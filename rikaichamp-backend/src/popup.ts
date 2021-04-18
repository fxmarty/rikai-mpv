import { NameTranslation } from './jp-utils-hikibiki.js';
import { countMora, moraSubstring } from './jp-utils-mora.js';

import {
  CopyKeys,
  CopyType,
  CopyKanjiKeyStrings,
  CopyNextKeyStrings,
} from './copy-keys.js';
import { groupSenses } from './grouping.js';
import { getHash } from './hash.js';
import { SelectionMeta } from './meta.js';
import { QueryResult } from './query.js';
import { isSvgDoc, SVG_NS } from './svg.js';
import {
  ExtendedKanaEntry,
  ExtendedSense,
  Gloss,
  GlossType,
  KanjiInfo,
  LangSource,
  ReadingInfo,
} from './word-result.js';
import { EraInfo, getEraInfo } from './years.js';

import fs from 'fs';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let styling_path = path.join(__dirname, '..', 'web_page', 'styling.css');
let popupStyles = fs.readFileSync(styling_path,'utf8');

import { i18next } from "./i18n.js";

import jsdom from 'jsdom';
const { JSDOM } = jsdom;

export const enum CopyState {
  Inactive,
  Active,
  Finished,
  Error,
}

export interface PopupOptions {
  accentDisplay: AccentDisplay;
  container?: HTMLElement;
  // Set when copyState !== CopyState.Inactive
  copyIndex?: number;
  copyNextKey: string;
  copyState?: CopyState;
  // Set when copyState === CopyState.Finished
  copyType?: CopyType;
  meta?: SelectionMeta;
  posDisplay: PartOfSpeechDisplay;
  popupStyle: string;
  showDefinitions: boolean;
  showPriority: boolean;
  showKanjiComponents?: boolean;
}

export function renderPopup(
  result: QueryResult,
  options: PopupOptions
) {
  const dom = new JSDOM(`<!DOCTYPE html>`);
  const doc = dom.window.document

  const container = options.container || getDefaultContainer(doc);
  const windowElem = resetContainer(container, {
    document: doc,
    popupStyle: options.popupStyle,
  });
  //console.log('popup.ts, windowElem here: ' + windowElem.outerHTML);
  // TODO: We should use `options.document` everywhere in this file and in
  // the other methods too.

  switch (result.type) {
    case 'names':
      windowElem.append(renderNamesEntries(result.data, result.more, options, doc));
      break;

    default:
      windowElem.append(
        renderWordEntries(
          result.data,
          result.names,
          result.moreNames,
          result.title,
          result.more,
          options,
          doc
        )
      );
      break;
  }

  var css_link = doc.createElement('link');
  css_link.setAttribute('rel', 'stylesheet');
  css_link.setAttribute('href', "styling.css");

  dom.window.document.head.append(css_link);

  var container_filled = container;
  container_filled.append(windowElem);
  dom.window.document.body.append(container_filled);

  let html_path = path.join(__dirname, '..', 'web_page', 'my_attempt.html');
  fs.writeFileSync(html_path, dom.serialize());
}

function getDefaultContainer(doc: Document): HTMLElement {
  // Look for an existing container
  const existingContainers = doc.querySelectorAll('#rikaichamp-window');
  if (existingContainers.length) {
    // Drop any duplicate containers
    while (existingContainers.length > 1) {
      existingContainers[1].remove();
    }
    return existingContainers[0] as HTMLElement;
  }

  // Create a new container

  // For SVG documents we put container <div> inside a <foreignObject>.
  let parent: Element;
  if (isSvgDoc(doc)) {
    const foreignObject = doc.createElementNS(SVG_NS, 'foreignObject');
    foreignObject.setAttribute('width', '600');
    foreignObject.setAttribute('height', '100%');
    doc.documentElement.append(foreignObject);
    parent = foreignObject;
  } else {
    parent = doc.documentElement;
  }

  // Actually create the container element
  const container = doc.createElement('div');
  container.id = 'rikaichamp-window';
  parent.append(container);

  // Apply minimal container styles
  //
  // All the interesting styles go on the inner 'window' object. The styles here
  // are just used for positioning the pop-up correctly.
  //
  // First reset all styles the page may have applied.
  container.style.all = 'initial';
  container.style.position = 'absolute';
  // asahi.com puts z-index: 1000000 on its banner ads. We go one better.
  container.style.zIndex = '1000001';

  // Set initial position
  container.style.top = '0px';
  container.style.left = '0px';
  container.style.minWidth = '100px';

  // Make sure the container too doesn't receive pointer events
  container.style.pointerEvents = 'none';

  return container;
}

