import { loadFileIntoStr } from "./open.js";
import { kanaToHiragana } from "./jp-utilities.js";
import { findLineStartingWith } from "./data_words.js";
import { NameResult } from "./jp-utils-hikibiki.js";

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class NamesDictionary {
    loaded: Promise<any>;
    nameDict: string;
    nameIndex: string;
    path_to_dict: string;
    path_to_dict_idx: string;

    constructor() {
        this.path_to_dict = path.join(__dirname, '..', 'data', 'names.ljson');
        this.path_to_dict_idx = path.join(__dirname, '..', 'data', 'names.idx');

        this.loaded = this.loadDictionary();
    }

    // Note: These are flat text files; loaded as one continuous string to reduce
    // memory use
    private async loadDictionary(): Promise<void> {
        // Read in series to reduce contention
        this.nameDict = await loadFileIntoStr(this.path_to_dict);
        this.nameIndex = await loadFileIntoStr(this.path_to_dict_idx);
    }

    async getNames(search: string): Promise<Array<NameResult>> {

        // Normalize search string
        const lookup = search.normalize();
        const result: Array<NameResult> = [];

        const hiragana = kanaToHiragana(lookup);

        // expand choon needed or not?

        const lookupResult = findLineStartingWith({
            source: this.nameIndex,
            text: hiragana + ',',
        });

        if (lookupResult) {
            let offsets: number[];
            offsets = lookupResult.split(',').slice(1).map(Number);

            for (const offset of offsets) {
                var extracted_entry = this.nameDict.substring(offset, this.nameDict.indexOf('\n', offset))
                const entry = JSON.parse(extracted_entry) as NameResult
                result.push(entry)
            }
        }
        //console.log(JSON.stringify(result));
        //console.log(typeof result)
        return result;
    }
}
