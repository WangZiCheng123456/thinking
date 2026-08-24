/* ==========================================================
   焦氏易林静态站 · 主逻辑
   孟喜卦气时间起卦 / 手动选卦 / 铜钱摇卦 / 查询林辞
   ========================================================== */
'use strict';

var YILIN_INDEX = {};

/* ---------- 工具 ---------- */
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function highlight(text, kw) {
  var t = esc(text);
  var k = esc(kw);
  var out = '', idx = 0, pos;
  if (!k) return t;
  while ((pos = t.indexOf(k, idx)) >= 0) {
    out += t.slice(idx, pos) + '<mark>' + k + '</mark>';
    idx = pos + k.length;
  }
  out += t.slice(idx);
  return out;
}
function fmtDate(d) {
  return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
}
function dateToInput(d) {
  var m = String(d.getMonth() + 1), dd = String(d.getDate());
  if (m.length < 2) m = '0' + m;
  if (dd.length < 2) dd = '0' + dd;
  return d.getFullYear() + '-' + m + '-' + dd;
}
function pad2(n) { return n < 10 ? '0' + n : '' + n; }

/* ---------- 数据索引 ---------- */
function buildYilinIndex() {
  var data = window.YILIN_DATA || [];
  YILIN_INDEX = {};
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    YILIN_INDEX[r['本卦'] + '->' + r['变卦']] = r;
  }
}
function findLinCi(ben, bian) {
  return YILIN_INDEX[ben + '->' + bian];
}
function ensureData(cb) {
  if (window.YILIN_DATA && window.YILIN_DATA.length) { cb(); return; }
  fetch('jsyl123.json')
    .then(function (r) { return r.json(); })
    .then(function (d) { window.YILIN_DATA = d; cb(); })
    .catch(function () {
      document.body.insertAdjacentHTML('beforeend',
        '<div class="warn" style="text-align:center;padding:16px;">数据载入失败：请将 jsyl123.json 与本页置于同一目录，或以本地服务器打开。</div>');
      cb();
    });
}

/* ---------- 林辭结果渲染（共享） ---------- */
function renderYiLinResult(ben, bian, container, infoLines, meta) {
  var rec = findLinCi(ben, bian);
  var hBen = HEXAGRAMS[HEX_INDEX[ben]] || {};
  var hBian = HEXAGRAMS[HEX_INDEX[bian]] || {};
  var html = '';
  html += '<div class="result-grid">';
  html += '<div class="hex-card"><div>' + hexSymbolHTML(ben) + '</div>';
  html += '<div class="hex-name">' + ben + '</div>';
  html += '<div class="hex-xiang">' + hexXiang(ben) + '</div>';
  html += '<div class="hex-meaning">' + hBen.m + '</div></div>';
  html += '<div class="arrow">⟶</div>';
  html += '<div class="hex-card"><div>' + hexSymbolHTML(bian) + '</div>';
  html += '<div class="hex-name">' + bian + '</div>';
  html += '<div class="hex-xiang">' + hexXiang(bian) + '</div>';
  html += '<div class="hex-meaning">' + hBian.m + '</div></div>';
  html += '</div>';
  if (infoLines && infoLines.length) {
    html += '<div class="info-lines">' + infoLines.join('<br>') + '</div>';
  }
  if (rec) {
    html += '<div class="linci"><div class="linci-label">林 辞</div>';
    html += '<p class="linci-text">' + (rec['林辞'] || '') + '</p>';
    html += '<div class="linci-label">译 文</div>';
    html += '<p class="linci-trans">' + (rec['翻译'] || '') + '</p></div>';
  } else {
    html += '<p class="warn">未找到「' + ben + '之' + bian + '」的林辞记录，或数据未载入。</p>';
  }
  container.innerHTML = html;
  if (meta) appendSaveBar(container, meta);
}

/* ---------- 标签页 ---------- */
function setupTabs() {
  var tabs = document.querySelectorAll('.tab');
  var panels = document.querySelectorAll('.panel');
  for (var i = 0; i < tabs.length; i++) {
    (function (tab) {
      tab.addEventListener('click', function () {
        for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove('active');
        for (var k = 0; k < panels.length; k++) panels[k].classList.remove('active');
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
      });
    })(tabs[i]);
  }
}

