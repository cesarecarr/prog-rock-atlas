/* Prog Rock Atlas — hesap ve eşitleme (v7)
   Google girişi + Firestore: users/{uid}/lists/{listId}
   Yalnız firebase-config.js doluysa yüklenir. */
const V = "12.19.0";
const B = `https://www.gstatic.com/firebasejs/${V}/`;

export async function start(cfg, H) {
  const [{ initializeApp }, A, F] = await Promise.all([
    import(B + "firebase-app.js"),
    import(B + "firebase-auth.js"),
    import(B + "firebase-firestore.js"),
  ]);
  const app = initializeApp(cfg);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);
  const provider = new A.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  let user = null, unsub = null, cloud = new Map(), chain = Promise.resolve(), ready = false;

  /* Firestore undefined kabul etmez; anahtar sırası karşılaştırmayı bozmasın */
  const clean = l => JSON.parse(JSON.stringify({ id: l.id, name: l.name || "", created: l.created || 0, items: l.items || [] }));
  const stable = o => Array.isArray(o) ? "[" + o.map(stable).join(",") + "]"
    : o && typeof o === "object" ? "{" + Object.keys(o).sort().map(k => JSON.stringify(k) + ":" + stable(o[k])).join(",") + "}"
    : JSON.stringify(o);
  const col = () => F.collection(db, "users", user.uid, "lists");
  const same = (x, y) => x.aid === y.aid && x.i === y.i;

  /* İlk girişte: yerel listeleri buluta kat (silmeden birleştir) */
  async function mergeLocal() {
    const snap = await F.getDocs(col());
    const remote = new Map(snap.docs.map(d => [d.id, d.data()]));
    const local = H.getLists();
    let batch = F.writeBatch(db), n = 0;
    const put = async (id, data) => { batch.set(F.doc(col(), id), data); if (++n % 400 === 0) { await batch.commit(); batch = F.writeBatch(db); } };
    for (const l of local) {
      const r = remote.get(l.id);
      if (!r) await put(l.id, clean(l));
      else {
        const extra = (l.items || []).filter(x => !(r.items || []).some(y => same(x, y)));
        if (extra.length) await put(l.id, clean({ ...r, items: (r.items || []).concat(extra) }));
      }
    }
    if (n % 400) await batch.commit();
    return n;
  }

  function listen() {
    unsub = F.onSnapshot(col(), s => {
      const arr = s.docs.map(d => d.data()).sort((a, b) => (a.created || 0) - (b.created || 0));
      cloud = new Map(arr.map(l => [l.id, stable(clean(l))]));
      ready = true;
      H.setLists(arr);
      H.onState("on", user);
    }, err => { console.error(err); H.onState("err", user, err); });
  }

  A.onAuthStateChanged(auth, async u => {
    if (unsub) { unsub(); unsub = null; }
    cloud = new Map(); ready = false; user = u;
    if (!u) { H.onState("out", null); return; }
    H.onState("sync", u);
    try {
      const n = await mergeLocal();
      if (n) H.toast(H.t("acct.merged", { n }));
      listen();
    } catch (e) { console.error(e); H.onState("err", u, e); }
  });

  /* Yereldeki her değişiklikte: değişen listeleri yaz, silinenleri sil */
  function push() {
    if (!user || !ready) return chain;
    chain = chain.then(async () => {
      const local = H.getLists(), ids = new Set();
      const batch = F.writeBatch(db); let n = 0;
      for (const l of local) {
        ids.add(l.id);
        const c = clean(l);
        if (cloud.get(l.id) !== stable(c)) { batch.set(F.doc(col(), l.id), c); cloud.set(l.id, stable(c)); n++; }
      }
      for (const id of [...cloud.keys()]) if (!ids.has(id)) { batch.delete(F.doc(col(), id)); cloud.delete(id); n++; }
      if (n) await batch.commit();
    }).catch(e => { console.error(e); H.toast(H.t("acct.err.save")); });
    return chain;
  }

  async function signIn() {
    try { await A.signInWithPopup(auth, provider); }
    catch (e) {
      const c = e && e.code || "";
      if (c === "auth/popup-closed-by-user" || c === "auth/cancelled-popup-request") return;
      if (c === "auth/popup-blocked") return H.toast(H.t("acct.err.popup"));
      if (c === "auth/unauthorized-domain") return H.toast(H.t("acct.err.domain"));
      console.error(e); H.toast(H.t("acct.err.login"));
    }
  }

  async function signOutUser() {
    await chain;
    if (unsub) { unsub(); unsub = null; }
    ready = false;
    await A.signOut(auth);
    H.setLists([]); /* paylaşılan cihazda listeler kalmasın; hesapta duruyorlar */
  }

  async function deleteAccount() {
    if (!user) return false;
    const u = user;
    await chain;
    /* Önce kimlik tazele: Firebase silme için yakın tarihli giriş ister */
    try { await A.reauthenticateWithPopup(u, provider); }
    catch (e) { const c = e && e.code || ""; if (c === "auth/popup-closed-by-user" || c === "auth/cancelled-popup-request") return false; throw e; }
    if (unsub) { unsub(); unsub = null; }
    ready = false;
    const snap = await F.getDocs(F.collection(db, "users", u.uid, "lists"));
    let batch = F.writeBatch(db), n = 0;
    for (const d of snap.docs) { batch.delete(d.ref); if (++n % 400 === 0) { await batch.commit(); batch = F.writeBatch(db); } }
    if (n % 400) await batch.commit();
    await A.deleteUser(u);
    H.setLists([]);
    return true;
  }

  return { signIn, signOut: signOutUser, deleteAccount, push, get user() { return user; } };
}
