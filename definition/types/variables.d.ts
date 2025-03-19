/**
 * Possible variable value types
 */
export type VariableValue = string | number;

/**
 * Supported variable types in the template
 */
export type VariableType = 'string' | 'number' | 'address' | 'dateTime';

/**
 * Validation rules for variables
 * Based on HTML5 form validation attributes
 */
export interface ValidationRules {
  /** Whether the field is required */
  required?: boolean;
  /** Minimum length for string values */
  minLength?: number;
  /** Maximum length for string values */
  maxLength?: number;
  /** Regular expression pattern for validation */
  pattern?: string;
  /** Minimum value for number types */
  min?: number;
  /** Maximum value for number types */
  max?: number;
  /** Custom validation message */
  message?: string;
}

/**
 * Variable definition in the template
 */
export interface Variable {
  /** Unique identifier for the variable */
  id: string;
  /** Data type of the variable */
  type: VariableType;
  /** Human readable name */
  name: string;
  /** Description of the variable's purpose */
  description: string;
  /** Current value of the variable */
  value?: VariableValue;
  /** Default value if none is provided */
  defaultValue?: VariableValue;
  /** Validation rules for the variable */
  validation?: ValidationRules;
}