/* ---------- 孟喜卦气 · 时间起卦 ---------- */
var guaqiBianHex = null;

function setupGuaQi() {
  var hourSel = document.getElementById('gq-hour');
  for (var i = 0; i < SHICHEN.length; i++) {
    var sc = SHICHEN[i];
    var opt = document.createElement('option');
    opt.value = String(sc.idx);
    opt.textContent = sc.name + '时（' + sc.range + '）';
    hourSel.appendChild(opt);
  }
  var now = new Date();
  document.getElementById('gq-date').value = dateToInput(now);
  hourSel.value = String(hourBranchIndex(now.getHours()));

  document.getElementById('btn-guaqi').addEventListener('click', runGuaQi);
  document.getElementById('btn-now').addEventListener('click', function () {
    var n = new Date();
    document.getElementById('gq-date').value = dateToInput(n);
    document.getElementById('gq-hour').value = String(hourBranchIndex(n.getHours()));
    runGuaQi();
  });

  /* 之卦：随机 / 自选 */
  var bianSel = document.getElementById('gq-bian-method');
  bianSel.addEventListener('change', function () {
    var slot = document.getElementById('gq-slot-bian');
    if (bianSel.value === 'pick') {
      slot.hidden = false;
      updateGuaqiBianSlot();
    } else {
      slot.hidden = true;
      guaqiBianHex = null;
    }
  });
  document.getElementById('gq-slot-bian').addEventListener('click', function () {
    openPicker('bian', function (name) {
      guaqiBianHex = name;
      updateGuaqiBianSlot();
    });
  });
  updateGuaqiBianSlot();
  runGuaQi();
}

function updateGuaqiBianSlot() {
  var slot = document.getElementById('gq-slot-bian');
  var val = document.getElementById('gq-slot-bian-val');
  if (guaqiBianHex) {
    val.innerHTML = hexSymbolSmall(guaqiBianHex) +
      '<span style="display:block;margin-top:4px;">' + guaqiBianHex + '</span>';
    slot.classList.add('selected');
  } else {
    val.textContent = '点选以择卦';
    slot.classList.remove('selected');
  }
}

function runGuaQi() {
  var dateStr = document.getElementById('gq-date').value;
  var hIdx = parseInt(document.getElementById('gq-hour').value, 10);
  var bianMethod = document.getElementById('gq-bian-method').value;
  var out = document.getElementById('gq-result');
  if (!dateStr) { out.innerHTML = '<p class="warn">请先选择日期。</p>'; return; }

  var parts = dateStr.split('-');
  var y = parseInt(parts[0], 10), m = parseInt(parts[1], 10), d = parseInt(parts[2], 10);
  if (y < 1900 || y > 2100) {
    out.innerHTML = '<p class="warn">支持范围为 1900–2100 年。</p>';
    return;
  }
  var date = new Date(y, m - 1, d);
  var lunar = solarToLunar(y, m, d);
  var dayHex = guaQiDayInfo(date);
  var ben = dayHex.hex;
  var sc = SHICHEN[hIdx];
  var term = currentTerm(date);

  /* 之卦：随机 / 自选 */
  var bian, bianLabel;
  if (bianMethod === 'pick') {
    if (!guaqiBianHex) {
      out.innerHTML = '<p class="warn">请先于上方「之卦（自选）」拣选之卦，或改为随机。</p>';
      return;
    }
    bian = guaqiBianHex;
    bianLabel = '之卦＝自选（' + bian + '）';
  } else {
    bian = KING_WEN_ORDER[Math.floor(Math.random() * 64)];
    bianLabel = '之卦＝随机（' + bian + '）';
  }

  var info = [];
  info.push('公历：' + fmtDate(date) + '　' + sc.name + '时（' + sc.range + '）');
  info.push('农历：' + lunar.year + '年　' + lunarMonthName(lunar) + lunarDayName(lunar.day) + '　属' + shengxiao(lunar.year));
  info.push('干支：' + yearGZ(lunar.year) + '年　' + monthGZ(lunar.year, lunar.month) + '月　' +
    dayGZ(y, m, d) + '日　' + hourGZ(y, m, d, hIdx * 2) + '时');
  info.push('节气：现值「' + term.name + '」之后');
  if (dayHex.special) {
    info.push('四正卦值日：今日为「' + dayHex.special + '」，本卦取「' + ben + '」');
  } else {
    info.push('卦气六日七分：' + fmtDate(dayHex.solstice) + '冬至起算，距冬至 ' + dayHex.daysSince + ' 日，'
      + '第 ' + dayHex.seq + ' 卦「' + ben + '」值日，为本卦');
  }
  info.push(bianLabel);

  renderYiLinResult(ben, bian, out, info, {
    method: '时间起卦',
    ben: ben,
    bian: bian,
    info: info,
    moving: null
  });
}

