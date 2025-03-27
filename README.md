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
6. **[Template](#6-template)** - Complete template structure

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
    "templateId": "did:template:consulting-v1",
    "version": "1.0.0",
    "createdAt": "2024-03-20T12:00:00Z",
    "name": "Consulting Agreement Template",
    "author": "Jane Doe",
    "description": "Standard template for one-hour consulting services with USDC payment"
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
      "id": "partyB",
      "type": "string",
      "name": "Party B",
      "description": "Name of the party receiving consulting services",
      "validation": {
        "required": true,
        "minLength": 1
      }
    },
    {
      "id": "amount",
      "type": "number",
      "name": "USDC Amount",
      "description": "Amount of USDC to be paid for services",
      "validation": {
        "required": true,
        "min": 1
      }
    },
    {
      "id": "partyBAddress",
      "type": "address",
      "name": "Party B Ethereum Address",
      "description": "Ethereum address of Party B",
      "validation": {
        "required": true,
        "pattern": "^0x[a-fA-F0-9]{40}$"
      }
    },
    {
      "id": "signedDate",
      "type": "dateTime",
      "name": "Signing Date",
      "description": "Date when the agreement was signed",
      "validation": {
        "required": true
      }
    }
  ]
}
```

#### Variable Usage

Variables can be referenced in three different formats:

1. **MDAST Format**
```json
{
  "type": "variable",
  "id": "partyB"
}
```

To reference specific properties:
```json
{
  "type": "variable",
  "id": "partyB",
  "property": "name"
}
```

2. **Markdown Format**
```md
:variable{id='partyB'}
:variable{id='partyB' property='name'}
:variable{id='partyB' property='description'}
```

3. **JSON Template Format**
```json
{
  "client": "${partyB}",
  "clientName": "${partyB.name}",
  "paymentAmount": "${amount}"
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

**Markdown Example:**
```json
{
  "content": {
    "type": "md",
    "data": "# Agreement\n\nI, Jane Doe, agree to provide :variable{id='partyB'} with one hour of startup business advice.\n\nIn exchange, :variable{id='partyB'} agrees to transfer :variable{id='amount'} USDC to my Ethereum address: 0x123...abcd on the Ethereum mainnet.\n\n**Signed:** Jane Doe\n**Ethereum Address:** 0x123...abcd\n\n**Signed:** :variable{id='partyB'}\n**Ethereum Address:** :variable{id='partyBAddress'}\n\n**Date:** :variable{id='signedDate'}"
  }
}
```

**MDAST Example:**
```json
{
  "content": {
    "type": "mdast",
    "data": {
      "type": "root",
      "children": [
        {
          "type": "heading",
          "depth": 1,
          "children": [
            {
              "type": "text",
              "value": "Agreement"
            }
          ]
        },
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "value": "I, Jane Doe, agree to provide "
            },
            {
              "type": "variable",
              "id": "partyB"
            },
            {
              "type": "text",
              "value": " with one hour of startup business advice."
            }
          ]
        },
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "value": "In exchange, "
            },
            {
              "type": "variable",
              "id": "partyB"
            },
            {
              "type": "text",
              "value": " agrees to transfer "
            },
            {
              "type": "variable",
              "id": "amount"
            },
            {
              "type": "text",
              "value": " USDC to my Ethereum address: 0x123...abcd on the Ethereum mainnet."
            }
          ]
        },
        {
          "type": "paragraph",
          "children": [
            {
              "type": "strong",
              "children": [
                {
                  "type": "text",
                  "value": "Signed:"
                }
              ]
            },
            {
              "type": "text",
              "value": " Jane Doe\n"
            },
            {
              "type": "strong",
              "children": [
                {
                  "type": "text",
                  "value": "Ethereum Address:"
                }
              ]
            },
            {
              "type": "text",
              "value": " 0x123...abcd"
            }
          ]
        },
        {
          "type": "paragraph",
          "children": [
            {
              "type": "strong",
              "children": [
                {
                  "type": "text",
                  "value": "Signed:"
                }
              ]
            },
            {
              "type": "text",
              "value": " "
            },
            {
              "type": "variable",
              "id": "partyB"
            },
            {
              "type": "text",
              "value": "\n"
            },
            {
              "type": "strong",
              "children": [
                {
                  "type": "text",
                  "value": "Ethereum Address:"
                }
              ]
            },
            {
              "type": "text",
              "value": " "
            },
            {
              "type": "variable",
              "id": "partyBAddress"
            }
          ]
        },
        {
          "type": "paragraph",
          "children": [
            {
              "type": "strong",
              "children": [
                {
                  "type": "text",
                  "value": "Date:"
                }
              ]
            },
            {
              "type": "text",
              "value": " "
            },
            {
              "type": "variable",
              "id": "signedDate"
            }
          ]
        }
      ]
    }
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

### 6. Template

The complete template structure combines all components into a single JSON document:

**Schema Definition:**
```json
{
  "type": "object",
  "required": ["metadata", "variables", "content"],
  "properties": {
    "metadata": {
      "type": "object",
      "required": ["id", "templateId", "version", "createdAt", "name", "author", "description"]
    },
    "variables": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "type", "name", "description"]
      }
    },
    "content": {
      "type": "object",
      "required": ["type", "data"],
      "properties": {
        "type": {
          "type": "string",
          "enum": ["mdast", "md"]
        }
      }
    }
  }
}
```

**Example Template:**
```json
{
  "metadata": {
    "id": "did:example:123",
    "templateId": "did:template:consulting-v1",
    "version": "1.0.0",
    "createdAt": "2024-03-20T12:00:00Z",
    "name": "Consulting Agreement Template",
    "author": "Jane Doe",
    "description": "Standard template for one-hour consulting services with USDC payment"
  },
  "variables": [
    {
      "id": "partyB",
      "type": "string",
      "name": "Party B",
      "description": "Name of the party receiving consulting services",
      "validation": {
        "required": true,
        "minLength": 1
      }
    },
    {
      "id": "amount",
      "type": "number",
      "name": "USDC Amount",
      "description": "Amount of USDC to be paid for services",
      "validation": {
        "required": true,
        "min": 1
      }
    },
    {
      "id": "partyBAddress",
      "type": "address",
      "name": "Party B Ethereum Address",
      "description": "Ethereum address of Party B",
      "validation": {
        "required": true,
        "pattern": "^0x[a-fA-F0-9]{40}$"
      }
    },
    {
      "id": "signedDate",
      "type": "dateTime",
      "name": "Signing Date",
      "description": "Date when the agreement was signed",
      "validation": {
        "required": true
      }
    }
  ],
  "content": {
    "type": "md",
    "data": "# Agreement\n\nI, Jane Doe, agree to provide :variable{id='partyB'} with one hour of startup business advice.\n\nIn exchange, :variable{id='partyB'} agrees to transfer :variable{id='amount'} USDC to my Ethereum address: 0x123...abcd on the Ethereum mainnet.\n\n**Signed:** Jane Doe\n**Ethereum Address:** 0x123...abcd\n\n**Signed:** :variable{id='partyB'}\n**Ethereum Address:** :variable{id='partyBAddress'}\n\n**Date:** :variable{id='signedDate'}"
  }
}
```

**Example Rendered Agreement:**
```md
# Agreement

