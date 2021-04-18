import { promises as fs } from 'fs';

export async function loadFileIntoStr(my_path : string) {
    const data = await fs.readFile(my_path, 'utf8');
    return data.toString();
}