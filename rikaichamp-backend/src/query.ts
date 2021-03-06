
// TO CHANGE !
import { searchIt } from './background_search_html.js'

export type QueryResult =
  | WordSearchOrTranslateResult
  | NameSearchResult

export interface WordSearchOrTranslateResult
  extends Omit<WordSearchResult, 'matchLen'> {
  type: 'words';
  title?: string;
  matchLen: number | null;
}

export interface QueryOptions {
  dictMode: DictMode;
  wordLookup: boolean;
}

// XXX Add a wrapper for this that memoizes when dictMode is Default

export async function query(
  text: string,
  options: QueryOptions
): Promise<QueryResult | null> {
  let message;
  if (options.wordLookup) {
    message = {
      type: 'xsearch',
      text: text,
      dictOption: options.dictMode,
    };
  } else {
    message = {
      type: 'translate',
      title: text,
    };
  }

  const searchResult: SearchResult = await searchIt(message);
  if (!searchResult) {
    return null;
  }

  if (searchResult.type === 'names') {
    return searchResult;
  }

  let matchLen: number | null = null;
  if (searchResult.type === 'words') {
    matchLen = searchResult.matchLen || 1;
  }
  const more = !!searchResult.more;

  let title: string | undefined;

  let names: Array<NameResult> | undefined;
  let moreNames: boolean | undefined;
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
