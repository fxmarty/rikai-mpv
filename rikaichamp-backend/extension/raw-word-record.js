import { kanaToHiragana } from './jp-utilities.js';
import { stripFields } from './strip-fields.js';
import { BITS_PER_GLOSS_TYPE, } from './word-result.js';
export function toWordResult({ entry, matchingText, reason, romaji, }) {
    const kanjiMatch = !!entry.k && entry.k.some((k) => kanaToHiragana(k) === matchingText);
    const kanaMatch = !kanjiMatch && entry.r.some((r) => kanaToHiragana(r) === matchingText);
    return {
        k: mergeMeta(entry.k, entry.km, (key, meta) => (Object.assign(Object.assign({ ent: key }, meta), { match: (kanjiMatch && kanaToHiragana(key) === matchingText) || !kanjiMatch }))),
        r: mergeMeta(entry.r, entry.rm, (key, meta) => (Object.assign(Object.assign({ ent: key }, meta), { match: (kanaMatch && kanaToHiragana(key) === matchingText) || !kanaMatch }))),
        s: expandSenses(entry.s),
        reason,
        romaji,
    };
}
function mergeMeta(keys, metaArray, merge) {
    const result = [];
    for (const [i, key] of (keys || []).entries()) {
        const meta = metaArray && metaArray.length >= i + 1 && metaArray[i] !== 0
            ? metaArray[i]
            : undefined;
        result.push(merge(key, meta));
    }
    return result;
}
function expandSenses(senses) {
    return senses.map((sense, i) => (Object.assign(Object.assign({ g: expandGlosses(sense) }, stripFields(sense, ['g', 'gt'])), { match: true })));
}
function expandGlosses(sense) {
    // Helpers to work out the gloss type
    const gt = sense.gt || 0;
    const typeMask = (1 << BITS_PER_GLOSS_TYPE) - 1;
    const glossTypeAtIndex = (i) => {
        return (gt >> (i * BITS_PER_GLOSS_TYPE)) & typeMask;
    };
    return sense.g.map((gloss, i) => {
        // This rather convoluted mess is because our test harness differentiates
        // between properties that are not set and those that are set to
        // undefined.
        const result = { str: gloss };
        const type = glossTypeAtIndex(i);
        if (type !== 0 /* None */) {
            result.type = type;
        }
        return result;
    });
}
//# sourceMappingURL=raw-word-record.js.map