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

function createStringLiteralToken(value: string): StringLiteralToken {
  return { type: 'string', value };
}

function createParenToken(value: '{' | '}'): ParenToken {
  return { type: 'paren', value };
}

function createSquareBracketToken(value: '[' | ']'): SquareBracketToken {
  return { type: 'square-bracket', value };
}

function createColonToken(): ColonToken {
  return { type: 'colon', value: ':' };
}

function createCommaToken(): CommaToken {
  return { type: 'comma', value: ',' };
}

function createPropertyToken(value: string): PropertyToken {
  return { type: 'property', value };
}

function createNumberLiteralToken(value: string): NumberLiteralToken {
  return { type: 'number', value };
}

function createBooleanLiteralToken(
  value: 'true' | 'false'
): BooleanLiteralToken {
  return { type: 'boolean', value };
}

function createNullLiteralToken(): NullLiteralToken {
  return { type: 'null', value: 'null' };
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
    tokens.push(createStringLiteralToken(value));
    current++;
  }

  while (current < input.length) {
    const char = input[current];

    if (char === '{' || char === '}') {
      tokens.push(createParenToken(char));
      current++;
      continue;
    }

    if (char === '[' || char === ']') {
      tokens.push(createSquareBracketToken(char));
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
      tokens.push(createColonToken());
      current++;
      continue;
    }

    if (char === ',') {
      tokens.push(createCommaToken());
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
        tokens.push(createPropertyToken(value));
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
      tokens.push(createNumberLiteralToken(value));
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
      tokens.push(createBooleanLiteralToken('true'));
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
      tokens.push(createBooleanLiteralToken('false'));
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
      tokens.push(createNullLiteralToken());
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

function createJSONBooleanNode(tokenValue: 'true' | 'false'): JSONBooleanNode {
  return { type: 'boolean', value: tokenValue === 'true' };
}

function createJSONNullNode(): JSONNullNode {
  return { type: 'null', value: null };
}

function createJSONNumberNode(tokenValue: string): JSONNumberNode {
  return { type: 'number', value: +tokenValue };
}

function createJSONStringNode(tokenValue: string): JSONStringNode {
  return { type: 'string', value: tokenValue };
}

function createEmptyJSONObjectNode(): JSONObjectNode {
  return { type: 'object', properties: {} };
}

function createEmptyJSONArrayNode(): JSONArrayNode {
  return { type: 'array', items: [] };
}

export function parser(tokens: JSONToken[]): JSONNode[] {
  const nodes: JSONNode[] = [];
  let current = 0;

  function walk(): JSONNode {
    let token = tokens[current];

    if (token.type === 'boolean') {
      current++;
      return createJSONBooleanNode(token.value);
    }

    if (token.type === 'null') {
      current++;
      return createJSONNullNode();
    }

    if (token.type === 'number') {
      current++;
      return createJSONNumberNode(token.value);
    }

    if (token.type === 'string') {
      current++;
      return createJSONStringNode(token.value);
    }

    if (isParenToken(token) && token.value === '{') {
      const objectNode = createEmptyJSONObjectNode();
      let nextToken = tokens[++current];
      while (
        nextToken &&
        !(isParenToken(nextToken) && nextToken.value === '}')
      ) {
        if (nextToken.type === 'property') {
          const property = nextToken.value;
          // skip colon
          current++;
          objectNode.properties[property] = walk();
        }
        nextToken = tokens[++current];
      }
      return objectNode;
    }

    if (isSquareBracketToken(token) && token.value === '[') {
      const arrayNode = createEmptyJSONArrayNode();
      let nextToken = tokens[++current];
      while (
        nextToken &&
        !(isSquareBracketToken(nextToken) && nextToken.value === ']')
      ) {
        arrayNode.items.push(walk());
        nextToken = tokens[++current];
      }
      return arrayNode;
    }

    if (token.type === 'colon' || token.type === 'comma') {
      current++;
      return walk();
    }

    throw new TypeError(`Invalid token: ${token.type}`);
  }

  while (current < tokens.length) {
    nodes.push(walk());
  }

  return nodes;
}

export function transformer(
  ast: JSONNode[]
): string | number | boolean | object | Array<any> | null {
  if (!ast.length) {
    throw new Error('Invalid AST');
  }
  const [rootNode] = ast;
  switch (rootNode.type) {
    case 'null': {
      return null;
    }
    case 'boolean': {
      return rootNode.value;
    }
    case 'number': {
      return rootNode.value;
    }
    case 'string': {
      return rootNode.value;
    }
    case 'object': {
      const obj: Record<string, any> = {};
      for (const key in rootNode.properties) {
        obj[key] = transformer([rootNode.properties[key]]);
      }
      return obj;
    }
    case 'array': {
      return rootNode.items.map((item) => transformer([item]));
    }
  }
}
