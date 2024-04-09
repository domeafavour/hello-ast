import {
  DASH,
  LEFT_PARENTHESES,
  LEFT_SQUARE_PARENTHESES,
  LINE_BREAK,
  NUMBER,
  RIGHT_ARROW,
  RIGHT_PARENTHESES,
  RIGHT_SQUARE_PARENTHESES,
  SHARP,
  TEXT,
  WHITESPACE,
  createBackQuoteToken,
  createBaseElement,
  createBaseTextElement,
  createDashToken,
  createInlineLinkElement,
  createInlineTextElement,
  createLineBreakToken,
  createOrderToken,
  createParagraphElement,
  createParenContentToken,
  createRightArrowToken,
  createSharpsToken,
  createSpacesToken,
  createSquareParenContentToken,
  createTextToken,
  mergeInlineTexts,
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

    // paren content
    if (LEFT_PARENTHESES.test(char)) {
      // series of left paren: ((dd)
      if (LEFT_PARENTHESES.test(input[current + 1])) {
        tokens.push(createTextToken(char));
        current++;
        continue;
      }

      let content = '';
      while (
        current < input.length - 1 &&
        !RIGHT_PARENTHESES.test(input[current + 1])
      ) {
        content += input[++current];
      }

      const maybeRightParen = input[++current];
      if (RIGHT_PARENTHESES.test(maybeRightParen)) {
        tokens.push(createParenContentToken(content));
      } else {
        tokens.push(createTextToken('('));
        tokens.push(createTextToken(content));
      }
      current++;
      continue;
    }

    if (RIGHT_PARENTHESES.test(char)) {
      tokens.push(createTextToken(char));
      current++;
      continue;
    }

    // square paren content
    if (LEFT_SQUARE_PARENTHESES.test(char)) {
      // series of left square paren: [[dd]
      if (LEFT_SQUARE_PARENTHESES.test(input[current + 1])) {
        tokens.push(createTextToken(char));
        current++;
        continue;
      }

      let content = '';
      while (
        current < input.length - 1 &&
        !RIGHT_SQUARE_PARENTHESES.test(input[current + 1])
      ) {
        content += input[++current];
      }

      const mayBeRightSquareParen = input[++current];
      if (RIGHT_SQUARE_PARENTHESES.test(mayBeRightSquareParen)) {
        tokens.push(createSquareParenContentToken(content));
      } else {
        tokens.push(createTextToken('['));
        tokens.push(createTextToken(content));
      }
      current++;
      continue;
    }

    if (RIGHT_SQUARE_PARENTHESES.test(char)) {
      tokens.push(createTextToken(char));
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
      } else if (token.type === 'square-paren-content') {
        const mayBeParenContent = tokens[current + 1];
        if (mayBeParenContent && mayBeParenContent.type === 'paren-content') {
          elements.push(
            createInlineLinkElement(mayBeParenContent.value, [
              createInlineTextElement(token.value),
            ])
          );
        } else {
          elements.push(createInlineTextElement('[' + token.value + ']'));
        }
      } else if (token.type === 'paren-content') {
        const mayBeSquareParenContent = tokens[current - 1];
        if (
          !mayBeSquareParenContent ||
          mayBeSquareParenContent.type !== 'square-paren-content'
        ) {
          elements.push(createInlineTextElement('(' + token.value + ')'));
        }
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

//  - [x] merge texts
export function transformer(ast: MarkdownElement[]): MarkdownElement[] {
  const newAst: MarkdownElement[] = [];
  ast.forEach((element) => {
    if (element.type === 'text' || element.type === 'inline-code') {
      newAst.push(createParagraphElement([element]));
    } else {
      newAst.push({ ...element, children: mergeInlineTexts(element.children) });
    }
  });
  return newAst;
}