/* ---------- 手动选卦 ---------- */
var manualState = { ben: null, bian: null, target: 'ben' };

function setupManual() {
  buildPickerGrid();
  document.getElementById('slot-ben').addEventListener('click', function () { openPicker('ben'); });
  document.getElementById('slot-bian').addEventListener('click', function () { openPicker('bian'); });
  document.getElementById('btn-picker-close').addEventListener('click', closePicker);
  document.getElementById('btn-manual-clear').addEventListener('click', function () {
    manualState.ben = null;
    manualState.bian = null;
    updateManualSlots();
    document.getElementById('manual-result').innerHTML = '';
  });
  document.getElementById('btn-manual-query').addEventListener('click', function () {
    if (!manualState.ben || !manualState.bian) {
      document.getElementById('manual-result').innerHTML = '<p class="warn">请先选定本卦与之卦。</p>';
      return;
    }
    renderYiLinResult(manualState.ben, manualState.bian, document.getElementById('manual-result'), [], {
      method: '手动摇卦',
      ben: manualState.ben,
      bian: manualState.bian,
      info: [],
      moving: null
    });
  });
  updateManualSlots();
}

function buildPickerGrid() {
  var grid = document.getElementById('picker-grid');
  grid.innerHTML = '';
  for (var i = 0; i < KING_WEN_ORDER.length; i++) {
    (function (h) {
      var tile = document.createElement('div');
      tile.className = 'hex-tile';
      tile.innerHTML = hexSymbolSmall(h.n) + '<div class="tile-name">' + h.n + '</div>';
      tile.title = h.n + '（' + hexXiang(h.n) + '）';
      tile.addEventListener('click', function () {
        if (pickerState.onPick) {
          pickerState.onPick(h.n);
        } else {
          manualState[pickerState.target] = h.n;
          updateManualSlots();
        }
        closePicker();
      });
      grid.appendChild(tile);
    })(HEXAGRAMS[HEX_INDEX[KING_WEN_ORDER[i]]]);
  }
}

var pickerState = { target: 'ben', onPick: null };
function openPicker(target, onPick) {
  pickerState.target = target;
  pickerState.onPick = onPick || null;
  document.getElementById('picker-title').textContent =
    (target === 'ben' ? '择 本 卦' : '择 之 卦');
  document.getElementById('picker-overlay').hidden = false;
}
function closePicker() {
  document.getElementById('picker-overlay').hidden = true;
}
function updateManualSlots() {
  var benSlot = document.getElementById('slot-ben');
  var bianSlot = document.getElementById('slot-bian');
  if (manualState.ben) {
    document.getElementById('slot-ben-val').innerHTML =
      hexSymbolSmall(manualState.ben) + '<span style="display:block;margin-top:4px;">' + manualState.ben + '</span>';
    benSlot.classList.add('selected');
  } else {
    document.getElementById('slot-ben-val').textContent = '点选以择卦';
    benSlot.classList.remove('selected');
  }
  if (manualState.bian) {
    document.getElementById('slot-bian-val').innerHTML =
      hexSymbolSmall(manualState.bian) + '<span style="display:block;margin-top:4px;">' + manualState.bian + '</span>';
    bianSlot.classList.add('selected');
  } else {
    document.getElementById('slot-bian-val').textContent = '点选以择卦';
    bianSlot.classList.remove('selected');
  }
}

/* ---------- 铜钱摇卦 ---------- */
var coinState = { lines: [], tossing: false };
var YAO_NAMES = ['初', '二', '三', '四', '五', '上'];

