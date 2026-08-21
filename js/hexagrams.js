/* ==========================================================
   焦氏易林静态站 · 卦学基础数据
   八卦 / 六十四卦 / 孟喜卦气(六日七分) / 十二辟卦 / 时辰 /
   干支 / 农历(1900-2100) / 二十四节气(太阳黄经算法)
   ========================================================== */
'use strict';

/* ---------- 八卦：三爻自下而上编码，阳=1 阴=0 ---------- */
var TRIGRAMS = {
  '乾': { bits: 7, nature: '天', symbol: '☰', de: '健' },
  '兑': { bits: 6, nature: '泽', symbol: '☱', de: '悦' },
  '离': { bits: 5, nature: '火', symbol: '☲', de: '丽' },
  '震': { bits: 4, nature: '雷', symbol: '☳', de: '动' },
  '巽': { bits: 3, nature: '风', symbol: '☴', de: '入' },
  '坎': { bits: 2, nature: '水', symbol: '☵', de: '险' },
  '艮': { bits: 1, nature: '山', symbol: '☶', de: '止' },
  '坤': { bits: 0, nature: '地', symbol: '☷', de: '顺' }
};

var BITS_TO_NAME = { 7: '乾', 6: '兑', 5: '离', 4: '震', 3: '巽', 2: '坎', 1: '艮', 0: '坤' };

/* ---------- 六十四卦（依八宫排列） ---------- */
var HEXAGRAMS = [
  /* 乾宫 */
  { n: '乾', u: '乾', l: '乾', m: '刚健中正，自强不息。' },
  { n: '姤', u: '乾', l: '巽', m: '天下有风，不期而遇。' },
  { n: '遁', u: '乾', l: '艮', m: '天下有山，退避隐遁。' },
  { n: '否', u: '乾', l: '坤', m: '天地不交，闭塞不通。' },
  { n: '观', u: '巽', l: '坤', m: '风行地上，观仰瞻视。' },
  { n: '剥', u: '艮', l: '坤', m: '山附于地，剥落衰败。' },
  { n: '晋', u: '离', l: '坤', m: '明出地上，晋升前进。' },
  { n: '大有', u: '离', l: '乾', m: '火天辉映，大有所成。' },
  /* 兑宫 */
  { n: '兑', u: '兑', l: '兑', m: '丽泽相悦，和悦待人。' },
  { n: '困', u: '兑', l: '坎', m: '泽无水，困顿守志。' },
  { n: '萃', u: '兑', l: '坤', m: '泽上于地，荟萃聚集。' },
  { n: '咸', u: '兑', l: '艮', m: '山上有泽，交感相应。' },
  { n: '蹇', u: '坎', l: '艮', m: '山上有水，险阻难行。' },
  { n: '谦', u: '坤', l: '艮', m: '地中有山，谦逊有光。' },
  { n: '小过', u: '震', l: '艮', m: '山上有雷，小有过越。' },
  { n: '归妹', u: '震', l: '兑', m: '泽上有雷，嫁娶之象。' },
  /* 离宫 */
  { n: '离', u: '离', l: '离', m: '明两作离，附丽光明。' },
  { n: '旅', u: '离', l: '艮', m: '山上有火，行旅在外。' },
  { n: '鼎', u: '离', l: '巽', m: '木上有火，鼎新革故。' },
  { n: '未济', u: '离', l: '坎', m: '火在水上，事未成而慎之。' },
  { n: '蒙', u: '艮', l: '坎', m: '蒙昧初开，启蒙教育。' },
  { n: '涣', u: '巽', l: '坎', m: '风行水上，涣散释难。' },
  { n: '讼', u: '乾', l: '坎', m: '天水违行，争讼不和。' },
  { n: '同人', u: '乾', l: '离', m: '天火同明，和同于人。' },
  /* 震宫 */
  { n: '震', u: '震', l: '震', m: '洊雷震动，奋起戒惧。' },
  { n: '豫', u: '震', l: '坤', m: '雷出地奋，喜悦安乐。' },
  { n: '解', u: '震', l: '坎', m: '雷雨作解，解除困厄。' },
  { n: '恒', u: '震', l: '巽', m: '雷风相与，恒久之道。' },
  { n: '升', u: '坤', l: '巽', m: '地中生木，循序上升。' },
  { n: '井', u: '坎', l: '巽', m: '木上有水，井养不穷。' },
  { n: '大过', u: '兑', l: '巽', m: '泽灭木，非常之举。' },
  { n: '随', u: '兑', l: '震', m: '泽中有雷，随时而动。' },
  /* 巽宫 */
  { n: '巽', u: '巽', l: '巽', m: '随风巽入，申命行事。' },
  { n: '小畜', u: '巽', l: '乾', m: '风行天上，小有积蓄。' },
  { n: '家人', u: '巽', l: '离', m: '风自火出，家道正焉。' },
  { n: '益', u: '巽', l: '震', m: '风雷相益，损上益下。' },
  { n: '无妄', u: '乾', l: '震', m: '天下雷行，无妄守正。' },
  { n: '噬嗑', u: '离', l: '震', m: '火雷相合，咬合明断。' },
  { n: '颐', u: '艮', l: '震', m: '山下有雷，颐养之道。' },
  { n: '蛊', u: '艮', l: '巽', m: '山下有风，整饬积弊。' },
  /* 坎宫 */
  { n: '坎', u: '坎', l: '坎', m: '重险习坎，险中求通。' },
  { n: '节', u: '坎', l: '兑', m: '泽上有水，节制有度。' },
  { n: '屯', u: '坎', l: '震', m: '万物始生，艰难创始。' },
  { n: '既济', u: '坎', l: '离', m: '水在火上，事已成济。' },
  { n: '革', u: '兑', l: '离', m: '泽中有火，变革鼎新。' },
  { n: '丰', u: '震', l: '离', m: '雷电皆至，丰盛盛大。' },
  { n: '明夷', u: '坤', l: '离', m: '明入地中，韬光养晦。' },
  { n: '师', u: '坤', l: '坎', m: '地中有水，师出以律。' },
  /* 艮宫 */
  { n: '艮', u: '艮', l: '艮', m: '兼山艮止，动静有节。' },
  { n: '贲', u: '艮', l: '离', m: '山下有火，文饰美化。' },
  { n: '大畜', u: '艮', l: '乾', m: '天在山中，大有蓄养。' },
  { n: '损', u: '艮', l: '兑', m: '山下有泽，损己益人。' },
  { n: '睽', u: '离', l: '兑', m: '上火下泽，乖离睽违。' },
  { n: '履', u: '乾', l: '兑', m: '天泽履礼，如履虎尾。' },
  { n: '中孚', u: '巽', l: '兑', m: '泽上有风，诚信笃实。' },
  { n: '渐', u: '巽', l: '艮', m: '山上有木，循序渐进。' },
  /* 坤宫 */
  { n: '坤', u: '坤', l: '坤', m: '柔顺利贞，厚德载物。' },
  { n: '复', u: '坤', l: '震', m: '雷在地中，一阳来复。' },
  { n: '临', u: '坤', l: '兑', m: '泽上有地，临下以德。' },
  { n: '泰', u: '坤', l: '乾', m: '天地交泰，上下和通。' },
  { n: '大壮', u: '震', l: '乾', m: '雷在天上，阳刚壮盛。' },
  { n: '夬', u: '兑', l: '乾', m: '泽上于天，决断刚决。' },
  { n: '需', u: '坎', l: '乾', m: '云上于天，待时而动。' },
  { n: '比', u: '坎', l: '坤', m: '水地相亲，亲辅团结。' }
];

