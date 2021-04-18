import { expandChoon, kanaToHiragana } from './jp-utilities.js';
import { deinflect, deinflectL10NKeys } from './deinflect.js';
import { normalizeInput } from './conversion.js';
import { toRomaji } from './romaji.js';
import { toWordResult } from './raw-word-record.js';
import { sortMatchesByPriority } from './word-match-sorting.js';
import { endsInYoon } from './yoon.js';
import { i18next } from './i18n.js';
import { loadFileIntoStr } from './open.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// TO MODIFY, INCREASE AND ADD SCROLLING
const WORDS_MAX_ENTRIES = 3;
export class WordsDictionary {
    constructor() {
        this.path_to_dict = path.join(__dirname, '..', 'data', 'words.ljson');
        this.path_to_dict_idx = path.join(__dirname, '..', 'data', 'words.idx');
        this.loaded = this.loadDictionary();
    }
    // Note: These are flat text files; loaded as one continuous string to reduce
    // memory use
    async loadDictionary() {
        // Read in series to reduce contention
        this.wordDict = await loadFileIntoStr(this.path_to_dict);
        this.wordIndex = await loadFileIntoStr(this.path_to_dict_idx);
    }
    async wordSearch({ input, max = 0, includeRomaji = false, }) {
        let [word, inputLengths] = normalizeInput(input);
        word = kanaToHiragana(word);
        let maxResults = WORDS_MAX_ENTRIES;
        if (max > 0) {
            maxResults = Math.min(maxResults, max);
        }
        await this.loaded;
        const candidateWords = [word, ...expandChoon(word)];
        let result = null;
        for (const candidate of candidateWords) {
            const thisResult = this.lookupInput({
                input: candidate,
                inputLengths,
                maxResults,
                includeRomaji,
            });
            if (!result || (thisResult && thisResult.matchLen > result.matchLen)) {
                result = thisResult;
            }
        }
        return result;
    }
    // Looks for dictionary entries in |dict| (using |index|) that match some
    // portion of |input| after de-inflecting it.
    // Only entries that match from the beginning of |input| are checked.
    //
    // e.g. if |input| is '子犬は' then the entry for '子犬' will match but
    // '犬' will not.
    lookupInput({ input, inputLengths, maxResults, includeRomaji, }) {
        let count = 0;
        let longestMatch = 0;
        let cache = {};
        let have = new Set();
        let result = {
            type: 'words',
            data: [],
            more: false,
            matchLen: 0,
        };
        while (input.length > 0) {
            const showInflections = count != 0;
            const candidates = deinflect(input);
            for (let i = 0; i < candidates.length; i++) {
                const candidate = candidates[i];
                let offsets = cache[candidate.word];
                if (!offsets) {
                    const lookupResult = findLineStartingWith({
                        source: this.wordIndex,
                        text: candidate.word + ',',
                    });
                    if (!lookupResult) {
                        cache[candidate.word] = [];
                        continue;
                    }
                    offsets = lookupResult.split(',').slice(1).map(Number);
                    cache[candidate.word] = offsets;
                }
                // We temporarily store the set of matches for the current candidate
                // in a separate array since we want to sort them by priority before
                // adding them to the result array.
                const matches = [];
                for (const offset of offsets) {
                    if (have.has(offset)) {
                        continue;
                    }
                    const entry = JSON.parse(this.wordDict.substring(offset, this.wordDict.indexOf('\n', offset)));
                    // The first candidate is the full string, anything after that is
                    // a possible deinflection.
                    //
                    // The deinflection code, however, doesn't know anything about the
                    // actual words. It just produces possible deinflections along with
                    // a type that says what kind of a word (e.g. godan verb, i-adjective
                    // etc.) it must be in order for that deinflection to be valid.
                    //
                    // So, if we have a possible deinflection, we need to check that it
                    // matches the kind of word we looked up.
                    if (i > 0 && !entryMatchesType(entry, candidate.type)) {
                        continue;
                    }
                    have.add(offset);
                    ++count;
                    longestMatch = Math.max(longestMatch, inputLengths[input.length]);
                    let reason;
                    if (candidate.reasons.length) {
                        reason =
                            '< ' +
                                candidate.reasons
                                    .map((reasonList) => reasonList
                                    .map((reason) => i18next.t(deinflectL10NKeys[reason] + '.message'))
                                    .join(' < '))
                                    .join(i18next.t('deinflect_alternate' + '.message'));
                        if (showInflections) {
                            reason += ` < ${input}`;
                        }
                    }
                    let romaji;
                    if (includeRomaji) {
                        romaji = entry.r.map(toRomaji);
                    }
                    matches.push(toWordResult({
                        entry,
                        matchingText: candidate.word,
                        reason,
                        romaji,
                    }));
                } // for offset of offsets
                // Sort preliminary results
                sortMatchesByPriority(matches);
                // Trim to max results AFTER sorting (so that we make sure to favor
                // common words in the trimmed result).
                if (count >= maxResults) {
                    result.more = true;
                    matches.splice(matches.length - count + maxResults);
                }
                result.data.push(...matches);
                if (count >= maxResults) {
                    break;
                }
            } // for i < trys.length
            if (count >= maxResults) {
                break;
            }
            // Shorten input, but don't split a ようおん (e.g. きゃ).
            const lengthToShorten = endsInYoon(input) ? 2 : 1;
            input = input.substr(0, input.length - lengthToShorten);
        } // while input.length > 0
        if (!result.data.length) {
            return null;
        }
        result.matchLen = longestMatch;
        return result;
    }
}
// Does a binary search of a linefeed delimited string, |data|, for |text|.
export function findLineStartingWith({ source, text, }) {
    const tlen = text.length;
    let start = 0;
    let end = source.length - 1;
    while (start < end) {
        const midpoint = (start + end) >> 1;
        const i = source.lastIndexOf('\n', midpoint) + 1;
        const candidate = source.substr(i, tlen);
        if (text < candidate) {
            end = i - 1;
        }
        else if (text > candidate) {
            start = source.indexOf('\n', midpoint + 1) + 1;
        }
        else {
            return source.substring(i, source.indexOf('\n', midpoint + 1));
        }
    }
    return null;
}
// Tests if a given entry matches the type of a generated deflection
function entryMatchesType(entry, type) {
    const hasMatchingSense = (test) => entry.s.some((sense) => { var _a; return (_a = sense.pos) === null || _a === void 0 ? void 0 : _a.some(test); });
    if (type & 1 /* IchidanVerb */ &&
        hasMatchingSense((pos) => pos.startsWith('v1'))) {
        return true;
    }
    if (type & 2 /* GodanVerb */ &&
        hasMatchingSense((pos) => pos.startsWith('v5') || pos.startsWith('v4'))) {
        return true;
    }
    if (type & 4 /* IAdj */ &&
        hasMatchingSense((pos) => pos.startsWith('adj-i'))) {
        return true;
    }
    if (type & 8 /* KuruVerb */ && hasMatchingSense((pos) => pos === 'vk')) {
        return true;
    }
    if (type & 16 /* SuruVerb */ &&
        hasMatchingSense((pos) => pos.startsWith('vs-'))) {
        return true;
    }
    if (type & 32 /* NounVS */ && hasMatchingSense((pos) => pos === 'vs')) {
        return true;
    }
    return false;
}
//# sourceMappingURL=data_words.js.map