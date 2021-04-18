// prettier-ignore
const HANKAKU_KATAKANA_TO_ZENKAKU = [
 0x3002, 0x300c, 0x300d, 0x3001, 0x30fb, 0x30f2, 0x30a1, 0x30a3, 0x30a5,
 0x30a7, 0x30a9, 0x30e3, 0x30e5, 0x30e7, 0x30c3, 0x30fc, 0x30a2, 0x30a4,
 0x30a6, 0x30a8, 0x30aa, 0x30ab, 0x30ad, 0x30af, 0x30b1, 0x30b3, 0x30b5,
 0x30b7, 0x30b9, 0x30bb, 0x30bd, 0x30bf, 0x30c1, 0x30c4, 0x30c6, 0x30c8,
 0x30ca, 0x30cb, 0x30cc, 0x30cd, 0x30ce, 0x30cf, 0x30d2, 0x30d5, 0x30d8,
 0x30db, 0x30de, 0x30df, 0x30e0, 0x30e1, 0x30e2, 0x30e4, 0x30e6, 0x30e8,
 0x30e9, 0x30ea, 0x30eb, 0x30ec, 0x30ed, 0x30ef, 0x30f3, 0x3099, 0x309a,
];

// prettier-ignore
const VOICED_TO_COMPOSED = new Map([
  [0x3046, 0x3094], [0x304b, 0x304c], [0x304d, 0x304e], [0x304f, 0x3050],
  [0x3051, 0x3052], [0x3053, 0x3054], [0x3055, 0x3056], [0x3057, 0x3058],
  [0x3059, 0x305a], [0x305b, 0x305c], [0x305d, 0x305e], [0x305f, 0x3060],
  [0x3061, 0x3062], [0x3064, 0x3065], [0x3066, 0x3067], [0x3068, 0x3069],
  [0x306f, 0x3070], [0x3072, 0x3073], [0x3075, 0x3076], [0x3078, 0x3079],
  [0x307b, 0x307c], [0x309d, 0x309e], [0x30ab, 0x30ac], [0x30ad, 0x30ae],
  [0x30a6, 0x30f4], [0x30af, 0x30b0], [0x30b1, 0x30b2], [0x30b3, 0x30b4],
  [0x30b5, 0x30b6], [0x30b7, 0x30b8], [0x30b9, 0x30ba], [0x30bb, 0x30bc],
  [0x30bd, 0x30be], [0x30bf, 0x30c0], [0x30c1, 0x30c2], [0x30c4, 0x30c5],
  [0x30c6, 0x30c7], [0x30c8, 0x30c9], [0x30cf, 0x30d0], [0x30d2, 0x30d3],
  [0x30d5, 0x30d6], [0x30d8, 0x30d9], [0x30db, 0x30dc], [0x30ef, 0x30f7],
  [0x30f0, 0x30f8], [0x30f1, 0x30f9], [0x30f2, 0x30fa], [0x30fd, 0x30fe]
]);

// prettier-ignore
const SEMIVOICED_TO_COMPOSED = new Map([
  [0x306f, 0x3071], [0x3072, 0x3074], [0x3075, 0x3077], [0x3078, 0x307a],
  [0x307b, 0x307d], [0x30cf, 0x30d1], [0x30d2, 0x30d4], [0x30d5, 0x30d7],
  [0x30d8, 0x30da], [0x30db, 0x30dd]
]);

// First part of the CJK Compatibility block: 0x3300-0x3370
// prettier-ignore
const COMBINED_CHARS_A = [
 'アパート', 'アルファ', 'アンペア', 'アール', 'イニング', 'インチ', 'ウォン',
  'エスクード', 'エーカー', 'オンス', 'オーム', 'カイリ', 'カラット',
  'カロリー', 'ガロン', 'ガンマ', 'ギガ', 'ギニー', 'キュリー', 'ギルダー',
  'キロ', 'キログラム', 'キロメートル', 'キロワット', 'グラム', 'グラムトン',
  'クルゼイロ', 'クローネ', 'ケース', 'コルナ', 'コーポ', 'サイクル',
  'サンチーム', 'シリング', 'センチ', 'セント', 'ダース', 'デシ', 'ドル',
  'トン', 'ナノ', 'ノット', 'ハイツ', 'パーセント', 'パーツ', 'バーレル',
  'ピアストル', 'ピクル', 'ピコ', 'ビル', 'ファラッド', 'フィート',
  'ブッシェル', 'フラン', 'ヘクタール', 'ペソ', 'ペニヒ', 'ヘルツ', 'ペンス',
  'ページ', 'ベータ', 'ポイント', 'ボルト', 'ホン', 'ポンド', 'ホール',
  'ホーン', 'マイクロ', 'マイル', 'マッハ', 'マルク', 'マンション', 'ミクロン',
  'ミリ', 'ミリバール', 'メガ', 'メガトン', 'メートル', 'ヤード', 'ヤール',
  'ユアン', 'リットル', 'リラ', 'ルピー', 'ルーブル', 'レム', 'レントゲン',
  'ワット', '0点', '1点', '2点', '3点', '4点', '5点', '6点', '7点', '8点',
  '9点', '10点', '11点', '12点', '13点', '14点', '15点', '16点', '17点', '18点',
  '19点', '20点', '21点', '22点', '23点', '24点'
];

