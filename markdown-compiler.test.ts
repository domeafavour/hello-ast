import { Token, tokenizer } from './markdown-compiler';

describe('markdown compiler', () => {
  it('should return an empty token list', () => {
    expect(tokenizer('')).toEqual([]);
  });

  it('should return a text token list', () => {
    expect(tokenizer('hello world')).toEqual([
      {
        type: 'text',
        text: 'hello',
      },
      {
        type: 'spaces',
        count: 1,
      },
      {
        type: 'text',
        text: 'world',
      },
    ] satisfies Token[]);
  });

  it('should return a sharps token list', () => {
    expect(tokenizer('###')).toEqual([
      { type: 'sharps', count: 3 },
    ] satisfies Token[]);
  });

  it('should return a line-break token list', () => {
    expect(tokenizer('\n\n')).toEqual([
      { type: 'line-break' },
      { type: 'line-break' },
    ] satisfies Token[]);
  });

  it('should return a spaces token list', () => {
    expect(tokenizer('   ')).toEqual([
      { type: 'spaces', count: 3 },
    ] satisfies Token[]);
  });

  it('should return a text token(prefix: `##`) list', () => {
    expect(tokenizer('##hello world')).toEqual([
      {
        type: 'sharps',
        count: 2,
      },
      {
        type: 'text',
        text: 'hello',
      },
      {
        type: 'spaces',
        count: 1,
      },
      {
        type: 'text',
        text: 'world',
      },
    ] satisfies Token[]);
  });

  it('sharps 1 + text Hello World', () => {
    expect(tokenizer('# Hello World')).toEqual([
      {
        type: 'sharps',
        count: 1,
      },
      {
        type: 'spaces',
        count: 1,
      },
      {
        type: 'text',
        text: 'Hello',
      },
      {
        type: 'spaces',
        count: 1,
      },
      {
        type: 'text',
        text: 'World',
      },
    ] satisfies Token[]);

    expect(tokenizer('#     Hello World')).toEqual([
      {
        type: 'sharps',
        count: 1,
      },
      {
        type: 'spaces',
        count: 5,
      },
      {
        type: 'text',
        text: 'Hello',
      },
      {
        type: 'spaces',
        count: 1,
      },
      {
        type: 'text',
        text: 'World',
      },
    ] satisfies Token[]);
  });

  it('heading one and a paragraph', () => {
    expect(tokenizer('# Hello World\nI am ok.')).toEqual([
      {
        type: 'sharps',
        count: 1,
      },
      {
        type: 'spaces',
        count: 1,
      },
      {
        type: 'text',
        text: 'Hello',
      },
      {
        type: 'spaces',
        count: 1,
      },
      {
        type: 'text',
        text: 'World',
      },
      {
        type: 'line-break',
      },
      {
        type: 'text',
        text: 'I',
      },
      {
        type: 'spaces',
        count: 1,
      },
      {
        type: 'text',
        text: 'am',
      },
      {
        type: 'spaces',
        count: 1,
      },
      {
        type: 'text',
        text: 'ok.',
      },
    ] satisfies Token[]);
  });
});