function resetContainer(
  container: HTMLElement,
  { document: doc, popupStyle }: { document: Document; popupStyle: string }
): HTMLElement {
  if (!container.shadowRoot) {
    container.attachShadow({ mode: 'open' });

    // Add <style>
    const style = doc.createElement('style');
    style.textContent = popupStyles;
    style.dataset.hash = getStyleHash();
    container.shadowRoot!.append(style);
  } else {
    // Reset content
    for (const child of container.shadowRoot!.children) {
      if (child.tagName !== 'STYLE') {
        child.remove();
      }
    }

    // Reset style
    let existingStyle = container.shadowRoot.querySelector('style');
    if (existingStyle && existingStyle.dataset.hash !== getStyleHash()) {
      existingStyle.remove();
      existingStyle = null;
    }

    if (!existingStyle) {
      const style = doc.createElement('style');
      style.textContent = popupStyles;
      style.dataset.hash = getStyleHash();
      container.shadowRoot!.append(style);
    }
  }

  const windowDiv = doc.createElement('div');
  windowDiv.classList.add('window', `-${popupStyle}`);
  container.shadowRoot!.append(windowDiv);

  // Reset the container position so we can consistently measure the size of
  // the popup
  container.style.left = '0px';
  container.style.top = '0px';
  container.style.maxWidth = 'initial';
  container.style.maxHeight = 'initial';


  return windowDiv;
}

let styleHash: string | undefined;

function getStyleHash(): string {
  if (!styleHash) {
    styleHash = getHash(popupStyles.toString());
  }

  return styleHash;
}

