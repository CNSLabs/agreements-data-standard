/**
 * Supported content types in the template
 */
export type ContentType = 'mdast' | 'md';

/**
 * Base MDAST node interface
 */
export interface MdastNode {
  type: string;
  children?: MdastNode[];
  value?: string;
}

/**
 * Variable reference in MDAST
 */
export interface VariableNode extends MdastNode {
  type: 'variable';
  id: string;
  property?: string;
}

/**
 * Markdown document type
 */
export type MdDoc = string;

/**
 * Content section of the template
 */
export interface Content {
  /** Type of content format */
  type: ContentType;
  /** Content data - either MDAST structure or markdown string */
  data: MdastNode | MdDoc;
}

/**
 * Type guard to check if content is MDAST
 */
export declare function isMdastContent(content: Content): content is Content & { data: MdastNode };

/**
 * Type guard to check if content is Markdown
 */
export declare function isMarkdownContent(content: Content): content is Content & { data: MdDoc };