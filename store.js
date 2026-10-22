// Camada de dados: Firebase (Firestore) quando configurado; modo de teste local caso contrário.
import { FIREBASE_CONFIG } from "./firebase-config.js";

export const ITENS_IDS = ["camisa-curta", "camisa-longa", "gravata", "calca"];

const configurado =
  FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey && !/^COLE/.test(FIREBASE_CONFIG.apiKey);
const VERSAO = "10.14.1";
const BASE = "https://www.gstatic.com/firebasejs/" + VERSAO + "/";

export async function abrirStore() {
  if (configurado) {
    try {
      return await storeFirebase();
    } catch (e) {
      console.warn("Firebase indisponível, usando modo local.", e);
    }
  }
  return storeLocal();
}

async function storeFirebase() {
  const [app, fs] = await Promise.all([
    import(BASE + "firebase-app.js"),
    import(BASE + "firebase-firestore.js")
  ]);
  const db = fs.getFirestore(app.initializeApp(FIREBASE_CONFIG));
  return {
    modo: "firebase",
    onContagens(cb) {
      return fs.onSnapshot(
        fs.collection(db, "itens"),
        (snap) => {
          const o = {};
          snap.forEach((d) => { o[d.id] = Math.max(0, Number(d.data().count) || 0); });
          cb(o);
        },
        (err) => console.warn(err)
      );
    },
    async ajustar(id, delta) {
      await fs.setDoc(fs.doc(db, "itens", id), { count: fs.increment(delta) }, { merge: true });
    },
    onRecados(cb) {
      const q = fs.query(fs.collection(db, "recados"), fs.orderBy("criadoEm", "desc"), fs.limit(40));
      return fs.onSnapshot(
        q,
        (snap) => {
          cb(snap.docs.map((d) => {
            const x = d.data();
            return {
              nome: String(x.nome || ""),
              texto: String(x.texto || ""),
              quando: x.criadoEm && x.criadoEm.toDate ? x.criadoEm.toDate() : new Date()
            };
          }));
        },
        (err) => console.warn(err)
      );
    },
    async enviarRecado(nome, texto) {
      await fs.addDoc(fs.collection(db, "recados"), {
        nome: nome,
        texto: texto,
        criadoEm: fs.serverTimestamp()
      });
    }
  };
}

function storeLocal() {
  const K1 = "cha:teste:contagens", K2 = "cha:teste:recados";
  const ler = (k, pad) => {
    try { return JSON.parse(localStorage.getItem(k)) || pad; } catch (e) { return pad; }
  };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  let contagens = ler(K1, {});
  let recados = ler(K2, []);
  const ouvintes1 = [], ouvintes2 = [];
  const avisar1 = () => ouvintes1.forEach((f) => f(Object.assign({}, contagens)));
  const avisar2 = () => ouvintes2.forEach((f) => f(recados.map((r) => Object.assign({}, r, { quando: new Date(r.quando) }))));
  return {
    modo: "local",
    onContagens(cb) {
      ouvintes1.push(cb);
      setTimeout(() => cb(Object.assign({}, contagens)), 0);
      return () => ouvintes1.splice(ouvintes1.indexOf(cb), 1);
    },
    async ajustar(id, delta) {
      contagens[id] = Math.max(0, (contagens[id] || 0) + delta);
      gravar(K1, contagens);
      avisar1();
    },
    onRecados(cb) {
      ouvintes2.push(cb);
      setTimeout(() => avisar2(), 0);
      return () => ouvintes2.splice(ouvintes2.indexOf(cb), 1);
    },
    async enviarRecado(nome, texto) {
      recados.unshift({ nome: nome, texto: texto, quando: new Date().toISOString() });
      recados = recados.slice(0, 40);
      gravar(K2, recados);
      avisar2();
    }
  };
}
