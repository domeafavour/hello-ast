// # Hello World
// { type: "sharps", count: 1 }
// { type: "spaces", count: 1 }
// { type: "text", text: "Hello" }
// { type: "spaces", count: 1 }
// { type: "text", text: "World" }

import {
  DASH,
  LINE_BREAK,
  NUMBER,
  RIGHT_ARROW,
  SHARP,
  TEXT,
  WHITESPACE,
  createBackQuoteToken,
  createBaseElement,
  createBaseTextElement,
  createDashToken,
  createInlineTextElement,
  createLineBreakToken,
  createOrderToken,
  createRightArrowToken,
  createSharpsToken,
  createSpacesToken,
  createTextToken,
} from './helpers';
import {
  BlockquoteElement,
  HeadingElement,
  InlineCodeElement,
  InlineTextElement,
  ListItemElement,
  MarkdownElement,
  OrderListItemElement,
  ParagraphElement,
  TextElement,
  TextToken,
  Token,
} from './typings';

export * from './helpers';
export * from './typings';

// # Hello World\nI am ok.
// { type: "sharps", count: 1 }
// { type: "spaces", count: 1 }
// { type: "text", text: "Hello" }
// { type: "spaces", count: 1 }
// { type: "text", text: "World" }
// { type: "line-break" }
// { type: "text", text: "I" }
// { type: "spaces", count: 1 }
// { type: "text", text: "am" }
// { type: "spaces", count: 1 }
// { type: "text", text: "ok." }

// - Hello World
// { type: "dash", count: 1 }
// { type: "spaces", count: 1 }
// { type: "text", text: "Hello" }
// { type: "spaces", count: 1 }
// { type: "text", text: "World" }

export function tokenizer(input: string): Token[] {
  const tokens: Token[] = [];
  let current = 0;

  while (current < input.length) {
    let char = input[current];
    if (SHARP.test(char)) {
      let count = 1;
      while (SHARP.test(input[current + 1])) {
        count++;
        char = input[++current];
      }
      tokens.push(createSharpsToken(count));
      current++;
      continue;
    }

    if (WHITESPACE.test(char)) {
      let count = 1;
      while (WHITESPACE.test(input[current + 1])) {
        count++;
        char = input[++current];
      }
      tokens.push(createSpacesToken(count));
      current++;
      continue;
    }

    if (RIGHT_ARROW.test(char)) {
      tokens.push(createRightArrowToken());
      current++;
      continue;
    }

    if (LINE_BREAK.test(char)) {
      tokens.push(createLineBreakToken());
      current++;
      continue;
    }

    if (DASH.test(char)) {
      tokens.push(createDashToken());
      current++;
      continue;
    }

    if (char === '`') {
      tokens.push(createBackQuoteToken());
      current++;
      continue;
    }

    if (NUMBER.test(char)) {
      let num: string = char;
      while (NUMBER.test(input[current + 1])) {
        num += input[++current];
      }

      const maybeDot = input[current + 1];

      // `1. hello` => yes, order + space + text
      // `1.hello` => no, text(number) + text
      // `1 hello` => no, text + space + text
      if (maybeDot === '.' && input[current + 2] === ' ') {
        // Skip the dot
        current++;
        tokens.push(createOrderToken(num));
      } else {
        tokens.push(createTextToken(num));
      }
      current++;
      continue;
    }

    if (TEXT.test(char)) {
      let text = char;
      while (current < input.length - 1 && TEXT.test(input[current + 1])) {
        text += input[++current];
      }
      tokens.push(createTextToken(text));
      current++;
      continue;
    }
  }

  return tokens;
}

export function parser(tokens: Token[]): MarkdownElement[] {
  const elements: MarkdownElement[] = [];
  let current = 0;

  function walkInlineElements(): TextElement[] {
    const elements: TextElement[] = [];
    while (tokens[current] && tokens[current].type !== 'line-break') {
      const token = tokens[current];
      if (token.type === 'text') {
        elements.push(createInlineTextElement(token.value));
      } else if (token.type === 'spaces') {
        elements.push(createInlineTextElement(token.value));
      } else if (token.type === 'dash') {
        elements.push(createInlineTextElement(token.value));
      } else if (token.type === 'order') {
        elements.push(createInlineTextElement(token.value.toString() + '.'));
      } else if (token.type === 'right-arrow') {
        elements.push(createInlineTextElement(token.value));
      } else if (token.type === 'back-quote') {
        // Skip back-quote
        current++;

        const inlineText = createBaseTextElement('');

        // Collect text until next back-quote or line-break
        while (tokens[current] && tokens[current].type !== 'back-quote') {
          // TODO: token text resolver
          const textToken = tokens[current++] as TextToken;
          inlineText.text += textToken.value;
        }

        // Add this inline code element if the next token is back-quote
        // `code` => yes
        // `code  => no
        if (tokens[current] && tokens[current].type === 'back-quote') {
          (inlineText as InlineCodeElement).type = 'inline-code';
        } else {
          (inlineText as InlineTextElement).type = 'text';
          // Prepend the skipped back-quote
          inlineText.text = '`' + inlineText.text;
        }
        // current++;
        elements.push(inlineText as TextElement);
      }
      current++;
    }
    return elements;
  }

  function walkBlockElements(): MarkdownElement {
    const token = tokens[current];
    if (token.type !== 'line-break') {
      let blockElement = createBaseElement();
      let nextToken = tokens[current + 1];
      let isNextSpaceToken = nextToken && nextToken.type === 'spaces';
      // default type is paragraph
      (blockElement as ParagraphElement).type = 'paragraph';
      if (token.type === 'sharps') {
        // `# hello`
        // heading 1 `hello`
        if (isNextSpaceToken) {
          // Skip current sharps and next spaces
          current += 2;
          (blockElement as HeadingElement).type = 'heading';
          (blockElement as HeadingElement).level = token.count;
        }
      } else if (token.type === 'dash') {
        if (isNextSpaceToken) {
          // Skip current dash and next spaces
          current += 2;
          (blockElement as ListItemElement).type = 'list-item';
        }
      } else if (token.type === 'order') {
        if (isNextSpaceToken) {
          current += 2;
          (blockElement as OrderListItemElement).type = 'order-list-item';
          (blockElement as OrderListItemElement).order = token.value;
        }
      } else if (token.type === 'right-arrow') {
        if (isNextSpaceToken) {
          current += 2;
          (blockElement as BlockquoteElement).type = 'blockquote';
        }
      }
      blockElement.children = walkInlineElements();
      current++;
      return blockElement as ParagraphElement;
    }
    current++;
    return walkBlockElements();
  }

  while (current < tokens.length) {
    elements.push(walkBlockElements());
  }

  return elements;
}
