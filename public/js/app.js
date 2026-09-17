/* O XI do século: interface. Depende de engine.js (window.XIEngine). */
(function () {
  'use strict';
  var E = window.XIEngine;
  if (!E) return;

  var STAR = '<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z"/>';
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
    res = E.compute(st.W, st.X, st.F, st.L);
    st.L = res.locks;
    if (ui.sel === null || !res.inXI.has(ui.sel)) ui.sel = res.best;
  }

  function lockCount() { return Object.keys(st.L).length; }
  function slotOf(id) {
    for (var i = 0; i < res.xi.length; i++) if (res.xi[i].p.id === id) return i;
    return -1;
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
      var extra = ', ' + (p.n !== shortName(p.n) ? p.n + ', ' : '') + E.POS[s.pos][0] + (s.adapt ? ' adaptado' : '') + (s.locked ? ', escolha sua' : '');
      // O nome acessível começa pelo texto visível (pontos e nome), como pede a WCAG 2.5.3.
      return '<button type="button" class="tk' + (s.pos === 'GOL' ? ' gk' : '') + (s.locked ? ' locked' : '') + (changed ? ' swap' : '') + '" data-id="' + p.id +
        '" style="left:' + s.x + '%;top:' + s.y + '%" aria-pressed="' + (p.id === ui.sel) + '">' +
        '<span class="disc">' + fmt(p.t) + '<span class="sr"> pontos,</span></span><span class="tag">' + esc(shortName(p.n)) +
        '<span class="sr">' + esc(extra) + '</span></span></button>';
    }).join('');
    $('xi-sum').textContent = fmt(res.sum);
    var n = lockCount();
    $('locks-note').hidden = !n;
    $('locks-count').textContent = n === 1 ? '1 jogador escolhido por você.' : n + ' jogadores escolhidos por você.';
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
    var i = slotOf(ui.sel), s = res.xi[i], p = s.p;
    var note = s.adapt ? '. Nesta formação, joga adaptado como ' + E.POS[s.pos][0] : '';
    var lockInfo = '';
    if (s.locked) {
      var others = Object.assign({}, st.L);
      delete others[i];
      var auto = E.compute(st.W, st.X, st.F, others).xi[i].p;
      lockInfo = '<p class="lock-info"><span>Escolha sua.' + (auto.id !== p.id ? ' Pela conta, a vaga seria de ' + esc(auto.n) + ', com ' + fmt(auto.t) + ' pontos.' : '') + '</span>' +
        '<button type="button" class="link-btn" data-unlock="' + i + '">Voltar ao calculado</button></p>';
    }
    $('card').innerHTML = '<div class="head"><div><h2>' + esc(p.n) + '</h2><p class="muted">' + E.NAT[p.nat] + ', ' + E.POS[p.pos][0] + '</p>' +
      '<p class="muted small">' + p.r + 'º no geral e ' + p.pr + 'º entre os ' + E.POS[p.pos][1] + note + '</p></div>' +
      '<div class="total"><span class="num">' + fmt(p.t) + '</span><span class="small muted">pontos</span></div></div>' +
      '<div class="card-actions"><button type="button" class="btn" data-pick="' + i + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg>' +
      'Trocar ' + E.POS[s.pos][0] + '</button></div>' + lockInfo + breakdown(p);
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
    var n = lockCount();
    var label = (pre ? 'Pesos: ' + pre : 'Pesos personalizados') + (n ? '  ·  ' + n + (n === 1 ? ' escolha sua' : ' escolhas suas') : '');
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

  /* ---------- trocar jogador ---------- */
  var picker = $('picker');

  function openPicker(slot) {
    var s = res.xi[slot], list = E.candidates(res, slot);
    $('picker-title').textContent = 'Escolher ' + E.POS[s.pos][0];
    $('picker-hint').textContent = 'Ordenado por pontos. Quem joga adaptado tem 8% de desconto na comparação. Escolher alguém que já está no time muda o jogador de vaga.';
    $('picker-list').innerHTML = list.map(function (c, j) {
      var p = c.p, meta = [cap1(E.POS[p.pos][0]) + ', ' + E.NAT[p.nat]];
      if (c.adapt) meta.push('adaptado');
      if (c.elsewhere) meta.push('no XI como ' + E.POS[res.xi[slotOf(p.id)].pos][0]);
      return '<li><button type="button" class="rk pick' + (c.current ? ' current' : '') + '" data-choose="' + slot + ':' + p.id + '"' + (c.current ? ' aria-current="true"' : '') + '>' +
        '<span class="rn num">' + (j + 1) + '</span><span class="rb"><span class="rname"><span class="ell">' + esc(p.n) + '</span>' +
        (c.current ? '<span class="badge">Atual</span>' : '') + '</span><span class="rmeta">' + esc(meta.join(' · ')) + '</span></span>' +
        '<span class="rp num">' + fmt(c.v) + '<span class="sr"> pontos</span></span></button></li>';
    }).join('');
    if (picker.showModal) picker.showModal(); else picker.setAttribute('open', '');
    var cur = picker.querySelector('.current');
    if (cur) { cur.focus(); cur.scrollIntoView({ block: 'center' }); }
  }

  function closePicker() {
    if (picker.close) picker.close(); else picker.removeAttribute('open');
  }

  function choose(slot, id) {
    Object.keys(st.L).forEach(function (k) { if (st.L[k] === id) delete st.L[k]; });
    var others = Object.assign({}, st.L);
    delete others[slot];
    // Se a conta já escolheria esse jogador, não guarda como escolha pessoal.
    if (E.compute(st.W, st.X, st.F, others).xi[slot].p.id === id) delete st.L[slot];
    else st.L[slot] = id;
    ui.sel = id;
    closePicker();
    render();
    toast(player(id).n + ' entrou como ' + E.POS[res.xi[slot].pos][0]);
    var b = document.querySelector('[data-pick]');
    if (b) b.focus({ preventScroll: true });
  }

  // Fecha só com clique no fundo escurecido, fora da caixa (o padding da caixa também é o próprio dialog).
  picker.addEventListener('click', function (e) {
    if (e.target !== picker) return;
    var r = picker.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closePicker();
  });

  /* ---------- montagem ---------- */
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
    if (t.hasAttribute('data-f')) {
      var nf = t.getAttribute('data-f');
      if (nf !== st.F) { st.L = E.remapLocks(st.F, nf, st.L); st.F = nf; render(); }
    }
    else if (t.hasAttribute('data-pick')) { openPicker(+t.getAttribute('data-pick')); }
    else if (t.hasAttribute('data-choose')) { var c = t.getAttribute('data-choose').split(':'); choose(+c[0], +c[1]); }
    else if (t.hasAttribute('data-unlock')) { delete st.L[+t.getAttribute('data-unlock')]; render(); toast('Vaga de volta ao calculado'); }
    else if (t.id === 'unlock-all') { st.L = {}; render(); toast('XI de volta ao calculado'); }
    else if (t.id === 'picker-close') { closePicker(); }
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