/* 卦名 -> 索引 */
var HEX_INDEX = {};
HEXAGRAMS.forEach(function (h, i) { HEX_INDEX[h.n] = i; });

/* ---------- 六十四卦（文王卦序：乾、坤、屯、蒙……既济、未济） ---------- */
var KING_WEN_ORDER = ['乾', '坤', '屯', '蒙', '需', '讼', '师', '比', '小畜', '履',
  '泰', '否', '同人', '大有', '谦', '豫', '随', '蛊', '临', '观',
  '噬嗑', '贲', '剥', '复', '无妄', '大畜', '颐', '大过', '坎', '离',
  '咸', '恒', '遁', '大壮', '晋', '明夷', '家人', '睽', '蹇', '解',
  '损', '益', '夬', '姤', '萃', '升', '困', '井', '革', '鼎',
  '震', '艮', '渐', '归妹', '丰', '旅', '巽', '兑', '涣', '节',
  '中孚', '小过', '既济', '未济'];

/* 由上下卦名求卦名 */
function hexNameByUpperLower(upperName, lowerName) {
  for (var i = 0; i < HEXAGRAMS.length; i++) {
    var h = HEXAGRAMS[i];
    if (h.u === upperName && h.l === lowerName) return h.n;
  }
  return null;
}

/* 反转八卦三爻编码（自下而上 ↔ 自上而下），
   使六爻位自下而上排列：bit0=初爻、bit5=上爻。
   八卦编码中 bit2=下爻、bit1=中爻、bit0=上爻，
   组装六爻时需将上下卦三爻位反转，方能与爻序对齐。 */
