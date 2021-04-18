import { loadFileIntoStr } from "./open.js";
import { kanaToHiragana } from "./jp-utilities.js";
import { findLineStartingWith } from "./data_words.js";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class NamesDictionary {
    constructor() {
        this.path_to_dict = path.join(__dirname, '..', 'data', 'names.ljson');
        this.path_to_dict_idx = path.join(__dirname, '..', 'data', 'names.idx');
        this.loaded = this.loadDictionary();
    }
    // Note: These are flat text files; loaded as one continuous string to reduce
    // memory use
    async loadDictionary() {
        // Read in series to reduce contention
        this.nameDict = await loadFileIntoStr(this.path_to_dict);
        this.nameIndex = await loadFileIntoStr(this.path_to_dict_idx);
    }
    async getNames(search) {
        // Normalize search string
        const lookup = search.normalize();
        const result = [];
        const hiragana = kanaToHiragana(lookup);
        // expand choon needed or not?
        const lookupResult = findLineStartingWith({
            source: this.nameIndex,
            text: hiragana + ',',
        });
        if (lookupResult) {
            let offsets;
            offsets = lookupResult.split(',').slice(1).map(Number);
            for (const offset of offsets) {
                var extracted_entry = this.nameDict.substring(offset, this.nameDict.indexOf('\n', offset));
                const entry = JSON.parse(extracted_entry);
                result.push(entry);
            }
        }
        //console.log(JSON.stringify(result));
        //console.log(typeof result)
        return result;
    }
}
//# sourceMappingURL=data_names.js.map