// Second part of the CJK Compatibility block: 0x337b-0x337f
// prettier-ignore
const COMBINED_CHARS_B = ['平成', '昭和', '大正', '明治', '株式会社'];

// First part of Enclosed CJK letters and motnhs block: 0x3220-0x3247
// prettier-ignore
const ENCLOSED_CHARS_A = [
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '月', '火', '水',
  '木', '金', '土', '日', '株', '有', '社', '名', '特', '財', '祝', '労', '代',
  '呼', '学', '監', '企', '資', '協', '祭', '休', '自', '至', '問', '幼', '文',
  '箏'
];

// Second part of Enclosed CJK letters and motnhs block: 0x3280-0x32b0
// prettier-ignore
const ENCLOSED_CHARS_B = [
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '月', '火', '水',
  '木', '金', '土', '日', '株', '有', '社', '名', '特', '財', '祝', '労', '秘',
  '男', '女', '適', '優', '印', '注', '頂', '休', '写', '正', '上', '中', '下',
  '左', '右', '医', '宗', '学', '監', '企', '資', '協', '夜'
];

// Third part of Enclosed CJK letters and motnhs block: 0x32c0-0x32cb
// prettier-ignore
const ENCLOSED_CHARS_C = [
  '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月',
  '12月'
];

// Fourth part of Enclosed CJK letters and motnhs block: 0x32d0-0x32ff
// prettier-ignore
const ENCLOSED_CHARS_D = [
  'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス',
  'セ', 'ソ', 'タ', 'チ', 'ツ', 'テ', 'ト', 'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ',
  'ヒ', 'フ', 'ヘ', 'ホ', 'マ', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ',
  'リ', 'ル', 'レ', 'ロ', 'ワ', 'ヰ', 'ヱ', 'ヲ', '令和'
];

// We should handle the Enclosed Ideographic Supplement too
// (https://en.wikipedia.org/wiki/Enclosed_Ideographic_Supplement)
// but it's in the SMP so it makes processing more complicated.
//
// We'll wait until it's actually needed.

// Converts:
//
// - half-width katakana to full-width katakana (e.g. ｶﾞｰﾃﾞﾝ → ガーデン)
// - decomposed characters to their composed equivalents
//   (e.g. ダイエット → ダイエット)
// - various enclosed characters into their plain form
//   (e.g. ㋕ → カ)
// - various combined characters into their expanded form
//   (e.g. ㌀ → アパート, ㋿ → 令和)
//
// while maintaining a mapping from input character offsets to output
// offsets.
export function toNormalized(input: string): [string, number[]] {
  let inputLengths = [0];
  let result = '';

  for (let i = 0; i < input.length; ++i) {
    let c = input.charCodeAt(i);
    const prevChar = result.length ? result.charCodeAt(result.length - 1) : 0;

    // Half-width to full-width katakana
    if (c >= 0xff61 && c <= 0xff9f) {
      c = HANKAKU_KATAKANA_TO_ZENKAKU[c - 0xff61];
    }

    // Decomposed characters (including any half-width katakana which we just
    // converted since half-width katakana is always decomposed).
    if (c === 0x3099) {
      const composed = VOICED_TO_COMPOSED.get(prevChar);
      if (composed) {
        result = result.slice(0, -1);
        c = composed;
      }
    } else if (c === 0x309a) {
      // Decomposed semi-voiced mark (full-width or half-width)
      const composed = SEMIVOICED_TO_COMPOSED.get(prevChar);
      if (composed) {
        result = result.slice(0, -1);
        c = composed;
      }
    }

    // Look for an expanded character
    let expanded: null | string = null;
    if (c >= 0x3300 && c <= 0x3370) {
      expanded = COMBINED_CHARS_A[c - 0x3300];
    } else if (c >= 0x337b && c <= 0x337f) {
      expanded = COMBINED_CHARS_B[c - 0x337b];
    } else if (c >= 0x3220 && c <= 0x3247) {
      expanded = ENCLOSED_CHARS_A[c - 0x3220];
    } else if (c >= 0x3280 && c <= 0x32b0) {
      expanded = ENCLOSED_CHARS_B[c - 0x3280];
    } else if (c >= 0x32c0 && c <= 0x32cb) {
      expanded = ENCLOSED_CHARS_C[c - 0x32c0];
    } else if (c >= 0x32d0 && c <= 0x32ff) {
      expanded = ENCLOSED_CHARS_D[c - 0x32d0];
    }

    if (expanded) {
      result += expanded;
      inputLengths.push(...Array(expanded.length - 1).fill(i));
    } else {
      result += String.fromCharCode(c);
    }
    inputLengths[result.length] = i + 1;
  }

  return [result, inputLengths];
}
