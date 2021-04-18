export type NameResult = Omit<NameRecord, 'h'>;

// Misc types. As with PositionType, a few of these are not used (e.g. male-sl,
// uK) but they have entity definitions so we include them here.
//
// prettier-ignore
export type MiscType =
    | 'abbr' | 'arch' | 'chn' | 'col' | 'company' | 'dated' | 'derog' | 'fam'
    | 'fem' | 'given' | 'hist' | 'hon' | 'hum' | 'id' | 'joc' | 'litf' | 'm-sl'
    | 'male' | 'net-sl' | 'obs' | 'obsc' | 'on-mim' | 'organization' | 'person'
    | 'place' | 'poet' | 'pol' | 'product' | 'proverb' | 'quote' | 'rare' | 'sens'
    | 'sl' | 'station' | 'surname' | 'uk' | 'unclass' | 'vulg' | 'work' | 'X'
    | 'yoji';

type NameRecord = NameEntryLine & {
    // r and k strings with all kana converted to hiragana
    h: Array<string>;
};

interface NameEntryLine {
    // Kanji readings
    k?: Array<string>;
    // Kana readings
    r: Array<string>;
    tr: Array<NameTranslation>;
}

export interface NameTranslation {
    // The type(s) for this entry. This can be missing (e.g. ノコノコ).
    type?: Array<NameType>;
    // The translation text itself.
    det: Array<string>;
    // Cross-references to other entries (in the form of an arbitrary string of
    // Japanese text).
    cf?: Array<string>;
}

export type NameType =
    | 'char'
    | 'company'
    | 'creat'
    | 'dei'
    | 'ev'
    | 'fem'
    | 'fict'
    | 'given'
    | 'leg'
    | 'masc'
    | 'myth'
    | 'obj'
    | 'org'
    | 'oth'
    | 'person'
    | 'place'
    | 'product'
    | 'relig'
    | 'serv'
    | 'station'
    | 'surname'
    | 'unclass'
    | 'work';
