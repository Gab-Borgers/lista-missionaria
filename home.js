import { abrirStore } from "./store.js";

/* ---------- Contagem regressiva até 18/11/2026 (horário de Brasília) ---------- */
const INICIO = new Date("2026-11-18T00:00:00-03:00").getTime();
const el = (id) => document.getElementById(id);
const dois = (n) => String(n).padStart(2, "0");

function atualizarContagem() {
  let falta = INICIO - Date.now();
  if (falta <= 0) {
    ["c-dias", "c-horas", "c-min", "c-seg"].forEach((id) => (el(id).textContent = "00"));
    el("c-msg").textContent = "A missão começou. Obrigado por cada oração e cada gesto.";
    el("t-contagem").textContent = "A missão começou";
    return false;
  }
  const s = Math.floor(falta / 1000);
  el("c-dias").textContent = Math.floor(s / 86400);
  el("c-horas").textContent = dois(Math.floor((s % 86400) / 3600));
  el("c-min").textContent = dois(Math.floor((s % 3600) / 60));
  el("c-seg").textContent = dois(s % 60);
  return true;
}
if (atualizarContagem()) {
  const timer = setInterval(() => { if (!atualizarContagem()) clearInterval(timer); }, 1000);
}

/* ---------- Mural de recados ---------- */
const lista = el("lista-recados");
const form = el("form-recado");
const aviso = el("r-aviso");
const texto = el("r-texto");
const nome = el("r-nome");

texto.addEventListener("input", () => { el("r-qtd").textContent = texto.value.length; });

function quando(d) {
  const min = Math.round((Date.now() - d.getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return "há " + min + " min";
  const h = Math.round(min / 60);
  if (h < 24) return "há " + h + " h";
  return dois(d.getDate()) + "/" + dois(d.getMonth() + 1);
}

function desenhar(recados) {
  lista.textContent = "";
  if (!recados.length) {
    const li = document.createElement("li");
    li.className = "vazio";
    li.textContent = "Ainda não há recados. Seja a primeira pessoa a escrever.";
    lista.append(li);
    return;
  }
  recados.forEach((r) => {
    const li = document.createElement("li");
    li.className = "recado";
    const topo = document.createElement("header");
    const n = document.createElement("strong");
    n.textContent = r.nome;
    const t = document.createElement("time");
    t.textContent = quando(r.quando);
    topo.append(n, t);
    const p = document.createElement("p");
    p.textContent = r.texto;
    li.append(topo, p);
    lista.append(li);
  });
}

const store = await abrirStore();
store.onRecados(desenhar);

let ultimoEnvio = 0;
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  aviso.className = "aviso";
  const n = nome.value.trim();
  const t = texto.value.trim();
  if (!n || !t) {
    aviso.className = "aviso erro";
    aviso.textContent = "Preencha seu nome e o recado.";
    return;
  }
  if (Date.now() - ultimoEnvio < 15000) {
    aviso.className = "aviso erro";
    aviso.textContent = "Espere alguns segundos antes de enviar outro recado.";
    return;
  }
  const botao = el("r-enviar");
  botao.disabled = true;
  try {
    await store.enviarRecado(n.slice(0, 40), t.slice(0, 280));
    ultimoEnvio = Date.now();
    texto.value = "";
    el("r-qtd").textContent = "0";
    aviso.textContent = "Recado publicado. Obrigado!";
  } catch (err) {
    console.warn(err);
    aviso.className = "aviso erro";
    aviso.textContent = "Não foi possível publicar agora. Tente de novo em instantes.";
  } finally {
    botao.disabled = false;
  }
});
