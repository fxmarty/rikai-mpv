// This is our slightly slimmed down version of the `WordResult` produced by
// hikibiki-data, augmented with reason and romaji fields.
//
// It represents the subset of fields we use and, most importantly, the
// subset of fields we make available when reading from the flat file (fallback)
// copy of the data.
const GLOSS_TYPE_MAX = 3 /* Fig */;
export const BITS_PER_GLOSS_TYPE = Math.floor(Math.log2(GLOSS_TYPE_MAX)) + 1;
//# sourceMappingURL=word-result.js.map