function renderWordEntries(
  entries: Array<WordResult>,
  names: Array<NameResult> | undefined,
  moreNames: boolean | undefined,
  title: string | undefined,
  more: boolean,
  options: PopupOptions,
  doc: Document
): HTMLElement {
  const container = doc.createElement('div');
  container.classList.add('wordlist');

  if (title) {
    const titleDiv = doc.createElement('div');
    container.append(titleDiv);
    titleDiv.classList.add('title');
    titleDiv.lang = 'ja';
    titleDiv.append(title);
  }

  if (options.meta) {
    const eraInfo = getEraInfo(options.meta.era);
    if (eraInfo) {
      container.append(renderEraInfo(options.meta, eraInfo, doc));
    }
  }

  if (names) {
    container.append(renderBonusNames(names, doc, moreNames));
  }

  let index = 0;
  const selectedIndex = getSelectedIndex(options, entries.length);
  for (const entry of entries) {
    const entryDiv = doc.createElement('div');
    container.append(entryDiv);

    entryDiv.classList.add('entry');
    if (index === selectedIndex) {
      entryDiv.classList.add(
        options.copyState === CopyState.Active ? '-selected' : '-flash'
      );
    }
    index++;

    const headingDiv = doc.createElement('div');
    entryDiv.append(headingDiv);

    // Sort matched kanji entries first
    const sortedKanji = entry.k
      ? [...entry.k].sort((a, b) => Number(b.match) - Number(a.match))
      : [];
    if (sortedKanji.length) {
      const kanjiSpan = doc.createElement('span');
      kanjiSpan.classList.add('w-kanji');
      kanjiSpan.lang = 'ja';
      for (const [i, kanji] of sortedKanji.entries()) {
        if (i) {
          const commaSpan = doc.createElement('span');
          commaSpan.classList.add('w-separator');
          commaSpan.textContent = '、';
          kanjiSpan.append(commaSpan);
        }

        let headwordSpan = kanjiSpan;
        if (!kanji.match) {
          const dimmedSpan = doc.createElement('span');
          dimmedSpan.classList.add('w-unmatched');
          kanjiSpan.append(dimmedSpan);
          headwordSpan = dimmedSpan;
        }

        headwordSpan.append(kanji.ent);

        appendHeadwordInfo(kanji.i, headwordSpan, doc);
        if (options.showPriority) {
          appendPriorityMark(kanji.p, headwordSpan, doc);
        }
      }
      headingDiv.append(kanjiSpan);
    }

    const matchingKana = entry.r.filter((r) => r.match);
    if (matchingKana.length) {
      const kanaSpan = doc.createElement('span');
      kanaSpan.classList.add('w-kana');
      kanaSpan.lang = 'ja';
      for (const [i, kana] of matchingKana.entries()) {
        if (i) {
          kanaSpan.append('、 ');
        }
        kanaSpan.append(renderKana(kana, options, doc));
        appendHeadwordInfo(kana.i, kanaSpan, doc);
        if (options.showPriority) {
          appendPriorityMark(kana.p, kanaSpan, doc);
        }
      }
      headingDiv.append(kanaSpan);
    }

    if (entry.romaji?.length) {
      const romajiSpan = doc.createElement('span');
      romajiSpan.classList.add('w-romaji');
      romajiSpan.lang = 'ja';
      romajiSpan.append(entry.romaji.join(', '));
      headingDiv.append(romajiSpan);
    }

    if (entry.reason) {
      const reasonSpan = doc.createElement('span');
      headingDiv.append(reasonSpan);
      reasonSpan.lang = getLangTag();
      reasonSpan.classList.add('w-conj');
      reasonSpan.append(`(${entry.reason})`);
    }

    if (options.showDefinitions) {
      entryDiv.append(renderDefinitions(entry, options, doc));
    }
  }

  if (more) {
    const moreDiv = doc.createElement('div');
    moreDiv.classList.add('more');
    moreDiv.append('...');
    container.append(moreDiv);
  }

  const copyDetails = renderCopyDetails(
    options.copyNextKey,
    doc,
    options.copyState,
    typeof options.copyType !== 'undefined' ? options.copyType : undefined
  );
  if (copyDetails) {
    container.append(copyDetails);
  }

  return container;
}

function renderEraInfo(meta: SelectionMeta, eraInfo: EraInfo, doc: Document): HTMLElement {
  const metaDiv = doc.createElement('div');
  metaDiv.classList.add('meta');
  metaDiv.lang = 'ja';

  const eraSpan = doc.createElement('span');
  eraSpan.classList.add('era');

  const rubyBase = doc.createElement('ruby');
  rubyBase.append(meta.era);

  const rpOpen = doc.createElement('rp');
  rpOpen.append('(');
  rubyBase.append(rpOpen);

  const rubyText = doc.createElement('rt');
  rubyText.append(eraInfo.reading);
  rubyBase.append(rubyText);

  const rpClose = doc.createElement('rp');
  rpClose.append(')');
  rubyBase.append(rpClose);
  eraSpan.append(rubyBase);

  if (meta.year === 0) {
    eraSpan.append('元年');
  } else {
    eraSpan.append(`${meta.year}年`);
  }
  metaDiv.append(eraSpan);

  const equalsSpan = doc.createElement('span');
  equalsSpan.classList.add('equals');
  equalsSpan.append('=');
  metaDiv.append(equalsSpan);

  const seirekiSpan = doc.createElement('span');
  seirekiSpan.classList.add('seireki');
  const seireki =
    meta.year === 0 ? eraInfo.start : meta.year - 1 + eraInfo.start;
  seirekiSpan.append(`${seireki}年`);
  metaDiv.append(seirekiSpan);

  return metaDiv;
}