function reverseTri(b) {
  return ((b & 1) << 2) | (b & 2) | ((b & 4) >> 2);
}

/* 卦的六爻二进制（自下而上，阳=1 阴=0） */
function hexBits(name) {
  var h = HEXAGRAMS[HEX_INDEX[name]];
  return (reverseTri(TRIGRAMS[h.u].bits) << 3) | reverseTri(TRIGRAMS[h.l].bits);
}

/* 六爻数组 lines[0]=初爻 ... lines[5]=上爻，1=阳 0=阴 */
function hexLines(name) {
  var bits = hexBits(name);
  var arr = [];
  for (var i = 0; i < 6; i++) arr.push((bits >> i) & 1);
  return arr;
}

/* 由六爻求卦名 */
function hexNameFromLines(lines) {
  var lo = lines[0] * 4 + lines[1] * 2 + lines[2];
  var up = lines[3] * 4 + lines[4] * 2 + lines[5];
  return hexNameByUpperLower(BITS_TO_NAME[up], BITS_TO_NAME[lo]);
}

/* 卦象称谓：如「天风姤」「地天泰」「乾为天」 */
function hexXiang(name) {
  var h = HEXAGRAMS[HEX_INDEX[name]];
  if (h.u === h.l) return name + '为' + TRIGRAMS[h.u].nature;
  return TRIGRAMS[h.u].nature + TRIGRAMS[h.l].nature + name;
}

