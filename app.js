/* Prog Rock Atlas — v16 (masaüstü: pencere gizliyken sıradaki parçaya geçiş) / v14 (ana sayfa bağlantısı, gezinme yığını, müzisyen hap bilgileri) / v13 (müzisyen sayfaları) / v7 (hesap + eşitleme) / v6 (Spotify önizleme algılama) / v5 (tek çalar) / v4 (çalar düzeltmeleri) / v3 (liste çalar) / v2: diller, platformlar, çalar, kişisel listeler */
let DATA=[], T={}, F={}, U={}, LANG="tr", NDATA=null, TRK=null;
const PLATS=[["spotify","#1DB954"],["apple","#fa233b"],["youtube","#ff3b30"],["tidal","#33b5e5"]];
const store={get(k,d){try{const v=localStorage.getItem("atlas."+k);return v===null?d:JSON.parse(v);}catch(e){return d;}},
  set(k,v){try{localStorage.setItem("atlas."+k,JSON.stringify(v));}catch(e){}}};
let PLAT=store.get("platform",null);
function u(k,p){let s=U[k]||k; if(p)for(const x in p)s=s.split("{"+x+"}").join(p[x]); return s;}
function tx(k){return T[k]!==undefined?T[k]:F[k];}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function $(id){return document.getElementById(id);}
function toast(m){const t=$("toast");t.textContent=m;t.style.display="block";clearTimeout(t._h);t._h=setTimeout(()=>t.style.display="none",1600);}
function detectLang(){const s=store.get("lang",null);if(s)return s;const n=(navigator.language||"en").slice(0,2).toLowerCase();return ["tr","de"].includes(n)?n:"en";}
async function getJSON(p){const r=await fetch(p,{cache:"no-cache"});if(!r.ok)throw new Error(p);return r.json();}
function fmt(sec){if(!sec&&sec!==0)return "";const m=Math.floor(sec/60),s=sec%60;return m+":"+String(s).padStart(2,"0");}
function fmtLong(sec){const h=Math.floor(sec/3600),m=Math.round((sec%3600)/60);const L={tr:["sa","dk"],de:["Std.","Min."],en:["h","min"]}[LANG]||["h","min"];return h?`${h} ${L[0]} ${m} ${L[1]}`:`${m} ${L[1]}`;}
function platName(p){return u("plat."+p);}
function platColor(p){return (PLATS.find(x=>x[0]===p)||[0,"#999"])[1];}

/* ---------- veri ---------- */
function build(N){
  return N.map(s=>{const sk="sec."+s.no;
    return {no:s.no,title:tx(sk+".title")||"",intro:tx(sk+".intro")||"",html:tx(sk+".html")||"",
      groups:s.groups.map(g=>{const gk="grp."+g.id,f={};
        ["kurulus","hikaye","dna","uyeler","gecisler","etki","ipucu"].forEach(x=>{const v=tx(gk+"."+x);if(v)f[x]=v;});
        if(tx(gk+".tarih"))f.tarih={txt:tx(gk+".tarih"),src:g.tarih_src||""};
        const out={id:g.id,name:tx(gk+".name")||g.id,artist:g.artist,f};
        if(g.eras)out.eras=g.eras.map((e,i)=>({yil:e.yil,from:e.from,to:e.to,t:tx(gk+".era."+i+".t")||"",note:tx(gk+".era."+i+".note")||""}));
        out.albums=g.albums.map(a=>{const ak="alb."+a.id,o={id:a.id,t:a.t,y:a.y,onc:a.onc,e:a.e,cov:a.cov};
          ["an","dn","oncelik","tip","kadro","prod","detay","tr"].forEach(x=>{const v=tx(ak+"."+x);if(v)o[x]=v;});
          if(a.crit){const ct=tx(ak+".crit")||[];o.crit=a.crit.map((c,i)=>({src:c.src,url:c.url,txt:ct[i]||""}));}
          return o;});
        return out;})};});
}
function findAlbum(aid){for(const s of DATA)for(let gi=0;gi<s.groups.length;gi++){const g=s.groups[gi];const a=g.albums.find(x=>x.id===aid);if(a)return {s,g,a};}return null;}
/* v13: yapılandırılmış kadro (Wikipedia) ve müzisyen sayfaları */
let KAD=null,MUSALB=null,KADTXT=null;
async function loadKadro(){if(!KAD){try{KAD=await getJSON("kadro.json");}catch(e){KAD={m:{},a:{}};}
  MUSALB={};KADTXT={};for(const aid in KAD.a){const rows=KAD.a[aid];KADTXT[aid]=rows.map(r=>(KAD.m[r[0]]||[""])[0]).join(" ").toLowerCase();
    for(const r of rows)(MUSALB[r[0]]=MUSALB[r[0]]||[]).push([aid,r[1],r[2]]);}
  if(query&&$("v-atlas")&&$("v-atlas").classList.contains("on"))render();}
  return KAD;}
function musName(mid){return ((KAD&&KAD.m[mid])||[mid])[0];}
function rolTxt(r){return r?r.split(",").map(x=>u("rol."+x)).join(", "):"";}
async function loadTracks(){if(!TRK){try{TRK=await getJSON("parcalar.json");}catch(e){TRK={};}if(listIdxFix(LISTS))store.set("lists",LISTS);}return TRK;}
/* v9: bazı albümlerin parça listesi düzeltildi; listelerdeki parça sırasını ada göre yeniden bul */
function tnorm(t){return String(t||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"");}
function listIdxFix(lists){if(!TRK||!lists)return false;let ch=false;
  for(const l of lists)for(const x of (l.items||[])){const tr=TRK[x.aid]&&TRK[x.aid].tr;if(!tr||!tr.length)continue;
    const cur=tr[x.i];if(cur&&tnorm(cur.t)===tnorm(x.t))continue;
    const k=tr.findIndex(t=>tnorm(t.t)===tnorm(x.t));if(k>=0&&k!==x.i){x.i=k;ch=true;}}
  return ch;}

/* ---------- dil ---------- */
async function setLang(l){
  LANG=l;store.set("lang",l);document.documentElement.lang=l;
  const fb=l==="de"?"en":null;
  const [ui,txt,fbt]=await Promise.all([getJSON("ui_"+l+".json"),getJSON("metin_"+l+".json"),fb?getJSON("metin_"+fb+".json"):Promise.resolve({})]);
  U=ui;T=txt;F=fbt;
  if(!NDATA)NDATA=await getJSON("data.json");
  DATA=build(NDATA);
  document.title=u("app.title");
  document.querySelector(".brand h1 a").textContent=u("app.title");
  $("q").placeholder=u("search.placeholder");
  $("install").textContent=u("install");
  $("lang").value=l;
  renderTabbar();renderPlatBadge();initChips();render();
  if($("v-lists").classList.contains("on"))renderLists();
  if($("v-settings").classList.contains("on"))renderSettings();
  if(CUR&&CUR.m)openMus(CUR.m,"pop");else if(CUR)openAlbum(CUR.id,CUR.tab,"pop");
}

