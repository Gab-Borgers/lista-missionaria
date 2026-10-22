import { abrirStore } from "./store.js";

const ITENS = [
  { id: "camisa-curta", nome: "Camisa branca de manga curta", nota: "Branca e lisa.", img: "camisa-curta.jpg" },
  { id: "camisa-longa", nome: "Camisa branca de manga longa", nota: "Branca e lisa.", img: "camisa-longa.jpg" },
  { id: "gravata", nome: "Gravata", nota: "Qualquer tonalidade e tipo.", img: "gravata.jpg" },
  { id: "calca", nome: "Calça social", nota: "De qualquer cor.", img: "calca.jpg" }
];

const CHAVE_MARCADOS = "cha:marcados";
let marcados = {};
try { marcados = JSON.parse(localStorage.getItem(CHAVE_MARCADOS)) || {}; } catch (e) {}
const salvarMarcados = () => { try { localStorage.setItem(CHAVE_MARCADOS, JSON.stringify(marcados)); } catch (e) {} };

let contagens = {};
const toast = document.getElementById("toast");
let tt;
function aviso(msg) {
  toast.textContent = msg;
  toast.classList.add("visivel");
  clearTimeout(tt);
  tt = setTimeout(() => toast.classList.remove("visivel"), 2600);
}

const lista = document.getElementById("itens");
const refs = {};

ITENS.forEach((it) => {
  const li = document.createElement("li");
  li.className = "item";

  const foto = document.createElement("div");
  foto.className = "foto";
  const img = document.createElement("img");
  img.src = it.img;
  img.alt = it.nome;
  img.loading = "lazy";
  foto.append(img);

  const info = document.createElement("div");
  info.className = "info";
  const h = document.createElement("h3");
  h.textContent = it.nome;
  const nota = document.createElement("p");
  nota.className = "nota";
  nota.textContent = it.nota;
  const pil = document.createElement("p");
  pil.className = "pilula";
  pil.setAttribute("aria-live", "polite");
  info.append(h, nota, pil);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "botao";
  li.append(foto, info, btn);
  lista.append(li);

  btn.addEventListener("click", () => alternar(it, btn));
  refs[it.id] = { pil, btn };
});

function textoPilula(n) {
  const b = document.createElement("span");
  const num = document.createElement("b");
  num.textContent = n;
  const frag = document.createDocumentFragment();
  frag.append(num, document.createTextNode(n === 1 ? " pessoa está levando" : " pessoas estão levando"));
  return frag;
}

function desenhar() {
  let total = 0;
  ITENS.forEach((it) => {
    const n = contagens[it.id] || 0;
    total += n;
    const r = refs[it.id];
    r.pil.textContent = "";
    r.pil.append(textoPilula(n));
    const on = !!marcados[it.id];
    r.btn.className = on ? "botao marcado" : "botao";
    r.btn.textContent = on ? "Eu vou levar · desmarcar" : "Vou levar este item";
    r.btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  document.getElementById("total").textContent =
    total === 0
      ? "Nenhuma doação marcada ainda. Seja a primeira pessoa."
      : total === 1
        ? "1 doação já foi marcada."
        : total + " doações já foram marcadas.";
}

const store = await abrirStore();
store.onContagens((c) => { contagens = c; desenhar(); });
desenhar();

async function alternar(it, btn) {
  const ligar = !marcados[it.id];
  if (!ligar && (contagens[it.id] || 0) < 1) {
    // contador já está zerado (outro aparelho desmarcou): só limpa o estado local
    delete marcados[it.id];
    salvarMarcados();
    desenhar();
    return;
  }
  btn.disabled = true;
  try {
    await store.ajustar(it.id, ligar ? 1 : -1);
    if (ligar) marcados[it.id] = true; else delete marcados[it.id];
    salvarMarcados();
    if (store.modo === "local") {
      // no modo de teste o contador já foi atualizado pelo ouvinte
    }
    aviso(ligar ? "Obrigado! Item marcado." : "Marcação removida.");
  } catch (e) {
    console.warn(e);
    aviso("Não foi possível salvar. Tente de novo.");
  } finally {
    btn.disabled = false;
    desenhar();
  }
}