I, Jane Doe, agree to provide Acme Corp with one hour of startup business advice.

In exchange, Acme Corp agrees to transfer 500 USDC to my Ethereum address: 0x123...abcd on the Ethereum mainnet.

**Signed:** Jane Doe
**Ethereum Address:** 0x123...abcd

**Signed:** Acme Corp
**Ethereum Address:** 0x456...def0

**Date:** March 20, 2024
```

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

Creating agreement templates is simple with AI assistance. Here's how to get started:

1. **Prepare Your Agreement**
   Start with your agreement in markdown format:
```md
# Agreement

I, Jane Doe, agree to provide [PartyB] with one hour of startup business advice.

In exchange, [PartyB] agrees to transfer [Amount] USDC to my Ethereum address: 0x123...abcd on the Ethereum mainnet.

**Signed:** Jane Doe  
**Ethereum Address:** 0x123...abcd

**Signed:** [PartyB]  
**Ethereum Address:** [PartyBAddress]

**Date:** [SignedDate]
```

2. **Provide Context**
   Share these files with your AI assistant:
   - [README](./README.md) - Protocol overview and examples
   - [Template Schema](./definition/schemas/template.schema.json) - JSON schema definition
   - [MDAST Schema](./definition/schemas/mdast.schema.json) - Content structure specification
   - [Grant Agreement](./definition/templates/grant-agreement.json) - Reference implementation

3. **Generate Template**
   Use this prompt format:
   ```
   Help me create an agreement template following the Agreements Protocol standard.

   Agreement Type: Consulting Agreement
   Purpose: One-hour consulting session with USDC payment
   Variables: 
   - Party B name and address
   - Payment amount
   - Signing date
   Format: MDAST (preferred for structured content)

   Here's my agreement:
   <paste your markdown agreement>
   ```

The AI will help you:
- Identify and type your variables (string, number, address, dateTime)
- Convert brackets to variable directives
- Structure the complete template with metadata and MDAST content
- Validate against the schema

See [Grant Agreement](./definition/templates/grant-agreement.json) for a complete example of a properly structured template using MDAST.

### 2. Validate Your Templates

Use our JSON schemas to validate your agreement templates:

- [Template Schema](./definition/schemas/template.schema.json)
- [MDAST Schema](./definition/schemas/mdast.schema.json)

## Contributing

We welcome contributions to the Agreements Protocol! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get involved.

## License

TBD
