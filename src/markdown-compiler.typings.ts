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
