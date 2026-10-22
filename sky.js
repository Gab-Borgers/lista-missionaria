// Céu estrelado: estrelas que cintilam e, de tempos em tempos, uma estrela cadente.
(function () {
  var c = document.getElementById("ceu");
  if (!c) return;
  var ctx = c.getContext("2d");
  var reduz = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var w = 0, h = 0, estrelas = [], cadente = null, proxima = 3500, ultimo = 0;

  function montar() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round((w * h) / 5200);
    estrelas = [];
    for (var i = 0; i < n; i++) {
      estrelas.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.3,
        fase: Math.random() * 6.28,
        vel: 0.5 + Math.random() * 1.3,
        ouro: Math.random() < 0.2
      });
    }
  }

  function quadro(t) {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < estrelas.length; i++) {
      var e = estrelas[i];
      var a = reduz ? 0.7 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(e.fase + (t / 1000) * e.vel));
      ctx.globalAlpha = a;
      ctx.fillStyle = e.ouro ? "#f0d48e" : "#e8ecff";
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (!reduz) {
      var dt = t - ultimo;
      ultimo = t;
      if (!cadente) {
        proxima -= dt;
        if (proxima <= 0) {
          cadente = { x: Math.random() * w * 0.8 + w * 0.2, y: Math.random() * h * 0.35, vida: 0 };
          proxima = 5000 + Math.random() * 5000;
        }
      } else {
        cadente.vida += dt;
        var p = cadente.vida / 1100;
        if (p >= 1) {
          cadente = null;
        } else {
          var cx = cadente.x - p * 220;
          var cy = cadente.y + p * 130;
          var g = ctx.createLinearGradient(cx, cy, cx + 90, cy - 53);
          g.addColorStop(0, "rgba(240,212,142," + (1 - p) + ")");
          g.addColorStop(1, "rgba(240,212,142,0)");
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + 90, cy - 53);
          ctx.stroke();
        }
      }
    }
  }

  var rodando = true;
  function laco(t) {
    if (rodando) quadro(t);
    if (!reduz) requestAnimationFrame(laco);
  }

  montar();
  var larguraAntes = w;
  window.addEventListener("resize", function () {
    // a barra do navegador no celular muda a altura ao rolar; só refaz quando a largura muda
    if (window.innerWidth !== larguraAntes) {
      larguraAntes = window.innerWidth;
      montar();
      if (reduz) quadro(0);
    }
  });
  document.addEventListener("visibilitychange", function () { rodando = !document.hidden; });
  requestAnimationFrame(laco);
})();
