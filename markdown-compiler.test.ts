import { MarkdownElement, Token, parser, tokenizer } from './markdown-compiler';

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

  it('with bulleted list', () => {
    expect(tokenizer('# Bulleted List\n\n- Hello World\n- Coding')).toEqual([
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
        text: 'Bulleted',
      },
      {
        type: 'spaces',
        count: 1,
      },
      {
        type: 'text',
        text: 'List',
      },
      {
        type: 'line-break',
      },
      {
        type: 'line-break',
      },
      {
        type: 'dash',
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
        type: 'dash',
      },
      {
        type: 'spaces',
        count: 1,
      },
      {
        type: 'text',
        text: 'Coding',
      },
    ] satisfies Token[]);
  });

  it('with ordered list', () => {
    expect(tokenizer('# Ordered List\n\n1. Hello World\n2. Coding')).toEqual([
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
        text: 'Ordered',
      },
      {
        type: 'spaces',
        count: 1,
      },
      {
        type: 'text',
        text: 'List',
      },
      {
        type: 'line-break',
      },
      {
        type: 'line-break',
      },
      {
        type: 'order',
        value: 1,
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
        type: 'order',
        value: 2,
      },
      {
        type: 'spaces',
        count: 1,
      },
      {
        type: 'text',
        text: 'Coding',
      },
    ] satisfies Token[]);

    expect(tokenizer('1.hello')).toEqual([
      {
        type: 'order',
        value: 1,
      },
      {
        type: 'text',
        text: 'hello',
      },
    ] satisfies Token[]);
  });
});

describe('markdown parser', () => {
  it('should return an empty element list', () => {
    expect(parser(tokenizer(''))).toEqual([] satisfies MarkdownElement[]);
  });

  it('should return an element list with one heading element', () => {
    const tokens = tokenizer('# Hello World');
    const elements = parser(tokens);

    expect(elements).toEqual([
      {
        type: 'heading',
        level: 1,
        children: [
          {
            type: 'text',
            value: 'Hello',
          },
          {
            type: 'text',
            value: ' ',
          },
          {
            type: 'text',
            value: 'World',
          },
        ],
      },
    ] satisfies MarkdownElement[]);
  });

  it('should return an paragraph element', () => {
    const tokens = tokenizer('Hello World');
    const elements = parser(tokens);

    expect(elements).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value: 'Hello',
          },
          {
            type: 'text',
            value: ' ',
          },
          {
            type: 'text',
            value: 'World',
          },
        ],
      },
    ] satisfies MarkdownElement[]);
  });

  it('should return an element list with one heading element and one paragraph element', () => {
    const tokens = tokenizer('# Hello World\nI am ok.');
    const elements = parser(tokens);
    expect(elements).toEqual([
      {
        type: 'heading',
        level: 1,
        children: [
          {
            type: 'text',
            value: 'Hello',
          },
          {
            type: 'text',
            value: ' ',
          },
          {
            type: 'text',
            value: 'World',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value: 'I',
          },
          {
            type: 'text',
            value: ' ',
          },
          {
            type: 'text',
            value: 'am',
          },
          {
            type: 'text',
            value: ' ',
          },
          {
            type: 'text',
            value: 'ok.',
          },
        ],
      },
    ] satisfies MarkdownElement[]);
  });
});
