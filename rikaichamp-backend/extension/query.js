// TO CHANGE !
import { searchIt } from './background_search_html.js';
// XXX Add a wrapper for this that memoizes when dictMode is Default
export async function query(text, options) {
    let message;
    if (options.wordLookup) {
        message = {
            type: 'xsearch',
            text: text,
            dictOption: options.dictMode,
        };
    }
    else {
        message = {
            type: 'translate',
            title: text,
        };
    }
    const searchResult = await searchIt(message);
    if (!searchResult) {
        return null;
    }
    if (searchResult.type === 'names') {
        return searchResult;
    }
    let matchLen = null;
    if (searchResult.type === 'words') {
        matchLen = searchResult.matchLen || 1;
    }
    const more = !!searchResult.more;
    let title;
    let names;
    let moreNames;
    if (searchResult.type === 'words') {
        names = searchResult.names;
        moreNames = searchResult.moreNames;
    }
    return {
        type: 'words',
        title,
        names,
        moreNames,
        data: searchResult.data,
        matchLen,
        more,
    };
}
//# sourceMappingURL=query.js.map