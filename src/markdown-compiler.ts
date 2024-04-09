// # Hello World
// { type: "sharps", count: 1 }
// { type: "spaces", count: 1 }
// { type: "text", text: "Hello" }
// { type: "spaces", count: 1 }
// { type: "text", text: "World" }

import {
  BackQuoteToken,
  BaseElement,
  BaseTextElement,
  DashToken,
  HeadingElement,
  InlineCodeElement,
  InlineTextElement,
  LineBreakToken,
  ListItemElement,
  MarkdownElement,
  OrderListItemElement,
  OrderToken,
  ParagraphElement,
  SharpsToken,
  SpacesToken,
  TextElement,
  TextToken,
  Token,
} from './markdown-compiler.typings';

export * from './markdown-compiler.typings';

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

const SHARP = /#/;
const WHITESPACE = / /;
const LINE_BREAK = /\n/;
const DASH = /-/;
const NUMBER = /[0-9]/;

const TEXT = /[^# \n`]/;

export function createSharpsToken(count: number): SharpsToken {
  return { type: 'sharps', count, value: '#'.repeat(count) };
}

export function createSpacesToken(count: number): SpacesToken {
  return { type: 'spaces', count, value: ' '.repeat(count) };
}

export function createLineBreakToken(): LineBreakToken {
  return { type: 'line-break' };
}

export function createTextToken(value: string): TextToken {
  return { type: 'text', value };
}

export function createDashToken(): DashToken {
  return { type: 'dash', value: '-' };
}

export function createOrderToken(value: string): OrderToken {
  return { type: 'order', value: parseInt(value) };
}

export function createBackQuoteToken(): BackQuoteToken {
  return { type: 'back-quote', value: '`' };
}

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
      if (input[current + 1] === '.') {
        tokens.push(createOrderToken(char));
        // Skip number and dot
        current += 2;
        continue;
      }
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

export function createBaseElement(
  children: BaseElement['children'] = []
): BaseElement {
  return { children };
}

export function createHeadingElement(
  level: number,
  children: BaseElement['children'] = []
): HeadingElement {
  return { type: 'heading', level, children };
}

export function createParagraphElement(
  children: BaseElement['children'] = []
): ParagraphElement {
  return { type: 'paragraph', children };
}

export function createListItemElement(
  children: BaseElement['children'] = []
): ListItemElement {
  return { type: 'list-item', children };
}

export function createOrderListItemElement(
  order: number,
  children: BaseElement['children'] = []
): OrderListItemElement {
  return { type: 'order-list-item', order, children };
}

export function createBaseTextElement(text: string): BaseTextElement {
  return { text };
}

export function createInlineTextElement(text: string): InlineTextElement {
  const baseText = createBaseTextElement(text) as InlineTextElement;
  baseText.type = 'text';
  return baseText;
}

export function createInlineCodeElement(text: string): InlineCodeElement {
  const baseText = createBaseTextElement(text) as InlineCodeElement;
  baseText.type = 'inline-code';
  return baseText;
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