function coinValue(backs) {
  if (backs === 3) return { value: 9, yao: 1, moving: true, label: '老阳', mark: '○' };
  if (backs === 2) return { value: 7, yao: 1, moving: false, label: '少阳', mark: '' };
  if (backs === 1) return { value: 8, yao: 0, moving: false, label: '少阴', mark: '' };
  return { value: 6, yao: 0, moving: true, label: '老阴', mark: '×' };
}

function setupCoins() {
  document.getElementById('btn-toss').addEventListener('click', tossOne);
  document.getElementById('btn-reset').addEventListener('click', resetCoins);
  document.getElementById('btn-auto').addEventListener('click', autoToss);
  renderCoinLines();
}

function tossOne() {
  if (coinState.tossing) return;
  if (coinState.lines.length >= 6) {
    document.getElementById('coin-result').innerHTML = '<p class="warn">已成卦，请先「重置」再摇。</p>';
    return;
  }
  coinState.tossing = true;
  var backs = 0, coins = [];
  for (var i = 0; i < 3; i++) {
    var back = Math.random() < 0.5;
    if (back) backs++;
    coins.push(back);
  }
  setTimeout(function () {
    var info = coinValue(backs);
    coinState.lines.push({ backs: backs, coins: coins, value: info.value, yao: info.yao, moving: info.moving, label: info.label });
    coinState.tossing = false;
    renderCoinLines();
    if (coinState.lines.length === 6) finishCoin();
  }, 600);
}

function autoToss() {
  if (coinState.tossing) return;
  if (coinState.lines.length >= 6) {
    document.getElementById('coin-result').innerHTML = '<p class="warn">已成卦，请先「重置」再摇。</p>';
    return;
  }
  var timer = setInterval(function () {
    if (coinState.lines.length >= 6) { clearInterval(timer); return; }
    tossOne();
  }, 700);
}

function resetCoins() {
  coinState.lines = [];
  coinState.tossing = false;
  renderCoinLines();
  document.getElementById('coin-result').innerHTML = '';
}

function renderCoinLines() {
  var holder = document.querySelector('.coin-line-holder');
  if (coinState.lines.length === 0) {
    holder.innerHTML = '<div class="search-summary">尚无摇卦记录：点击「摇卦」掷出六爻（自下而上），或「自动连摇六次」。</div>';
    return;
  }
  holder.innerHTML = '';
  var total = coinState.lines.length;
  var order = [];
  for (var o = 0; o < total; o++) order.push(o);
  /* 六次摇完后，列表以「上爻在上、初爻在下」显示 */
  if (total === 6) order.reverse();
  for (var k = 0; k < order.length; k++) {
    var i = order[k];
    var ln = coinState.lines[i];
    var div = document.createElement('div');
    div.className = 'coin-line';
    var coinsHtml = '';
    for (var c = 0; c < ln.coins.length; c++) {
      coinsHtml += '<span class="coin">' + (ln.coins[c] ? '背' : '字') + '</span>';
    }
    div.innerHTML = '<span class="line-no">第' + YAO_NAMES[i] + '爻</span>'
      + '<span class="coins">' + coinsHtml + '</span>'
      + '<span class="line-verdict">' + ln.value + ' · <b>' + ln.label + '</b>' + (ln.moving ? '（动）' : '（静）') + '</span>';
    holder.appendChild(div);
  }
}

function finishCoin() {
  var benLines = coinState.lines.map(function (l) { return l.yao; });
  var moving = coinState.lines.map(function (l) { return l.moving; });
  var bianLines = benLines.slice();
  for (var i = 0; i < 6; i++) {
    if (moving[i]) bianLines[i] = 1 - bianLines[i];
  }
  var ben = hexNameFromLines(benLines);
  var bian = hexNameFromLines(bianLines);
  var mvText = [];
  for (var j = 0; j < 6; j++) if (moving[j]) mvText.push(YAO_NAMES[j] + '爻');
  var info = ['动爻：' + (mvText.length ? mvText.join('、') : '无动爻（静卦）')];
  renderCoinResult(ben, bian, moving, info);
}