function renderBonusNames(
  names: Array<NameResult>,
  doc: Document,
  moreNames?: boolean,
): HTMLElement {
  const container = doc.createElement('div');
  container.classList.add('bonus-name');

  for (const name of names) {
    container.append(renderName(name, doc));
  }

  if (moreNames) {
    const moreSpan = doc.createElement('span');
    moreSpan.classList.add('more');
    moreSpan.append('…');
    container.append(moreSpan);
  }

  return container;
}

function renderKana(
  kana: ExtendedKanaEntry,
  options: PopupOptions,
  doc: Document
): string | Element {
  const accents = kana.a;
  if (
    options.accentDisplay === 'none' ||
    typeof accents === 'undefined' ||
    (Array.isArray(accents) && !accents.length)
  ) {
    return kana.ent;
  }

  const accentPos = typeof accents === 'number' ? accents : accents[0].i;

  if (options.accentDisplay === 'downstep') {
    if (!accentPos) {
      // accentPos 0 (heiban) is special since there's no accent to show.
      //
      // At the same time we want to distinguish between heiban and
      // "no accent information". So we indicate heiban with a dotted line
      // across the top instead.
      const wrapperSpan = doc.createElement('span');
      wrapperSpan.classList.add('w-heiban');
      wrapperSpan.textContent = kana.ent;
      return wrapperSpan;
    } else {
      return (
        moraSubstring(kana.ent, 0, accentPos) +
        'ꜜ' +
        moraSubstring(kana.ent, accentPos)
      );
    }
  }

  // Generate binary pitch display
  const wrapperSpan = doc.createElement('span');
  wrapperSpan.classList.add('w-binary');

  // Accent position 0 (heiban: LHHHHH) and accent position 1 (atamadata: HLLLL)
  // are sufficiently similar that we handle them together.
  if (accentPos === 0 || accentPos === 1) {
    const len = countMora(kana.ent);
    const startSpan = doc.createElement('span');
    startSpan.classList.add(accentPos ? 'h-l' : len > 1 ? 'l-h' : 'h');
    startSpan.textContent = moraSubstring(kana.ent, 0, 1);
    wrapperSpan.append(startSpan);

    if (len > 1) {
      const endSpan = doc.createElement('span');
      endSpan.classList.add(accentPos ? 'l' : 'h');
      endSpan.textContent = moraSubstring(kana.ent, 1);
      wrapperSpan.append(endSpan);
    }
  } else {
    // Otherwise we have nakadaka (LHHHHL) or odaka (LHHHH)
    const startSpan = doc.createElement('span');
    startSpan.classList.add('l-h');
    startSpan.textContent = moraSubstring(kana.ent, 0, 1);
    wrapperSpan.append(startSpan);

    const middleSpan = doc.createElement('span');
    middleSpan.classList.add('h-l');
    middleSpan.textContent = moraSubstring(kana.ent, 1, accentPos);
    wrapperSpan.append(middleSpan);

    if (accentPos < countMora(kana.ent)) {
      const endSpan = doc.createElement('span');
      endSpan.classList.add('l');
      endSpan.textContent = moraSubstring(kana.ent, accentPos);
      wrapperSpan.append(endSpan);
    }
  }

  return wrapperSpan;
}

function appendHeadwordInfo(
  info: Array<KanjiInfo> | Array<ReadingInfo> | undefined,
  parent: ParentNode,
  doc: Document
) {
  if (!info || !info.length) {
    return;
  }

  for (const i of info) {
    const span = doc.createElement('span');
    span.classList.add('w-head-info');
    span.lang = getLangTag();
    span.append('(');

    // Some KanjiInfo/RadicalInfo values differ only by case but
    // addons-linter (as used by webext etc.) does not allow WebExtension i18n
    // keys to differ by case only.
    //
    // I couldn't find the rationale for this, the rule just magically
    // appears in https://github.com/mozilla/addons-linter/commit/3923b399f8166b59617071730b87048f45122c7e
    // it seems.
    const specialKeys: { [k in KanjiInfo | ReadingInfo]?: string } = {
      iK: 'ikanji',
      ik: 'ikana',
      oK: 'okanji',
      ok: 'okana',
      uK: 'ukanji',
    };
    const key = specialKeys.hasOwnProperty(i) ? specialKeys[i] : i;

    span.append(i18next.t(`head_info_label_${key}` + '.message') || i);
    span.append(')');
    parent.append(span);
  }
}

