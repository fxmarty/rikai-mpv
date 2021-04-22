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
import { WordsDictionary } from './data_words.js';
import { NamesDictionary } from './data_names.js';
import { searchNames } from './jpdict.js';
import { RikaiContent } from './content.js';
import fs from 'fs';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let flatFileWordsDict = undefined;
export let flatFileNamesDict = undefined;
let flatFileWordsDictState = 0 /* Ok */;
let flatFileNamesDictState = 0 /* Ok */;
async function loadNameDictionary() {
    if (!flatFileNamesDict) {
        flatFileNamesDict = new NamesDictionary();
    }
    try {
        flatFileNamesDictState = 1 /* Loading */;
        await flatFileNamesDict.loaded;
    }
    catch (e) {
        flatFileNamesDictState = 2 /* Error */;
        // If we fail loading the dictionary, make sure to reset it so we can try
        // again!
        flatFileNamesDict = undefined;
        throw e;
    }
    flatFileNamesDictState = 0 /* Ok */;
}
async function loadWordsDictionary() {
    if (!flatFileWordsDict) {
        flatFileWordsDict = new WordsDictionary();
    }
    try {
        flatFileWordsDictState = 1 /* Loading */;
        await flatFileWordsDict.loaded;
    }
    catch (e) {
        flatFileWordsDictState = 2 /* Error */;
        // If we fail loading the dictionary, make sure to reset it so we can try
        // again!
        flatFileWordsDict = undefined;
        throw e;
    }
    flatFileWordsDictState = 0 /* Ok */;
}
let currentDict = 0 /* Words */;
let preferNames = false;
// The order in which we cycle/search through dictionaries.
const defaultOrder = [
    0 /* Words */,
    1 /* Names */,
];
// In some cases, however, where we don't find a match in the word dictionary
// but find a good match in the name dictionary, we want to show that before
// kanji entries so we use a different order.
const preferNamesOrder = [1 /* Names */];
async function _wordSearch(params) {
    const result = await flatFileWordsDict.wordSearch(params);
    // Check for a longer match in the names dictionary, but only if the existing
    // match has some non-hiragana characters in it.
    //
    // The names dictionary contains mostly entries with at least some kanji or
    // katakana but it also contains entries that are solely hiragana (e.g.
    // はなこ without any corresponding kanji). Generally we only want to show
    // a name preview if it matches on some kanji or katakana as otherwise it's
    // likely to be a false positive.
    //
    // While it might seem like it would be enough to check if the existing
    // match from the words dictionary is hiragana-only, we can get cases where
    // a longer match in the names dictionary _starts_ with hiragana but has
    // kanji/katakana later, e.g. ほとけ沢.
    if (result) {
        const nameResult = await searchNames({
            input: params.input,
            minLength: result.matchLen + 1,
        });
        if (nameResult) {
            const names = [];
            // Add up to three results provided they have a kanji reading and are all
            // are as long as the longest match.
            for (const [i, name] of nameResult.data.entries()) {
                if (name.k && name.matchLen < nameResult.matchLen) {
                    break;
                }
                if (i > 2) {
                    result.moreNames = true;
                    break;
                }
                names.push(name);
            }
            result.names = names;
            result.matchLen = nameResult.matchLen;
        }
    }
    return result;
}
async function _search(text, dictOption) {
    if (!flatFileWordsDict || !flatFileNamesDict) {
        console.error('Dictionary not initialized in search');
        return null;
    }
    switch (dictOption) {
        case 0 /* Default */:
            currentDict = 0 /* Words */;
            preferNames = false;
            break;
        case 1 /* NextDict */:
            const cycleOrder = preferNames ? preferNamesOrder : defaultOrder;
            currentDict =
                cycleOrder[(cycleOrder.indexOf(currentDict) + 1) % cycleOrder.length];
            break;
    }
    const hasGoodNameMatch = async () => {
        const nameMatch = await searchNames({ input: text });
        // We could further refine this condition by checking that:
        //
        //   !isHiragana(text.substring(0, nameMatch.matchLen))
        //
        // However, we only call this when we have no match in the words dictionary,
        // meaning we only have the name and kanji dictionaries left. The kanji
        // dictionary presumably is not going to match on an all-hiragana key anyway
        // so it's probably fine to prefer the name dictionary even if it's an
        // all-hiragana match.
        return nameMatch && nameMatch.matchLen > 1;
    };
    const originalDict = currentDict;
    do {
        let result = null;
        switch (currentDict) {
            case 0 /* Words */:
                result = await _wordSearch({
                    input: text,
                    includeRomaji: false,
                });
                break;
            case 1 /* Names */:
                result = await searchNames({ input: text });
                break;
        }
        if (result) {
            return result;
        }
        // If we just looked up the words dictionary and didn't find a match,
        // consider if we should switch to prioritizing the names dictionary.
        if (dictOption === 0 /* Default */ &&
            !preferNames &&
            currentDict === 0 /* Words */ &&
            (await hasGoodNameMatch())) {
            preferNames = true;
            currentDict = preferNamesOrder[0];
            // (We've potentially created an infinite loop here since we've switched
            // to a cycle order that excludes the word dictionary which may be the
            // originalDict -- hence the loop termination condition will never be
            // true. However, we know that we have a names match so we should always
            // end up returning something.)
        }
        else {
            // Otherwise just try the next dictionary.
            const cycleOrder = preferNames ? preferNamesOrder : defaultOrder;
            currentDict =
                cycleOrder[(cycleOrder.indexOf(currentDict) + 1) % cycleOrder.length];
        }
    } while (originalDict !== currentDict);
    return null;
}
export function searchIt(request) {
    if (typeof request.type !== 'string') {
        return;
    }
    switch (request.type) {
        case 'xsearch':
            if (typeof request.text === 'string' &&
                typeof request.dictOption === 'number') {
                return _search(request.text, request.dictOption);
            }
            break;
    }
}
let my_config = {
    showPriority: true,
    readingOnly: false,
    accentDisplay: 'binary',
    posDisplay: 'expl',
    kanjiReferences: ["radical", "nelson_r", "kk", "py", "jlpt", "unicode", "conning", "halpern_njecd", "halpern_kkld_2ed", "heisig6", "henshall", "sh_kk2", "nelson_c", "nelson_n", "skip", "sh_desc"],
    showKanjiComponents: true,
    holdToShowKeys: [],
    keys: { nextDictionary: ["Shift", "Enter"],
        toggleDefinition: [],
        startCopy: ["c"] },
    noTextHighlight: false,
    popupStyle: 'blue'
};
// Our socket, in rikai-mpv/ folder
const SOCKETFILE = path.join(__dirname, '..', '..', 'my_socket');
async function createServer(socket, content_handler) {
    console.log('Creating server.');
    let server = net.createServer(function (stream) {
        console.log('Connection acknowledged.');
        // Messages are buffers. use toString
        stream.on('data', async function (msg) {
            let msg_decode = msg.toString();
            //console.log('Client:', msg_decode);
            let matchLen = await content_handler.tryToUpdatePopup(msg_decode, 0 /* Default */);
            //console.log('Sending back: ' + res);
            stream.write('ready' + matchLen.toString());
        });
    })
        .listen(socket)
        .on('connection', function (socket) {
        console.log('node client connected.');
    });
    return server;
}
function createServerClean(content_handler) {
    console.log('Checking for leftover socket.');
    fs.stat(SOCKETFILE, function (err) {
        if (err) {
            // start server
            console.log('No leftover socket found.');
            createServer(SOCKETFILE, content_handler);
            return;
        }
        // remove file then start server
        console.log('Removing leftover socket.');
        fs.unlink(SOCKETFILE, function (err) {
            if (err) {
                // This should never happen.
                console.error(err);
                process.exit(0);
            }
            createServer(SOCKETFILE, content_handler);
        });
    });
}
async function main() {
    await loadWordsDictionary();
    await loadNameDictionary();
    let content_handler = new RikaiContent(my_config);
    createServerClean(content_handler);
}
main();
//# sourceMappingURL=background_search_html.js.map