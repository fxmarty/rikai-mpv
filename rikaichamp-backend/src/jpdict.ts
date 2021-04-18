import { NameResult } from './jp-utils-hikibiki.js'

// TO CHANGE!
import { flatFileNamesDict } from './background_search_html.js'


import { expandChoon } from './jp-utilities.js';

import { normalizeInput } from './conversion.js';
import { endsInYoon } from './yoon.js';

// Local state tracking
//
// We track some state locally because we want to avoid querying the database
// when it is being updated since this can block for several seconds.

const NAMES_MAX_ENTRIES = 20;

export async function searchNames({
  input,
  minLength,
}: {
  input: string;
  minLength?: number;
}): Promise<NameSearchResult | null> {

  let [normalized, inputLengths] = normalizeInput(input);

  // Setup a list of strings to try that includes all the possible expansions of
  // ー characters.
  const candidates = [normalized, ...expandChoon(normalized)];

  let result: NameSearchResult | null = null;
  for (const candidate of candidates) {
    let thisResult = await doNameSearch({
      input: candidate,
      inputLengths,
      minInputLength: minLength,
    });

    if (!result || (thisResult && thisResult.matchLen > result.matchLen)) {
      result = thisResult;
    }
  }

  return result;
}

async function doNameSearch({
  input,
  inputLengths,
  minInputLength,
}: {
  input: string;
  inputLengths: Array<number>;
  minInputLength?: number;
}): Promise<NameSearchResult | null> {
  let result: NameSearchResult = {
    type: 'names',
    data: [],
    more: false,
    matchLen: 0,
  };

  // Record the position of existing entries for grouping purposes
  let existingItems = new Map<string, number>();

  let currentString = input;
  let longestMatch = 0;

  while (currentString.length > 0) {
    const currentInputLength = inputLengths[currentString.length];
    if (minInputLength && minInputLength > currentInputLength) {
      break;
    }

    let names: Array<NameResult>;
    try {
      names = await flatFileNamesDict!.getNames(currentString);
    } catch (e) {
      console.error(e);
      return null;
    }

    if (names.length) {
      longestMatch = Math.max(longestMatch, currentInputLength);
    }

    for (const name of names) {
      // We group together entries where the kana readings and translation
      // details are all equal.
      const nameContents =
        name.r.join('-') +
        '#' +
        name.tr
          .map(
            (tr) =>
              `${(tr.type || []).join(',')}-${tr.det.join(',')}${
                tr.cf ? '-' + tr.cf.join(',') : ''
              }`
          )
          .join(';');

      // Check for an existing entry to combine with
      const existingIndex = existingItems.get(nameContents);
      if (typeof existingIndex !== 'undefined') {
        const existingEntry = result.data[existingIndex];
        if (name.k) {
          if (!existingEntry.k) {
            existingEntry.k = [];
          }
          existingEntry.k.push(...name.k);
        }
      } else {
        result.data.push({ ...name, matchLen: currentInputLength });
        existingItems.set(nameContents, result.data.length - 1);
      }

      if (result.data.length >= NAMES_MAX_ENTRIES) {
        break;
      }
    }

    if (result.data.length >= NAMES_MAX_ENTRIES) {
      break;
    }

    // Shorten input, but don't split a ようおん (e.g. きゃ).
    const lengthToShorten = endsInYoon(currentString) ? 2 : 1;
    currentString = currentString.substr(
      0,
      currentString.length - lengthToShorten
    );
  }

  if (!result.data.length) {
    return null;
  }

  result.matchLen = longestMatch;
  return result;
}
