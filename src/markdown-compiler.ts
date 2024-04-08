export type SharpsToken = { type: 'sharps'; count: number };
export type BackQuoteToken = { type: 'back-quote'; value: '`' };
export type DashToken = { type: 'dash' };

/**
 * 1. xxx
 * 2. xxx
 * 3. xxx
 */
export type OrderToken = { type: 'order'; value: number };
export type SpacesToken = { type: 'spaces'; count: number };
export type LineBreakToken = { type: 'line-break' };
export type TextToken = { type: 'text'; text: string };
export type Token =
  | SharpsToken
  | DashToken
  | OrderToken
  | SpacesToken
  | BackQuoteToken
  | LineBreakToken
  | TextToken;

// # Hello World
// { type: "sharps", count: 1 }
// { type: "spaces", count: 1 }
// { type: "text", text: "Hello" }
// { type: "spaces", count: 1 }
// { type: "text", text: "World" }

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

export type TextElement = {
  type: 'text';
  value: string;
};

export type HeadingElement = {
  type: 'heading';
  level: number;
  children: TextElement[];
};

export type ParagraphElement = {
  type: 'paragraph';
  children: TextElement[];
};

export type ListItemElement = {
  type: 'list-item';
  children: TextElement[];
};

export type OrderListItemElement = {
  type: 'order-list-item';
  order: number;
  children: TextElement[];
};

export type MarkdownElement =
  | TextElement
  | ParagraphElement
  | HeadingElement
  | ListItemElement
  | OrderListItemElement;

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

  function walk(): MarkdownElement {
    const token = tokens[current];
    if (token.type === 'sharps') {
      let nextToken = tokens[current + 1];
      // `# hello`
      // heading 1 `hello`
      if (nextToken && nextToken.type === 'spaces') {
        const headingElement = createHeadingElement(token.count);

        // Skip current sharps and next spaces
        current += 2;

        // text or spaces
        while (tokens[current] && tokens[current].type !== 'line-break') {
          headingElement.children.push(walk() as TextElement);
        }

        return headingElement;
      } else {
        current++;
        // `#hello`
        // text `#`
        return { type: 'text', value: '#'.repeat(token.count) };
      }
    }

    if (token.type === 'text') {
      const previous = tokens[current - 1];
      const text: TextElement = { type: 'text', value: token.text };

      current++;
      // The start of first line or a new line
      if (!previous || previous.type === 'line-break') {
        const paragraphElement: ParagraphElement = createParagraphElement();
        paragraphElement.children.push(text);

        while (tokens[current] && tokens[current].type !== 'line-break') {
          paragraphElement.children.push(walk() as TextElement);
        }
        return paragraphElement;
      }
      return text;
    }

    if (token.type === 'line-break') {
      current++;
      return walk();
    }

    if (token.type === 'spaces') {
      current++;
      return { type: 'text', value: ' '.repeat(token.count) };
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

        // The start of first line or a new line.
        while (tokens[current] && tokens[current].type !== 'line-break') {
          // (text or spaces)
          itemElement.children.push(walk() as TextElement);
        }

        return itemElement;
      } else {
        tokens[current] = createTextToken('-');
        return walk();
      }
    }

    if (token.type === 'order') {
      const next = tokens[current + 1];

      if (next && next.type === 'spaces') {
        const orderElement = createOrderListItemElement(token.value);

        current += 2;

        // The start of first line or a new line.
        while (tokens[current] && tokens[current].type !== 'line-break') {
          // (text or spaces)
          orderElement.children.push(walk() as TextElement);
        }

        return orderElement;
      } else {
        // reuse `text` logic
        tokens[current] = createTextToken(token.value.toString() + '.');
        return walk();
      }
    }

    throw new TypeError(`Unknown token type`);
  }

  while (current < tokens.length) {
    elements.push(walk());
  }

  return elements;
}