/* 渲染六爻卦象 HTML；moving 为可选六爻动爻标记数组 */
function hexSymbolHTML(name, cls, moving) {
  var lines = hexLines(name);
  var html = '<div class="hex-symbol ' + (cls || '') + '">';
  for (var i = 5; i >= 0; i--) {
    var yang = lines[i] === 1;
    var mv = moving ? moving[i] : false;
    html += '<div class="yao ' + (yang ? 'yang' : 'yin') + '">';
    if (yang) html += '<span class="yao-bar"></span>';
    else html += '<span class="yao-bar"></span><span class="yao-bar"></span>';
    if (mv) html += '<span class="moving-mark">' + (yang ? '○' : '×') + '</span>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

/* 小卦盘（选择器用） */
function hexSymbolSmall(name) {
  return hexSymbolHTML(name, 'small');
}

/* ---------- 孟喜卦气：六日七分六十卦（自冬至起，中孚值日） ---------- */
var GUIQI_60 = ['中孚', '复', '屯', '谦', '睽', '升', '临', '小过', '蒙', '益',
  '渐', '泰', '需', '随', '晋', '解', '大壮', '豫', '讼', '蛊',
  '革', '夬', '旅', '师', '比', '小畜', '乾', '大有', '家人', '井',
  '咸', '姤', '鼎', '丰', '涣', '履', '遁', '恒', '节', '同人',
  '损', '否', '巽', '萃', '大畜', '贲', '观', '归妹', '无妄', '明夷',
  '困', '剥', '艮', '既济', '噬嗑', '大过', '坤', '未济', '蹇', '颐'];

/* ---------- 十二辟卦（消息卦）：月建 + 时辰 ---------- */
var PIBI = [
  { month: 11, hour: 0,  name: '复',  monthLabel: '十一月 · 子月', hourLabel: '子时' },
  { month: 12, hour: 1,  name: '临',  monthLabel: '十二月 · 丑月', hourLabel: '丑时' },
  { month: 1,  hour: 2,  name: '泰',  monthLabel: '正月 · 寅月',   hourLabel: '寅时' },
  { month: 2,  hour: 3,  name: '大壮', monthLabel: '二月 · 卯月',  hourLabel: '卯时' },
  { month: 3,  hour: 4,  name: '夬',  monthLabel: '三月 · 辰月',   hourLabel: '辰时' },
  { month: 4,  hour: 5,  name: '乾',  monthLabel: '四月 · 巳月',   hourLabel: '巳时' },
  { month: 5,  hour: 6,  name: '姤',  monthLabel: '五月 · 午月',   hourLabel: '午时' },
  { month: 6,  hour: 7,  name: '遁',  monthLabel: '六月 · 未月',   hourLabel: '未时' },
  { month: 7,  hour: 8,  name: '否',  monthLabel: '七月 · 申月',   hourLabel: '申时' },
  { month: 8,  hour: 9,  name: '观',  monthLabel: '八月 · 酉月',   hourLabel: '酉时' },
  { month: 9,  hour: 10, name: '剥',  monthLabel: '九月 · 戌月',   hourLabel: '戌时' },
  { month: 10, hour: 11, name: '坤',  monthLabel: '十月 · 亥月',   hourLabel: '亥时' }
];
var PIBI_BY_MONTH = {};
PIBI.forEach(function (p) { PIBI_BY_MONTH[p.month] = p.name; });
var PIBI_BY_HOUR = {};
PIBI.forEach(function (p) { PIBI_BY_HOUR[p.hour] = p.name; });

/* ---------- 十二时辰 ---------- */
var SHICHEN = [
  { name: '子', range: '23:00 – 00:59', idx: 0 },
  { name: '丑', range: '01:00 – 02:59', idx: 1 },
  { name: '寅', range: '03:00 – 04:59', idx: 2 },
  { name: '卯', range: '05:00 – 06:59', idx: 3 },
  { name: '辰', range: '07:00 – 08:59', idx: 4 },
  { name: '巳', range: '09:00 – 10:59', idx: 5 },
  { name: '午', range: '11:00 – 12:59', idx: 6 },
  { name: '未', range: '13:00 – 14:59', idx: 7 },
  { name: '申', range: '15:00 – 16:59', idx: 8 },
  { name: '酉', range: '17:00 – 18:59', idx: 9 },
  { name: '戌', range: '19:00 – 20:59', idx: 10 },
  { name: '亥', range: '21:00 – 22:59', idx: 11 }
];

/* 小时 -> 时辰序号(0=子 … 11=亥) */
function hourBranchIndex(hour) {
  return Math.floor(((hour + 1) % 24) / 2);
}

/* ---------- 干支与生肖 ---------- */
var GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
var SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

function yearGZ(year) {
  var i = ((year - 4) % 60 + 60) % 60;
  return GAN[i % 10] + ZHI[i % 12];
}
/* 以 2000-01-01 = 戊午日(54) 为基准 */
function dayGZ(year, month, day) {
  var base = Date.UTC(2000, 0, 1);
  var target = Date.UTC(year, month - 1, day);
  var diff = Math.round((target - base) / 86400000);
  var i = ((54 + diff) % 60 + 60) % 60;
  return GAN[i % 10] + ZHI[i % 12];
}
/* 月干支：五虎遁（正月＝寅月） */
function monthGZ(lunarYear, lunarMonth) {
  var yGan = (((lunarYear - 4) % 60 + 60) % 60) % 10;
  var mGan = (yGan % 5) * 2 + 2 + (lunarMonth - 1);
  var mZhi = (lunarMonth + 1) % 12;
  return GAN[mGan % 10] + ZHI[mZhi % 12];
}
/* 时干支：五鼠遁 */
function hourGZ(dayYear, dayMonth, dayDate, hour) {
  var dGan = GAN.indexOf(dayGZ(dayYear, dayMonth, dayDate)[0]);
  var hIdx = hourBranchIndex(hour);
  var hGan = (dGan % 5) * 2 + hIdx;
  return GAN[hGan % 10] + ZHI[hIdx];
}
function shengxiao(year) {
  return SHENGXIAO[((year - 4) % 12 + 12) % 12];
}

/* ---------- 农历（1900–2100） ---------- */
var LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520
];

function leapMonth(y) { return LUNAR_INFO[y - 1900] & 0xf; }
function leapDays(y) {
  if (leapMonth(y)) return (LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29;
  return 0;
}
function monthDays(y, m) { return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29; }
function lYearDays(y) {
  var i, sum = 348;
  for (i = 0x8000; i > 0x8; i >>= 1) sum += (LUNAR_INFO[y - 1900] & i) ? 1 : 0;
  return sum + leapDays(y);
}

function solarToLunar(year, month, day) {
  var base = Date.UTC(1900, 0, 31);
  var target = Date.UTC(year, month - 1, day);
  var offset = Math.round((target - base) / 86400000);
  var i, temp = 0;
  for (i = 1900; i < 2101 && offset > 0; i++) {
    temp = lYearDays(i);
    offset -= temp;
  }
  if (offset < 0) { offset += temp; i--; }
  var lYear = i;
  var leap = leapMonth(lYear);
  var isLeap = false;
  for (i = 1; i < 13 && offset > 0; i++) {
    if (leap > 0 && i === (leap + 1) && isLeap === false) {
      --i; isLeap = true; temp = leapDays(lYear);
    } else {
      temp = monthDays(lYear, i);
    }
    if (isLeap === true && i === (leap + 1)) isLeap = false;
    offset -= temp;
  }
  if (offset === 0 && leap > 0 && i === leap + 1) {
    if (isLeap) isLeap = false; else { isLeap = true; --i; }
  }
  if (offset < 0) { offset += temp; --i; }
  return { year: lYear, month: i, day: offset + 1, isLeap: isLeap };
}

var LUNAR_MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
function lunarDayName(d) {
  if (d === 10) return '初十';
  if (d === 20) return '二十';
  if (d === 30) return '三十';
  if (d < 10) return '初' + '一二三四五六七八九'[d - 1];
  if (d < 20) return '十' + '一二三四五六七八九'[d - 11];
  return '廿' + '一二三四五六七八九'[d - 21];
}
function lunarMonthName(lunar) {
  return (lunar.isLeap ? '闰' : '') + LUNAR_MONTH_NAMES[lunar.month - 1] + '月';
}

/* ---------- 二十四节气（太阳黄经法，Meeus 低精度） ---------- */
var TERM_NAMES = ['春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑',
  '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬',
  '小雪', '大雪', '冬至', '小寒', '大寒', '立春', '雨水', '惊蛰'];
var TERM_LNG = [];
for (var _t = 0; _t < 24; _t++) TERM_LNG.push((_t * 15) % 360);
var TERM_MONTH = [3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 1, 1, 2, 2, 3];

function jdFromDate(y, m, d, h) {
  return Date.UTC(y, m - 1, d, h || 12) / 86400000 + 2440587.5;
}
function sunLongitude(y, m, d, h) {
  var rad = Math.PI / 180;
  var T = (jdFromDate(y, m, d, h || 12) - 2451545.0) / 36525;
  var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * rad)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M * rad)
    + 0.000289 * Math.sin(3 * M * rad);
  var omega = 125.04 - 1934.136 * T;
  var lambda = (L0 + C - 0.00569 - 0.00478 * Math.sin(omega * rad)) % 360;
  if (lambda < 0) lambda += 360;
  return lambda;
}

