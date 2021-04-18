const SKIP_FOR_MORA_COUNT: ReadonlyArray<number> = [
  0x3041,
  0x3043,
  0x3045,
  0x3047,
  0x3049,
  0x3083,
  0x3085,
  0x3087,
  0x308e,
  0x30a1,
  0x30a3,
  0x30a5,
  0x30a7,
  0x30a9,
  0x30e3,
  0x30e5,
  0x30e7,
  0x30ee,
];

// Very basic mora counter
export function countMora(text: string): number {
  return [...text].filter(
    (c, i) => i === 0 || !SKIP_FOR_MORA_COUNT.includes(c.codePointAt(0)!)
  ).length;
}

export function moraSubstring(
  input: string,
  _start: number,
  _end?: number
): string {
  let start = _start;
  let end = _end;

  if (start < 0) {
    start = 0;
  }
  if (typeof end !== 'undefined' && end < 0) {
    end = 0;
  }

  const moraLength = countMora(input);
  if (start > moraLength) {
    start = moraLength;
  }
  if (typeof end !== 'undefined' && end > moraLength) {
    end = moraLength;
  }

  if (start === end) {
    return '';
  }

  if (typeof end !== 'undefined' && start > end) {
    const temp = end;
    end = start;
    start = temp;
  }

  let moraIndex = 0;
  let charStart = input.length;
  let charEnd: number | undefined;

  for (let i = 0; i < input.length; i++, moraIndex++) {
    if (moraIndex === start) {
      charStart = i;
      if (typeof end === 'undefined') {
        break;
      }
    }

    if (moraIndex === end) {
      charEnd = i;
      break;
    }

    // Skip forward if this is a skippable character
    if (
      i < input.length - 1 &&
      SKIP_FOR_MORA_COUNT.includes(input.codePointAt(i + 1)!)
    ) {
      i++;
    }
  }

  return input.substring(charStart, charEnd);
}
