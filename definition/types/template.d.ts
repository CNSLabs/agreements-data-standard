import { Metadata } from './metadata';
import { Variable } from './variables';
import { Content } from './content';

/**
 * Template structure
 */
export interface Template {
  metadata: Metadata;
  variables: Variable[];
  content: Content;
}