function renderCoinResult(ben, bian, moving, infoLines) {
  var container = document.getElementById('coin-result');
  var rec = findLinCi(ben, bian);
  var hBen = HEXAGRAMS[HEX_INDEX[ben]] || {};
  var hBian = HEXAGRAMS[HEX_INDEX[bian]] || {};
  var html = '';
  html += '<div class="result-grid">';
  html += '<div class="hex-card"><div>' + hexSymbolHTML(ben, '', moving) + '</div>';
  html += '<div class="hex-name">' + ben + '</div>';
  html += '<div class="hex-xiang">' + hexXiang(ben) + '</div>';
  html += '<div class="hex-meaning">' + hBen.m + '</div></div>';
  html += '<div class="arrow">⟶</div>';
  html += '<div class="hex-card"><div>' + hexSymbolHTML(bian) + '</div>';
  html += '<div class="hex-name">' + bian + '</div>';
  html += '<div class="hex-xiang">' + hexXiang(bian) + '</div>';
  html += '<div class="hex-meaning">' + hBian.m + '</div></div>';
  html += '</div>';
  if (infoLines && infoLines.length) {
    html += '<div class="info-lines">' + infoLines.join('<br>') + '</div>';
  }
  if (rec) {
    html += '<div class="linci"><div class="linci-label">林 辞</div>';
    html += '<p class="linci-text">' + (rec['林辞'] || '') + '</p>';
    html += '<div class="linci-label">译 文</div>';
    html += '<p class="linci-trans">' + (rec['翻译'] || '') + '</p></div>';
  } else {
    html += '<p class="warn">未找到「' + ben + '之' + bian + '」的林辞记录。</p>';
  }
  container.innerHTML = html;
  appendSaveBar(container, {
    method: '铜钱摇卦',
    ben: ben,
    bian: bian,
    info: infoLines,
    moving: moving
  });
}

/* ---------- 查询林辞 ---------- */
var QLIST_STATE = { all: [], shown: 0 };

/* 卦名识别：支持键入卦名或卦象称谓（如「天风姤」）；留空返回 ''，未识别返回 null */
function resolveHexName(raw) {
  var s = (raw || '').trim();
  if (!s) return '';
  if (Object.prototype.hasOwnProperty.call(HEX_INDEX, s)) return s;
  for (var i = 0; i < KING_WEN_ORDER.length; i++) {
    if (hexXiang(KING_WEN_ORDER[i]) === s) return KING_WEN_ORDER[i];
  }
  return null;
}

/* 模糊候选排序：精确 → 卦名包含 → 卦象称谓包含 */
function hexMatchCandidates(q) {
  q = (q || '').trim();
  if (!q) return [];
  var exact = [], contains = [], xiang = [];
  for (var i = 0; i < KING_WEN_ORDER.length; i++) {
    var n = KING_WEN_ORDER[i];
    if (n === q) { exact.push(n); }
    else if (n.indexOf(q) >= 0) { contains.push(n); }
    else {
      var x = hexXiang(n);
      if (x && x.indexOf(q) >= 0) xiang.push(n);
    }
  }
  return exact.concat(contains, xiang);
}

function highlightSub(text, q) {
  var idx = text.indexOf(q);
  if (idx < 0) return esc(text);
  return esc(text.slice(0, idx)) + '<b>' + esc(q) + '</b>' + esc(text.slice(idx + q.length));
}