function appendPriorityMark(
  priority: Array<string> | undefined,
  parent: ParentNode,
  doc: Document
) {
  if (!priority || !priority.length) {
    return;
  }

  // These are the ones that are annotated with a (P) in the EDICT file.
  const highPriorityLabels = ['i1', 'n1', 's1', 's2', 'g1'];
  let highPriority = false;
  for (const p of priority) {
    if (highPriorityLabels.includes(p)) {
      highPriority = true;
      break;
    }
  }

  parent.append(renderStar(highPriority ? 'full' : 'hollow', doc));
}

function renderStar(style: 'full' | 'hollow', doc: Document): SVGElement {
  const svg = doc.createElementNS(SVG_NS, 'svg');
  svg.classList.add('svgicon');
  svg.style.opacity = '0.5';
  svg.setAttribute('viewBox', '0 0 98.6 93.2');

  const path = doc.createElementNS(SVG_NS, 'path');
  path.setAttribute(
    'd',
    style === 'full'
      ? 'M98 34a4 4 0 00-3-1l-30-4L53 2a4 4 0 00-7 0L33 29 4 33a4 4 0 00-3 6l22 20-6 29a4 4 0 004 5 4 4 0 002 0l26-15 26 15a4 4 0 002 0 4 4 0 004-4 4 4 0 000-1l-6-29 22-20a4 4 0 001-5z'
      : 'M77 93a4 4 0 004-4 4 4 0 000-1l-6-29 22-20a4 4 0 00-2-6l-30-4L53 2a4 4 0 00-7 0L33 29 4 33a4 4 0 00-3 6l22 20-6 29a4 4 0 004 5 4 4 0 002 0l26-15 26 15a4 4 0 002 0zm-5-12L51 70a4 4 0 00-4 0L27 81l5-22a4 4 0 00-1-4L13 40l23-3a4 4 0 004-2l9-21 10 21a4 4 0 003 2l23 3-17 15a4 4 0 00-1 4z'
  );
  svg.append(path);

  return svg;
}

function renderDefinitions(entry: WordResult, options: PopupOptions, doc: Document) {
  const definitionsDiv = doc.createElement('div');
  definitionsDiv.classList.add('w-def');
  // Currently all definitions are in English
  definitionsDiv.lang = 'en';

  if (entry.s.length === 1) {
    definitionsDiv.append(renderSense(entry.s[0], options, doc));
  } else {
    // Try grouping the definitions by part-of-speech.
    const posGroups = options.posDisplay !== 'none' ? groupSenses(entry.s) : [];

    // Determine if the grouping makes sense
    //
    // If the group headings make the number of lines used to represent
    // all the senses (ignoring word wrapping) grow by more than 50%, we should
    // skip using groups. This will typically be the case where there are no
    // common parts-of-speech, or at least very few.
    const linesWithGrouping = posGroups.length + entry.s.length;
    const linesWithoutGrouping = entry.s.length;
    const useGroups =
      posGroups.length && linesWithGrouping / linesWithoutGrouping <= 1.5;

    if (useGroups) {
      let startIndex = 1;
      for (const group of posGroups) {
        // Group heading
        const groupHeading = doc.createElement('p');
        groupHeading.classList.add('w-group-head');

        for (const pos of group.pos) {
          const posSpan = doc.createElement('span');
          posSpan.classList.add('w-pos', 'tag');
          if (options.posDisplay === 'expl') {
            posSpan.lang = getLangTag();
            posSpan.textContent =
                i18next.t(`pos_label_${pos.replace(/-/g, '_')}` + '.message') ||
              pos;
          } else {
            posSpan.textContent = pos;
          }
          groupHeading.append(posSpan);
        }

        for (const misc of group.misc) {
          const miscSpan = doc.createElement('span');
          miscSpan.classList.add('w-misc', 'tag');
          miscSpan.lang = getLangTag();
          miscSpan.textContent =
            i18next.t(`misc_label_${misc.replace(/-/g, '_')}` + '.message') ||
            misc;
          groupHeading.append(miscSpan);
        }

        // If there is no group heading, just add a '-' placeholder
        if (!group.pos.length && !group.misc.length) {
          const posSpan = doc.createElement('span');
          posSpan.classList.add('w-pos', 'tag');
          posSpan.textContent = '-';
          groupHeading.append(posSpan);
        }

        definitionsDiv.append(groupHeading);

        // Group items
        const definitionList = doc.createElement('ol');
        definitionList.start = startIndex;
        for (const sense of group.senses) {
          const listItem = doc.createElement('li');
          listItem.append(renderSense(sense, options, doc));
          definitionList.append(listItem);
          startIndex++;
        }
        definitionsDiv.append(definitionList);
      }
    } else {
      const definitionList = doc.createElement('ol');
      for (const sense of entry.s) {
        const listItem = doc.createElement('li');
        listItem.append(renderSense(sense, options, doc));
        definitionList.append(listItem);
      }
      definitionsDiv.append(definitionList);
    }
  }

  return definitionsDiv;
}

