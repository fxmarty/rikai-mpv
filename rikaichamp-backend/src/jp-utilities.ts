export function kanaToHiragana(input: string): string {
    let result = '';

    for (const char of input) {
        let c = char.codePointAt(0)!;

        if ((c >= 0x30a1 && c <= 0x30f6) || c === 0x30fd || c === 0x30fe) {
            c -= 0x60;
        }

        result += String.fromCodePoint(c);
    }

    return result;
}

/**
 * Expands the ー character to equivalent kana.
 *
 * Note that for some combinations there are multiple possible expansions.
 * e.g. カオー could be カオウ but オーサカ is オオサカ.
 *
 * (Technically, ー represents an extended vowel sound and オオ is actually
 * pronounced _differently_ to オウ, as two separate sounds, but people still
 * write オーサカ so we should recognize it.)
 *
 * This function returns an empty array if the input string contains no
 * ー characters.
 */
export function expandChoon(input: string): Array<string> {
    if (input.indexOf('ー') === -1) {
        return [];
    }

    const replacer = (vowel: string) => (match: string, start: string) =>
        `${start}${vowel.repeat(match.length - 1)}`;

    // Expand the simple cases
    const initialResult = input
        .replace(/([うくぐすずつづぬふぶぷむゆゅる])ー+/g, replacer('う'))
        .replace(/([ウクグスズツヅヌフブプムユュル])ー+/g, replacer('ウ'))
        .replace(/([あかがさざただなはばぱまやゃらわ])ー+/g, replacer('あ'))
        .replace(/([アカガサザタダナハバパマヤャラワ])ー+/g, replacer('ア'))
        .replace(/([いきぎしじちぢにひびぴみり])ー+/g, replacer('い'))
        .replace(/([イキギシジチヂニイブピミリ])ー+/g, replacer('イ'))
        .replace(/([えけげせぜてでねへべぺめれ])ー+/g, replacer('え'))
        .replace(/([エケゲセゼテデネヘベペメレ])ー+/g, replacer('エ'));

    // Now generate a result for each possible expansion of お・う
    const result: Array<string> = [];
    const matchO = /([おこごそぞとどのほぼぽもよょろを])ー+/;
    const matchKatakanaO = /([オコゴソゾトドノホボポモヨョロヲ])ー+/;
    const expandO = (base: string) => {
        let expandedWithU = base.replace(matchO, replacer('う'));
        if (expandedWithU === base) {
            expandedWithU = base.replace(matchKatakanaO, replacer('ウ'));
        }

        // If there have been no changes, then there are no more substitutions to
        // make for this string.
        if (expandedWithU === base) {
            // Check that there is _some_ change from the original input, however.
            if (base !== input) {
                result.push(expandedWithU);
            }
            return;
        }

        // Continue expanding with this base
        expandO(expandedWithU);

        // Also, in "parallel", try expanding using お・オ
        let expandedWithO = base.replace(matchO, replacer('お'));
        if (expandedWithO === base) {
            expandedWithO = base.replace(matchKatakanaO, replacer('オ'));
        }
        expandO(expandedWithO);
    };

    expandO(initialResult);

    return result;
}