/* ---------- alt menü ---------- */
const ICO={atlas:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="8" r="2.5"/><circle cx="11" cy="18" r="2.5"/><path d="M8.3 6.9l7.4.8M16.8 10.1l-4.4 5.8M7.2 8.2l2.8 7.6"/></svg>',
 lists:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h11M4 12h11M4 18h7M18 14v6M15 17h6"/></svg>',
 settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>'};
let VIEW="atlas";
function renderTabbar(){
  $("tabbar").innerHTML=[["atlas","tab.atlas"],["lists","tab.lists"],["settings","tab.settings"]].map(([v,k])=>`<button class="${VIEW===v?"on":""}" onclick="go('${v}')">${ICO[v]}<span>${esc(u(k))}</span></button>`).join("");
}
function go(v){
  closeAlbum(true);VIEW=v;
  $("v-atlas").classList.toggle("on",v==="atlas");$("v-lists").classList.toggle("on",v==="lists");$("v-settings").classList.toggle("on",v==="settings");
  document.querySelector("header").style.display=v==="atlas"?"":"none";$("countbar").style.display=v==="atlas"?"":"none";
  if(v==="lists"){OPENLIST=null;renderLists();} if(v==="settings")renderSettings();
  renderTabbar();window.scrollTo(0,0);
}
/* v14: başlık = ana sayfa — açık albüm/müzisyen sayfasını kapat, aramayı ve filtreleri sıfırla */
function goHome(e){if(e)e.preventDefault();
  const had=!!CUR;go("atlas");
  if(had||location.hash){try{history.pushState(null,"",location.pathname+location.search);}catch(x){}}
  query="";$("q").value="";activeFilter="all";coreOnly=false;initChips();render();window.scrollTo(0,0);}
function renderPlatBadge(){const b=$("platbadge");if(!PLAT){b.innerHTML="";return;}
  b.innerHTML=`<span class="plat-dot" style="background:${platColor(PLAT)}"></span>${esc(platName(PLAT))}`;}

/* ---------- atlas listesi ---------- */
let activeFilter="all",query="",coreOnly=false;
const shortName=t=>t.replace(/ — .*/,"").replace(/\(.*\)/,"").replace(/:.*$/,"").replace(/^(The|Das|Die|Der) /,"").replace(/ (Universe|Evreni)$/,"").replace(/-Universum$/,"").trim();
function initChips(){
  const fe=$("filters");
  let chips=[["all",u("filter.all")],["core",u("filter.core")]];DATA.forEach(s=>chips.push([s.no,shortName(s.title)]));
  fe.innerHTML=chips.map(([id,lb])=>`<div class="chip ${String(id)===String(activeFilter)||(id==='core'&&coreOnly)?'on':''} ${id==='core'?'core':''}" data-f="${id}">${esc(lb)}</div>`).join("");
  fe.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{
    if(c.dataset.f==="core"){coreOnly=!coreOnly;c.classList.toggle("on",coreOnly);render();return;}
    activeFilter=c.dataset.f;fe.querySelectorAll(".chip:not(.core)").forEach(x=>x.classList.remove("on"));
    c.classList.add("on");c.scrollIntoView({inline:"nearest",block:"nearest"});window.scrollTo(0,0);render();});
  chipNav();
}
// v11: masaüstünde filtre bandı — oklar, fare tekerleği ve sürükleyerek kaydırma
let chipNavOk=false;
function chipNav(){
  const fe=$("filters"),pv=$("fprev"),nx=$("fnext");if(!fe||!pv||!nx)return;
  const upd=()=>{const m=fe.scrollWidth-fe.clientWidth;pv.classList.toggle("show",fe.scrollLeft>4);nx.classList.toggle("show",fe.scrollLeft<m-4);};
  upd();if(chipNavOk)return;chipNavOk=true;
  const step=()=>Math.max(160,fe.clientWidth*0.7);
  pv.onclick=()=>fe.scrollBy({left:-step(),behavior:"smooth"});
  nx.onclick=()=>fe.scrollBy({left:step(),behavior:"smooth"});
  fe.addEventListener("scroll",upd,{passive:true});window.addEventListener("resize",upd);
  fe.addEventListener("wheel",e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)&&fe.scrollWidth>fe.clientWidth){fe.scrollLeft+=e.deltaY;e.preventDefault();}},{passive:false});
  let x0=null,s0=0,moved=false;
  fe.addEventListener("mousedown",e=>{if(e.button!==0)return;x0=e.clientX;s0=fe.scrollLeft;moved=false;});
  window.addEventListener("mousemove",e=>{if(x0===null)return;const dx=e.clientX-x0;if(!moved&&Math.abs(dx)>5){moved=true;fe.classList.add("drag");}if(moved)fe.scrollLeft=s0-dx;});
  window.addEventListener("mouseup",()=>{if(x0===null)return;x0=null;setTimeout(()=>fe.classList.remove("drag"),0);});
}
const ph='<div class="ph">♪</div>';
function img(cov){return cov?`<img loading="lazy" src="${cov}" alt="">`:ph;}
const ONC={temel:"b-temel",onerilir:"b-oner",istege:"b-ist",ikincil:"b-ik",atla:"b-atla"};
function badge(a){const o=ONC[a.onc];return o?`<span class="badge ${o}">${esc(u("onc."+a.onc))}</span>`:"";}
function isStudio(t){return !t||["stüdyo","studio","Studio"].includes(t);}
function tipPill(a){return isStudio(a.tip)?"":`<span class="pill">${esc(a.tip)}</span>`;}
function albMatch(g,a){if(coreOnly&&a.onc!=="temel")return false;if(!query)return true;
  return (a.t+" "+g.name+" "+(a.tr||[]).join(" ")+" "+(a.kadro||"")+" "+((KADTXT&&KADTXT[a.id])||"")+" "+a.y).toLowerCase().includes(query);}
function albRow(g,a){return `<div class="alb" onclick="openAlbum('${a.id}')">${img(a.cov)}
    <div class="alb-info"><div class="t" translate="no">${esc(a.t)}</div><div class="y">${a.y}${tipPill(a)}${badge(a)}</div></div><span class="go">›</span></div>`;}
function render(){
  const main=$("main");let html="",any=false,totA=0;const filtering=!!query||coreOnly;
  DATA.forEach(s=>{
    if(activeFilter!=="all"&&String(s.no)!==String(activeFilter))return;
    const hasReal=s.groups.some(g=>g.albums.length>0);
    if(s.html&&!hasReal){if(filtering)return;any=true;
      html+=`<div class="sec-title">${esc(shortName(s.title))}</div>`+(s.intro?`<p class="sec-intro">${esc(s.intro)}</p>`:"")+`<div class="special">${s.html}</div>`;return;}
    let sh="",has=false;
    s.groups.forEach((g,gi)=>{const albs=g.albums.filter(a=>albMatch(g,a));if(!albs.length)return;has=true;any=true;totA+=albs.length;
      const gid=`g_${s.no}_${gi}`,f=g.f;
      const extra=[f.uyeler?`<p class="gfield"><b>${u("f.uyeler")}:</b> ${esc(f.uyeler)}</p>`:"",f.gecisler?`<p class="gfield"><b>${u("f.gecisler")}:</b> ${esc(f.gecisler)}</p>`:"",
        f.etki?`<p class="gfield"><b>${u("f.etki")}:</b> ${esc(f.etki)}</p>`:"",
        (f.ipucu&&f.ipucu.length)?`<div class="tipbox"><div class="tlabel" style="margin-top:0">${u("f.ipucu")}</div><ul>${f.ipucu.map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>`:"",
        f.tarih?`<div class="histbox">${esc(f.tarih.txt)}<span class="src">${esc(f.tarih.src)}</span></div>`:""].join("");
      let list="";
      if(g.eras&&g.eras.length){g.eras.forEach((e,ei)=>{const ea=albs.filter(a=>(a.e||0)===ei);if(!ea.length)return;
          list+=`<div class="era-h"><span class="era-t">${esc(e.t)}</span><span class="era-y">${esc(e.yil)}</span></div>`;
          if(e.note&&!filtering)list+=`<p class="era-note">${esc(e.note)}</p>`;list+=ea.map(a=>albRow(g,a)).join("");});}
      else list=albs.map(a=>albRow(g,a)).join("");
      sh+=`<div class="group ${filtering?"open":""}" id="${gid}"><div class="group-head" onclick="tg('${gid}')"><h2 translate="no">${esc(g.name)}</h2><span class="cnt">${u("group.albums",{n:g.albums.length})}</span><span class="arr">▶</span></div>
        <div class="group-body">${f.kurulus?`<p class="gfield"><b>${u("f.kurulus")}:</b> ${esc(f.kurulus)}</p>`:""}
        ${f.hikaye?`<p class="gfield hik" onclick="this.classList.toggle('full')"><b>${u("f.hikaye")}:</b> ${esc(f.hikaye)}</p>`:""}
        ${f.dna?`<p class="gfield"><b>${u("f.dna")}:</b> ${esc(f.dna)}</p>`:""}
        ${extra?`<span class="gmore" onclick="tgMore(event,'${gid}_x')">${u("group.more")}${f.ipucu?" · "+u("group.tips"):""}</span><div class="gextra" id="${gid}_x">${extra}</div>`:""}
        ${list}</div></div>`;});
    if(has){html+=`<div class="sec-title">${esc(shortName(s.title))}</div>`;if(s.intro&&activeFilter!=="all")html+=`<p class="sec-intro">${esc(s.intro)}</p>`;
      html+=sh;if(s.html&&!filtering)html+=`<div class="special">${s.html}</div>`;}
  });
  $("countbar").textContent=any?u("count.albums",{n:totA})+(coreOnly?" · "+u("count.coreonly"):""):"";
  main.innerHTML=any?html:`<div class="empty">${esc(u("empty"))}</div>`;
}
function tg(id){$(id).classList.toggle("open");}
function tgMore(e,id){e.stopPropagation();$(id).classList.toggle("show");}

