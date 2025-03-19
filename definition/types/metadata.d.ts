/**
 * Metadata for agreement templates
 */
export interface Metadata {
  /** Unique identifier for the agreement instance */
  id: `did:${string}`;
  /** Identifier for the template type */
  templateId: `did:template:${string}`;
  /** Semantic version of the template */
  version: string;
  /** Creation timestamp */
  createdAt: string;
  /** Human readable name of the template */
  name: string;
  /** Author or organization that created the template */
  author: string;
  /** Description of the template's purpose */
  description: string;
}