/* 文本框 + 候选中选（支持输入法键入、上下键选择、回车确认） */
function setupHexAutocomplete(inputId, listId) {
  var input = document.getElementById(inputId);
  var list = document.getElementById(listId);
  var active = -1, shown = [];

  function hide() { list.classList.remove('show'); list.innerHTML = ''; active = -1; shown = []; }

  function render() {
    var q = input.value;
    shown = hexMatchCandidates(q);
    if (!shown.length) { hide(); return; }
    var html = '';
    for (var i = 0; i < shown.length; i++) {
      var n = shown[i];
      html += '<div class="ac-item' + (i === active ? ' active' : '') + '" data-i="' + i + '">'
        + '<span>' + highlightSub(n, q) + '</span>'
        + '<span class="ac-xiang">' + highlightSub(hexXiang(n), q) + '</span></div>';
    }
    list.innerHTML = html;
    list.classList.add('show');
  }

  function choose(idx) {
    if (idx < 0 || idx >= shown.length) return;
    input.value = shown[idx];
    hide();
  }

  input.addEventListener('input', function () { active = -1; render(); });
  input.addEventListener('keydown', function (e) {
    /* 输入法组字期间的回车交给输入法处理，避免误触发查询 */
    if (e.isComposing || e.keyCode === 229) return;
    if (list.classList.contains('show') && shown.length) {
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, shown.length - 1); render(); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); render(); return; }
      if (e.key === 'Enter') { e.preventDefault(); choose(active >= 0 ? active : 0); doQuery(); return; }
      if (e.key === 'Escape') { hide(); return; }
    }
    if (e.key === 'Enter') doQuery();
  });
  input.addEventListener('focus', function () { active = -1; render(); });
  input.addEventListener('blur', function () { setTimeout(hide, 150); });
  list.addEventListener('mousedown', function (e) {
    var t = e.target;
    while (t && t !== list && !(t.classList && t.classList.contains('ac-item'))) t = t.parentNode;
    if (t && t.classList && t.classList.contains('ac-item')) {
      choose(parseInt(t.getAttribute('data-i'), 10));
      e.preventDefault();
    }
  });
}

function setupQuery() {
  setupHexAutocomplete('q-bengua', 'q-bengua-ac');
  setupHexAutocomplete('q-biangua', 'q-biangua-ac');
  document.getElementById('btn-query').addEventListener('click', doQuery);
  var searchInput = document.getElementById('q-search');
  var timer = null;
  searchInput.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(doSearch, 250);
  });
}

/* 批次查询：本卦／之卦可留空。两者皆填查单一组合；
   仅填本卦或仅填之卦，或两者皆空时，列出所有符合条件的林辞。 */
function doQuery() {
  var container = document.getElementById('query-result');
  var benRaw = document.getElementById('q-bengua').value;
  var bianRaw = document.getElementById('q-biangua').value;
  var ben = resolveHexName(benRaw);
  var bian = resolveHexName(bianRaw);
  if (benRaw.trim() && ben === null) {
    container.innerHTML = '<p class="warn">未识别本卦「' + esc(benRaw) + '」，请从候选中点选或输入正确卦名。</p>';
    return;
  }
  if (bianRaw.trim() && bian === null) {
    container.innerHTML = '<p class="warn">未识别之卦「' + esc(bianRaw) + '」，请从候选中点选或输入正确卦名。</p>';
    return;
  }
  if (ben && bian) { renderYiLinResult(ben, bian, container); return; }
  var data = window.YILIN_DATA || [];
  var hits = [];
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    if (ben && r['本卦'] !== ben) continue;
    if (bian && r['变卦'] !== bian) continue;
    hits.push(r);
  }
  QLIST_STATE.all = hits;
  QLIST_STATE.shown = 0;
  drawYilinList(container);
}

/* 批次结果：不显示卦象，每条左上角标注「本卦之之卦」，仅列林辞与译文；
   每次载入 200 条，可点「载入更多」查看其余。 */
function drawYilinList(container) {
  var records = QLIST_STATE.all;
  var total = records.length;
  var BATCH = 200;
  var shown = Math.min(QLIST_STATE.shown + BATCH, total);
  var html = '<div class="search-summary">共检出 ' + total + ' 条（已显示 ' + shown + ' 条）</div>';
  if (total) {
    html += '<div class="search-list">';
    for (var i = 0; i < shown; i++) {
      var rec = records[i];
      html += '<div class="search-item">'
        + '<div class="si-head">' + (rec['本卦'] || '') + '之' + (rec['变卦'] || '') + '</div>'
        + '<div class="si-text">' + (rec['林辞'] || '') + '</div>'
        + '<div class="si-trans">' + (rec['翻译'] || '') + '</div>'
        + '</div>';
    }
    html += '</div>';
  } else {
    html += '<p class="warn">未找到符合条件的林辞，或数据未载入。</p>';
  }
  if (shown < total) {
    html += '<button type="button" class="secondary" id="btn-q-more" style="display:block;margin:12px auto;">载入更多（' + shown + '/' + total + '）</button>';
  }
  container.innerHTML = html;
  QLIST_STATE.shown = shown;
  var moreBtn = document.getElementById('btn-q-more');
  if (moreBtn) {
    moreBtn.addEventListener('click', function () { drawYilinList(container); });
  }
}

