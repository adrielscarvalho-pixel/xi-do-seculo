/* O XI do século: interface. Depende de engine.js (window.XIEngine). */
(function () {
  'use strict';
  var E = window.XIEngine;
  if (!E) return;

  var STAR = '<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z"/>';
  var FILTERS = [['Todos', 'Todos'], ['GOL', 'Goleiros'], ['LD', 'Laterais-direitos'], ['ZAG', 'Zagueiros'], ['LE', 'Laterais-esquerdos'],
    ['MC', 'Meio-campistas'], ['MEI', 'Meias'], ['PD', 'Pontas-direitas'], ['PE', 'Pontas-esquerdas'], ['CA', 'Centroavantes']];
  var TOP = 20;

  var st = E.decodeState(location.hash);
  var pre = E.matchPreset(st.W, st.X);
  var ui = { filt: 'Todos', q: '', all: false, sel: null, open: null };
  var res = null, prevIds = [];

  function $(id) { return document.getElementById(id); }
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  function fmt(n) { return Math.round(n).toLocaleString('pt-BR'); }
  function fmt1(n) { return n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
  function fmt2(n) { return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function shortName(n) { return E.SHORT[n] || n; }
  function player(id) { return res.byId[id]; }

  /* ---------- cálculo ---------- */
  function calc() {
    res = E.compute(st.W, st.X, st.F);
    if (ui.sel === null || !res.inXI.has(ui.sel)) ui.sel = res.best;
  }

  /* ---------- desenho ---------- */
  function breakdown(p) {
    var rows = E.breakdownRows(p);
    if (!rows.length) return '<p class="muted small">Sem títulos ou prêmios nas categorias contadas.</p>';
    var mx = Math.max.apply(null, [1].concat(rows.map(function (r) { return r.v; })));
    return rows.map(function (r) {
      var d = E.detail(p, r.k, st.W, st.X, fmt1);
      return '<div class="brk"><span>' + r.label + '</span><span class="muted">×' + r.n + '</span><span class="pts">' + fmt(r.v) + '</span>' +
        (d ? '<span class="det">' + esc(d) + '</span>' : '') +
        '<span class="meter" aria-hidden="true"><span class="' + (r.individual ? 'i' : 'c') + '" style="width:' + (r.v / mx * 100) + '%"></span></span></div>';
    }).join('');
  }

  function renderBoard() {
    $('tokens').innerHTML = res.xi.map(function (s, i) {
      var p = s.p, changed = prevIds.length && prevIds[i] !== p.id;
      var label = p.n + ', ' + E.POS[s.pos][0] + (s.adapt ? ' adaptado' : '') + ', ' + fmt(p.t) + ' pontos';
      return '<button type="button" class="tk' + (s.pos === 'GOL' ? ' gk' : '') + (changed ? ' swap' : '') + '" data-id="' + p.id +
        '" style="left:' + s.x + '%;top:' + s.y + '%" aria-pressed="' + (p.id === ui.sel) + '" aria-label="' + esc(label) + '">' +
        '<span class="disc">' + fmt(p.t) + '</span><span class="tag">' + esc(shortName(p.n)) + '</span></button>';
    }).join('');
    $('xi-sum').textContent = fmt(res.sum);
  }

  function announceChanges() {
    var ids = res.xi.map(function (s) { return s.p.id; });
    if (prevIds.length) {
      var ins = ids.filter(function (id) { return prevIds.indexOf(id) < 0; });
      var outs = prevIds.filter(function (id) { return ids.indexOf(id) < 0; });
      if (ins.length) {
        var names = function (a) { return a.map(function (id) { return player(id).n; }).join(', '); };
        $('live').textContent = 'Mudança no XI. Entram: ' + names(ins) + '. Saem: ' + names(outs) + '.';
      }
    }
    prevIds = ids;
  }

  function renderCard() {
    var s = res.xi.filter(function (z) { return z.p.id === ui.sel; })[0];
    var p = s.p;
    var note = s.adapt ? '. Nesta formação, joga adaptado como ' + E.POS[s.pos][0] : '';
    $('card').innerHTML = '<div class="head"><div><h2>' + esc(p.n) + '</h2><p class="muted">' + E.NAT[p.nat] + ', ' + E.POS[p.pos][0] + '</p>' +
      '<p class="muted small">' + p.r + 'º no geral e ' + p.pr + 'º entre os ' + E.POS[p.pos][1] + note + '</p></div>' +
      '<div class="total"><span class="num">' + fmt(p.t) + '</span><span class="small muted">pontos</span></div></div>' + breakdown(p);
  }

  function renderRank(focusId) {
    var mx = Math.max(1, res.ranked[0].t);
    var list = res.ranked.filter(function (p) { return (ui.filt === 'Todos' || p.pos === ui.filt) && (!ui.q || p.key.indexOf(ui.q) > -1); });
    var limited = ui.filt === 'Todos' && !ui.q && !ui.all;
    var show = limited ? list.slice(0, TOP) : list;
    $('rank').innerHTML = show.length ? show.map(function (p) {
      var exp = ui.open === p.id, rn = ui.filt === 'Todos' ? p.r : p.pr;
      return '<li><button type="button" class="rk" data-rid="' + p.id + '" aria-expanded="' + exp + '"' + (exp ? ' aria-controls="det-' + p.id + '"' : '') + '>' +
        '<span class="rn num">' + rn + '</span><span class="rb"><span class="rname"><span class="ell">' + esc(p.n) + '</span>' +
        (res.inXI.has(p.id) ? '<svg class="star" viewBox="0 0 24 24" role="img" aria-label="Está no XI">' + STAR + '</svg>' : '') + '</span>' +
        '<span class="rmeta">' + cap1(E.POS[p.pos][0]) + ', ' + E.NAT[p.nat] + '</span><span class="stack" aria-hidden="true">' +
        (p.c > 0 ? '<span class="c" style="width:' + (p.c / mx * 100) + '%"></span>' : '') +
        (p.i > 0 ? '<span class="i" style="width:' + (p.i / mx * 100) + '%"></span>' : '') + '</span></span>' +
        '<span class="rp num">' + fmt(p.t) + '<span class="sr"> pontos</span></span></button>' +
        (exp ? '<div class="rdet" id="det-' + p.id + '">' + breakdown(p) + '</div>' : '') + '</li>';
    }).join('') : '<li class="empty">Nenhum jogador encontrado. Tente outro nome ou volte para "Todos".</li>';
    var more = $('more');
    more.hidden = !(ui.filt === 'Todos' && !ui.q && list.length > TOP);
    more.textContent = ui.all ? 'Mostrar só os ' + TOP + ' primeiros' : 'Mostrar todos os ' + list.length;
    $('count').textContent = list.length + (list.length === 1 ? ' jogador' : ' jogadores');
    if (focusId != null) {
      var b = document.querySelector('[data-rid="' + focusId + '"]');
      if (b) b.focus({ preventScroll: true });
    }
  }

  function renderLeagues() {
    var rows = E.leagueTable(st.W, st.X);
    var mx = Math.max(0.0001, rows[0].avg);
    $('lg-rank').innerHTML = rows.map(function (r, j) {
      return '<li class="lgr"><span class="rn num">' + (j + 1) + '</span><span class="rb"><span class="rname">' + r.name + '</span>' +
        '<span class="rmeta">Força UEFA média de ' + fmt2(r.s) + '. ' + r.dist + ' campeões diferentes. Em ' + r.heg + ' de ' + r.n +
        ' temporadas, o campeão já tinha ganho pelo menos três das cinco anteriores.</span>' +
        '<span class="stack" aria-hidden="true"><span class="c" style="width:' + (r.avg / mx * 100) + '%"></span></span></span>' +
        '<span class="rp num">' + fmt1(r.avg) + '</span></li>';
    }).join('');
    $('lg-ex').innerHTML = E.EXAMPLES.map(function (e) {
      var t = E.leagueTitleValue(e[0], e[1], st.W, st.X);
      return t ? '<li><span>' + t.club + ', ' + t.league + ' ' + t.season + '</span><span>' + fmt1(t.v) + ' pts</span></li>' : '';
    }).join('');
  }

  function renderControls() {
    each('[data-f]', function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-f') === st.F); });
    each('[data-pre]', function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-pre') === pre); });
    each('[data-filt]', function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filt') === ui.filt); });
    E.K.forEach(function (k) {
      var el = $('w-' + k);
      if (document.activeElement !== el) el.value = st.W[k];
      $('o-' + k).textContent = st.W[k];
    });
    $('x-h').value = st.X.h; $('o-h').textContent = st.X.h + '%';
    $('x-s').checked = !!st.X.s; $('x-phi').checked = !!st.X.phi;
    $('custom').hidden = pre !== '';
  }

  function writeHash() {
    var h = E.encodeState(st);
    try { history.replaceState(null, '', location.pathname + location.search + (h ? '#' + h : '')); } catch (e) { /* file:// ou sandbox */ }
  }

  function render() {
    calc(); renderControls(); renderBoard(); announceChanges(); renderCard(); renderRank(); renderLeagues(); writeHash();
  }

  /* Sliders disparam muitos eventos: agrupa num quadro de animação. */
  var queued = false;
  function scheduleRender() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; render(); });
  }

  /* ---------- aviso ---------- */
  var toastTimer;
  function toast(m) {
    var el = $('toast');
    el.textContent = m; el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('on'); }, 2800);
  }

  /* ---------- compartilhar link ---------- */
  function shareText() { return 'Meu XI do século (' + st.F + '): ' + E.lineupText(res.xi, st.F) + '.'; }

  function copy(text, ok) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(ok); }, function () { toast('Copie o endereço na barra do navegador'); });
    } else toast('Copie o endereço na barra do navegador');
  }

  function share() {
    writeHash();
    var url = location.href, text = shareText();
    if (navigator.share) {
      navigator.share({ title: 'O XI do século', text: text, url: url }).catch(function (e) {
        if (e && e.name !== 'AbortError') copy(text + '\n' + url, 'Link copiado com a sua escalação');
      });
      return;
    }
    copy(text + '\n' + url, 'Link copiado com a sua escalação');
  }

  /* ---------- imagem do time ---------- */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function fitText(ctx, text, maxW, size, weight, family) {
    var s = size;
    do { ctx.font = weight + ' ' + s + 'px ' + family; s -= 1; } while (ctx.measureText(text).width > maxW && s > 10);
  }

  function drawImage() {
    var W = 1080, H = 1350, M = 56;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    var DISP = '"Big Shoulders Display", Impact, "Arial Narrow", sans-serif', TXT = 'Archivo, system-ui, sans-serif';
    var INK = '#10261B', GOLD = '#F6D258', G1 = '#1D5E3F', G2 = '#1A5539';

    ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'alphabetic';
    ctx.font = '800 112px ' + DISP; ctx.fillText('O XI do século', M, 150);
    var label = pre ? 'Pesos: ' + pre : 'Pesos personalizados';
    ctx.font = '600 34px ' + TXT; ctx.fillStyle = '#D6E2D9';
    ctx.fillText(st.F + '  ·  ' + label, M, 206);
    ctx.textAlign = 'right'; ctx.fillStyle = GOLD; ctx.font = '800 64px ' + DISP;
    ctx.fillText(fmt(res.sum), W - M, 150);
    ctx.font = '600 26px ' + TXT; ctx.fillText('pontos no total', W - M, 196);
    ctx.textAlign = 'left';

    var px = M, py = 246, pw = W - 2 * M, ph = H - py - 120;
    ctx.save(); roundRect(ctx, px, py, pw, ph, 24); ctx.clip();
    for (var i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? G2 : G1; ctx.fillRect(px, py + i * ph / 8, pw, ph / 8 + 1); }
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px, py + ph / 2); ctx.lineTo(px + pw, py + ph / 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(px + pw / 2, py + ph / 2, pw * 0.14, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeRect(px + pw * 0.21, py - 3, pw * 0.58, ph * 0.15);
    ctx.strokeRect(px + pw * 0.21, py + ph * 0.85 + 3, pw * 0.58, ph * 0.15);
    ctx.strokeRect(px + pw * 0.37, py - 3, pw * 0.26, ph * 0.055);
    ctx.strokeRect(px + pw * 0.37, py + ph * 0.945 + 3, pw * 0.26, ph * 0.055);
    ctx.restore();

    var R = 46;
    res.xi.forEach(function (s) {
      var x = px + pw * s.x / 100, y = py + 40 + (ph - 110) * s.y / 100;
      x = Math.min(Math.max(x, px + 90), px + pw - 90);
      ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fillStyle = s.pos === 'GOL' ? GOLD : '#fff'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(16,38,27,.25)'; ctx.stroke();
      ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      fitText(ctx, fmt(s.p.t), R * 1.6, 36, '800', DISP);
      ctx.fillText(fmt(s.p.t), x, y + 2);
      var name = shortName(s.p.n);
      fitText(ctx, name, 170, 28, '600', TXT);
      var tw = ctx.measureText(name).width;
      ctx.fillStyle = 'rgba(8,26,17,.72)'; roundRect(ctx, x - tw / 2 - 12, y + R + 10, tw + 24, 42, 8); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillText(name, x, y + R + 32);
    });

    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#D6E2D9'; ctx.font = '500 28px ' + TXT;
    ctx.fillText('Títulos e prêmios de 2001 a 2026 viram pontos.', M, H - 58);
    ctx.textAlign = 'right'; ctx.fillStyle = GOLD; ctx.font = '600 28px ' + TXT;
    ctx.fillText(location.host || 'O XI do século', W - M, H - 58);
    return c;
  }

  function saveImage() {
    var btn = $('image');
    btn.disabled = true;
    var fonts = document.fonts && document.fonts.load
      ? Promise.all(['800 40px "Big Shoulders Display"', '600 20px Archivo', '500 20px Archivo'].map(function (f) { return document.fonts.load(f); })).catch(function () {})
      : Promise.resolve();
    fonts.then(function () {
      var canvas = drawImage();
      canvas.toBlob(function (blob) {
        btn.disabled = false;
        if (!blob) { toast('Não foi possível gerar a imagem'); return; }
        var name = 'xi-do-seculo-' + st.F + '.png';
        var file = typeof File === 'function' ? new File([blob], name, { type: 'image/png' }) : null;
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: 'O XI do século', text: shareText() + '\n' + location.href }).catch(function () {});
          return;
        }
        var url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        toast('Imagem salva');
      }, 'image/png');
    });
  }

  /* ---------- montagem ---------- */
  $('presets').innerHTML = Object.keys(E.PRE).map(function (n) {
    return '<button type="button" class="chip" data-pre="' + esc(n) + '" aria-pressed="false">' + n + '</button>';
  }).join('') + '<span class="chip ghost" id="custom" hidden>Personalizado</span>';
  $('filters').innerHTML = FILTERS.map(function (f) {
    return '<button type="button" class="chip" data-filt="' + f[0] + '" aria-pressed="false" title="' + f[1] + '" aria-label="' + f[1] + '">' + f[0] + '</button>';
  }).join('');
  function slider(k) {
    return '<div class="w"><label for="w-' + k + '"><span>' + E.LBL[k] + '</span><output id="o-' + k + '" for="w-' + k + '">' + st.W[k] + '</output></label>' +
      '<input type="range" id="w-' + k + '" min="0" max="' + E.W_MAX + '" step="5" value="' + st.W[k] + '"></div>';
  }
  $('wc-group').innerHTML = E.K.filter(function (k) { return !E.IND[k]; }).map(slider).join('');
  $('wi-group').innerHTML = E.K.filter(function (k) { return E.IND[k]; }).map(slider).join('');

  function setWeightsOpen(open) {
    $('weights').hidden = !open;
    $('toggle-w').setAttribute('aria-expanded', String(open));
  }

  E.K.forEach(function (k) {
    $('w-' + k).addEventListener('input', function (e) { st.W[k] = +e.target.value; pre = E.matchPreset(st.W, st.X); scheduleRender(); });
  });
  $('x-h').addEventListener('input', function (e) { st.X.h = +e.target.value; pre = E.matchPreset(st.W, st.X); scheduleRender(); });
  $('x-s').addEventListener('change', function (e) { st.X.s = e.target.checked ? 1 : 0; pre = E.matchPreset(st.W, st.X); render(); });
  $('x-phi').addEventListener('change', function (e) { st.X.phi = e.target.checked ? 1 : 0; pre = E.matchPreset(st.W, st.X); render(); });
  $('q').addEventListener('input', function (e) { ui.q = E.norm(e.target.value.trim()); ui.open = null; renderRank(); });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t) return;
    if (t.hasAttribute('data-f')) { st.F = t.getAttribute('data-f'); render(); }
    else if (t.hasAttribute('data-pre')) {
      pre = t.getAttribute('data-pre');
      st.W = Object.assign({}, E.PRE[pre].w); st.X = Object.assign({}, E.PRE[pre].x); render();
    }
    else if (t.hasAttribute('data-id')) { ui.sel = +t.getAttribute('data-id'); renderBoard(); renderCard(); }
    else if (t.hasAttribute('data-filt')) { ui.filt = t.getAttribute('data-filt'); ui.open = null; renderControls(); renderRank(); }
    else if (t.hasAttribute('data-rid')) { var id = +t.getAttribute('data-rid'); ui.open = ui.open === id ? null : id; renderRank(id); }
    else if (t.id === 'more') { ui.all = !ui.all; renderRank(); }
    else if (t.id === 'toggle-w') { setWeightsOpen($('weights').hidden); }
    else if (t.id === 'reset') { st.W = Object.assign({}, E.DEF); st.X = Object.assign({}, E.DX); pre = E.DEFAULT_PRESET; render(); toast('Pesos de volta ao padrão'); }
    else if (t.id === 'share') { share(); }
    else if (t.id === 'image') { saveImage(); }
    else if (t.id === 'install' && deferredInstall) {
      deferredInstall.prompt();
      deferredInstall = null; t.hidden = true;
    }
  });

  /* Atalho: "/" vai para a busca. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
    $('q').focus();
  });

  var deferredInstall = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredInstall = e; $('install').hidden = false; });
  window.addEventListener('appinstalled', function () { deferredInstall = null; $('install').hidden = true; toast('App instalado'); });
  window.addEventListener('hashchange', function () {
    st = E.decodeState(location.hash); pre = E.matchPreset(st.W, st.X);
    if (pre !== E.DEFAULT_PRESET) setWeightsOpen(true);
    render();
  });

  if (pre !== E.DEFAULT_PRESET) setWeightsOpen(true);
  render();
  document.documentElement.classList.add('ready');

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  }
})();
