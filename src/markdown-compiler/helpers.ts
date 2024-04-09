import {
  BackQuoteToken,
  BaseElement,
  BaseTextElement,
  BlockquoteElement,
  DashToken,
  HeadingElement,
  InlineCodeElement,
  InlineTextElement,
  LineBreakToken,
  ListItemElement,
  OrderListItemElement,
  OrderToken,
  ParagraphElement,
  RightArrowToken,
  SharpsToken,
  SpacesToken,
  TextElement,
  TextToken,
} from './typings';

export const SHARP = /#/;
export const WHITESPACE = / /;
export const LINE_BREAK = /\n/;
export const DASH = /-/;
export const NUMBER = /[0-9]/;
export const RIGHT_ARROW = />/;

export const TEXT = /[^# \n>`]/;

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

export function createRightArrowToken(): RightArrowToken {
  return { type: 'right-arrow', value: '>' };
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

export function createBlockquoteElement(
  children: BaseElement['children'] = []
): BlockquoteElement {
  return { type: 'blockquote', children };
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

export function mergeInlineTexts(texts: TextElement[]): TextElement[] {
  return texts.reduce<TextElement[]>((merged, text) => {
    const lastText = merged[merged.length - 1];
    if (!lastText || lastText.type !== 'text') {
      merged.push(text);
    } else {
      const inlineText = text as InlineTextElement;
      if (inlineText.type === 'text') {
        lastText.text += inlineText.text;
      } else {
        merged.push(text);
      }
    }
    return merged;
  }, []);
}
