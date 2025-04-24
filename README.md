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
- 🚧 **[IP-003](https://github.com/ConsenSysMesh/agreements-protocol/pull/16)**: Proofs and Execution Flow specifications
- ✅ **[IP-004](./improvement-proposals/IP-004.md)**: Standardized Metadata, Flat Variables, Schemas, and Content Types
- ✅ **[IP-006](./improvement-proposals/IP-006.md)**: Execution Definition Improvements

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

**Example Usage:**

```json
{
  "variables": [
    {
      "id": "partyB",
      "type": "string",
      "name": "Party B",
      "description": "Name of the party receiving consulting services",
      "initiallyRequired": true,
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

Note the use of `initiallyRequired` flag that indicates the variable is required for the very first instantiation of the agreement document.

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

[View full DFSM schema →](./schemas/execution-dfsm.schema.json)

#### States

States represent the possible lifecycle stages of an agreement:

**Example Usage:**

```json
{
  "states": [
    "PENDING_SIGNATURE": {
      "name": "Pending Consultant Signature",
      "description": "Awaiting consultant (Jane Doe) to sign and set initial terms",
      "isInitial": true
    },
    "SIGNED": {
      "name": "Received Signature",
      "description": "Received consultant (Jane Doe) signature to indicate terms were accepted",
    }
  ]
}
```

#### Inputs

Inputs represent verifiable data used to trigger state transitions:

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
  - [View full schema →](./schemas/verified-credential-eip712.schema.json)
- **EVM Transaction Receipts** (🚧 as part of [IP-003](https://github.com/ConsenSysMesh/agreements-data standard/pull/7)):

  - Transaction hash verification
  - Event log verification
  - Smart contract state verification
- **Zero-Knowledge Proofs** (🚧):

  - Planned support for zk-SNARKs and zk-STARKs
  - Privacy-preserving verification

#### Transitions

Transitions define how an agreement moves between states:

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
          "input": "partyBSignature"
        }
      ]
    }
  ]
}
```

The execution model ensures that agreements follow a predictable lifecycle based on verifiable proofs, making them suitable for legal and blockchain-based applications where cryptographic certainty is required.

#### Example Usage

Here's a complete execution flow example for our consulting agreement:

```json
{
  "execution": {
    "states": {
      "PENDING_CONSULTANT_SIGNATURE": {
        "name": "Pending Consultant Signature",
        "description": "Awaiting consultant (Jane Doe) to sign and set initial terms",
        "isInitial": true
      },
      "PENDING_CLIENT_SIGNATURE": {
        "name": "Pending Client Signature",
        "description": "Awaiting client signature and USDC payment confirmation"
      },
      "PENDING_ACCEPTANCE": {
        "name": "Pending Final Acceptance",
        "description": "Awaiting consultant's final acceptance of client details and payment"
      },
      "ACCEPTED": {
        "name": "Agreement Active",
        "description": "Consulting agreement is active and services can begin"
      },
      "REJECTED": {
        "name": "Agreement Rejected",
        "description": "Agreement was rejected by the consultant"
      }
    },
    "inputs": {
      "consultantSignature": {
        "type": "VerifiedCredentialEIP712",
        "schema": "verified-credential-eip712.schema.json",
        "displayName": "Consultant Signature",
        "description": "EIP712 signature from consultant confirming service terms",
        "data": {
          "consultantName": "Jane Doe",
          "consultantAddress": "0x123...abcd",
          "serviceDescription": "One hour of startup business advice"
        },
        "issuer": "0x123...abcd"
      },
      "clientSignature": {
        "type": "VerifiedCredentialEIP712",
        "schema": "verified-credential-eip712.schema.json",
        "displayName": "Client Signature",
        "description": "EIP712 signature from client accepting terms",
        "data": {
          "clientName": "${variables.partyB}",
          "clientAddress": "${variables.partyBAddress}",
          "paymentAmount": "${variables.amount}"
        },
        "issuer": "${variables.partyBAddress}"
      },
      "paymentConfirmation": {
        "type": "EVMTransactionReceipt",
        "schema": "evm-transaction-receipt.schema.json",
        "displayName": "USDC Payment",
        "description": "Confirmation of USDC transfer to consultant",
        "data": {
          "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          "amount": "${variables.amount}",
          "recipient": "0x123...abcd"
        }
      },
      "consultantAcceptance": {
        "type": "VerifiedCredentialEIP712",
        "schema": "verified-credential-eip712.schema.json",
        "displayName": "Consultant Acceptance",
        "description": "Final acceptance of client details and payment",
        "data": {
          "accepted": true
        },
        "issuer": "0x123...abcd"
      }
    },
    "transitions": [
      {
        "from": "PENDING_CONSULTANT_SIGNATURE",
        "to": "PENDING_CLIENT_SIGNATURE",
        "conditions": [
          {
            "type": "isValid",
            "input": "consultantSignature"
          }
        ]
      },
      {
        "from": "PENDING_CLIENT_SIGNATURE",
        "to": "PENDING_ACCEPTANCE",
        "conditions": [
          {
            "type": "isValid",
            "input": "clientSignature"
          },
          {
            "type": "isValid",
            "input": "paymentConfirmation"
          }
        ]
      },
      {
        "from": "PENDING_ACCEPTANCE",
        "to": "ACCEPTED",
        "conditions": [
          {
            "type": "isValid",
            "input": "consultantAcceptance"
          }
        ]
      }
    ]
  }
}
```

This example demonstrates:

1. **Clear State Flow**

   - Starts with consultant signature
   - Proceeds to client signature and payment
   - Ends with consultant's final acceptance
2. **Multiple Input Types**

   - EIP-712 signatures for agreement terms
   - EVM transaction receipt for USDC payment
   - Variable interpolation for dynamic values
3. **Conditional Transitions**

   - Single-input conditions for signatures
   - Multi-input condition for client stage (signature + payment)
   - Final acceptance to activate the agreement

### 5. Template

The complete template structure combines all components into a single JSON document:

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
    "states": {
      "PENDING_CONSULTANT_SIGNATURE": {
        "name": "Pending Consultant Signature",
        "description": "Awaiting consultant (Jane Doe) to sign and set initial terms",
        "isInitial": true
      },
      "PENDING_CLIENT_SIGNATURE": {
        "name": "Pending Client Signature",
        "description": "Awaiting client signature and USDC payment confirmation"
      },
      "PENDING_ACCEPTANCE": {
        "name": "Pending Final Acceptance",
        "description": "Awaiting consultant's final acceptance of client details and payment"
      },
      "ACCEPTED": {
        "name": "Agreement Active",
        "description": "Consulting agreement is active and services can begin"
      },
      "REJECTED": {
        "name": "Agreement Rejected",
        "description": "Agreement was rejected by the consultant"
      }
    },
    "inputs": {
      "consultantSignature": {
        "type": "VerifiedCredentialEIP712",
        "schema": "verified-credential-eip712.schema.json",
        "displayName": "Consultant Signature",
        "description": "EIP712 signature from consultant confirming service terms",
        "data": {
          "consultantName": "Jane Doe",
          "consultantAddress": "0x123...abcd",
          "serviceDescription": "One hour of startup business advice"
        },
        "issuer": "0x123...abcd"
      },
      "clientSignature": {
        "type": "VerifiedCredentialEIP712",
        "schema": "verified-credential-eip712.schema.json",
        "displayName": "Client Signature",
        "description": "EIP712 signature from client accepting terms",
        "data": {
          "clientName": "${variables.partyB}",
          "clientAddress": "${variables.partyBAddress}",
          "paymentAmount": "${variables.amount}"
        },
        "issuer": "${variables.partyBAddress}"
      },
      "paymentConfirmation": {
        "type": "EVMTransactionReceipt",
        "schema": "evm-transaction-receipt.schema.json",
        "displayName": "USDC Payment",
        "description": "Confirmation of USDC transfer to consultant",
        "data": {
          "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          "amount": "${variables.amount}",
          "recipient": "0x123...abcd"
        }
      },
      "consultantAcceptance": {
        "type": "VerifiedCredentialEIP712",
        "schema": "verified-credential-eip712.schema.json",
        "displayName": "Consultant Acceptance",
        "description": "Final acceptance of client details and payment",
        "data": {
          "accepted": true
        },
        "issuer": "0x123...abcd"
      }
    },
    "transitions": [
      {
        "from": "PENDING_CONSULTANT_SIGNATURE",
        "to": "PENDING_CLIENT_SIGNATURE",
        "conditions": [
          {
            "type": "isValid",
            "input": "consultantSignature"
          }
        ]
      },
      {
        "from": "PENDING_CLIENT_SIGNATURE",
        "to": "PENDING_ACCEPTANCE",
        "conditions": [
          {
            "type": "isValid",
            "input": "clientSignature"
          },
          {
            "type": "isValid",
            "input": "paymentConfirmation"
          }
        ]
      },
      {
        "from": "PENDING_ACCEPTANCE",
        "to": "ACCEPTED",
        "conditions": [
          {
            "type": "isValid",
            "input": "consultantAcceptance"
          }
        ]
      }
    ]
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

#### Creating Custom Templates

Creating agreement templates is simple with AI assistance. Here's how to get started:

1. **Prepare Your Agreement**
   Start with your agreement in markdown format.
2. **Provide Context**
   Share these files with your AI assistant:

   - [README](./README.md) - Data Standard overview and examples
   - [Template Schema](./schemas/template.schema.json) - JSON schema definition
   - [MDAST Schema](./schemas/mdast.schema.json) - Content structure specification
   - [Grant Agreement](./templates/grant-agreement.json) - Reference implementation
3. **Generate Template**
   Use this prompt format:

   ```
   Help me create an agreement template following the Agreements Data Standard standard.

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
