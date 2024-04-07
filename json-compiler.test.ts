import { JSONNode, JSONToken, parser, tokenizer } from './json-compiler';

describe('json-tokenizer', () => {
  it('should contain a null-literal token only', () => {
    expect(tokenizer('null')).toEqual([
      { type: 'null', value: 'null' },
    ] as JSONToken[]);
  });

  it('should contain 2 paren tokens', () => {
    expect(tokenizer('{}')).toEqual([
      { type: 'paren', value: '{' },
      { type: 'paren', value: '}' },
    ] as JSONToken[]);
  });

  it('should contain 2 number-literal token only', () => {
    expect(tokenizer('233')).toEqual([
      { type: 'number', value: '233' },
    ] as JSONToken[]);
  });

  it('should contain 2 string-literal token only', () => {
    expect(tokenizer('"hello"')).toEqual([
      { type: 'string', value: 'hello' },
    ] as JSONToken[]);
  });

  it('should contain a boolean-literal(true) token only', () => {
    expect(tokenizer('true')).toEqual([{ type: 'boolean', value: 'true' }]);
  });

  it('should contain a boolean-literal(false) token only', () => {
    expect(tokenizer('false')).toEqual([{ type: 'boolean', value: 'false' }]);
  });

  it('left paren + property(firstName) + colon + string(John) + comma + property(lastName) + colon + string(Doe) + right paren', () => {
    expect(tokenizer('{"firstName":"John","lastName":"Doe"}')).toEqual([
      { type: 'paren', value: '{' },
      { type: 'property', value: 'firstName' },
      { type: 'colon', value: ':' },
      { type: 'string', value: 'John' },
      { type: 'comma', value: ',' },
      { type: 'property', value: 'lastName' },
      { type: 'colon', value: ':' },
      { type: 'string', value: 'Doe' },
      { type: 'paren', value: '}' },
    ] as JSONToken[]);
  });

  it('left square-bracket + number(1) + comma + number(2) + comma + number(3) + right square-bracket', () => {
    expect(tokenizer('[1,2,3]')).toEqual([
      { type: 'square-bracket', value: '[' },
      { type: 'number', value: '1' },
      { type: 'comma', value: ',' },
      { type: 'number', value: '2' },
      { type: 'comma', value: ',' },
      { type: 'number', value: '3' },
      { type: 'square-bracket', value: ']' },
    ] as JSONToken[]);
  });
});

describe('json-parser', () => {
  it('should contain a boolean(true) null node', () => {
    expect(parser(tokenizer('true'))).toEqual([
      { type: 'boolean', value: true },
    ] as JSONNode[]);
  });

  it('should contain a boolean(false) null node', () => {
    expect(parser(tokenizer('false'))).toEqual([
      { type: 'boolean', value: false },
    ] as JSONNode[]);
  });

  it('should contain a json null node', () => {
    expect(parser(tokenizer('null'))).toEqual([
      { type: 'null', value: null },
    ] as JSONNode[]);
  });

  it('should contain a json number node', () => {
    expect(parser(tokenizer('123'))).toEqual([
      { type: 'number', value: 123 },
    ] as JSONNode[]);
  });

  it('should contain a json string node', () => {
    expect(parser(tokenizer('"123"'))).toEqual([
      { type: 'string', value: '123' },
    ] as JSONNode[]);
  });

  it('should contain a json object node', () => {
    expect(
      parser(tokenizer('{"firstName":"John","lastName":"Doe","age":22}'))
    ).toEqual([
      {
        type: 'object',
        properties: {
          firstName: { type: 'string', value: 'John' },
          lastName: { type: 'string', value: 'Doe' },
          age: { type: 'number', value: 22 },
        },
      },
    ] as JSONNode[]);
  });

  it('should contain a json array node', () => {
    expect(parser(tokenizer('[1,2,3]'))).toEqual([
      {
        type: 'array',
        items: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 },
        ],
      },
    ] as JSONNode[]);
  });
});