function renderSense(
  sense: ExtendedSense,
  options: PopupOptions,
  doc: Document
): string | DocumentFragment {
  const fragment = doc.createDocumentFragment();

  if (options.posDisplay !== 'none') {
    for (const pos of sense.pos || []) {
      const posSpan = doc.createElement('span');
      posSpan.classList.add('w-pos', 'tag');
      switch (options.posDisplay) {
        case 'expl':
          posSpan.lang = getLangTag();
          posSpan.append(
              i18next.t(`pos_label_${pos.replace(/-/g, '_')}` + '.message') ||
              pos
          );
          break;

        case 'code':
          posSpan.append(pos);
          break;
      }
      fragment.append(posSpan);
    }
  }

  if (sense.field) {
    for (const field of sense.field) {
      const fieldSpan = doc.createElement('span');
      fieldSpan.classList.add('w-field', 'tag');
      fieldSpan.lang = getLangTag();
      fieldSpan.textContent = i18next.t(`field_label_${field}` + '.message') || field;
      fragment.append(fieldSpan);
    }
  }

  if (sense.misc) {
    for (const misc of sense.misc) {
      const miscSpan = doc.createElement('span');
      miscSpan.classList.add('w-misc', 'tag');
      miscSpan.lang = getLangTag();
      miscSpan.textContent = i18next.t(`misc_label_${misc.replace(/-/g, '_')}` + '.message') ||
        misc;
      fragment.append(miscSpan);
    }
  }

  if (sense.dial) {
    for (const dial of sense.dial) {
      const dialSpan = doc.createElement('span');
      dialSpan.classList.add('w-dial', 'tag');
      dialSpan.lang = getLangTag();
      dialSpan.textContent =
          i18next.t(`dial_label_${dial}` + '.message') || dial;
      fragment.append(dialSpan);
    }
  }

  appendGlosses(sense.g, fragment, doc);

  if (sense.inf) {
    const infSpan = doc.createElement('span');
    infSpan.classList.add('w-inf');
    // Mark inf as Japanese because it often contains Japanese text
    infSpan.lang = 'ja';
    infSpan.textContent = ` (${sense.inf})`;
    fragment.append(infSpan);
  }

  if (sense.lsrc && sense.lsrc.length) {
    fragment.append(renderLangSources(sense.lsrc, doc));
  }

  return fragment;
}

function appendGlosses(glosses: Array<Gloss>, parent: ParentNode, doc: Document) {
  for (const [i, gloss] of glosses.entries()) {
    if (i) {
      parent.append('; ');
    }

    if (gloss.type) {
      const typeCode = {
        [GlossType.Expl]: 'expl',
        [GlossType.Fig]: 'fig',
        [GlossType.Lit]: 'lit',
      }[gloss.type];
      const typeStr = typeCode
        ? i18next.t(`gloss_type_label_${typeCode}` + '.message')
        : '';
      if (typeStr) {
        const typeSpan = doc.createElement('span');
        typeSpan.classList.add('w-type');
        typeSpan.lang = getLangTag();
        typeSpan.textContent = `(${typeStr}) `;
        parent.append(typeSpan);
      }
    }

    parent.append(gloss.str);
  }
}

