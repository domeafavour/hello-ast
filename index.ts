// tokenizer(input: string): Token[]
// parser(tokens: Token[]): AST
// transformer(ast: AST): newAST

const NUM_RE = /[0-9]/;
const WHITESPACE = /\s/;

const LEFT_PAREN = '(';
const RIGHT_PAREN = ')';
const ADD = 'add';
const SUBTRACT = 'subtract';

type NumberToken = {
  type: 'number';
  value: string;
};

type NameValue = typeof ADD | typeof SUBTRACT;

type NameToken = {
  type: 'name';
  value: string;
};

type ParenToken = {
  type: 'paren';
  value: '(' | ')';
};

type Token = NumberToken | NameToken | ParenToken;

// { type: 'number', value: '1' },
// { type: 'name', value: 'add' },
// { type: 'paren', value: '(' },
// { type: 'number', value: '2' },
// { type: 'name', value: 'add' },
// { type: 'number', value: '31' },
// { type: 'name', value: 'subtract' },
// { type: 'paren', value: ')' }
// { type: 'name', value: 'add' },
// { type: 'number', value: '5' },

function tokenizer(input: string) {
  let current = 0;
  const tokens: Token[] = [];
  while (current < input.length) {
    let char = input[current];
    if (char === LEFT_PAREN) {
      tokens.push({ type: 'paren', value: LEFT_PAREN });
      current++;
      continue;
    }
    if (char === RIGHT_PAREN) {
      tokens.push({ type: 'paren', value: RIGHT_PAREN });
      current++;
      continue;
    }
    if (NUM_RE.test(char)) {
      let value = '';
      while (NUM_RE.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({ type: 'number', value });
      continue;
    }
    if (char === '+') {
      tokens.push({ type: 'name', value: ADD });
      current++;
      continue;
    }
    if (char === '-') {
      tokens.push({ type: 'name', value: SUBTRACT });
      current++;
      continue;
    }
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }
  }
  return tokens;
}

const tokens = tokenizer('1 +(2 +  31)');
console.log(tokens);
