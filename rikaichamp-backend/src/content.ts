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

import { SelectionMeta } from './meta.js';
import { kanjiToNumber } from './numbers.js';
import {
    CopyState,
    PopupOptions,
    renderPopup
} from './popup.js';
import { query, QueryResult } from './query.js';

import { isEraName, startsWithEraName } from './years.js';

// Either end of a Range object
interface RangeEndpoint {
    offset: number;
}

export interface GetTextResult {
    text: string;
    // Contains the node and offset where the selection starts. This will be null
    // if, for example, the result is the text from an element's title attribute.
    rangeStart: RangeEndpoint | null;
    // Contains the node and offset for each text-containing node in the
    // maximum selected range.
    rangeEnds: RangeEndpoint[];
    // Extra metadata we parsed in the process
    meta?: SelectionMeta;
}

interface CachedGetTextResult {
    result: GetTextResult;
}

// noinspection DuplicatedCode
export class RikaiContent {
    // This should be enough for most (but not all) entries for now.
    //
    // See https://github.com/birtles/rikaichamp/issues/319#issuecomment-655545971
    // for a snapshot of the entry lengths by frequency.
    //
    // Once we have switched all databases to IndexedDB, we should investigate the
    // performance impact of increasing this further.
    static MAX_LENGTH = 16;

    _config: ContentConfig;

    // Lookup tracking (so we can avoid redundant work and so we can re-render)
    _currentTextAtPoint: CachedGetTextResult | null = null;
    _currentSearchResult: QueryResult | null = null;
    _currentTarget: Element | null = null;

    // Copy support
    _copyMode: boolean = false;
    _copyIndex: number = 0;

    constructor(config: ContentConfig) {
        this._config = config;

    }

    getTextFromTextNode(input: string, maxLength?: number): GetTextResult | null {

        let result: GetTextResult | null = {
            text: '',
            rangeStart: {
                // If we're operating on a synthesized text node, use the actual
                // start node.
                offset: 0,
            },
            rangeEnds: [],
        };

        // Search for non-Japanese text (or a delimiter of some sort even if it
        // is "Japanese" in the sense of being full-width).
        //
        // * U+FF01~U+FF5E is for full-width alphanumerics (includes some
        //   punctuation like ＆ and ～ because they appear in the kanji headwords for
        //   some entries)
        // * U+25CB is 'white circle' often used to represent a blank
        //   (U+3007 is an ideographic zero that is also sometimes used for this
        //   purpose, but this is included in the U+3001~U+30FF range.)
        // * U+3000~U+30FF is ideographic punctuation but we skip:
        //
        //    U+3000 (ideographic space),
        //    U+3001 (、 ideographic comma),
        //    U+3002 (。 ideographic full stop),
        //    U+3003 (〃 ditto mark),
        //    U+3008,U+3009 (〈〉),
        //    U+300A,U+300B (《》),
        //    U+300C,U+300D (「」 corner brackets for quotations),
        //                  [ENAMDICT actually uses this in one entry,
        //                  "ウィリアム「バッファロービル」コーディ", but I think we
        //                  can live without being able to recognize that)
        //    U+300E,U+300F (『 』), and
        //    U+3010,U+3011 (【 】),
        //
        //   since these are typically only going to delimit words.
        // * U+3041~U+309F is the hiragana range
        // * U+30A0~U+30FF is the katakana range
        // * U+3220~U+3247 is various enclosed characters like ㈵
        // * U+3280~U+32B0 is various enclosed characters like ㊞
        // * U+32D0~U+32FF is various enclosed characters like ㋐ and ㋿.
        // * U+3300~U+3370 is various shorthand characters from the CJK
        //   compatibility block like ㍍
        // * U+337B~U+337F is various era names and ㍿
        // * U+3400~U+4DBF is the CJK Unified Ideographs Extension A block (rare
        //   kanji)
        // * U+4E00~U+9FFF is the CJK Unified Ideographs block ("the kanji")
        // * U+F900~U+FAFF is the CJK Compatibility Ideographs block (random odd
        //   kanji, because standards)
        // * U+FF5E is full-width tilde ～ (not 〜 which is a wave dash)
        // * U+FF61~U+FF65 is some halfwidth ideographic symbols, e.g. ｡ but we
        //   skip them (although previous rikai-tachi included them) since
        //   they're mostly going to be delimiters
        // * U+FF66~U+FF9F is halfwidth katakana
        // * U+20000~U+20FFF is CJK Unified Ideographs Extension B (more rare kanji)
        //
        const nonJapaneseOrDelimiter = /[^\uff01-\uff5e\u25cb\u3004-\u3007\u3011-\u30ff\u3220-\u3247\u3280-\u32b0\u32d0-\u32ff\u3300-\u3370\u337b-\u337f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff5e\uff66-\uff9f\u{20000}-\u{20fff}]/u;

        // If we detect a Japanese era, however, we allow a different set of
        // characters.
        const nonEraCharacter = /[^\s0-9０-９一二三四五六七八九十百元年]/;
        let textDelimiter = nonJapaneseOrDelimiter;

        let textEnd = input.search(textDelimiter);

        let offset = 0; // temporary
        const nodeText = input.substring(offset);

        // Check for a Japanese era since we use different end delimiters in that
        // case.
        if (textDelimiter === nonJapaneseOrDelimiter) {
            const currentText =
                result.text +
                nodeText.substring(0, textEnd === -1 ? undefined : textEnd);

            // If we hit a delimiter but the existing text is an era name, we should
            // re-find the end of this text node.
            if (textEnd >= 0 && startsWithEraName(currentText)) {
                textDelimiter = nonEraCharacter;
                const endOfEra = nodeText.substring(textEnd).search(textDelimiter);
                textEnd = endOfEra === -1 ? -1 : textEnd + endOfEra;
            }
        }

        if (typeof maxLength === 'number' && maxLength >= 0) {
            const maxEnd = maxLength - result.text.length;
            if (textEnd === -1) {
                // The >= here is important since it means that if the node has
                // exactly enough characters to reach the maxLength then we will
                // stop walking the tree at this point.
                textEnd = input.length - offset >= maxEnd ? maxEnd : -1;
            } else {
                textEnd = Math.min(textEnd, maxEnd);
            }
        }

        if (textEnd === 0) {
            // There are no characters here for us.
        } else if (textEnd !== -1) {
            // The text node has disallowed characters mid-way through so
            // return up to that point.
            result.text += nodeText.substring(0, textEnd);
            result.rangeEnds.push({
                offset: offset + textEnd,
            });
        } else {
            // The whole text node is allowed characters, keep going.
            result.text += nodeText;
            result.rangeEnds.push({
                offset: input.length,
            });
        }

        // Check if we didn't find any suitable characters
        if (!result.rangeEnds.length) {
            result = null;
        }

        if (result) {
            result.meta = extractGetTextMetadata(result.text);
        }

        return result;
    }

