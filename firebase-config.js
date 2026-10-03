/* Prog Rock Atlas — Firebase ayarları
   Firebase konsolundaki "Web uygulaması" yapılandırmasını aşağıya yapıştır.
   Bu değerler gizli değildir (her web sitesinde açıkça görünür); güvenliği firestore.rules sağlar.
   apiKey boş kaldıkça hesap özelliği sitede hiç görünmez. */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCZIkNzRwcDc8GA9oHwK9rK2s0pU7_Np0A",
  authDomain: "prog-rock-atlas.firebaseapp.com",
  projectId: "prog-rock-atlas",
  storageBucket: "prog-rock-atlas.firebasestorage.app",
  messagingSenderId: "1070273589814",
  appId: "1:1070273589814:web:f6beb1d08c7fde61881e97"
};

/* Gizlilik metninde "sorumlu kişi" olarak görünecek bilgiler */
window.SITE_OWNER = {
  name: "",   /* ör. "Barış …" */
  city: "",   /* ör. "Wien, Österreich" */
  email: ""   /* gizlilik soruları için iletişim adresi */
};
