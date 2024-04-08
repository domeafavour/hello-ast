export type SharpsToken = { type: 'sharps'; count: number };
export type LineBreakToken = { type: 'line-break' };
export type TextToken = { type: 'text'; text: string };
export type Token = SharpsToken | LineBreakToken | TextToken;

// # Hello World
// { type: "sharps", count: 1 }
// { type: "text", count: "Hello World" }

const SHARP = /#/;
const WHITESPACE = /\s/;

export function tokenizer(input: string): Token[] {
  const tokens: Token[] = [];
  let current = 0;

  while (current < input.length) {
    let char = input[current];
    if (SHARP.test(char)) {
      let count = 0;
      while (SHARP.test(char)) {
        count++;
        char = input[++current];
      }
      tokens.push({ type: 'sharps', count });
      current++;
      continue;
    }

    // Skip whitespace after sharps
    if (
      WHITESPACE.test(char) &&
      tokens.length &&
      tokens[tokens.length - 1].type === 'sharps'
    ) {
      while (WHITESPACE.test(input[current])) {
        current++;
      }
      continue;
    }

    let text = '';
    while (current < input.length && !SHARP.test(input[current])) {
      text += input[current];
      current++;
    }
    tokens.push({ type: 'text', text });
  }

  return tokens;
}