    async tryToUpdatePopup(
        my_input : string,
        dictMode: DictMode
    ) {
        const textAtPoint = this.getTextAtPoint(my_input, RikaiContent.MAX_LENGTH);

        if (!textAtPoint) {
            return -1;
        }

        const queryResult = await query(textAtPoint.text, {
            dictMode,
            wordLookup: textAtPoint.rangeStart !== null,
        });

        // Check if we have triggered a new query or been disabled in the meantime.
        // THIS SHOULD BE KEPT, REALLY REALLY.
        /*
        if (
            !this._currentTextAtPoint ||
            textAtPoint !== this._currentTextAtPoint.result
        ) {
            return;
        }
        */

        if (!queryResult) {
            return -1;
        }

        let matchLen = 0;

        if (queryResult.matchLen) {
            // Adjust matchLen if we are highlighting something meta.
            matchLen = queryResult.matchLen;
            if (textAtPoint.meta) {
                matchLen = Math.max(textAtPoint.meta.matchLen, matchLen);
            }
        }


        this._currentSearchResult = queryResult;

        this.showPopup();

        return matchLen;
    }

    getTextAtPoint(my_input : string, maxLength?: number): GetTextResult | null {
        return this.getTextFromTextNode(my_input, maxLength);
    }

    showPopup(options?: Partial<PopupOptions>) {
        if (!this._currentSearchResult) {
            return;
        }

        const popupOptions: PopupOptions = {
            accentDisplay: this._config.accentDisplay,
            copyIndex: this._copyIndex,
            copyNextKey: this._config.keys.startCopy[0] || '',
            copyState: this._copyMode ? CopyState.Active : CopyState.Inactive,
            meta: this._currentTextAtPoint?.result.meta,
            popupStyle: this._config.popupStyle,
            posDisplay: this._config.posDisplay,
            showDefinitions: !this._config.readingOnly,
            showKanjiComponents: this._config.showKanjiComponents,
            showPriority: this._config.showPriority,
            ...options,
        };

        renderPopup(this._currentSearchResult!, popupOptions);
    }

}

// This is a bit complicated because for a numeric year we don't require the
// 年 but for 元年 we do. i.e. '令和2' is valid but '令和元' is not.
const yearRegex = /(?:([0-9０-９一二三四五六七八九十百]+)\s*年?|(?:元\s*年))/;

function extractGetTextMetadata(text: string): SelectionMeta | undefined {
    // Look for a year
    const matches = yearRegex.exec(text);
    if (!matches || matches.index === 0) {
        return undefined;
    }

    // Look for an era
    const era = text.substring(0, matches.index).trim();
    if (!isEraName(era)) {
        return undefined;
    }

    // Parse year
    let year: number | null = 0;
    if (typeof matches[1] !== 'undefined') {
        // If it's a character in the CJK block, parse as a kanji number
        const firstCharCode = matches[1].charCodeAt(0);
        if (firstCharCode >= 0x4e00 && firstCharCode <= 0x9fff) {
            year = kanjiToNumber(matches[1]);
        } else {
            year = parseInt(
                matches[1].replace(/[０-９]/g, (ch) =>
                    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
                ),
                10
            );
        }
    }

    if (year === null) {
        return undefined;
    }

    const matchLen = matches.index + matches[0].length;

    return { era, year, matchLen };
}
