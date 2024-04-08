export type SharpsToken = { type: 'sharps'; count: number };
export type DashToken = { type: 'dash' };
export type SpacesToken = { type: 'spaces'; count: number };
export type LineBreakToken = { type: 'line-break' };
export type TextToken = { type: 'text'; text: string };
export type Token =
  | SharpsToken
  | DashToken
  | SpacesToken
  | LineBreakToken
  | TextToken;

// # Hello World
// { type: "sharps", count: 1 }
// { type: "spaces", count: 1 }
// { type: "text", text: "Hello" }
// { type: "spaces", count: 1 }
// { type: "text", text: "World" }

// # Hello World\nI am ok.
// { type: "sharps", count: 1 }
// { type: "spaces", count: 1 }
// { type: "text", text: "Hello" }
// { type: "spaces", count: 1 }
// { type: "text", text: "World" }
// { type: "line-break" }
// { type: "text", text: "I" }
// { type: "spaces", count: 1 }
// { type: "text", text: "am" }
// { type: "spaces", count: 1 }
// { type: "text", text: "ok." }

// - Hello World
// { type: "dash", count: 1 }
// { type: "spaces", count: 1 }
// { type: "text", text: "Hello" }
// { type: "spaces", count: 1 }
// { type: "text", text: "World" }

const SHARP = /#/;
const WHITESPACE = / /;
const LINE_BREAK = /\n/;
const DASH = /-/;

const TEXT = /[^# \n]/;

function createSharpsToken(count: number): SharpsToken {
  return { type: 'sharps', count };
}

function createSpacesToken(count: number): SpacesToken {
  return { type: 'spaces', count };
}

function createLineBreakToken(): LineBreakToken {
  return { type: 'line-break' };
}

function createTextToken(text: string): TextToken {
  return { type: 'text', text };
}

function createDashToken(): DashToken {
  return { type: 'dash' };
}

export function tokenizer(input: string): Token[] {
  const tokens: Token[] = [];
  let current = 0;

  while (current < input.length) {
    let char = input[current];
    if (SHARP.test(char)) {
      let count = 1;
      while (SHARP.test(input[current + 1])) {
        count++;
        char = input[++current];
      }
      tokens.push(createSharpsToken(count));
      current++;
      continue;
    }

    if (WHITESPACE.test(char)) {
      let count = 1;
      while (WHITESPACE.test(input[current + 1])) {
        count++;
        char = input[++current];
      }
      tokens.push(createSpacesToken(count));
      current++;
      continue;
    }

    if (LINE_BREAK.test(char)) {
      tokens.push(createLineBreakToken());
      current++;
      continue;
    }

    if (DASH.test(char)) {
      tokens.push(createDashToken());
      current++;
      continue;
    }

    if (TEXT.test(char)) {
      let text = char;
      while (current < input.length - 1 && TEXT.test(input[current + 1])) {
        text += input[++current];
      }
      tokens.push(createTextToken(text));
      current++;
      continue;
    }
  }

  return tokens;
}
