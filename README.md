# Agreements Data Standard

[![JSON Schema](https://img.shields.io/badge/schema-JSON-blue)](./schemas/template.schema.json)

The Agreements Data Standard is a JSON-based standard for creating and executing legally binding web3/blockchain agreements. Think of it as "DocuSign for web3" - providing a standardized way to create, validate, and execute digital agreements with blockchain-based proofs and state transitions.

## Data Standard Overview

The data standard consists of five core components:

1. **[Metadata](#1-metadata)** - Agreement identification and context
2. **[Variables](#2-variables)** - Typed inputs that drive the agreement
3. **[Content](#3-content)** - Legal prose with variable interpolation
4. **[Execution Flow](#4-execution-flow)** - State machine for agreement progression, driven via verifiable inputs (transaction receipts, ZK proofs, VCs)
5. **[Template](#5-template)** - Complete template structure
6. **[Verifiable Credential Wrapper](#6-verifiable-credential-wrapper)** - Wrapping agreements in W3C Verifiable Credentials

[View Full Schema Definition →](./schemas/template.schema.json)

### Current Status

- 🚧 **[IP-001](./improvement-proposals/IP-001.md)**: DFSM to ASM
- ✅ **[IP-002](./improvement-proposals/IP-002.md)**: MDAST Content Representation
- 🚧 **[IP-003](https://github.com/ConsenSysMesh/agreements-data-standard/pull/16)**: Proofs and Execution Flow specifications
- ✅ **[IP-004](./improvement-proposals/IP-004.md)**: Standardized Metadata, Flat Variables, Schemas, and Content Types

#### Planned

- VC Schema Standards
- DID Method Extensions

## Core Components

To illustrate how the Agreements Data Standard works, let's start with a simple example of a written agreement:

```md
# Agreement

I, Jane Doe, agree to provide [PartyB] with one hour of startup business advice.

In exchange, [PartyB] agrees to transfer [Amount] USDC to my Ethereum address: 0x123...abcd on the Ethereum mainnet.

**Signature:** Jane Doe
**Ethereum Address:** 0x123...abcd

**Signature:** [PartyB]
**Ethereum Address:** [PartyBAddress]
```

This simple consulting agreement contains all the key elements we need to demonstrate how the data standard works. In the following sections, we'll break down how each component of this agreement maps to our data standard schema:

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

Variables define typed inputs that can be referenced throughout the agreement. The data standard supports both array-based and object-based variable formats:

#### Array-Based Variables (Original Format)

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

#### Object-Based Variables (New Format)

The newest version of the data standard supports an object-based variables structure for more intuitive access:

```json
{
  "variables": {
    "partyAEthAddress": {
      "type": "address",
      "name": "Party A Ethereum Address",
      "description": "Ethereum address of the first party",
      "initiallyRequired": true,
      "validation": {
        "required": true,
        "pattern": "^0x5B38Da6a701c568545dCfcB03FcB875f56beddC4$"
      }
    },
    "partyBName": {
      "type": "string",
      "name": "Party B Name",
      "description": "Legal name of the second party",
      "validation": {
        "required": true,
        "minLength": 1
      }
    }
  }
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

Models the expected execution of the agreement. The data standard now supports two main formats for state machine definitions:

#### Array-Based State Machine (Original Format)

**Schema Definition:**
```json
{
  "execution": {
    "type": "dfsm",
    "data": {
      "states": [
        "AWAITING_SIGNATURES",
        "ACTIVE_PENDING_REVIEW",
        "APPROVED",
        "REJECTED"
      ],
      "inputs": {
        "grantRecipientSignature": {
          "id": "grantRecipientSignature",
          "type": "VerifiedCredentialEIP712",
          "schema": "verified-credential-eip712.schema.json",
          "displayName": "Grant Recipient Signature",
          "description": "EIP712 signature from the grant recipient",
          "value": {
            "isGrantRecipientApproved": true
          },
          "signer": "${grantRecipientAddress}"
        }
      },
      "transitions": [
        {
          "from": "AWAITING_SIGNATURES",
          "to": "ACTIVE_PENDING_REVIEW",
          "conditions": [
            {
              "type": "isValid",
              "inputs": ["grantRecipientSignature"]
            }
          ]
        }
      ]
    }
  }
}
```

#### Object-Based State Machine (New Format)

The newest version of the data standard supports an object-based state machine for more descriptive states:

```json
{
  "execution": {
    "states": {
      "PENDING_PARTY_A_SIGNATURE": {
        "name": "Pending Signature From A",
        "description": "This state awaits until Party A supplies Party B's address along with their own name.",
        "isInitial": true
      },
      "PENDING_PARTY_B_SIGNATURE": {
        "name": "Pending Signature From B",
        "description": "This state awaits until Party B confirms their identity by supplying their name."
      },
      "ACCEPTED": {
        "name": "Agreement Accepted",
        "description": "The agreement has been accepted by both parties and is now in force."
      }
    },
    "inputs": {
      "partyAData": {
        "type": "VerifiedCredentialEIP712",
        "schema": "verified-credential-eip712.schema.json",
        "displayName": "Party A Signature",
        "description": "EIP712 signature from Party A proposing the MOU terms",
        "data": {
          "partyAName": "${variables.partyAName}",
          "partyBEthAddress": "${variables.partyBEthAddress}"
        },
        "issuer": "${variables.partyAEthAddress.value}"
      }
    },
    "transitions": [
      {
        "from": "PENDING_PARTY_A_SIGNATURE",
        "to": "PENDING_PARTY_B_SIGNATURE",
        "conditions": [
          {
            "type": "isValid",
            "input": "partyAData"
          }
        ]
      }
    ]
  }
}
```

#### States

In the new format, states are objects that can include:
- `name`: Human-readable name for the state
- `description`: Detailed description of the state
- `isInitial`: Boolean flag indicating if this is the starting state

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

Inputs represent verifiable data used to trigger state transitions:

- **Verifiable Credentials with EIP-712 Signatures**:
  - W3C Verifiable Credentials with Ethereum's typed structured data signing (EIP-712)
  - Includes standard VC properties like issuer, issuanceDate, and credentialSubject
  - EIP-712 proof with domain, types, and signature
  - [View full schema →](./schemas/verified-credential-eip712.schema.json)

- **EVM Transaction Receipts** (🚧 as part of [IP-003](https://github.com/ConsenSysMesh/agreements-data-standard/pull/7)):
  - Transaction hash verification
  - Event log verification
  - Smart contract state verification

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

In the newer format, conditions have been simplified to reference single inputs:

```json
{
  "conditions": [
    {
      "type": "isValid",
      "input": "partyAData"  // Note: uses "input" instead of "inputs" array
    }
  ]
}
```

The execution model ensures that agreements follow a predictable lifecycle based on verifiable proofs, making them suitable for legal and blockchain-based applications where cryptographic certainty is required.

### 5. Template

The complete template structure combines all components into a single JSON document. The newest version wraps the components inside an `agreement` object with an optional `params` section for initial values:

**Schema Definition for Original Format:**

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

**New Format with Agreement Wrapper:**

```json
{
  "agreement": {
    "metadata": {
      // metadata properties
    },
    "variables": {
      // object-based variables
    },
    "content": {
      // content definition
    },
    "execution": {
      // object-based state machine
    }
  },
  "params": {
    // initial values for variables
    "partyAEthAddress": "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
  }
}
```

The new format provides a clearer separation between the agreement definition and the parameters used to initialize it.

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
See [verified-credential-eip712.schema.json](./schemas/verified-credential-eip712.schema.json) for the wrapper format.

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

#### Memorandum of Understanding (MOU)

A non-binding agreement between two parties that outlines their intention to work together:

- Party details and contact information
- Purpose and scope of collaboration
- Roles and responsibilities
- Term and termination conditions
- Confidentiality provisions

The MOU template uses the newest format with:
- Object-based variables
- Descriptive state machine with named states
- Multi-step approval process
- Initial parameters

Example:
- [Simple MOU](./templates/simple-grant/simple.grant.json) - Complete MOU with execution flow

#### Creating Custom Templates

Creating agreement templates is simple with AI assistance. Here's how to get started:

1. **Prepare Your Agreement**
   Start with your agreement in markdown format.

2. **Provide Context**
   Share these files with your AI assistant:
   - [README](./README.md) - Data standard overview and examples
   - [Template Schema](./schemas/template.schema.json) - JSON schema definition
   - [MDAST Schema](./schemas/mdast.schema.json) - Content structure specification
   - [Grant Agreement](./templates/grant-agreement.json) - Reference implementation

3. **Generate Template**
   Use this prompt format:
   ```
   Help me create an agreement template following the Agreements Data Standard.

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

We welcome contributions to the Agreements Data Standard! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get involved.

## License

TBD