function renderLangSources(sources: Array<LangSource>, doc: Document): DocumentFragment {
  const container = doc.createDocumentFragment();

  for (const lsrc of sources) {
    container.append(' ');

    let prefix = lsrc.wasei
      ? i18next.t('lang_label_wasei' + '.message')
      : undefined;
    if (!prefix) {
      prefix =
          i18next.t(`lang_label_${lsrc.lang || 'en'}` + '.message') || lsrc.lang;
    }

    const wrapperSpan = doc.createElement('span');
    wrapperSpan.classList.add('w-lsrc');
    wrapperSpan.lang = getLangTag();
    wrapperSpan.append('(');

    if (prefix && lsrc.src) {
      prefix = `${prefix}: `;
    }
    if (prefix) {
      wrapperSpan.append(prefix);
    }

    if (lsrc.src) {
      const sourceSpan = doc.createElement('span');
      if (lsrc.lang) {
        sourceSpan.lang = lsrc.lang;
      }
      sourceSpan.textContent = lsrc.src;
      wrapperSpan.append(sourceSpan);
    }

    wrapperSpan.append(')');

    container.append(wrapperSpan);
  }

  return container;
}

function renderNamesEntries(
  entries: Array<NameResult>,
  more: boolean,
  options: PopupOptions,
  doc: Document
): HTMLElement {
  const container = doc.createElement('div');

  const titleDiv = doc.createElement('div');
  container.append(titleDiv);
  titleDiv.classList.add('title');
  titleDiv.lang = getLangTag();
  titleDiv.append(i18next.t('content_names_dictionary' + '.message'));

  const namesTable = doc.createElement('div');
  container.append(namesTable);
  namesTable.classList.add('name-table');

  if (entries.length > 4) {
    namesTable.classList.add('-multicol');
  }

  let index = 0;
  const selectedIndex = getSelectedIndex(options, entries.length);
  for (const entry of entries) {
    const entryDiv = renderName(entry, doc);
    if (index === selectedIndex) {
      entryDiv.classList.add(
        options.copyState === CopyState.Active ? '-selected' : '-flash'
      );
    }
    index++;

    namesTable.append(entryDiv);
  }

  if (more) {
    const moreDiv = doc.createElement('div');
    moreDiv.classList.add('more');
    moreDiv.append('...');
    namesTable.append(moreDiv);
  }

  const copyDetails = renderCopyDetails(
    options.copyNextKey,
    doc,
    options.copyState,
    typeof options.copyType !== 'undefined' ? options.copyType : undefined
  );
  if (copyDetails) {
    container.append(copyDetails);
  }

  return container;
}

function renderName(entry: NameResult, doc: Document): HTMLElement {
  const entryDiv = doc.createElement('div');
  entryDiv.classList.add('entry');

  const entryTitleDiv = doc.createElement('div');
  entryTitleDiv.classList.add('w-title');
  entryTitleDiv.lang = 'ja';
  entryDiv.append(entryTitleDiv);

  if (entry.k) {
    const MAX_KANJI = 15;
    const trimKanji = entry.k.length > MAX_KANJI;
    const kanjiToDisplay = trimKanji ? entry.k.slice(0, MAX_KANJI) : entry.k;
    let kanji = kanjiToDisplay.join('、');
    if (trimKanji) {
      kanji += '…';
    }

    const kanjiSpan = doc.createElement('span');
    entryTitleDiv.append(kanjiSpan);
    kanjiSpan.classList.add('w-kanji');
    kanjiSpan.append(kanji);
  }

  const kana = entry.r.join('、');
  const kanaSpan = doc.createElement('span');
  entryTitleDiv.append(kanaSpan);
  kanaSpan.classList.add('w-kana');
  kanaSpan.append(kana);

  const definitionBlock = doc.createElement('div');
  definitionBlock.classList.add('w-def');
  for (const tr of entry.tr) {
    definitionBlock.append(renderNameTranslation(tr, doc));
  }
  entryDiv.append(definitionBlock);

  return entryDiv;
}