/* 某年某节气（序号0-23）的公历日期（当地时区 Date） */
function termDate(year, idx) {
  var target = TERM_LNG[idx];
  var month = TERM_MONTH[idx];
  var y2 = month <= 2 ? year : year; /* 节气所在公历年（小寒大寒在1月） */
  for (var d = 1; d <= 31; d++) {
    var lng = sunLongitude(y2, month, d, 12);
    var diff = (lng - target + 540) % 360 - 180;
    if (diff >= 0) return new Date(y2, month - 1, d);
  }
  return null;
}

function winterSolstice(year) { return termDate(year, 18); }

/* 当前节气（≤日期的最近节气名） */
function currentTerm(date) {
  var y = date.getFullYear();
  var best = null, bestName = '';
  for (var yy = y - 1; yy <= y + 1; yy++) {
    for (var i = 0; i < 24; i++) {
      var d = termDate(yy, i);
      if (d && d <= date && (!best || d > best)) { best = d; bestName = TERM_NAMES[i]; }
    }
  }
  return { name: bestName, date: best };
}

/* 同日判断 */
function sameDay(a, b) {
  return !!(a && b && a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() && a.getDate() === b.getDate());
}

/* ---------- 卦气六日七分：值日之卦（含四正卦掌二至二分） ----------
   坎掌冬至、离掌夏至、震掌春分、兑掌秋分，此四日本卦即四正卦；
   其余日期自冬至起按「六日七分」六十卦周流值日。 */
function guaQiDayInfo(date) {
  var y = date.getFullYear();
  var ws = winterSolstice(y);
  if (date < ws) ws = winterSolstice(y - 1);
  var days = Math.round((date - ws) / 86400000);

  if (sameDay(date, winterSolstice(y))) {
    return { hex: '坎', special: '冬至', daysSince: 0, solstice: ws, seq: null };
  }
  if (sameDay(date, termDate(y, 6))) {
    return { hex: '离', special: '夏至', daysSince: days, solstice: ws, seq: null };
  }
  if (sameDay(date, termDate(y, 0))) {
    return { hex: '震', special: '春分', daysSince: days, solstice: ws, seq: null };
  }
  if (sameDay(date, termDate(y, 12))) {
    return { hex: '兑', special: '秋分', daysSince: days, solstice: ws, seq: null };
  }

  var period = 6 + 7 / 80;
  var idx = Math.floor(days / period);
  idx = ((idx % 60) + 60) % 60;
  return { hex: GUIQI_60[idx], special: null, daysSince: days, solstice: ws, seq: idx + 1 };
}

/* 月建辟卦（依农历月，闰月随本支） */
function pibiByLunarMonth(lunar) {
  var m = lunar.month;
  return PIBI_BY_MONTH[m];
}

/* 时辰辟卦 */
function pibiByHourIndex(hIdx) {
  return PIBI_BY_HOUR[hIdx];
}



