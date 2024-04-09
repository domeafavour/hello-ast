import {
  MarkdownElement,
  Token,
  createBackQuoteToken,
  createDashToken,
  createLineBreakToken,
  createOrderToken,
  createSharpsToken,
  createSpacesToken,
  createTextToken,
  parser,
  tokenizer,
} from './markdown-compiler';

describe('markdown compiler', () => {
  it('should return an empty token list', () => {
    expect(tokenizer('')).toEqual([]);
  });

  it('should contain back quote tokens', () => {
    expect(tokenizer('`code`')).toEqual([
      createBackQuoteToken(),
      createTextToken('code'),
      createBackQuoteToken(),
    ] satisfies Token[]);
  });

  it('should return a text token list', () => {
    expect(tokenizer('hello world')).toEqual([
      createTextToken('hello'),
      createSpacesToken(1),
      createTextToken('world'),
    ] satisfies Token[]);
  });

  it('should return a sharps token list', () => {
    expect(tokenizer('###')).toEqual([createSharpsToken(3)] satisfies Token[]);
  });

  it('should return a line-break token list', () => {
    expect(tokenizer('\n\n')).toEqual([
      createLineBreakToken(),
      createLineBreakToken(),
    ] satisfies Token[]);
  });

  it('should return a spaces token list', () => {
    expect(tokenizer('   ')).toEqual([createSpacesToken(3)] satisfies Token[]);
  });

  it('should return a text token(prefix: `##`) list', () => {
    expect(tokenizer('##hello world')).toEqual([
      createSharpsToken(2),
      createTextToken('hello'),
      createSpacesToken(1),
      createTextToken('world'),
    ] satisfies Token[]);
  });

  it('sharps 1 + text Hello World', () => {
    expect(tokenizer('# Hello World')).toEqual([
      createSharpsToken(1),
      createSpacesToken(1),
      createTextToken('Hello'),
      createSpacesToken(1),
      createTextToken('World'),
    ] satisfies Token[]);

    expect(tokenizer('#     Hello World')).toEqual([
      createSharpsToken(1),
      createSpacesToken(5),
      createTextToken('Hello'),
      createSpacesToken(1),
      createTextToken('World'),
    ] satisfies Token[]);
  });

  it('heading one and a paragraph', () => {
    expect(tokenizer('# Hello World\nI am ok.')).toEqual([
      createSharpsToken(1),
      createSpacesToken(1),
      createTextToken('Hello'),
      createSpacesToken(1),
      createTextToken('World'),
      createLineBreakToken(),
      createTextToken('I'),
      createSpacesToken(1),
      createTextToken('am'),
      createSpacesToken(1),
      createTextToken('ok.'),
    ] satisfies Token[]);
  });

  it('with bulleted list', () => {
    expect(tokenizer('# Bulleted List\n\n- Hello World\n- Coding')).toEqual([
      createSharpsToken(1),
      createSpacesToken(1),
      createTextToken('Bulleted'),
      createSpacesToken(1),
      createTextToken('List'),
      createLineBreakToken(),
      createLineBreakToken(),
      createDashToken(),
      createSpacesToken(1),
      createTextToken('Hello'),
      createSpacesToken(1),
      createTextToken('World'),
      createLineBreakToken(),
      createDashToken(),
      createSpacesToken(1),
      createTextToken('Coding'),
    ] satisfies Token[]);
  });

  it('with ordered list', () => {
    expect(tokenizer('# Ordered List\n\n1. Hello World\n2. Coding')).toEqual([
      createSharpsToken(1),
      createSpacesToken(1),
      createTextToken('Ordered'),
      createSpacesToken(1),
      createTextToken('List'),
      createLineBreakToken(),
      createLineBreakToken(),
      createOrderToken('1'),
      createSpacesToken(1),
      createTextToken('Hello'),
      createSpacesToken(1),
      createTextToken('World'),
      createLineBreakToken(),
      createOrderToken('2'),
      createSpacesToken(1),
      createTextToken('Coding'),
    ] satisfies Token[]);

    expect(tokenizer('1.hello')).toEqual([
      createOrderToken('1'),
      createTextToken('hello'),
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
            text: 'Hello',
          },
          {
            type: 'text',
            text: ' ',
          },
          {
            type: 'text',
            text: 'World',
          },
        ],
      },
    ] satisfies MarkdownElement[]);
  });

  // it('a paragraph with one inline code text only', () => {
  //   expect(parser(tokenizer('`Hello World`'))).toEqual([
  //     {
  //       type: 'paragraph',
  //       children: [
  //         //
  //         { type: 'inline-code', text: 'Hello World' },
  //       ],
  //     },
  //   ] satisfies MarkdownElement[]);
  // });

  it('should not contain a inline code text while there is only one back quote', () => {
    expect(parser(tokenizer('Hello `World'))).toEqual([
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'Hello' },
          { type: 'text', text: ' ' },
          { type: 'text', text: '`World' },
        ],
      },
    ] satisfies MarkdownElement[]);
  });

  it('should contain a paragraph element with text and inline code elements inside', () => {
    const tokens = tokenizer('# Hello `World`');
    const elements = parser(tokens);
    expect(elements).toEqual([
      {
        type: 'heading',
        level: 1,
        children: [
          { type: 'text', text: 'Hello' },
          { type: 'text', text: ' ' },
          { type: 'inline-code', text: 'World' },
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
            text: 'Hello',
          },
          {
            type: 'text',
            text: ' ',
          },
          {
            type: 'text',
            text: 'World',
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
            text: 'Hello',
          },
          {
            type: 'text',
            text: ' ',
          },
          {
            type: 'text',
            text: 'World',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'I',
          },
          {
            type: 'text',
            text: ' ',
          },
          {
            type: 'text',
            text: 'am',
          },
          {
            type: 'text',
            text: ' ',
          },
          {
            type: 'text',
            text: 'ok.',
          },
        ],
      },
    ] satisfies MarkdownElement[]);
  });

  it('should return an element list with some list items', () => {
    const tokens = tokenizer('- Hello World\n- Coding\n- Ha');
    const elements = parser(tokens);
    expect(elements).toEqual([
      {
        type: 'list-item',
        children: [
          {
            type: 'text',
            text: 'Hello',
          },
          {
            type: 'text',
            text: ' ',
          },
          {
            type: 'text',
            text: 'World',
          },
        ],
      },
      {
        type: 'list-item',
        children: [
          {
            type: 'text',
            text: 'Coding',
          },
        ],
      },
      {
        type: 'list-item',
        children: [
          {
            type: 'text',
            text: 'Ha',
          },
        ],
      },
    ] satisfies MarkdownElement[]);
  });

  it('should contain an paragraph element when there is no spaces between dash and text', () => {
    const tokens = tokenizer('-Hello');
    const elements = parser(tokens);
    expect(elements).toEqual([
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: '-' },
          { type: 'text', text: 'Hello' },
        ],
      },
    ] satisfies MarkdownElement[]);
  });

  it('should return an element list with some order list items', () => {
    const tokens = tokenizer('1. Hello World\n2. Coding\n3. Ha');
    const elements = parser(tokens);
    expect(elements).toEqual([
      {
        type: 'order-list-item',
        order: 1,
        children: [
          {
            type: 'text',
            text: 'Hello',
          },
          {
            type: 'text',
            text: ' ',
          },
          {
            type: 'text',
            text: 'World',
          },
        ],
      },
      {
        type: 'order-list-item',
        order: 2,
        children: [
          {
            type: 'text',
            text: 'Coding',
          },
        ],
      },
      {
        type: 'order-list-item',
        order: 3,
        children: [
          {
            type: 'text',
            text: 'Ha',
          },
        ],
      },
    ] satisfies MarkdownElement[]);
  });

  it('should contain an paragraph element when there is no spaces between order and text', () => {
    const tokens = tokenizer('1.Hello');
    const elements = parser(tokens);
    expect(elements).toEqual([
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: '1.' },
          { type: 'text', text: 'Hello' },
        ],
      },
    ] satisfies MarkdownElement[]);
  });
});
