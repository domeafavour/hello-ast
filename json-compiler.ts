type ParenToken = { type: 'paren'; value: '{' | '}' };
type ColonToken = { type: 'colon'; value: ':' };
type CommaToken = { type: 'comma'; value: ',' };
type SquareBracketToken = { type: 'square-bracket'; value: '[' | ']' };
type StringLiteralToken = { type: 'string'; value: string };
type NumberLiteralToken = { type: 'number'; value: string };
type BooleanLiteralToken = { type: 'boolean'; value: 'true' | 'false' };
type NullLiteralToken = { type: 'null'; value: 'null' };
type PropertyToken = { type: 'property'; value: string };

export type JSONToken =
  | ParenToken
  | ColonToken
  | CommaToken
  | SquareBracketToken
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

function isSquareBracketToken(token: any): token is SquareBracketToken {
  return token.type === 'square-bracket';
}

const TRUE_LITERAL = 'true';
const FALSE_LITERAL = 'false';
const NULL_LITERAL = 'null';

export function tokenizer(input: string): JSONToken[] {
  const tokens: JSONToken[] = [];
  let current = 0;

  function pushStringToken() {
    // string literal
    let value = '';
    while (input[++current] !== '"') {
      value += input[current];
    }
    tokens.push({ type: 'string', value });
    current++;
  }

  while (current < input.length) {
    const char = input[current];

    if (char === '{' || char === '}') {
      tokens.push({ type: 'paren', value: char });
      current++;
      continue;
    }

    if (char === '[' || char === ']') {
      tokens.push({ type: 'square-bracket', value: char });
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

      if (!previous) {
        pushStringToken();
        continue;
      }
      if (
        (isParenToken(previous) && previous.value === '{') ||
        isCommaToken(previous)
      ) {
        // property
        let value = '';
        while (input[++current] !== '"') {
          value += input[current];
        }
        tokens.push({ type: 'property', value });
        current++;
        continue;
      } else if (
        isColonToken(previous) ||
        (isSquareBracketToken(previous) && previous.value === '[')
      ) {
        // string literal
        pushStringToken();
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

    // `t`rue
    if (char === 't') {
      let value = char;
      while (
        current < input.length &&
        input[++current] === TRUE_LITERAL[value.length]
      ) {
        value += input[current];
      }
      tokens.push({ type: 'boolean', value: 'true' });
      continue;
    }

    // `f`alse
    if (char === 'f') {
      let value = char;
      while (
        current < input.length &&
        input[++current] === FALSE_LITERAL[value.length]
      ) {
        value += input[current];
      }
      tokens.push({ type: 'boolean', value: 'false' });
      continue;
    }

    // `n`ull
    if (char === 'n') {
      let value = char;
      while (
        current < input.length &&
        input[++current] === NULL_LITERAL[value.length]
      ) {
        value += input[current];
      }
      tokens.push({ type: 'null', value: 'null' });
      continue;
    }
  }

  return tokens;
}

export type JSONNumberNode = { type: 'number'; value: number };
export type JSONStringNode = { type: 'string'; value: string };
export type JSONBooleanNode = { type: 'boolean'; value: boolean };
export type JSONNullNode = { type: 'null'; value: null };
export type JSONObjectNode = {
  type: 'object';
  properties: Record<string, JSONNode>;
};
export type JSONArrayNode = { type: 'array'; items: JSONNode[] };

export type JSONNode =
  | JSONNumberNode
  | JSONStringNode
  | JSONBooleanNode
  | JSONNullNode
  | JSONObjectNode
  | JSONArrayNode;

export function parser(tokens: JSONToken[]): JSONNode[] {
  const nodes: JSONNode[] = [];
  let current = 0;

  function walk(): JSONNode {
    let token = tokens[current];

    if (token.type === 'boolean') {
      current++;
      return { type: 'boolean', value: token.value === 'true' };
    }

    if (token.type === 'null') {
      current++;
      return { type: 'null', value: null };
    }

    if (token.type === 'number') {
      current++;
      return { type: 'number', value: +token.value };
    }

    if (token.type === 'string') {
      current++;
      return { type: 'string', value: token.value };
    }

    throw new Error('Invalid token');
  }

  while (current < tokens.length) {
    nodes.push(walk());
  }

  return nodes;
}
