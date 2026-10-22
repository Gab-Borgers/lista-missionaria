(function () {
  var CHAVE = "(31) 99651-3825";
  var botao = document.getElementById("copiar");
  var rotulo = document.getElementById("copiar-rotulo");
  var chave = document.getElementById("chave");
  var toast = document.getElementById("toast");
  var t1, t2;

  function aviso(msg) {
    toast.textContent = msg;
    toast.classList.add("visivel");
    clearTimeout(t2);
    t2 = setTimeout(function () { toast.classList.remove("visivel"); }, 2600);
  }

  function selecionar() {
    var r = document.createRange();
    r.selectNodeContents(chave);
    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }

  function copiarAntigo() {
    var ta = document.createElement("textarea");
    ta.value = CHAVE;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px";
    document.body.appendChild(ta);
    ta.focus();
    ta.setSelectionRange(0, ta.value.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  }

  async function copiar() {
    var ok = false;
    try {
      await navigator.clipboard.writeText(CHAVE);
      ok = true;
    } catch (e) {
      ok = copiarAntigo();
    }
    if (ok) {
      rotulo.textContent = "Chave copiada";
      botao.classList.add("marcado");
      aviso("Chave copiada: " + CHAVE);
      clearTimeout(t1);
      t1 = setTimeout(function () {
        rotulo.textContent = "Copiar chave";
        botao.classList.remove("marcado");
      }, 2600);
    } else {
      selecionar();
      aviso("Segure sobre o número para copiar");
    }
  }

  botao.addEventListener("click", copiar);
})();
