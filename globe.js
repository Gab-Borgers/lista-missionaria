// Globo de pontos com rotas douradas convergindo para Londrina.
(function () {
  var c = document.getElementById("globo");
  if (!c) return;
  var ctx = c.getContext("2d");
  var reduz = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var RAD = Math.PI / 180;
  var LONDRINA = [-23.31, -51.16];
  var ORIGENS = [
    [-19.92, -43.94], // Belo Horizonte
    [38.72, -9.14],   // Lisboa
    [40.71, -74.0],   // Nova York
    [-26.2, 28.04],   // Joanesburgo
    [35.68, 139.69],  // Tóquio
    [-33.87, 151.2],  // Sydney
    [9.06, 7.49]      // Abuja
  ];
  var LAT0 = -8 * RAD;
  var w = 0, h = 0, R = 0, cx = 0, cy = 0;

  function vetor(lat, lon) {
    lat *= RAD; lon *= RAD;
    return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
  }

  var pontos = [];
  var N = 720, ouroAng = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < N; i++) {
    var y = 1 - (2 * (i + 0.5)) / N;
    var r = Math.sqrt(1 - y * y);
    var th = ouroAng * i;
    pontos.push([r * Math.sin(th), y, r * Math.cos(th)]);
  }

  var alvo = vetor(LONDRINA[0], LONDRINA[1]);
  var rotas = ORIGENS.map(function (o, k) {
    var a = vetor(o[0], o[1]);
    var dot = Math.max(-1, Math.min(1, a[0] * alvo[0] + a[1] * alvo[1] + a[2] * alvo[2]));
    return { a: a, ang: Math.acos(dot), fase: k * 0.37 };
  });

  function gira(v, lon0) {
    var c0 = Math.cos(lon0), s0 = Math.sin(lon0);
    var x1 = v[0] * c0 - v[2] * s0;
    var z1 = v[2] * c0 + v[0] * s0;
    var y2 = Math.cos(LAT0) * v[1] - Math.sin(LAT0) * z1;
    var z2 = Math.sin(LAT0) * v[1] + Math.cos(LAT0) * z1;
    return [cx + R * x1, cy - R * y2, z2];
  }

  function arco(rt, t) {
    var s = Math.sin(rt.ang);
    var u = (1 - t), a = Math.sin(u * rt.ang) / s, b = Math.sin(t * rt.ang) / s;
    var lift = 1 + 0.2 * Math.sin(Math.PI * t);
    return [
      (rt.a[0] * a + alvo[0] * b) * lift,
      (rt.a[1] * a + alvo[1] * b) * lift,
      (rt.a[2] * a + alvo[2] * b) * lift
    ];
  }

  function medir() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = c.clientWidth; h = c.clientHeight;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(w * 0.4, h * 0.46);
    cx = w / 2; cy = h * 0.5;
  }

  function quadro(t) {
    ctx.clearRect(0, 0, w, h);
    var lon0 = (-51 + (reduz ? 0 : 55 * Math.sin(t * 0.00022))) * RAD;

    var halo = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.35);
    halo.addColorStop(0, "rgba(40,66,150,0.38)");
    halo.addColorStop(1, "rgba(40,66,150,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(216,178,94,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 6.2832);
    ctx.stroke();

    for (var i = 0; i < pontos.length; i++) {
      var p = gira(pontos[i], lon0);
      if (p[2] <= 0) continue;
      ctx.globalAlpha = 0.14 + 0.62 * p[2];
      ctx.fillStyle = "#cdd6ff";
      ctx.fillRect(p[0] - 0.7, p[1] - 0.7, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;

    var tt = t * 0.00026;
    for (var k = 0; k < rotas.length; k++) {
      var rt = rotas[k];
      var prog = reduz ? 1 : (tt + rt.fase) % 1.5;
      var fim = Math.min(1, prog), ini = Math.max(0, prog - 0.55);
      var passos = 36, ant = null;
      for (var s = 0; s <= passos; s++) {
        var q = ini + (fim - ini) * (s / passos);
        var pt = gira(arco(rt, q), lon0);
        if (ant && pt[2] > 0 && ant[2] > 0) {
          var alfa = (s / passos);
          ctx.strokeStyle = "rgba(240,212,142," + (0.15 + 0.85 * alfa) + ")";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(ant[0], ant[1]);
          ctx.lineTo(pt[0], pt[1]);
          ctx.stroke();
        }
        ant = pt;
      }
      if (!reduz && prog < 1 && ant && ant[2] > 0) {
        ctx.fillStyle = "#fff6d6";
        ctx.beginPath();
        ctx.arc(ant[0], ant[1], 2.2, 0, 6.2832);
        ctx.fill();
      }
    }

    var L = gira(alvo, lon0);
    if (L[2] > 0) {
      var pulso = reduz ? 0.4 : (t % 2200) / 2200;
      ctx.strokeStyle = "rgba(240,212,142," + (0.8 * (1 - pulso)) + ")";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(L[0], L[1], 5 + pulso * 20, 0, 6.2832);
      ctx.stroke();
      ctx.fillStyle = "#f0d48e";
      ctx.beginPath();
      ctx.arc(L[0], L[1], 4.5, 0, 6.2832);
      ctx.fill();
      ctx.font = "600 12px Figtree, system-ui, sans-serif";
      ctx.fillStyle = "#f5eedb";
      ctx.textAlign = "left";
      ctx.fillText("Londrina", L[0] + 12, L[1] + 4);
    }
  }

  var rodando = true;
  function laco(t) {
    if (rodando) quadro(t);
    if (!reduz) requestAnimationFrame(laco);
  }
  medir();
  var larguraAntes = w;
  window.addEventListener("resize", function () {
    if (c.clientWidth !== larguraAntes) { larguraAntes = c.clientWidth; medir(); if (reduz) quadro(0); }
  });
  document.addEventListener("visibilitychange", function () { rodando = !document.hidden; });
  if (reduz) quadro(0); else requestAnimationFrame(laco);
})();
