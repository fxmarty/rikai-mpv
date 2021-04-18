import fs from 'fs';
import { Readable } from 'stream';
import split from 'split2';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { kanaToHiragana } from './jp-utilities.js';
let names_path = path.join(__dirname, '..', 'data', 'names.ljson');
const mystr = fs.readFileSync(names_path, { encoding: 'utf8' });
const myreadable = Readable.from(mystr);
main()
    .then(() => {
    console.log('Done.');
})
    .catch((e) => {
    console.error('Unhandled error');
    console.error(e);
    process.exit(1);
});
async function main() {
    const data = await readJsonRecords();
    console.log(`Read ${data.size} records.`);
    // Write data to a file, sorted by ID, generating an index from the various
    // headwords to the corresponding character offset at the same time.
    const ids = [...data.keys()].sort();
    const index = new Map();
    let charOffset = 0;
    const dataFilePath = path.join(__dirname, '..', 'data', 'names_new.ljson');
    const dataStream = fs.createWriteStream(dataFilePath);
    for (const id of ids) {
        // Make ID field nullable so we can delete it later.
        const record = data.get(id);
        // Add / update index entries
        const keys = [...record.r, ...(record.k || [])].map(kanaToHiragana);
        for (const key of keys) {
            if (index.has(key)) {
                const offsets = index.get(key);
                if (!offsets.includes(charOffset)) {
                    index.set(key, offsets.concat(charOffset));
                }
            }
            else {
                index.set(key, [charOffset]);
            }
        }
        // Trim down the record a bit, dropping fields we don't use
        delete record.id;
        const line = JSON.stringify(record) + '\n';
        charOffset += line.length;
        dataStream.write(line);
    }
    dataStream.end();
    console.log(`Wrote ${dataFilePath}.`);
    // Write index, sorted by key
    const indexFilePath = path.join(__dirname, '..', 'data', 'names_new.idx');
    const indexStream = fs.createWriteStream(indexFilePath);
    const sortedKeys = [...index.keys()].sort();
    for (const key of sortedKeys) {
        const lineNumbers = index.get(key);
        indexStream.write(`${key},${lineNumbers.join(',')}\n`);
    }
    indexStream.end();
    console.log(`Wrote ${indexFilePath}.`);
}
async function readJsonRecords() {
    const result = new Map();
    await applyPatch(myreadable, result);
    return result;
}
function applyPatch(stream, result) {
    return new Promise((resolve, reject) => {
        var i = 0;
        stream
            .pipe(split(JSON.parse))
            .on('data', (obj) => {
            result.set(i.toString(), obj);
            i = i + 1;
        })
            .on('error', (err) => reject(err))
            .on('end', resolve);
    });
}
//# sourceMappingURL=create_ljson_idx.js.map