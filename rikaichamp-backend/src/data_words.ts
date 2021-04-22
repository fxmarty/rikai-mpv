/*
  rikai-mpv
  by fxmarty
  https://github.com/fxmarty/rikai-mpv
  ---
  Originally based on Rikaichamp
  by Brian Birtles
  https://github.com/birtles/rikaichamp
  ---
  Originally based on Rikaikun
  by Erek Speed
  http://code.google.com/p/rikaikun/
  ---
  Originally based on Rikaichan 1.07
  by Jonathan Zarate
  http://www.polarcloud.com/
  ---
  Originally based on RikaiXUL 0.4 by Todd Rudick
  http://www.rikai.com/
  http://rikaixul.mozdev.org/
  ---
  This program is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation; either version 2 of the License, or
  (at your option) any later version.
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software
  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
  ---
  Please do not change or remove any of the copyrights or links to web pages
  when modifying any of the files. - Jon
*/

import { expandChoon, kanaToHiragana } from './jp-utilities.js';

import { deinflect, deinflectL10NKeys, CandidateWord } from './deinflect.js';
import { normalizeInput } from './conversion.js';
import { toRomaji } from './romaji.js';
import { toWordResult, RawWordRecord } from './raw-word-record.js';
import { sortMatchesByPriority } from './word-match-sorting.js';
import { PartOfSpeech } from './word-result.js';
import { endsInYoon } from './yoon.js';

import { i18next } from './i18n.js';

import { loadFileIntoStr } from './open.js'

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TO MODIFY, INCREASE AND ADD SCROLLING
const WORDS_MAX_ENTRIES = 4;

export const enum WordType {
  IchidanVerb = 1 << 0, // i.e. ru-verbs
  GodanVerb = 1 << 1, // i.e. u-verbs
  IAdj = 1 << 2,
  KuruVerb = 1 << 3,
  SuruVerb = 1 << 4,
  NounVS = 1 << 5,
}

export class WordsDictionary {
  loaded: Promise<any>;
  wordDict: string;
  wordIndex: string;
  path_to_dict: string;
  path_to_dict_idx: string;

  constructor() {
    this.path_to_dict = path.join(__dirname, '..', 'data', 'words.ljson');
    this.path_to_dict_idx = path.join(__dirname, '..', 'data', 'words.idx');

    this.loaded = this.loadDictionary();
  }

  // Note: These are flat text files; loaded as one continuous string to reduce
  // memory use
  private async loadDictionary(): Promise<void> {
    // Read in series to reduce contention
    this.wordDict = await loadFileIntoStr(this.path_to_dict);
    this.wordIndex = await loadFileIntoStr(this.path_to_dict_idx);
  }

  async wordSearch({
    input,
    max = 0,
    includeRomaji = false,
  }: {
    input: string;
    max?: number;
    includeRomaji?: boolean;
  }): Promise<WordSearchResult | null> {
    let [word, inputLengths] = normalizeInput(input);
    word = kanaToHiragana(word);

    let maxResults = WORDS_MAX_ENTRIES;
    if (max > 0) {
      maxResults = Math.min(maxResults, max);
    }

    await this.loaded;

    const candidateWords = [word, ...expandChoon(word)];

    let result: WordSearchResult | null = null;
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
  private lookupInput({
    input,
    inputLengths,
    maxResults,
    includeRomaji,
  }: {
    input: string;
    inputLengths: number[];
    maxResults: number;
    includeRomaji: boolean;
  }): WordSearchResult | null {
    let count: number = 0;
    let longestMatch: number = 0;
    let cache: { [index: string]: number[] } = {};
    let have: Set<number> = new Set();

    let result: WordSearchResult = {
      type: 'words',
      data: [],
      more: false,
      matchLen: 0,
    };

    while (input.length > 0) {
      const showInflections: boolean = count != 0;
      const candidates: Array<CandidateWord> = deinflect(input);

      for (let i = 0; i < candidates.length; i++) {
        const candidate: CandidateWord = candidates[i];
        let offsets: number[] | undefined = cache[candidate.word];
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
        const matches: Array<WordResult> = [];

        for (const offset of offsets) {
          if (have.has(offset)) {
            continue;
          }

          const entry = JSON.parse(
            this.wordDict.substring(offset, this.wordDict.indexOf('\n', offset))
          ) as RawWordRecord;

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

          let reason: string | undefined;
          if (candidate.reasons.length) {
            reason =
              '< ' +
              candidate.reasons
                .map((reasonList) =>
                  reasonList
                    .map((reason) =>
                      i18next.t(deinflectL10NKeys[reason] + '.message')
                    )
                    .join(' < ')
                )
                .join(i18next.t('deinflect_alternate' + '.message'));
            if (showInflections) {
              reason += ` < ${input}`;
            }
          }

          let romaji: Array<string> | undefined;
          if (includeRomaji) {
            romaji = entry.r.map(toRomaji);
          }

          matches.push(
            toWordResult({
              entry,
              matchingText: candidate.word,
              reason,
              romaji,
            })
          );
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
export function findLineStartingWith({
  source,
  text,
}: {
  source: string;
  text: string;
}): string | null {
  const tlen: number = text.length;
  let start: number = 0;
  let end: number = source.length - 1;

  while (start < end) {
    const midpoint: number = (start + end) >> 1;
    const i: number = source.lastIndexOf('\n', midpoint) + 1;

    const candidate: string = source.substr(i, tlen);
    if (text < candidate) {
      end = i - 1;
    } else if (text > candidate) {
      start = source.indexOf('\n', midpoint + 1) + 1;
    } else {
      return source.substring(i, source.indexOf('\n', midpoint + 1));
    }
  }

  return null;
}

// Tests if a given entry matches the type of a generated deflection
function entryMatchesType(entry: RawWordRecord, type: number): boolean {
  const hasMatchingSense = (test: (pos: PartOfSpeech) => boolean) =>
    entry.s.some((sense) => sense.pos?.some(test));

  if (
    type & WordType.IchidanVerb &&
    hasMatchingSense((pos) => pos.startsWith('v1'))
  ) {
    return true;
  }

  if (
    type & WordType.GodanVerb &&
    hasMatchingSense((pos) => pos.startsWith('v5') || pos.startsWith('v4'))
  ) {
    return true;
  }

  if (
    type & WordType.IAdj &&
    hasMatchingSense((pos) => pos.startsWith('adj-i'))
  ) {
    return true;
  }

  if (type & WordType.KuruVerb && hasMatchingSense((pos) => pos === 'vk')) {
    return true;
  }

  if (
    type & WordType.SuruVerb &&
    hasMatchingSense((pos) => pos.startsWith('vs-'))
  ) {
    return true;
  }

  if (type & WordType.NounVS && hasMatchingSense((pos) => pos === 'vs')) {
    return true;
  }

  return false;
}
