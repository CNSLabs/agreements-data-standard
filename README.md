# Agreements Protocol

[![JSON Schema](https://img.shields.io/badge/schema-JSON-blue)](./definition/schemas/template.schema.json)

The Agreements Protocol is a JSON-based standard for creating and executing legally binding web3/blockchain agreements. Think of it as "DocuSign for web3" - providing a standardized way to create, validate, and execute digital agreements with blockchain-based proofs and state transitions.

## Protocol Overview

The protocol consists of five core components:

1. **[Metadata](#1-metadata)** - Agreement identification and context
2. **[Variables](#2-variables)** - Typed inputs that drive the agreement
3. **[Content](#3-content)** - Legal prose with variable interpolation
4. **[Proofs](#4-proofs-🚧-in-progress)** - Verifiable blockchain evidence (transactions, ZK proofs, VCs)
5. **[Execution Flow](#5-execution-flow-🚧-in-progress)** - State machine for agreement progression

[View Full Schema Definition →](./definition/schemas/template.schema.json)

### Current Status

- 🚧 **[IP-001](./definition/improvement-proposals/IP-001.md)**: DFSM to ASM 
- ✅ **[IP-002](./definition/improvement-proposals/IP-002.md)**: MDAST Content Representation
- 🚧 **[IP-003](./definition/improvement-proposals/IP-003.md)**: Proofs and Execution Flow specifications
- ✅ **[IP-004](./definition/improvement-proposals/IP-004.md)**: Standardized Metadata, Flat Variables, Schemas, and Content Types

#### Planned
- VC Schema Standards
- DID Method Extensions

## Core Components

### 1. Metadata

Agreement metadata provides essential identification and context:

**Schema Definition:**
```json
{
  "metadata": {
    "type": "object",
    "required": ["id", "templateId", "version", "createdAt", "name", "author", "description"],
    "properties": {
      "id": {
        "type": "string",
        "pattern": "^did:.*",
        "description": "Unique identifier for the agreement instance"
      },
      "templateId": {
        "type": "string",
        "pattern": "^did:template:.*",
        "description": "Identifier for the template type"
      }
    }
  }
}
```

**Example Usage:**
```json
{
  "metadata": {
    "id": "did:example:123",
    "templateId": "did:template:grant-v1",
    "version": "1.0.0",
    "createdAt": "2024-01-20T12:00:00Z",
    "name": "Grant Agreement Template",
    "author": "Example Foundation",
    "description": "Standard template for ecosystem development grants"
  }
}
```

[View full schema →](./definition/schemas/template.schema.json#metadata)

### 2. Variables

Variables define typed inputs that can be referenced throughout the agreement:

**Schema Definition:**
```json
{
  "variables": {
    "type": "array",
    "items": {
      "type": "object",
      "required": ["id", "type", "name", "description"],
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the variable"
        },
        "type": {
          "type": "string",
          "enum": ["string", "number", "address", "dateTime"],
          "description": "Data type of the variable"
        },
        "validation": {
          "type": "object",
          "properties": {
            "required": { "type": "boolean" },
            "min": { "type": "number" },
            "max": { "type": "number" },
            "pattern": { "type": "string", "format": "regex" }
          }
        }
      }
    }
  }
}
```

**Example Usage:**
```json
{
  "variables": [
    {
      "id": "grantAmount",
      "type": "number",
      "name": "Grant Amount",
      "description": "Total grant amount in USD",
      "value": 50000,
      "validation": {
        "required": true,
        "min": 1000,
        "max": 100000
      }
    },
    {
      "id": "recipientAddress",
      "type": "address",
      "name": "Recipient Wallet",
      "description": "Ethereum address to receive the grant",
      "validation": {
        "required": true,
        "pattern": "^0x[a-fA-F0-9]{40}$"
      }
    }
  ]
}
```

[View full schema →](./definition/schemas/template.schema.json#variables)

### 3. Content

Agreement content supports multiple formats with variable interpolation:

**Schema Definition:**
```json
{
  "content": {
    "type": "object",
    "required": ["type", "data"],
    "properties": {
      "type": {
        "type": "string",
        "enum": ["mdast", "md"],
        "description": "Content format type"
      },
      "data": {
        "oneOf": [
          {
            "if": { "properties": { "type": { "const": "mdast" } } },
            "then": { "$ref": "mdast.schema.json" }
          },
          {
            "if": { "properties": { "type": { "const": "md" } } },
            "then": { "type": "string" }
          }
        ]
      }
    }
  }
}
```

**Example Usage:**
```json
{
  "content": {
    "type": "md",
    "data": "# Grant Agreement\n\nThis agreement is made between {{foundation}} and {{recipient}}...\n\nGrant Amount: {{grantAmount}} USD\nRecipient Address: {{recipientAddress}}"
  }
}
```

#### Content Formats

- **MDAST (Markdown Abstract Syntax Tree)**
  - Structured content with rich semantic information
  - [MDAST Specification](https://github.com/syntax-tree/mdast)
  - [Unist Specification](https://github.com/syntax-tree/unist) (MDAST's foundation)
  - [remark](https://github.com/remarkjs/remark) - Markdown processor powered by plugins
  - [IP-002](./definition/improvement-proposals/IP-002.md) - Our MDAST implementation details

- **Markdown (MD)**
  - Human-readable authoring format
  - [CommonMark Spec](https://commonmark.org/) - Our supported Markdown syntax
  - [GitHub Markdown Guide](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
  - Supports [remark-directive](https://github.com/remarkjs/remark-directive) syntax for variables

[View full interface →](./definition/types/content.d.ts)

### 4. Proofs (🚧 In Progress)

Proofs will provide verifiable evidence for agreement progression:

- EVM Transaction Receipts
- Zero-Knowledge Proofs
- Verifiable Credentials
- EIP-712 Signatures

### 5. Execution Flow (🚧 In Progress)

State machine definition for agreement progression:

- State definitions
- Transition rules
- Proof requirements
- Validation logic

## Getting Started

### 1. Templates

The following agreement templates are available as reference implementations:

#### Grant Agreement
A standardized agreement for ecosystem development funding that includes:
- Foundation and grant recipient details
- Token allocation specifications
- RFP reference and grant activities
- Token distribution terms

Available formats:
- [MDAST version](./definition/templates/grant-agreement.json) - Structured format with rich semantic information
- [Markdown version](./definition/templates/grant-agreement.md.json) - Human-readable format with variable interpolation

#### Creating Custom Templates

You can create your own agreement templates using AI assistance. For optimal results when generating templates:

1. **Required Context Files**
   Provide these files to your AI assistant:
   - [README](./README.md)
   - [Template Schema](./definition/schemas/template.schema.json)
   - [MDAST Schema](./definition/schemas/mdast.schema.json)
   - Type definitions:
     - [Template Types](./definition/types/template.d.ts)
     - [Variables Types](./definition/types/variables.d.ts)
     - [Content Types](./definition/types/content.d.ts)
     - [Metadata Types](./definition/types/metadata.d.ts)
   - [Example Grant Agreement](./definition/templates/grant-agreement.json)
  

2. **Example Prompt**
   ```
   Using the following legal agreement, help me create an agreement template following the Agreements Protocol standard. 
   
   Agreement Type: [Your agreement type]
   Purpose: [Brief description of the agreement's purpose]
   Key Variables Needed: [List main data points that should be variable]
   
   Please generate a complete template.json with proper metadata, typed variables, and MDAST content

   <AGREEMENT_LEGAL_PROS>
   ```

### 2. Validate Your Templates

Use our JSON schemas to validate your agreement templates:

- [Template Schema](./definition/schemas/template.schema.json)
- [MDAST Schema](./definition/schemas/mdast.schema.json)

### 3. Type Definitions

TypeScript definitions for type-safe development:

- [Template Types](./definition/types/template.d.ts)
- [Variables Types](./definition/types/variables.d.ts)
- [Content Types](./definition/types/content.d.ts)
- [Metadata Types](./definition/types/metadata.d.ts)

## Contributing

We welcome contributions to the Agreements Protocol! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get involved.

## License

TBD
