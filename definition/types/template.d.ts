import { Metadata } from './metadata';
import { Variable } from './variables';
import { Content } from './content';

/**
 * Template structure
 */
export interface AgreementTemplate {
  metadata: Metadata;
  variables: Variable[];
  content: Content;
}