/* ---------- 全文检索 ---------- */
function doSearch() {
  var kw = document.getElementById('q-search').value.trim();
  var container = document.getElementById('search-result');
  if (!kw) { container.innerHTML = ''; return; }
  var data = window.YILIN_DATA || [];
  var hits = [];
  var total = 0;
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    var lin = r['林辞'] || '';
    var tran = r['翻译'] || '';
    if (lin.indexOf(kw) >= 0 || tran.indexOf(kw) >= 0) {
      total++;
      if (hits.length < 200) hits.push(r);
    }
  }
  var html = '<div class="search-summary">共检出 ' + total + ' 条' +
    (total > 200 ? '（显示前 200 条）' : '') + '</div>';
  if (hits.length) {
    html += '<div class="search-list">';
    for (var j = 0; j < hits.length; j++) {
      var rec = hits[j];
      html += '<div class="search-item">'
        + '<div class="si-head">' + (rec['本卦'] || '') + '之' + (rec['变卦'] || '') + '</div>'
        + '<div class="si-text">' + highlight(rec['林辞'] || '', kw) + '</div>'
        + '<div class="si-trans">' + highlight(rec['翻译'] || '', kw) + '</div>'
        + '</div>';
    }
    html += '</div>';
  } else {
    html += '<p class="warn">未找到与「' + esc(kw) + '」相关的林辞。</p>';
  }
  container.innerHTML = html;
}

/* ---------- 保存记录（localStorage） ---------- */
var SAVE_KEY = 'yilin_saved_records';

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'); }
  catch (e) { return []; }
}
function saveList(list) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(list)); }
  catch (e) { /* 存储不可用时静默忽略 */ }
}
function formatSavedTime(d) {
  return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 '
    + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}
function flashSave(btn, text) {
  var old = btn.textContent;
  btn.textContent = text;
  btn.style.color = '#1d6b3c';
  setTimeout(function () {
    btn.textContent = old;
    btn.style.color = '';
  }, 1500);
}

/* 在结果容器下方附加「所问之事 + 保存」条 */
function appendSaveBar(container, data) {
  var bar = document.createElement('div');
  bar.className = 'save-bar';
  bar.innerHTML =
    '<input type="text" class="save-question" placeholder="所问何事？如：此行是否顺利、此事成败若何……">' +
    '<button type="button" class="primary">保存此卦</button>';
  var input = bar.querySelector('.save-question');
  var btn = bar.querySelector('button');
  btn.addEventListener('click', function () {
    var q = input.value.trim();
    if (!q) {
      input.focus();
      input.style.borderColor = '#c05555';
      flashSave(btn, '请先填写所问之事');
      return;
    }
    var rec = findLinCi(data.ben, data.bian);
    var record = {
      id: 'r' + Date.now() + '_' + Math.floor(Math.random() * 10000),
      savedAt: formatSavedTime(new Date()),
      method: data.method,
      question: q,
      ben: data.ben,
      bian: data.bian,
      linci: rec ? (rec['林辞'] || '') : '',
      trans: rec ? (rec['翻译'] || '') : '',
      info: data.info || [],
      moving: data.moving || null
    };
    saveRecord(record);
    input.style.borderColor = '';
    flashSave(btn, '已保存 ✓');
  });
  container.appendChild(bar);
}

function saveRecord(record) {
  var list = loadSaved();
  list.unshift(record);
  saveList(list);
  updateRecordsCount();
  drawRecords();
}
function deleteRecord(id) {
  var list = loadSaved().filter(function (r) { return r.id !== id; });
  saveList(list);
  updateRecordsCount();
  drawRecords();
}
function clearRecords() {
  if (!loadSaved().length) return;
  if (!window.confirm('确定清空全部保存记录吗？')) return;
  saveList([]);
  updateRecordsCount();
  drawRecords();
}
function updateRecordsCount() {
  var tab = document.querySelector('.tab[data-tab="records"]');
  if (tab) tab.textContent = '我的记录（' + loadSaved().length + '）';
}

