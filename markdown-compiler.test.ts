import { Token, tokenizer } from './markdown-compiler';

describe('markdown compiler', () => {
  it('should return an empty token list', () => {
    expect(tokenizer('')).toEqual([]);
  });

  it('should return a text token list', () => {
    expect(tokenizer('hello world')).toEqual([
      {
        type: 'text',
        text: 'hello world',
      },
    ] as Token[]);
  });

  it('sharps 1 + text Hello World', () => {
    expect(tokenizer('# Hello World')).toEqual([
      {
        type: 'sharps',
        count: 1,
      },
      {
        type: 'text',
        text: 'Hello World',
      },
    ] as Token[]);

    expect(tokenizer('#     Hello World')).toEqual([
      {
        type: 'sharps',
        count: 1,
      },
      {
        type: 'text',
        text: 'Hello World',
      },
    ] as Token[]);
  });
});
