type ParenToken = { type: 'paren'; value: '{' | '}' };
type ColonToken = { type: 'colon'; value: ':' };
type CommaToken = { type: 'comma'; value: ',' };
type StringLiteralToken = { type: 'string'; value: string };
type NumberLiteralToken = { type: 'number'; value: string };
type BooleanLiteralToken = { type: 'boolean'; value: 'true' | 'false' };
type NullLiteralToken = { type: 'null'; value: 'null' };
type PropertyToken = { type: 'property'; value: string };

type JSONToken =
  | ParenToken
  | ColonToken
  | CommaToken
  | StringLiteralToken
  | NumberLiteralToken
  | BooleanLiteralToken
  | NullLiteralToken
  | PropertyToken;

// { type: 'paren', value: '{' }
// { type: 'property', value: 'firstName' }
// { type: 'colon', value: ':' }
// { type: 'string', value: 'John' }
// { type: 'comma', value: ',' }
// { type: 'property', value: 'lastName' }
// { type: 'colon', value: ':' }
// { type: 'string', value: 'Doe' }
// { type: 'paren', value: '}' }

const WHITESPACE = /\s/;
const NUMBER = /[0-9]/;

function isParenToken(token: any): token is ParenToken {
  return token.type === 'paren';
}

function isColonToken(token: any): token is ColonToken {
  return token.type === 'colon';
}

function isCommaToken(token: any): token is CommaToken {
  return token.type === 'comma';
}

function tokenizer(input: string): JSONToken[] {
  const tokens: JSONToken[] = [];
  let current = 0;

  while (current < input.length) {
    const char = input[current];

    if (char === '{' || char === '}') {
      tokens.push({ type: 'paren', value: char });
      current++;
      continue;
    }

    if (WHITESPACE.test(char)) {
      const previous = tokens[tokens.length - 1];
      if (
        previous &&
        ((isParenToken(previous) && previous.value === '{') ||
          isColonToken(previous) ||
          isCommaToken(previous))
      ) {
        current++;
        continue;
      }
    }

    if (char === ':') {
      tokens.push({ type: 'colon', value: ':' });
      current++;
      continue;
    }

    if (char === ',') {
      tokens.push({ type: 'comma', value: ',' });
      current++;
      continue;
    }

    // property or string literal
    // {"firstName":"John","lastName":"Doe"}
    if (char === '"') {
      const previous = tokens[tokens.length - 1];
      if (
        previous &&
        ((isParenToken(previous) && previous.value === '{') ||
          isCommaToken(previous))
      ) {
        // property
        let value = '';
        while (input[++current] !== '"') {
          value += input[current];
        }
        tokens.push({ type: 'property', value });
        current++;
        continue;
      } else if (isColonToken(previous)) {
        // string literal
        let value = '';
        while (input[++current] !== '"') {
          value += input[current];
        }
        tokens.push({ type: 'string', value });
        current++;
        continue;
      }
    }

    if (NUMBER.test(char)) {
      let value = char;
      while (NUMBER.test(input[++current])) {
        value += input[current];
      }
      tokens.push({ type: 'number', value });
      continue;
    }
  }

  return tokens;
}

const jsonTokens = tokenizer(
  JSON.stringify({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    age: 22,
  })
);

console.log(jsonTokens);