/* 渲染「我的记录」列表 */
function drawRecords() {
  var container = document.getElementById('records-list');
  if (!container) return;
  var list = loadSaved();
  if (!list.length) {
    container.innerHTML =
      '<div class="record-empty">暂无保存记录。起卦得断后，点结果下方的「保存此卦」即可存入此处。</div>';
    return;
  }
  var html = '';
  for (var i = 0; i < list.length; i++) {
    var r = list[i];
    var hBen = HEXAGRAMS[HEX_INDEX[r.ben]] || {};
    var hBian = HEXAGRAMS[HEX_INDEX[r.bian]] || {};
    html += '<div class="record-item">';
    html += '<div class="record-head">'
      + '<span class="record-tag">' + esc(r.method || '') + '</span>'
      + '<span class="record-time">保存于 ' + esc(r.savedAt || '') + '</span>'
      + '<button type="button" class="record-del" data-id="' + esc(r.id) + '">删除</button>'
      + '</div>';
    html += '<div class="record-question"><b>所问之事：</b>' + esc(r.question || '') + '</div>';
    html += '<div class="result-grid">';
    html += '<div class="hex-card"><div>' + hexSymbolHTML(r.ben, '', r.moving) + '</div>'
      + '<div class="hex-name">' + r.ben + '</div>'
      + '<div class="hex-xiang">' + hexXiang(r.ben) + '</div>'
      + '<div class="hex-meaning">' + (hBen.m || '') + '</div></div>';
    html += '<div class="arrow">⟶</div>';
    html += '<div class="hex-card"><div>' + hexSymbolHTML(r.bian) + '</div>'
      + '<div class="hex-name">' + r.bian + '</div>'
      + '<div class="hex-xiang">' + hexXiang(r.bian) + '</div>'
      + '<div class="hex-meaning">' + (hBian.m || '') + '</div></div>';
    html += '</div>';
    if (r.info && r.info.length) {
      html += '<div class="info-lines">' + r.info.join('<br>') + '</div>';
    }
    if (r.linci) {
      html += '<div class="linci"><div class="linci-label">林 辞</div>'
        + '<p class="linci-text">' + esc(r.linci) + '</p>';
      if (r.trans) {
        html += '<div class="linci-label">译 文</div>'
          + '<p class="linci-trans">' + esc(r.trans) + '</p>';
      }
      html += '</div>';
    }
    html += '</div>';
  }
  container.innerHTML = html;
  var delBtns = container.querySelectorAll('.record-del');
  for (var j = 0; j < delBtns.length; j++) {
    (function (b) {
      b.addEventListener('click', function () {
        deleteRecord(b.getAttribute('data-id'));
      });
    })(delBtns[j]);
  }
}

function setupRecords() {
  var clearBtn = document.getElementById('btn-records-clear');
  if (clearBtn) clearBtn.addEventListener('click', clearRecords);
  updateRecordsCount();
  drawRecords();
}

/* ---------- 联系我们 ---------- */
function setupContact() {
  var items = document.querySelectorAll('.contact-copy[data-copy]');
  for (var i = 0; i < items.length; i++) {
    (function (el) {
      el.addEventListener('click', function () {
        copyText(el.getAttribute('data-copy'), el);
      });
    })(items[i]);
  }
}
function copyText(text, btn) {
  var done = function () {
    var old = btn.textContent;
    btn.textContent = '已复制 ✓';
    btn.style.color = '#1d6b3c';
    setTimeout(function () {
      btn.textContent = old;
      btn.style.color = '';
    }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(function () {
      fallbackCopy(text);
      done();
    });
  } else {
    fallbackCopy(text);
    done();
  }
}
function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) { /* 忽略 */ }
  document.body.removeChild(ta);
}

/* ---------- 免责声明弹窗 ---------- */
function setupDisclaimer() {
  var overlay = document.getElementById('disclaimer-overlay');
  var okBtn = document.getElementById('btn-disclaimer-ok');
  if (!overlay || !okBtn) return;
  okBtn.addEventListener('click', function () {
    overlay.hidden = true;
  });
}

/* ---------- 初始化 ---------- */
function initAll() {
  buildYilinIndex();
  setupTabs();
  setupGuaQi();
  setupManual();
  setupCoins();
  setupQuery();
  setupRecords();
  setupContact();
  setupDisclaimer();
}
document.addEventListener('DOMContentLoaded', function () {
  ensureData(initAll);
});




