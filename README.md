# Agreements Protocol

[![JSON Schema](https://img.shields.io/badge/schema-JSON-blue)](./schemas/template.schema.json)

The Agreements Protocol is a JSON-based standard for creating and executing legally binding web3/blockchain agreements. Think of it as "DocuSign for web3" - providing a standardized way to create, validate, and execute digital agreements with blockchain-based proofs and state transitions.

## Protocol Overview

The protocol consists of five core components:

1. **[Metadata](#1-metadata)** - Agreement identification and context
2. **[Variables](#2-variables)** - Typed inputs that drive the agreement
3. **[Content](#3-content)** - Legal prose with variable interpolation
4. **[Execution Flow](#4-execution-flow)** - State machine for agreement progression, driven via verifiable inputs (transaction receipts, ZK proofs, VCs)
5. **[Template](#5-template)** - Complete template structure
6. **[Verifiable Credential Wrapper](#6-verifiable-credential-wrapper)** - Wrapping agreements in W3C Verifiable Credentials

[View Full Schema Definition →](./schemas/template.schema.json)

### Current Status

- ✅ **[IP-002](./improvement-proposals/IP-002.md)**: MDAST Content Representation
- ✅ **[IP-003](./improvement-proposals/IP-003.md)**: Proofs and Execution Flow specifications
- ✅ **[IP-004](./improvement-proposals/IP-004.md)**: Standardized Metadata, Flat Variables, Schemas, and Content Types

#### Future Plans

- 🚧 **[IP-001](./improvement-proposals/IP-001.md)**: DFSM to ASM
- DID Method Extensions

## Core Components

To illustrate how the Agreements Protocol works, let's start with a simple example of a written agreement:

```md
# Agreement

I, Jane Doe, agree to provide [PartyB] with one hour of startup business advice.

In exchange, [PartyB] agrees to transfer [Amount] USDC to my Ethereum address: 0x123...abcd on the Ethereum mainnet.

**Signature:** Jane Doe
**Ethereum Address:** 0x123...abcd

**Signature:** [PartyB]
**Ethereum Address:** [PartyBAddress]
```

This simple consulting agreement contains all the key elements we need to demonstrate how the protocol works. In the following sections, we'll break down how each component of this agreement maps to our protocol schema:

1. **Metadata** - How we identify and version this agreement
2. **Variables** - The dynamic inputs (`[PartyB]`, `[Amount]`, `[PartyBAddress]`)
3. **Content** - The agreement text with variable interpolation
4. **Execution Flow** - The signing and verification process

Let's examine each component in detail:

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

[View full schema →](./schemas/template.schema.json#metadata)

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

[View full schema →](./schemas/template.schema.json#variables)

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
    "data": "# Agreement\n\nI, Jane Doe, agree to provide :variable{id='partyB'} with one hour of startup business advice.\n\nIn exchange, :variable{id='partyB'} agrees to transfer :variable{id='amount'} USDC to my Ethereum address: 0x123...abcd on the Ethereum mainnet.\n\n**Signature:** Jane Doe\n**Ethereum Address:** 0x123...abcd\n\n**Signature:** :variable{id='partyB'}\n**Ethereum Address:** :variable{id='partyBAddress'}"
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
                  "value": "Signature:"
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
                  "value": "Signature:"
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
  - [IP-002](./improvement-proposals/IP-002.md) - Our MDAST implementation details
- **Markdown (MD)**

  - Human-readable authoring format
  - [CommonMark Spec](https://commonmark.org/) - Our supported Markdown syntax
  - [GitHub Markdown Guide](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
  - Supports [remark-directive](https://github.com/remarkjs/remark-directive) syntax for variables

### 4. Execution Flow

Models the expected execution of the agreement. Various models could be used in the future, but for now a DFSM (Deterministic Finite State Machine) is considered, with future upgrades to an [ASM possible](./improvement-proposals/IP-001.md). The key characteristic of the DFSM model is that the state machine is expected to be driven by verifiable (provable) inputs provided.

**Schema Definition:**

```json
{
  "execution": {
    "type": "object",
    "description": "Execution model definition for agreement processing",
    "required": ["type", "data"],
    "properties": {
      "type": {
        "type": "string",
        "description": "The type of execution model being used",
        "enum": ["dfsm"]
      },
      "data": {
        "type": "object",
        "description": "The execution model data specific to the type",
        "oneOf": [
          {
            "if": {
              "properties": { "type": { "const": "dfsm" } },
              "required": ["type"]
            },
            "then": {
              "$ref": "execution-dfsm.schema.json"
            }
          }
        ]
      }
    }
  }
}
```

[View full DFSM schema →](./schemas/execution-dfsm.schema.json)

#### States

States represent the possible lifecycle stages of an agreement:

**Schema Definition:**

```json
{
  "states": {
    "type": "array",
    "description": "List of possible states for the agreement",
    "items": {
      "type": "string"
    }
  }
}
```

**Example Usage:**

```json
{
  "states": [
    "PENDING_SIGNATURE",
    "SIGNED",
    "APPROVED_PAYMENT_PENDING",
    "COMPLETED"
  ]
}
```

#### Inputs

Inputs represent verifiable data used to trigger state transitions:

**Schema Definition:**

```json
{
  "inputs": {
    "type": "object",
    "description": "Input definitions that can be used in transitions",
    "additionalProperties": {
      "type": "object",
      "required": ["id", "type", "displayName", "description"],
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the input"
        },
        "type": {
          "type": "string",
          "description": "Type of the input (e.g., VerifiedCredentialEIP712)"
        },
        "schema": {
          "type": "string",
          "enum": ["verified-credential-eip712.schema.json"],
          "description": "JSON schema reference for the input type"
        },
        "displayName": {
          "type": "string",
          "description": "Human-readable name for the input"
        },
        "description": {
          "type": "string",
          "description": "Description of the input's purpose"
        },
        "value": {
          "type": "object",
          "description": "Required field values for the credentialSubject"
        },
        "signer": {
          "type": "string",
          "description": "Party that should sign this input"
        }
      }
    }
  }
}
```

**Example Usage:**

```json
{
  "inputs": {
    "partyBSignature": {
      "id": "partyBSignature",
      "type": "VerifiedCredentialEIP712",
      "schema": "verified-credential-eip712.schema.json",
      "displayName": "Party B Signature",
      "description": "EIP712 signature from Party B accepting the agreement terms",
      "value": {
        "hasAcceptedTerms": true
      },
      "signer": "${partyBAddress}"
    }
  }
}
```

Inputs represent verifiable data used to trigger state transitions:

- **Verifiable Credentials with EIP-712 Signatures**:

  - W3C Verifiable Credentials with Ethereum's typed structured data signing (EIP-712)
  - Includes standard VC properties like issuer, issuanceDate, and credentialSubject
  - EIP-712 proof with domain, types, and signature
  - [View full schema →](./templates/grant-agreeement-tx-proof.json)
- **EVM Transaction Receipts**:

  - Transaction hash verification
  - Event log verification
  - Smart contract state verification
  - [View full schema →](./schemas/provable-inputs/transaction-proof.schema.json)
- **Zero-Knowledge Proofs** (🚧):

  - Planned support for zk-SNARKs and zk-STARKs
  - Privacy-preserving verification

#### Transitions

Transitions define how an agreement moves between states:

**Schema Definition:**

```json
{
  "transitions": {
    "type": "array",
    "description": "State transitions with conditions",
    "items": {
      "type": "object",
      "required": ["from", "to", "conditions"],
      "properties": {
        "from": {
          "type": "string",
          "description": "Starting state of the transition"
        },
        "to": {
          "type": "string",
          "description": "Ending state of the transition"
        },
        "conditions": {
          "type": "array",
          "description": "Conditions that must be met for the transition to occur",
          "items": {
            "type": "object",
            "required": ["type"],
            "properties": {
              "type": {
                "type": "string",
                "enum": ["isValid"],
                "description": "Type of condition"
              },
              "inputs": {
                "type": "array",
                "description": "Input identifiers to evaluate",
                "items": {
                  "type": "string"
                }
              }
            }
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
  "transitions": [
    {
      "from": "PENDING_SIGNATURE",
      "to": "SIGNED",
      "conditions": [
        {
          "type": "isValid",
          "inputs": ["partyBSignature"]
        }
      ]
    }
  ]
}
```

The execution model ensures that agreements follow a predictable lifecycle based on verifiable proofs, making them suitable for legal and blockchain-based applications where cryptographic certainty is required.

### 5. Template

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
    },
    "execution": {
      "type": "object",
      "required": ["type", "data"],
      "properties": {
        "type": {
          "type": "string",
          "enum": ["dfsm"]
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
    }
  ],
  "content": {
    "type": "md",
    "data": "# Agreement\n\nI, Jane Doe, agree to provide :variable{id='partyB'} with one hour of startup business advice.\n\nIn exchange, :variable{id='partyB'} agrees to transfer :variable{id='amount'} USDC to my Ethereum address: 0x123...abcd on the Ethereum mainnet.\n\n**Signature:** Jane Doe\n**Ethereum Address:** 0x123...abcd\n\n**Signature:** :variable{id='partyB'}\n**Ethereum Address:** :variable{id='partyBAddress'}"
  },
  "execution": {
    "type": "dfsm",
    "data": {
      "states": [
        "PENDING_SIGNATURE",
        "SIGNED",
        "APPROVED_PAYMENT_PENDING",
        "COMPLETED"
      ],
      "inputs": {
        "partyBSignature": {
          "id": "partyBSignature",
          "type": "VerifiedCredentialEIP712",
          "schema": "verified-credential-eip712.schema.json",
          "displayName": "Party B Signature",
          "description": "EIP712 signature from Party B accepting the agreement terms",
          "value": {
            "hasAcceptedTerms": true
          },
          "signer": "${partyBAddress}"
        },
        "paymentProof": {
          "id": "paymentProof",
          "type": "TransactionProof",
          "schema": "transaction-proof.schema.json",
          "displayName": "Payment Transaction Proof",
          "description": "Proof of USDC transfer to Jane Doe's address",
          "value": {
            "txHash": "",
            "chainId": 1,
            "transactionType": "contractCall",
            "contractCall": {
              "contractAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC contract
              "method": "transfer",
              "params": {
                "to": "${partyBAddress}", // Jane Doe's address
                "amount": "${amount}"
              }
            }
          }
        }
      },
      "transitions": [
        {
          "from": "PENDING_SIGNATURE",
          "to": "SIGNED",
          "conditions": [
            {
              "type": "isValid",
              "inputs": ["partyBSignature"]
            }
          ]
        },
        {
          "from": "SIGNED",
          "to": "APPROVED_PAYMENT_PENDING",
          "conditions": [
            {
              "type": "isValid",
              "inputs": ["partyBSignature"]
            }
          ]
        },
        {
          "from": "APPROVED_PAYMENT_PENDING",
          "to": "COMPLETED",
          "conditions": [
            {
              "type": "isValid",
              "inputs": ["paymentProof"]
            }
          ]
        }
      ]
    }
  }
}
```

### 6. Verifiable Credential Wrapper

The entire agreement can be wrapped in a W3C Verifiable Credential to provide cryptographic proof of its authenticity and integrity. This wrapper adds several important properties:

1. **Non-tamperability**: The entire agreement is cryptographically signed using EIP-712
2. **Non-repudiation**: The issuer's signature proves they created and approved the agreement
3. **Expiration**: The credential can have an expiration date
4. **Context**: The credential provides rich metadata about the agreement's context

**Example Usage:**

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld"
  ],
  "id": "did:example:agreement-vc-1",
  "type": ["VerifiableCredential", "AgreementCredential"],
  "issuer": {
    "id": "did:example:issuer-1",
    "name": "Agreement Issuer"
  },
  "issuanceDate": "2024-03-20T12:00:00Z",
  "expirationDate": "2025-03-20T12:00:00Z",
  "credentialSubject": {
    "id": "did:example:subject-1",
    "agreement": {
      // ... full agreement content ...
    }
  },
  "proof": {
    "type": "EthereumEip712Signature2021",
    "created": "2024-03-20T12:00:00Z",
    "proofPurpose": "contractAgreement",
    "verificationMethod": "did:example:issuer-1#key-1",
    "eip712": {
      // ... EIP-712 domain and type definitions ...
    },
    "proofValue": "0x..."
  }
}
```

See [grant-agreement-vc-wrapped.json](./templates/grant-agreement-vc-wrapped.json) for a complete example of a wrapped agreement.
See [verified-credential-eip712.schema.json](./schemas/provable-inputs/verified-credential-eip712.schema.json) for the wrapper format.

## Getting Started

### 1. Templates

The following agreement templates are available as reference implementations:

#### Grant Agreement

A standardized agreement for ecosystem development funding that includes:

- Foundation and grant recipient details
- Token allocation specifications
- RFP reference and grant activities
- Token distribution terms

Example content formats:

- [MDAST version](./templates/grant-agreement.json) - Structured format with rich semantic information
- [Markdown version](./templates/grant-agreement.md.json) - Human-readable format with variable interpolation

Full examples including execution environment definition:

- [Markdown content + DFSM execution](./templates/grant-agreement.md.dfsm.json) ([State Machine Visualization](./templates/grant-agreement.md.dfsm.json.md))

#### Transaction Proof Templates

Transaction proof templates demonstrate how to verify blockchain transactions in agreements:

- [Grant Agreement with Transaction Proof](./templates/provable-inputs/grant-agreeement-tx-proof.json) - Example of verifying token transfers
- Includes complete transaction data, receipts, and merkle proofs
- Supports contract calls and event log verification
- Demonstrates integration with DFSM execution model

#### Creating Custom Templates

Creating agreement templates is simple with AI assistance. Here's how to get started:

1. **Prepare Your Agreement**
   Start with your agreement in markdown format.
2. **Provide Context**
   Share these files with your AI assistant:

   - [README](./README.md) - Protocol overview and examples
   - [Template Schema](./schemas/template.schema.json) - JSON schema definition
   - [MDAST Schema](./schemas/mdast.schema.json) - Content structure specification
   - [Grant Agreement](./templates/grant-agreement.json) - Reference implementation
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

### 2. Validate Your Templates

Use our JSON schemas to validate your agreement templates:

- [Template Schema](./schemas/template.schema.json)
- [MDAST Schema](./schemas/mdast.schema.json)

## Contributing

We welcome contributions to the Agreements Protocol! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get involved.

## License

TBD
