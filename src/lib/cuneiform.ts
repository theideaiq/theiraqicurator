/*
 * A playful phonetic map from Latin and Arabic letters to Akkadian syllable
 * signs. It is for vibes, not for Assyriologists: real cuneiform spells by
 * syllable, not by letter.
 */

const SIGN = {
  A: '\u{12000}',
  BA: '\u{12040}',
  DA: '\u{12055}',
  E: '\u{1208A}',
  GA: '\u{120B5}',
  HA: '\u{12129}',
  I: '\u{1213F}',
  IA: '\u{12140}',
  KA: '\u{12157}',
  KU: '\u{121AA}',
  LA: '\u{121B7}',
  MA: '\u{12220}',
  NA: '\u{1223E}',
  PA: '\u{1227A}',
  PI: '\u{1227F}',
  RA: '\u{1228F}',
  SA: '\u{12293}',
  SHA: '\u{122AD}',
  TA: '\u{122EB}',
  U: '\u{1230B}',
  ZA: '\u{1235D}',
} as const;

const LATIN: Record<string, string> = {
  a: SIGN.A, b: SIGN.BA, c: SIGN.KA, d: SIGN.DA, e: SIGN.E, f: SIGN.PA,
  g: SIGN.GA, h: SIGN.HA, i: SIGN.I, j: SIGN.IA, k: SIGN.KA, l: SIGN.LA,
  m: SIGN.MA, n: SIGN.NA, o: SIGN.U, p: SIGN.PA, q: SIGN.KU, r: SIGN.RA,
  s: SIGN.SA, t: SIGN.TA, u: SIGN.U, v: SIGN.PI, w: SIGN.PI, x: SIGN.KU + SIGN.SA,
  y: SIGN.IA, z: SIGN.ZA,
};

const ARABIC: Record<string, string> = {
  'ا': SIGN.A, 'أ': SIGN.A, 'إ': SIGN.I, 'آ': SIGN.A, 'ء': SIGN.A, 'ع': SIGN.A,
  'ب': SIGN.BA, 'ت': SIGN.TA, 'ة': SIGN.TA, 'ط': SIGN.TA, 'ث': SIGN.SA, 'س': SIGN.SA,
  'ص': SIGN.SA, 'ش': SIGN.SHA, 'ج': SIGN.GA, 'غ': SIGN.GA, 'ح': SIGN.HA, 'خ': SIGN.HA,
  'ه': SIGN.HA, 'د': SIGN.DA, 'ض': SIGN.DA, 'ذ': SIGN.ZA, 'ز': SIGN.ZA, 'ظ': SIGN.ZA,
  'ر': SIGN.RA, 'ف': SIGN.PA, 'ق': SIGN.KU, 'ك': SIGN.KA, 'گ': SIGN.GA, 'ل': SIGN.LA,
  'م': SIGN.MA, 'ن': SIGN.NA, 'و': SIGN.U, 'ؤ': SIGN.U, 'ي': SIGN.I, 'ى': SIGN.I,
  'ئ': SIGN.I, 'چ': SIGN.SHA, 'پ': SIGN.PA,
};

/** Divider wedge between words, like the ones scribes used. */
export const WORD_DIVIDER = '\u{12470}';

export function toCuneiform(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      Array.from(word.toLowerCase())
        .map((ch) => LATIN[ch] ?? ARABIC[ch] ?? '')
        .join('')
    )
    .filter(Boolean)
    .join(` ${WORD_DIVIDER} `);
}