/* ---------- albüm sayfası ---------- */
let CUR=null,SCROLLY=0;
function searchURL(p,artist,title){const q=encodeURIComponent(artist+" "+title.replace(/\s*\(.*?\)\s*/g," ").trim());
  return {spotify:"https://open.spotify.com/search/"+q,apple:"https://music.apple.com/search?term="+q,youtube:"https://www.youtube.com/results?search_query="+q,tidal:"https://tidal.com/search?q="+q}[p];}
function playerHTML(pl,tr,artist,title,trackIdx){
  const ti=trackIdx!=null&&tr.tr?tr.tr[trackIdx]:null;
  if(pl==="spotify"){
    if(ti&&ti.sp)return `<iframe src="https://open.spotify.com/embed/track/${ti.sp}" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    if(tr.sp)return `<iframe src="https://open.spotify.com/embed/album/${tr.sp}" height="352" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;}
  if(pl==="youtube"){
    if(ti&&ti.yt)return `<iframe src="https://www.youtube-nocookie.com/embed/${ti.yt}?autoplay=1" style="aspect-ratio:16/9" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
    if(tr.yt)return `<iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=${tr.yt}" style="aspect-ratio:16/9" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;}
  if(pl==="apple"&&tr.am){return `<iframe src="${tr.am.replace("https://music.apple.com","https://embed.music.apple.com")}" height="450" allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" loading="lazy"></iframe>`;}
  const msg=pl==="tidal"?"":`<div>${esc(u("album.noid",{p:platName(pl)}))}</div>`;
  return `<div class="noid">${msg}<a class="btn small" href="${searchURL(pl,artist,title)}" target="_blank" rel="noopener">${esc(u("album.search",{p:platName(pl)}))}</a></div>`;
}
function albPlayable(pl,tr){return (pl==="spotify"||pl==="youtube")&&(tr.tr||[]).some(t=>t.sp||t.yt);}
function trackHasPlay(pl,t){return (pl==="spotify"&&t.sp)||(pl==="youtube"&&t.yt);}
/* v14: gezinme yığını — albüm › müzisyen › albüm … Geri her zaman bir önceki ekrana (ve o ekranın sekmesine/kaydırma yerine) döner.
   mode: undefined = yeni ekran (yığına ekle), "pop" = geri/ileri ya da yeniden çizim (geçmişe dokunma),
         "replace" = elle geri (geçerli geçmiş kaydını değiştir), "init" = sayfa açılışı */
let NAV=[],ALBLEN=0;
function navTop(){return NAV[NAV.length-1];}
function navSet(e,mode){
  if(mode==="pop"||mode==="replace"){if(!NAV.length)NAV.push(e);else Object.assign(navTop(),e);}
  else{if(mode==="init"||!CUR)NAV=[];else if(navTop())navTop().y=$("albview").scrollTop;if(mode==="init")e.i=1;NAV.push(e);}
  /* i: sayfa bu adresle açıldı — bu kayıttan history.back() siteden çıkarır, o yüzden elle kapatılır */
  const h=e.a?"#a="+e.a:"#m="+e.m,st={a:e.a||null,m:e.m||null,tab:navTop().tab||null,d:NAV.length,i:NAV.length===1&&NAV[0].i?1:0};
  try{if(mode==="pop"){}else if(mode==="replace"||mode==="init"||location.hash===h&&!CUR)history.replaceState(st,"",h);else history.pushState(st,"",h);}catch(x){}
  ALBLEN=history.length;}
async function openAlbum(aid,tab,mode,y){
  const f=findAlbum(aid);if(!f)return;
  if(!CUR)SCROLLY=window.scrollY;
  navSet({a:aid,tab:tab||"tracks"},mode);
  CUR={id:aid,tab:tab||"tracks",track:null};
  await Promise.all([loadTracks(),loadKadro()]);
  renderAlbum();
  $("albview").classList.add("show");$("albview").scrollTop=y||0;document.body.style.overflow="hidden";layoutDock();
}
function navShow(p,mode){if(p.m)openMus(p.m,mode,p.y);else openAlbum(p.a,p.tab,mode,p.y);}
function albBack(){const d=NAV.length;
  if(d&&history.length===ALBLEN&&history.state&&history.state.d===d&&!history.state.i){history.back();return;}
  NAV.pop();const p=navTop();
  if(p){navShow(p,"replace");return;}
  closeAlbum();try{history.replaceState(null,"",location.pathname+location.search);}catch(e){}}
function renderAlbum(){
  albSpReset();
  const {g,a}=findAlbum(CUR.id);const tr=TRK[a.id]||{tr:[]};const pl=PLAT||"spotify";
  const era=(g.eras&&g.eras[a.e||0])?g.eras[a.e||0]:null;
  const others=PLATS.map(p=>p[0]).filter(p=>p!==pl).map(p=>`<a class="btn small ghost" href="${p==="spotify"&&tr.sp?"https://open.spotify.com/album/"+tr.sp:p==="youtube"&&tr.yt?"https://www.youtube.com/playlist?list="+tr.yt:p==="apple"&&tr.am?tr.am:searchURL(p,g.artist,a.t)}" target="_blank" rel="noopener"><span class="plat-dot" style="background:${platColor(p)}"></span>${esc(platName(p))}</a>`).join("");
  $("albview").innerHTML=`<div class="page">
    <div class="navrow"><button class="backbtn" onclick="albBack()">${esc(u("nav.back"))}</button><a class="homebtn" href="./" onclick="goHome(event)" translate="no">${esc(u("app.title"))} ⌂</a></div>
    <div class="albhead">${img(a.cov)}<div><div class="g" translate="no">${esc(g.name)}</div><h2 translate="no">${esc(a.t)}</h2>
      <div class="y">${a.y}${a.tip?" · "+esc(a.tip):""}${era?" · "+esc(era.t):""}</div><div style="margin-top:6px">${badge(a)}</div></div></div>
    ${albPlayable(pl,tr)?`<button class="btn primary" style="width:100%" onclick="playTrack(0)">▶ ${esc(u("album.playalbum"))}</button>`:`<div class="player" id="player">${playerHTML(pl,tr,g.artist,a.t,null)}</div>`}
    <div class="otherp">${others}</div>
    <div class="tabs" id="albtabs">${albTabsHTML()}</div>
    <div id="albbody">${albBodyHTML()}</div></div>`;
}
function albTabsHTML(){return `${[["tracks","album.tab.tracks"],["about","album.tab.about"],["lineup","album.tab.lineup"]].map(([k,l])=>`<button class="${CUR.tab===k?"on":""}" onclick="albTab('${k}')">${esc(u(l))}</button>`).join("")}`;}
function albBodyHTML(){
  const {g,a}=findAlbum(CUR.id);const tr=TRK[a.id]||{tr:[]};const pl=PLAT||"spotify";
  let body="";
  if(CUR.tab==="tracks"){
    if(!tr.tr.length)body=`<p class="muted" style="padding:12px 0">${esc(u("album.notracks"))}</p>`;
    else{const multi=new Set(tr.tr.map(t=>t.d)).size>1;let lastD=null;
      body=tr.tr.map((t,i)=>{let h="";if(multi&&t.d!==lastD){h+=`<div class="disc">CD ${t.d}</div>`;lastD=t.d;}
        const inl=inAnyList(a.id,i);
        const now=Q&&Q.lid==="alb:"+a.id&&Q.cur.i===i;h+=`<div class="trk ${now?"now":""}"><span class="n">${now?"♪":t.n}</span><div class="tt"><div translate="no">${esc(t.t)}</div><div>${fmt(t.s)}</div></div>
          ${albPlayable(pl,tr)&&(t.sp||t.yt)?`<button class="ib pl" title="${esc(u("track.play"))}" onclick="playTrack(${i})">▶</button>`:""}
          <button class="ib ${inl?"in":""}" title="${esc(u(inl?"track.remove":"track.add"))}" onclick="openAdd([${i}])">${inl?"✓":"＋"}</button></div>`;return h;}).join("")
        +`<div style="margin-top:14px"><button class="btn" style="width:100%" onclick="openAdd(${JSON.stringify(tr.tr.map((_,i)=>i))})">＋ ${esc(u("album.addall"))}</button></div>`;}
  }else if(CUR.tab==="about"){
    body=`${a.an?`<p class="an" style="margin-top:10px">${esc(a.an)}</p>`:""}
      ${a.dn?`<div class="dnbox"><div class="tlabel" style="margin-top:0">${u("album.note")}</div>${esc(a.dn)}</div>`:""}
      ${(a.detay&&a.detay.length)?`<div class="tlabel">${u("album.details")}</div><ul class="detay">${a.detay.map(t=>`<li>${esc(t)}</li>`).join("")}</ul>`:""}
      ${a.oncelik?`<div class="oncbox"><b>${u("album.priority")}:</b> ${esc(a.oncelik)}</div>`:""}
      ${(a.crit&&a.crit.length)?`<div class="tlabel">${u("album.critics")}</div>${a.crit.map(c=>`<div class="crit"><span class="csrc">${esc(c.src)}</span>${esc(c.txt)}${c.url?` <a href="${esc(c.url)}" target="_blank" rel="noopener">${u("album.source")}</a>`:""}</div>`).join("")}`:""}
      ${(a.tr&&a.tr.length)?`<div class="tlabel">${u("album.highlights")}</div><ul class="tracks">${a.tr.map(t=>`<li>${esc(t)}</li>`).join("")}</ul>`:""}`;
  }else{
    const rows=KAD&&KAD.a[a.id];
    if(rows&&rows.length){
      const grp=[["kadro.members",rows.filter(r=>!r[2]&&r[1]!=="prod")],["kadro.guests",rows.filter(r=>r[2]&&r[1]!=="prod")],["kadro.production",rows.filter(r=>r[1]==="prod")]];
      body=grp.filter(x=>x[1].length).map(([l,L])=>`<div class="tlabel">${esc(u(l))}</div>`+L.map(r=>{const n=(MUSALB[r[0]]||[]).length;
        return `<div class="krow" onclick="openMus('${r[0]}')"><div class="kt"><div translate="no">${esc(musName(r[0]))}</div><div>${esc(rolTxt(r[1]))}</div></div>${n>1?`<span class="kc">${esc(u(n===1?"mus.album1":"mus.albums",{n}))}</span>`:""}<span class="go">›</span></div>`;}).join("")).join("")
        +`<p class="muted ksrc">${esc(u("kadro.tap"))} · ${esc(u("kadro.src"))}</p>`;
    }else{
    body=`${a.kadro?`<p class="kadro" style="margin-top:12px"><b>${u("album.lineup")}:</b> ${esc(a.kadro)}</p>`:""}${a.prod?`<p class="kadro"><b>${u("album.prod")}:</b> ${esc(a.prod)}</p>`:""}
      ${(!a.kadro&&!a.prod)?`<p class="muted" style="padding:12px 0">—</p>`:""}`;}
  }
  return body;
}
function updAlbBody(){if(!CUR||!$("albbody"))return renderAlbum();$("albtabs").innerHTML=albTabsHTML();$("albbody").innerHTML=albBodyHTML();}
function albTab(k){CUR.tab=k;const t=navTop();if(t&&t.a)t.tab=k;
  try{const s=history.state;if(s&&s.a===CUR.id&&s.d===NAV.length)history.replaceState(Object.assign({},s,{tab:k}),"",location.hash);}catch(e){}
  updAlbBody();}
let ALBC=null;
function albSpReset(){try{if(ALBC)ALBC.destroy();}catch(e){}ALBC=null;}
function spCtl(api,el,uri,h,onCtl){/* denetleyici + yüklenince çal */
  return new Promise(res=>api.createController(el,{uri,width:"100%",height:h},c=>{c._pend=true;
    c.addListener("ready",()=>{if(c._pend){c._pend=false;try{c.play();}catch(e){}}});
    setTimeout(()=>{if(c._pend){c._pend=false;try{c.play();}catch(e){}}},2500);
    if(onCtl)onCtl(c);res(c);}));}
function spLoad(c,uri){c._pend=true;c.loadUri(uri);setTimeout(()=>{if(c._pend){c._pend=false;try{c.play();}catch(e){}}},1500);}
function playTrack(i){qPlay("alb:"+CUR.id,i);}
function closeAlbum(silent){NAV=[];if(!CUR)return;albSpReset();CUR=null;ALBLEN=0;$("albview").classList.remove("show");$("albview").innerHTML="";document.body.style.overflow="";layoutDock();
  if(!silent)window.scrollTo(0,SCROLLY);}
async function openMus(mid,mode,y){
  await Promise.all([loadKadro(),loadBio()]);if(!KAD.m[mid])return;
  if(!CUR)SCROLLY=window.scrollY;
  navSet({m:mid},mode);
  albSpReset();CUR={id:null,m:mid,tab:"tracks"};
  renderMus();
  $("albview").classList.add("show");$("albview").scrollTop=y||0;document.body.style.overflow="hidden";layoutDock();
}
/* v14: müzisyen hap bilgisi (Wikipedia girişinden 3–5 cümle) — bio_<dil>.json, yoksa İngilizce */
const BIO={};
function loadBio(){const ls=[...new Set([LANG,"en"])];
  return Promise.all(ls.map(l=>BIO[l]?BIO[l]:(BIO[l]=getJSON("bio_"+l+".json").catch(()=>({}))).then(x=>BIO[l]=x)));}
function bioOf(mid){for(const l of [LANG,"en"]){const b=BIO[l];if(b&&!(b instanceof Promise)&&b[mid])return {t:b[mid],l};}return null;}
function renderMus(){
  const mid=CUR.m,m=KAD.m[mid],wiki=m[1]||m[0];
  const L=(MUSALB[mid]||[]).map(([aid,r,k])=>{const f=findAlbum(aid);return f?{g:f.g,a:f.a,r,k}:null;}).filter(Boolean)
    .sort((x,y)=>x.a.y-y.a.y||x.g.name.localeCompare(y.g.name));
  const gs=[];for(const x of L){const o=gs.find(z=>z.g===x.g);if(o)o.n++;else gs.push({g:x.g,n:1});}
  $("albview").innerHTML=`<div class="page">
    <div class="navrow"><button class="backbtn" onclick="albBack()">${esc(u("nav.back"))}</button><a class="homebtn" href="./" onclick="goHome(event)" translate="no">${esc(u("app.title"))} ⌂</a></div>
    <div class="mushead"><h2 translate="no">${esc(m[0])}</h2>
      <div class="y">${esc(u(L.length===1?"mus.album1":"mus.albums",{n:L.length}))} · <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(wiki.replace(/ /g,"_"))}" target="_blank" rel="noopener">Wikipedia ↗</a></div>
      ${(b=>b?`<p class="bio" lang="${b.l}">${esc(b.t)}</p>`:"")(bioOf(mid))}
      <div class="musg">${gs.map(x=>`<span class="pill" translate="no">${esc(x.g.name)} <b>${x.n}</b></span>`).join("")}</div></div>
    ${L.map(x=>`<div class="alb" onclick="openAlbum('${x.a.id}')">${img(x.a.cov)}
      <div class="alb-info"><div class="t" translate="no">${esc(x.a.t)}</div>
      <div class="y">${x.a.y} · <span translate="no">${esc(x.g.name)}</span></div>
      <div class="y mr">${esc(rolTxt(x.r))}${x.k?` · <i>${esc(u("mus.guest"))}</i>`:""}</div></div><span class="go">›</span></div>`).join("")}
    <p class="muted ksrc">${esc(u("kadro.src"))}</p></div>`;
}
window.addEventListener("popstate",e=>{const s=e.state;
  if(s&&s.d&&(s.a||s.m)){const old=NAV[s.d-1],same=old&&old.a==s.a&&old.m==s.m;
    NAV.length=Math.min(NAV.length,s.d-1);const p=same?old:{a:s.a,m:s.m,tab:s.tab||"tracks"};NAV.push(p);
    if(CUR&&(p.m?CUR.m===p.m:CUR.id===p.a&&CUR.tab===p.tab))return;
    navShow(p,"pop");return;}
  const m=location.hash.match(/^#a=(.+)$/),mm=location.hash.match(/^#m=(.+)$/);
  if(m){if(!CUR||CUR.id!==m[1])openAlbum(m[1],null,CUR?undefined:"init");}else if(mm){if(!CUR||CUR.m!==mm[1])openMus(mm[1],CUR?undefined:"init");}else closeAlbum();});

/* ---------- listeler (cihazda saklanır) ---------- */
let LISTS=store.get("lists",[]);
function saveLists(){store.set("lists",LISTS);if(ACCT.api)ACCT.api.push();}

/* ---------- v7: hesap (Google girişi, Firestore eşitleme) ---------- */
const ACCT={st:"off",user:null,api:null,p:null};
function acctOn(){const c=window.FIREBASE_CONFIG;return !!(c&&c.apiKey&&c.projectId);}
const ACCT_HOOKS={
  getLists:()=>LISTS,
  setLists:arr=>{LISTS=arr;listIdxFix(LISTS);store.set("lists",LISTS);acctRefresh(true);},
  onState:(st,user)=>{ACCT.st=st;ACCT.user=user;if(st==="on"||st==="sync")store.set("acct",true);if(st==="out")store.set("acct",false);acctRefresh(false);},
  toast:m=>toast(m),t:(k,p)=>u(k,p)};
function loadAcct(){if(!acctOn())return Promise.resolve(null);
  if(!ACCT.p){if(ACCT.st==="off")ACCT.st="loading";
    ACCT.p=import("./hesap.js?v=13").then(m=>m.start(window.FIREBASE_CONFIG,ACCT_HOOKS)).then(api=>{ACCT.api=api;return api;})
      .catch(e=>{console.error(e);ACCT.p=null;ACCT.st="err";acctRefresh(false);return null;});}
  return ACCT.p;}
function acctRefresh(lists){
  if(lists){if(Q&&!Q.lid.startsWith("alb:")&&!LISTS.find(l=>l.id===Q.lid))qClose();else if(Q)renderDock();
    if(CUR&&$("albbody"))updAlbBody();}
  if(VIEW==="lists")renderLists();
  if(VIEW==="settings"&&$("acctbox")){const y=window.scrollY;renderSettings();window.scrollTo(0,y);}}
async function acctSignIn(){const api=ACCT.api||await loadAcct();if(api)api.signIn();else toast(u("acct.err.login"));}
async function acctSignOut(){if(!ACCT.api||!confirm(u("acct.signout.confirm")))return;await ACCT.api.signOut();toast(u("acct.signedout"));}
async function acctDelete(){if(!ACCT.api||!confirm(u("acct.delete.confirm")))return;
  try{const ok=await ACCT.api.deleteAccount();if(ok){store.set("acct",false);toast(u("acct.deleted"));}}
  catch(e){console.error(e);toast(u("acct.err.delete"));}}
function acctHTML(){const s=ACCT.st,us=ACCT.user;
  if(us&&(s==="on"||s==="sync"||s==="err")){
    const pic=us.photoURL?`<img src="${esc(us.photoURL)}" alt="" referrerpolicy="no-referrer">`:`<span class="ph">${esc((us.displayName||us.email||"?").slice(0,1))}</span>`;
    return `<div class="acct">${pic}<div class="who"><div>${esc(us.displayName||"")}</div><div class="muted">${esc(us.email||"")}</div></div></div>
      <div class="acct-st ${s}">${esc(u("acct.st."+s))}</div>
      <div class="row" style="flex-wrap:wrap;margin-top:10px"><button class="btn small ghost" onclick="acctSignOut()">${esc(u("acct.signout"))}</button>
      <button class="btn small danger" onclick="acctDelete()">${esc(u("acct.delete"))}</button></div>`;}
  return `<p class="muted" style="margin-bottom:10px">${esc(u("acct.why"))}</p>
    <button class="btn gbtn" onclick="acctSignIn()">${GICON}<span>${esc(u("acct.google"))}</span></button>
    ${s==="err"?`<div class="acct-st err">${esc(u("acct.st.err"))}</div>`:""}
    <p class="muted" style="font-size:12px;margin-top:8px">${u("acct.consent",{link:`<a href="#" onclick="showPrivacy();return false">${esc(u("privacy.link"))}</a>`})}</p>`;}
const GICON='<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
function acctListsBanner(){if(!acctOn())return "";
  if(ACCT.user&&ACCT.st==="on")return `<div class="cloudline">☁ ${esc(u("acct.lists.on"))}</div>`;
  if(ACCT.user)return "";
  return `<div class="cloudline off" onclick="go('settings')">☁ ${esc(u("acct.lists.off"))} <span>›</span></div>`;}
function showPrivacy(){const o=window.SITE_OWNER||{};const p=$("privview");
  const who=esc([o.name,o.city].filter(Boolean).join(", ")||"—");
  p.innerHTML=`<div class="page"><button class="backbtn" onclick="hidePrivacy()">${esc(u("nav.back"))}</button><h1>${esc(u("privacy.title"))}</h1>
    <div class="privtext">${u("privacy.body",{who,email:o.email?`<a href="mailto:${esc(o.email)}">${esc(o.email)}</a>`:"—"})}</div>
    <p class="muted" style="margin-top:18px">${esc(u("privacy.updated"))}</p></div>`;
  p.classList.add("show");p.scrollTop=0;}
function hidePrivacy(){$("privview").classList.remove("show");}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function inAnyList(aid,i){return LISTS.some(l=>l.items.some(x=>x.aid===aid&&x.i===i));}
let ADD=null;
function openAdd(idx){
  const {g,a}=findAlbum(CUR.id);ADD={aid:a.id,idx,sel:new Set(LISTS.filter(l=>idx.every(i=>l.items.some(x=>x.aid===a.id&&x.i===i))).map(l=>l.id))};
  ADD.orig=new Set(ADD.sel);renderAdd();$("addbg").classList.add("show");$("addsheet").classList.add("show");
}
function renderAdd(){
  const {g,a}=findAlbum(ADD.aid);const tr=(TRK[a.id]||{tr:[]}).tr;
  const label=ADD.idx.length===1?tr[ADD.idx[0]].t:a.t;const sub=ADD.idx.length===1?`${g.name} · ${a.y}${tr[ADD.idx[0]].s?" · "+fmt(tr[ADD.idx[0]].s):""}`:`${g.name} · ${u("add.tracks",{n:ADD.idx.length})}`;
  $("addsheet").innerHTML=`<div class="grab"></div><div class="muted">${esc(u("add.title"))}</div>
    <div style="font-family:Georgia,serif;font-size:19px;font-weight:700;margin:2px 0" translate="no">${esc(label)}</div><div class="muted" style="margin-bottom:10px" translate="no">${esc(sub)}</div>
    ${LISTS.map(l=>`<div class="chk ${ADD.sel.has(l.id)?"on":""}" onclick="togSel('${l.id}')"><span class="box">${ADD.sel.has(l.id)?"✓":""}</span><span class="nm">${esc(l.name)}</span><span class="ct">${u("lists.tracks",{n:l.items.length})}</span></div>`).join("")}
    <div class="row" style="margin:12px 0"><input class="inp" id="newlist" placeholder="${esc(u("add.namehint"))}"><button class="btn small" onclick="createFromAdd()">${esc(u("add.create"))}</button></div>
    ${ADD.idx.length===1?`<label class="muted">${esc(u("add.note"))}<textarea class="inp" id="addnote" style="margin-top:6px"></textarea></label>`:""}
    <button class="btn primary" style="width:100%;margin-top:12px" onclick="saveAdd()">${esc(u("add.save"))}</button>`;
}
function togSel(id){ADD.sel.has(id)?ADD.sel.delete(id):ADD.sel.add(id);renderAdd();}
function createFromAdd(){const n=$("newlist").value.trim();if(!n)return;const l={id:uid(),name:n,created:Date.now(),items:[]};LISTS.push(l);ADD.sel.add(l.id);saveLists();renderAdd();}
function saveAdd(){
  const {g,a}=findAlbum(ADD.aid);const tr=(TRK[a.id]||{tr:[]}).tr;const note=$("addnote")?$("addnote").value.trim():"";
  LISTS.forEach(l=>{
    if(ADD.sel.has(l.id)){ADD.idx.forEach(i=>{if(!l.items.some(x=>x.aid===a.id&&x.i===i)){const t=tr[i];
        l.items.push({aid:a.id,i,t:t.t,alb:a.t,art:g.artist,y:a.y,s:t.s||0,sp:t.sp||null,yt:t.yt||null,cov:a.cov||null,note,added:Date.now()});}
        else if(note){const x=l.items.find(x=>x.aid===a.id&&x.i===i);x.note=note;}});}
    else if(ADD.orig.has(l.id)){l.items=l.items.filter(x=>!(x.aid===a.id&&ADD.idx.includes(x.i)));}
  });
  saveLists();closeAdd();toast(u("add.saved"));if(CUR)updAlbBody();
}
function closeAdd(){$("addsheet").classList.remove("show");$("addbg").classList.remove("show");ADD=null;}
let OPENLIST=null;
function listDur(l){return l.items.reduce((s,x)=>s+(x.s||0),0);}
function collage(l){const c=[...new Set(l.items.map(x=>x.cov).filter(Boolean))].slice(0,4);let h=c.map(x=>`<img src="${x}" alt="">`).join("");for(let i=c.length;i<4;i++)h+="<div></div>";return `<div class="coll">${h}</div>`;}
function renderLists(){
  const v=$("v-lists");
  if(OPENLIST){const l=LISTS.find(x=>x.id===OPENLIST);if(!l){OPENLIST=null;return renderLists();}
    const ytIds=l.items.map(x=>x.yt).filter(Boolean).slice(0,50);const spIt=l.items.filter(x=>x.sp);
    v.innerHTML=`<div class="page"><button class="backbtn" onclick="OPENLIST=null;renderLists()">${esc(u("nav.back"))}</button>
      <h1>${esc(l.name)}</h1><div class="muted" style="margin:-8px 0 12px">${u("lists.tracks",{n:l.items.length})} · ${fmtLong(listDur(l))}</div>
      ${l.items.length?`<button class="btn primary" style="width:100%;margin-bottom:6px" onclick="qPlay('${l.id}',0)">▶ ${esc(u("lists.play"))}</button>
        <p class="muted" style="font-size:12px;margin-bottom:8px">${esc(u("lists.play.hint"))}${(PLAT==="apple"||PLAT==="tidal")?" "+esc(u("lists.play.yt")):""}</p>`:""}
      ${l.items.length?l.items.map((x,k)=>`<div class="litem ${Q&&Q.lid===l.id&&Q.cur.aid===x.aid&&Q.cur.i===x.i?"now":""}"><span class="cov" onclick="openAlbum('${x.aid}')" title="${esc(u("lists.toalbum"))}">${img(x.cov)}</span><div class="tt" onclick="qPlay('${l.id}',${k})" style="cursor:pointer"><div translate="no">${esc(x.t)}</div><div translate="no">${esc(x.art)} · ${esc(x.alb)} · ${fmt(x.s)}</div>${x.note?`<div class="note">${esc(x.note)}</div>`:""}</div>
        <div class="mini"><button onclick="mv('${l.id}',${k},-1)">▲</button><button onclick="mv('${l.id}',${k},1)">▼</button></div>
        <button class="ib" title="${esc(u("lists.remove"))}" onclick="rmItem('${l.id}',${k})">✕</button></div>`).join(""):`<p class="muted">${esc(u("lists.emptylist"))}</p>`}
      ${l.items.length?`<div class="box2"><div class="lbl" style="margin:0">${esc(u("lists.export"))}</div>
        ${ytIds.length?`<a class="btn" href="https://www.youtube.com/watch_videos?video_ids=${ytIds.join(",")}" target="_blank" rel="noopener"><span class="plat-dot" style="background:#ff3b30"></span>${esc(u("lists.export.youtube"))}</a><div class="muted">${esc(u("lists.export.youtube.note"))}${l.items.length-ytIds.length>0?" "+esc(u("lists.missing",{n:l.items.length-l.items.filter(x=>x.yt).length})):""}</div>`:""}
        ${spIt.length?`<details><summary class="btn small ghost"><span class="plat-dot" style="background:#1DB954"></span>${esc(u("lists.export.spotify"))}</summary><div class="linklist">${spIt.map(x=>`<a href="https://open.spotify.com/track/${x.sp}" target="_blank" rel="noopener">${esc(x.art)} — ${esc(x.t)}</a>`).join("")}</div></details>`:""}
        <button class="btn small ghost" onclick="copyList('${l.id}')">${esc(u("lists.export.copy"))}</button></div>`:""}
      <div class="row" style="flex-wrap:wrap;margin-top:8px"><button class="btn small ghost" onclick="renameList('${l.id}')">${esc(u("lists.rename"))}</button><button class="btn small danger" onclick="delList('${l.id}')">${esc(u("lists.delete"))}</button></div></div>`;
    return;}
  v.innerHTML=`<div class="page"><div class="row" style="justify-content:space-between;margin-bottom:14px"><h1 style="margin:0">${esc(u("lists.title"))}</h1>
    <button class="btn small" onclick="newList()">＋ ${esc(u("lists.new"))}</button></div>
    ${acctListsBanner()}
    ${LISTS.length?LISTS.map(l=>`<div class="lcard" onclick="OPENLIST='${l.id}';renderLists();window.scrollTo(0,0)">${collage(l)}<div style="flex-grow:1"><div class="nm">${esc(l.name)}</div><div class="mt">${u("lists.tracks",{n:l.items.length})} · ${fmtLong(listDur(l))}</div></div><span class="go">›</span></div>`).join(""):`<p class="muted">${esc(u("lists.empty"))}</p>`}</div>`;
}
function newList(){const n=prompt(u("add.namehint"));if(!n||!n.trim())return;LISTS.push({id:uid(),name:n.trim(),created:Date.now(),items:[]});saveLists();renderLists();}
function renameList(id){const l=LISTS.find(x=>x.id===id);const n=prompt(u("lists.rename"),l.name);if(!n||!n.trim())return;l.name=n.trim();saveLists();renderLists();}
function delList(id){if(!confirm(u("lists.confirmdelete")))return;if(Q&&Q.lid===id)qClose();LISTS=LISTS.filter(x=>x.id!==id);saveLists();OPENLIST=null;renderLists();}
function rmItem(id,k){const l=LISTS.find(x=>x.id===id);l.items.splice(k,1);saveLists();renderLists();if(Q&&Q.lid===id&&qIdx()>=0)renderDock();}
function mv(id,k,d){const l=LISTS.find(x=>x.id===id);const j=k+d;if(j<0||j>=l.items.length)return;[l.items[k],l.items[j]]=[l.items[j],l.items[k]];saveLists();renderLists();if(Q&&Q.lid===id)renderDock();}
function copyList(id){const l=LISTS.find(x=>x.id===id);const txt=l.name+"\n\n"+l.items.map((x,k)=>`${k+1}. ${x.art} — ${x.t} (${x.alb}, ${x.y})${x.note?" — "+x.note:""}`).join("\n");
  (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast(u("lists.copied"))).catch(()=>prompt("",txt));}


/* ---------- v3: liste çalar (sıralı çalma) ---------- */
let Q=null,ENG=null,YTP=null,SPC=null,SPST=null,ytReady=null,spReady=null;
function loadYT(){if(!ytReady)ytReady=new Promise((res,rej)=>{if(window.YT&&YT.Player)return res();window.onYouTubeIframeAPIReady=res;const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";s.onerror=()=>{ytReady=null;rej(new Error("yt"));};document.head.appendChild(s);});return ytReady;}
function loadSP(){if(!spReady)spReady=new Promise((res,rej)=>{window.onSpotifyIframeApiReady=api=>res(api);const s=document.createElement("script");s.src="https://open.spotify.com/embed/iframe-api/v1";s.async=true;s.onerror=()=>{spReady=null;rej(new Error("sp"));};document.head.appendChild(s);});return spReady;}
function albList(aid){const f=findAlbum(aid);const tr=(TRK&&TRK[aid]&&TRK[aid].tr)||[];if(!f)return null;
  return {id:"alb:"+aid,name:f.a.t,album:true,items:tr.map((t,i)=>({aid,i,t:t.t,alb:f.a.t,art:f.g.artist,y:f.a.y,s:t.s||0,sp:t.sp||null,yt:t.yt||null,cov:f.a.cov||null}))};}
function qSrc(lid){return lid.startsWith("alb:")?albList(lid.slice(4)):LISTS.find(l=>l.id===lid);}
function qList(){return Q&&qSrc(Q.lid);}
function qIds(x){const t=TRK&&TRK[x.aid]&&TRK[x.aid].tr?TRK[x.aid].tr[x.i]:null;return {sp:(t&&t.sp)||x.sp||null,yt:(t&&t.yt)||x.yt||null};}
function qPref(){return PLAT==="spotify"?"sp":"yt";}
let SPYT=false;/* bu oturumda Spotify önizleme verdi → YouTube tercih */
/* v8: telefon/tablet — Spotify gömülü çalar orada yalnız 30 sn önizleme verir */
const MOB=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
function spMob(){return MOB&&PLAT==="spotify";}
let SPFB=store.get("spFallback",false);
function qEng(x){const d=qIds(x),p=(qPref()==="sp"&&(SPYT||MOB))?"yt":qPref();if(p==="sp")return d.sp?"sp":d.yt?"yt":null;return d.yt?"yt":d.sp?"sp":null;}
function qIdx(){const l=qList();if(!l)return -1;const k=l.items.findIndex(x=>x.aid===Q.cur.aid&&x.i===Q.cur.i);return k;}
function resetPlayer(){hideSpNote();try{if(YTP)YTP.destroy();}catch(e){}try{if(SPC)SPC.destroy();}catch(e){}YTP=null;SPC=null;ENG=null;$("dkpl").innerHTML="";}
async function qPlay(lid,k){
  await loadTracks();
  const l=qSrc(lid);if(!l||!l.items.length)return;
  let j=k;while(j<l.items.length&&!qEng(l.items[j]))j++;
  if(j>=l.items.length){toast(u("dock.none"));return;}
  Q={lid,k:j,cur:{aid:l.items[j].aid,i:l.items[j].i}};
  renderDock();playItem(l.items[j]);
  if(VIEW==="lists"&&OPENLIST===lid)renderLists();
}
async function playItem(x){
  try{if(ALBC)ALBC.pause();}catch(e){}
  const e=qEng(x),d=qIds(x);
  try{if(e==="yt")await ytPlay(d.yt);else if(e==="sp")await spPlay(d.sp);}catch(err){console.error(err);toast(u("dock.error"));}
}
/* v16: masaüstünde pencere gizli/simge durumundayken yeni iframe açılırsa tarayıcı sesi pencere görünene kadar başlatmıyor.
   Gizliyken mevcut çaları yeniden kullan (telefondaki gibi); görünürken v9'daki gibi yeni iframe (Geri tuşu geçmişi temiz kalsın). */
function reusePl(){return MOB||document.hidden;}
async function ytPlay(id){
  await loadYT();
  if(ENG!=="yt"||!YTP||!reusePl()){resetPlayer();$("dkpl").innerHTML='<div id="ytp"></div>';ENG="yt";
    YTP=new YT.Player("ytp",{host:"https://www.youtube-nocookie.com",videoId:id,width:"100%",height:"100%",
      playerVars:{autoplay:1,playsinline:1,rel:0,modestbranding:1},
      events:{onReady:ev=>ev.target.playVideo(),onStateChange:ev=>{if(ev.data===0)qNext(true);},onError:()=>setTimeout(()=>qNext(true),800)}});
    $("dkpl").className="dk-pl yt";layoutDock();}
  else YTP.loadVideoById(id);
}
async function spPlay(id){
  const api=await loadSP();const uri="spotify:track:"+id;
  SPST={t0:Date.now(),started:false,done:false,last:0};
  if(ENG!=="sp"||!SPC||!reusePl()){resetPlayer();$("dkpl").innerHTML='<div id="spp"></div>';ENG="sp";$("dkpl").className="dk-pl sp";
    SPC=await spCtl(api,$("spp"),uri,80,c=>c.addListener("playback_update",spUpd));
    layoutDock();}
  else spLoad(SPC,uri);
}
function curItem(){const l=qList();const k=l?qIdx():-1;return k>=0?l.items[k]:null;}
function spUpd(e){const d=e&&e.data;if(!d||!SPST||!d.duration)return;
  if(!SPST.chk&&d.duration>1000){SPST.chk=true;const x=curItem();const real=((x&&x.s)||0)*1000;
    if(d.duration<=31000&&(real===0||real>d.duration+5000))onSpPreview(x);}
  if(Date.now()-SPST.t0<1200)return;
  if(!d.isPaused&&d.position>0)SPST.started=true;
  const nearEnd=d.position>=d.duration-700||(d.isPaused&&SPST.last>=d.duration-1500);
  if(SPST.started&&!SPST.done&&nearEnd){SPST.done=true;setTimeout(()=>qNext(true),300);}
  SPST.last=d.position;}
function onSpPreview(x){
  if(SPFB&&x&&qIds(x).yt){SPYT=true;toast(u("sp.prev.switched"));playItem(x);return;}
  showSpNote(x);}
function showSpNote(x){const n=$("dknote");if(!n)return;const id=x&&qIds(x).sp;
  n.innerHTML=`<div class="dn-t">${esc(u(MOB?"sp.prev.mob":"sp.prev.msg"))}</div><div class="dn-b">
    ${x&&qIds(x).yt?`<button class="btn small primary" onclick="spUseYT()">▶ ${esc(u("sp.prev.yt"))}</button>`:""}
    ${MOB?"":`<button class="btn small ghost" onclick="spHelp()">${esc(u("sp.prev.how"))}</button>`}
    ${id?`<a class="btn small ghost" href="https://open.spotify.com/track/${id}" target="_blank" rel="noopener">${esc(u("sp.prev.open"))} ↗</a>`:""}
    <button class="ib" title="${esc(u("dock.close"))}" onclick="hideSpNote()">✕</button></div>`;
  n.classList.add("show");layoutDock();}
function hideSpNote(){const n=$("dknote");if(n){n.classList.remove("show");n.innerHTML="";}layoutDock();}
function spUseYT(){SPYT=true;hideSpNote();const x=curItem();if(x)playItem(x);}
function spHelp(){go("settings");setTimeout(()=>{const h=$("sphelp");if(h){h.open=true;h.scrollIntoView({behavior:"smooth",block:"start"});}},50);}
function setSpFB(v){SPFB=v;store.set("spFallback",v);renderSettings();toast(u("settings.saved"));}
function qNext(auto){const l=qList();if(!l)return;let k=qIdx();if(k<0)k=Q.k-1;let j=k+1;
  while(j<l.items.length&&!qEng(l.items[j]))j++;
  if(j>=l.items.length){if(auto)toast(u("dock.ended"));return;}
  Q.k=j;Q.cur={aid:l.items[j].aid,i:l.items[j].i};renderDock();playItem(l.items[j]);if(VIEW==="lists"&&OPENLIST===Q.lid)renderLists();}
function qPrev(){const l=qList();if(!l)return;let k=qIdx();if(k<0)k=Q.k;let j=k-1;
  while(j>=0&&!qEng(l.items[j]))j--;if(j<0)return;
  Q.k=j;Q.cur={aid:l.items[j].aid,i:l.items[j].i};renderDock();playItem(l.items[j]);if(VIEW==="lists"&&OPENLIST===Q.lid)renderLists();}
function qPause(){try{if(ENG==="yt"&&YTP)YTP.pauseVideo();if(ENG==="sp"&&SPC)SPC.pause();}catch(e){}}
function qClose(){resetPlayer();const lid=Q&&Q.lid;Q=null;$("dock").classList.remove("show");layoutDock();if(CUR&&$("albbody"))updAlbBody();if(VIEW==="lists"&&OPENLIST===lid)renderLists();}
function renderDock(){
  const l=qList();if(!l){qClose();return;}let k=qIdx();const x=k>=0?l.items[k]:null;
  $("dkhd").innerHTML=x?`${img(x.cov)}<div class="dk-t" onclick="openAlbum('${x.aid}')"><div translate="no">${esc(x.t)}</div><div><span translate="no">${esc(x.art)}</span> · ${esc(l.name)} · ${k+1}/${l.items.length}</div></div>
    <button class="ib" title="${esc(u("dock.prev"))}" onclick="qPrev()">⏮</button><button class="ib" title="${esc(u("dock.next"))}" onclick="qNext()">⏭</button><button class="ib" title="${esc(u("dock.close"))}" onclick="qClose()">✕</button>`:"";
  const sid=x&&spMob()?qIds(x).sp:null;const ds=$("dksp");
  if(ds){ds.innerHTML=sid&&qEng(x)==="yt"?`<span>${esc(u("sp.mob.dock"))}</span><a href="https://open.spotify.com/track/${sid}" target="_blank" rel="noopener"><span class="plat-dot" style="background:#1DB954"></span>${esc(u("sp.mob.open"))} ↗</a>`:"";ds.classList.toggle("show",!!ds.innerHTML);}
  $("dock").classList.add("show");layoutDock();
  if(CUR&&$("albbody"))updAlbBody();
}
function layoutDock(){
  const d=$("dock"),on=d.classList.contains("show"),alb=$("albview").classList.contains("show");
  const tb=alb?0:$("tabbar").offsetHeight;d.style.bottom=tb+"px";
  const h=on?d.offsetHeight:0;
  document.body.style.paddingBottom=`calc(${76+h}px + env(safe-area-inset-bottom))`;
  $("albview").style.paddingBottom=`calc(${80+h}px + env(safe-area-inset-bottom))`;
}
window.addEventListener("resize",()=>{if(Q)layoutDock();});

/* ---------- ayarlar ---------- */
function renderSettings(){
  const last=store.get("lastBackup",null);
  if(acctOn())loadAcct();
  $("v-settings").innerHTML=`<div class="page"><h1>${esc(u("tab.settings"))}</h1>
    ${acctOn()?`<div class="lbl">${esc(u("acct.title"))}</div><div class="box2" id="acctbox" style="margin-top:0;margin-bottom:22px">${acctHTML()}</div>`:""}
    <div class="lbl">${esc(u("settings.language"))}</div>
    <div class="optgrid" style="grid-template-columns:repeat(3,1fr)">${[["tr","Türkçe"],["en","English"],["de","Deutsch"]].map(([k,n])=>`<button class="opt ${LANG===k?"on":""}" onclick="setLang('${k}')">${n}</button>`).join("")}</div>
    <div class="lbl" style="margin-top:22px">${esc(u("settings.platform"))}</div>
    <div class="optgrid">${PLATS.map(([p,c])=>`<button class="opt ${PLAT===p?"on":""}" onclick="setPlat('${p}')"><span class="plat-dot" style="background:${c}"></span>${esc(platName(p))}</button>`).join("")}</div>
    <div class="lbl" style="margin-top:22px">${esc(u("sp.set.title"))}</div>
    ${MOB?`<p class="muted" id="sphelp">${esc(u("sp.mob.set"))}</p>`:`<p class="muted" style="margin-bottom:10px">${esc(u("sp.set.note"))}</p>
    <div class="optgrid" style="grid-template-columns:repeat(2,1fr)">
      <button class="opt ${SPFB?"":"on"}" onclick="setSpFB(false)">${esc(u("sp.set.stay"))}</button>
      <button class="opt ${SPFB?"on":""}" onclick="setSpFB(true)">${esc(u("sp.set.yt"))}</button></div>
    <details class="sphelp" id="sphelp"><summary>${esc(u("sp.help.title"))}</summary>
      <ol>${[1,2,3,4,5,6].map(i=>`<li>${u("sp.help."+i)}</li>`).join("")}</ol></details>`}
    <div class="lbl" style="margin-top:22px">${esc(u("settings.backup"))}</div>
    <p class="muted" style="margin-bottom:10px">${esc(u(ACCT.user?"acct.backup.note":"settings.backup.note"))}</p>
    <div style="display:flex;flex-direction:column;gap:8px">
      <button class="btn" onclick="exportLists()">↓ ${esc(u("settings.export"))}</button>
      <label class="btn">↑ ${esc(u("settings.import"))}<input type="file" accept="application/json,.json" style="display:none" onchange="importLists(this)"></label>
      <div class="muted">${esc(u("settings.lastbackup",{d:last?new Date(last).toLocaleDateString(LANG):u("settings.never")}))}</div></div>
    <div class="lbl" style="margin-top:22px">${esc(u("settings.about"))}</div><p class="muted">${esc(u("settings.about.text"))}</p>
    ${acctOn()?`<p style="margin-top:10px"><a href="#" class="plink" onclick="showPrivacy();return false">${esc(u("privacy.title"))} ›</a></p>`:""}</div>`;
}
function setPlat(p){PLAT=p;store.set("platform",p);renderPlatBadge();if($("v-settings").classList.contains("on"))renderSettings();toast(u("settings.saved"));}
function exportLists(){const blob=new Blob([JSON.stringify({app:"prog-rock-atlas",v:1,date:new Date().toISOString(),lists:LISTS},null,1)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="prog-atlas-listelerim-"+new Date().toISOString().slice(0,10)+".json";document.body.appendChild(a);a.click();a.remove();
  store.set("lastBackup",Date.now());renderSettings();}
function importLists(inp){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d.lists))throw 0;
    d.lists.forEach(l=>{const ex=LISTS.find(x=>x.id===l.id);if(ex)Object.assign(ex,l);else LISTS.push(l);});saveLists();toast(u("settings.import.ok",{n:d.lists.length}));renderSettings();}
  catch(e){toast(u("settings.import.err"));}};r.readAsText(f);}

/* ---------- karşılama ---------- */
let WL=null,WP=null;
function showWelcome(){WL=LANG;WP=PLAT||"spotify";renderWelcome();$("welcome").classList.add("show");}
function renderWelcome(){
  $("welcome").innerHTML=`<div class="page" style="max-width:520px;padding-top:calc(48px + env(safe-area-inset-top))">
    <div><div class="yr2">1967–2020</div><div class="big">${esc(u("app.title"))}</div></div>
    <div><div class="lbl">${esc(u("welcome.lang"))}</div><div class="optgrid" style="grid-template-columns:repeat(3,1fr)">${[["tr","Türkçe"],["en","English"],["de","Deutsch"]].map(([k,n])=>`<button class="opt ${WL===k?"on":""}" onclick="wLang('${k}')">${n}</button>`).join("")}</div></div>
    <div><div class="lbl">${esc(u("welcome.platform"))}</div><p class="muted" style="margin-bottom:10px">${esc(u("welcome.question"))}</p>
      <div style="display:flex;flex-direction:column;gap:8px">${PLATS.map(([p,c])=>`<button class="opt ${WP===p?"on":""}" onclick="WP='${p}';renderWelcome()"><span class="plat-dot" style="background:${c};width:12px;height:12px"></span><span>${esc(platName(p))}<small>${esc(u("plat."+p+".note"))}</small></span></button>`).join("")}</div></div>
    <div style="margin-top:auto"><button class="btn primary" style="width:100%" onclick="wEnter()">${esc(u("welcome.enter"))}</button><p class="muted" style="text-align:center;margin-top:8px">${esc(u("welcome.once"))}</p></div></div>`;
}
async function wLang(l){WL=l;await setLang(l);renderWelcome();}
function wEnter(){PLAT=WP;store.set("platform",WP);renderPlatBadge();$("welcome").classList.remove("show");}

/* ---------- başlat ---------- */
$("q").addEventListener("input",e=>{query=e.target.value.toLowerCase();render();});
$("lang").onchange=e=>setLang(e.target.value);
$("platbadge").onclick=()=>go("settings");
$("addbg").onclick=closeAdd;
(async()=>{
  try{await setLang(detectLang());}catch(err){console.error(err);$("main").innerHTML='<div class="empty">Veri yüklenemedi / Could not load data (http/https).</div>';return;}
  if(!PLAT)showWelcome();
  if(acctOn()&&store.get("acct",false))loadAcct();
  const m=location.hash.match(/^#a=(.+)$/),mm=location.hash.match(/^#m=(.+)$/),hs=history.state;
  if(m)openAlbum(m[1],hs&&hs.a===m[1]&&hs.tab||null,"init");else if(mm)openMus(mm[1],"init");
  $("home").onclick=goHome;
  loadTracks();loadKadro();
})();
