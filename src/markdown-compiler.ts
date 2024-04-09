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

function createSharpsToken(count: number): SharpsToken {
  return { type: 'sharps', count };
}

function createSpacesToken(count: number): SpacesToken {
  return { type: 'spaces', count };
}

function createLineBreakToken(): LineBreakToken {
  return { type: 'line-break' };
}

function createTextToken(text: string): TextToken {
  return { type: 'text', text };
}

function createDashToken(): DashToken {
  return { type: 'dash' };
}

function createOrderToken(value: string): OrderToken {
  return { type: 'order', value: parseInt(value) };
}

function createBackQuoteToken(): BackQuoteToken {
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

function createHeadingElement(level: number): HeadingElement {
  return { type: 'heading', level, children: [] };
}

function createParagraphElement(): ParagraphElement {
  return { type: 'paragraph', children: [] };
}

function createListItemElement(): ListItemElement {
  return { type: 'list-item', children: [] };
}

function createOrderListItemElement(order: number): OrderListItemElement {
  return { type: 'order-list-item', order, children: [] };
}

export function parser(tokens: Token[]): MarkdownElement[] {
  const elements: MarkdownElement[] = [];
  let current = 0;

  function walkInlineElements(): TextElement[] {
    const elements: TextElement[] = [];
    while (tokens[current] && tokens[current].type !== 'line-break') {
      const token = tokens[current];
      if (token.type === 'text') {
        elements.push({ type: 'text', text: token.text });
      } else if (token.type === 'spaces') {
        elements.push({ type: 'text', text: ' '.repeat(token.count) });
      } else if (token.type === 'back-quote') {
        // Skip back-quote
        current++;

        const inlineText: BaseTextElement = {
          text: '',
        };

        // Collect text until next back-quote or line-break
        while (tokens[current] && tokens[current].type !== 'back-quote') {
          // TODO: token text resolver
          const textToken = tokens[current++] as TextToken;
          inlineText.text += textToken.text;
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
        current++;
        elements.push(inlineText as TextElement);
      }
      current++;
    }
    return elements;
  }

  function walkBlockElements(): MarkdownElement {
    const token = tokens[current];
    if (token.type === 'sharps') {
      let nextToken = tokens[current + 1];
      // `# hello`
      // heading 1 `hello`
      if (nextToken && nextToken.type === 'spaces') {
        const headingElement = createHeadingElement(token.count);

        // Skip current sharps and next spaces
        current += 2;

        headingElement.children = walkInlineElements();

        return headingElement;
      } else {
        current++;
        // `#hello`
        // text `#`
        return { type: 'text', text: '#'.repeat(token.count) };
      }
    }

    if (token.type === 'text') {
      const previous = tokens[current - 1];
      const text: TextElement = { type: 'text', text: token.text };

      current++;
      // The start of first line or a new line
      if (!previous || previous.type === 'line-break') {
        const paragraphElement: ParagraphElement = createParagraphElement();
        paragraphElement.children.push(text);
        paragraphElement.children.push(...walkInlineElements());

        return paragraphElement;
      }
      return text;
    }

    if (token.type === 'line-break') {
      current++;
      return walkBlockElements();
    }

    if (token.type === 'spaces') {
      current++;
      return { type: 'text', text: ' '.repeat(token.count) };
    }

    if (token.type === 'dash') {
      // const previous = tokens[current - 1];
      const next = tokens[current + 1];

      // `- item`
      // bulleted list item
      if (next && next.type === 'spaces') {
        const itemElement = createListItemElement();

        // Skip current dash and next spaces
        // `- item` => `item`
        current += 2;

        itemElement.children = walkInlineElements();

        return itemElement;
      } else {
        tokens[current] = createTextToken('-');
        return walkBlockElements();
      }
    }

    if (token.type === 'order') {
      const next = tokens[current + 1];

      if (next && next.type === 'spaces') {
        const orderElement = createOrderListItemElement(token.value);

        current += 2;

        orderElement.children = walkInlineElements();

        return orderElement;
      } else {
        // reuse `text` logic
        tokens[current] = createTextToken(token.value.toString() + '.');
        return walkBlockElements();
      }
    }

    throw new TypeError(`Unknown token type`);
  }

  while (current < tokens.length) {
    elements.push(walkBlockElements());
  }

  return elements;
}
