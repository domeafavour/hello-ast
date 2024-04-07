import { JSONToken, tokenizer } from './json-compiler';

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
});