function renderNameTranslation(tr: NameTranslation, doc: Document): HTMLSpanElement {
  const definitionSpan = doc.createElement('div');
  // ENAMDICT only has English glosses
  definitionSpan.lang = 'en';
  definitionSpan.append(tr.det.join(', '));

  for (const tag of tr.type || []) {
    const tagText = i18next.t(`content_names_tag_${tag}` + '.message');
    if (!tagText) {
      continue;
    }

    const tagSpan = doc.createElement('span');
    tagSpan.classList.add('tag');
    tagSpan.classList.add(`tag-${tag}`);
    tagSpan.lang = getLangTag();
    tagSpan.append(tagText);
    definitionSpan.append(tagSpan);
  }

  return definitionSpan;
}

function getSelectedIndex(options: PopupOptions, numEntries: number) {
  return typeof options.copyState !== 'undefined' &&
    options.copyState !== CopyState.Inactive &&
    typeof options.copyIndex !== 'undefined' &&
    numEntries
    ? options.copyIndex % numEntries
    : -1;
}

function renderCopyDetails(
  copyNextKey: string,
  doc: Document,
  copyState?: CopyState,
  copyType?: CopyType,
  options: { kanji: boolean } = { kanji: false },
): HTMLElement | null {
  if (typeof copyState === 'undefined' || copyState === CopyState.Inactive) {
    return null;
  }

  const copyDiv = doc.createElement('div');
  copyDiv.classList.add('copy');
  copyDiv.lang = i18next.t('lang_tag' + '.message');

  const keysDiv = doc.createElement('div');
  keysDiv.classList.add('keys');
  copyDiv.append(keysDiv);

  keysDiv.append(i18next.t('content_copy_keys_label' + 'message') + ' ');

  const copyKeys: Array<{ key: string; l10nKey: string }> = CopyKeys.map(
    ({ key, type, popupString }) => {
      if (type === CopyType.Word && options.kanji) {
        return { key, l10nKey: CopyKanjiKeyStrings.popupString };
      } else {
        return { key, l10nKey: popupString };
      }
    }
  );
  copyKeys.push({
    key: copyNextKey,
    l10nKey: CopyNextKeyStrings.popupString,
  });

  for (const copyKey of copyKeys) {
    const keyElem = doc.createElement('kbd');
    keyElem.append(copyKey.key);
    keysDiv.append(keyElem, ' = ' + i18next.t(copyKey.l10nKey + '.message'));
    if (copyKey.key !== copyNextKey) {
      keysDiv.append(', ');
    }
  }

  if (copyState === CopyState.Finished && typeof copyType !== 'undefined') {
    copyDiv.classList.add('-finished');
    copyDiv.append(renderCopyStatus(getCopiedString(copyType), doc));
  } else if (copyState === CopyState.Error) {
    copyDiv.classList.add('-error');
    copyDiv.append(
      renderCopyStatus(i18next.t('content_copy_error' + '.message'), doc)
    );
  }

  return copyDiv;
}

function getCopiedString(target: CopyType): string {
  switch (target) {
    case CopyType.Entry:
      return i18next.t('content_copied_entry' + '.message');

    case CopyType.TabDelimited:
      return i18next.t('content_copied_fields' + '.message');

    case CopyType.Word:
      return i18next.t('content_copied_word' + '.message');
  }
}

function renderCopyStatus(message: string, doc: Document): HTMLElement {
  const status = doc.createElement('div');
  status.classList.add('status');
  status.innerText = message;
  return status;
}

// Cache language tag since we fetch it a lot
let langTag: string;
function getLangTag() {
  if (langTag === undefined) {
    langTag = i18next.t('lang_tag' + '.message');
  }
  //console.log("LANGTAG:", langTag)
  return langTag;
}
