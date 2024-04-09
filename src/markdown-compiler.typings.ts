export type SharpsToken = { type: 'sharps'; count: number; value: string };
export type BackQuoteToken = { type: 'back-quote'; value: '`' };
export type DashToken = { type: 'dash'; value: '-' };

/**
 * 1. xxx
 * 2. xxx
 * 3. xxx
 */
export type OrderToken = { type: 'order'; value: number };
export type SpacesToken = { type: 'spaces'; count: number; value: string };
export type LineBreakToken = { type: 'line-break' };
export type TextToken = { type: 'text'; value: string };
export type Token =
  | SharpsToken
  | DashToken
  | OrderToken
  | SpacesToken
  | BackQuoteToken
  | LineBreakToken
  | TextToken;

export interface BaseTextElement {
  text: string;
}

export interface InlineTextElement extends BaseTextElement {
  type: 'text';
}

export interface InlineCodeElement extends BaseTextElement {
  type: 'inline-code';
}

export type TextElement = InlineTextElement | InlineCodeElement;

export interface BaseElement {
  children: TextElement[];
}

export interface HeadingElement extends BaseElement {
  type: 'heading';
  level: number;
}

export interface ParagraphElement extends BaseElement {
  type: 'paragraph';
}

export interface ListItemElement extends BaseElement {
  type: 'list-item';
}

export interface OrderListItemElement extends BaseElement {
  type: 'order-list-item';
  order: number;
}

export type MarkdownElement =
  | TextElement
  | ParagraphElement
  | HeadingElement
  | ListItemElement
  | OrderListItemElement;
