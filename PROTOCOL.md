*** NOTE: THIS IS OUT OF DATE, AND WILL BE UPDATED AS PART OF FOLLOWING THE IP PROCESS ***

This document is heavily in flux for now. Here are some relevant Figma links:
* [Initial evolution from POC to Protocol](https://www.figma.com/board/AnLztpPdXshLLxjXZlU6jP/Ideas-Around-Agreements-Protocol?node-id=0-1&p=f&t=xJ2cVaLBufDJKImJ-0)
* [Incremental design on protcol](https://www.figma.com/board/IKvVxlr20bd9qRKSxll4ss/Agreements-Protocol?node-id=335-3026&t=iJA8Q3WHIL7NdISn-0)

# Grant Agreement Protocol (Current version: V0.1)

## Introduction

This document describes the structure and functionality of the Grant Agreement Protocol, a JSON-based format for creating and executing legally binding grant agreements. Version 1 implements a deterministic finite state machine approach to describing an agreement via a JSON standard (that ends up wrapped as a VC) and passed to an execution engine which will then receive verifiable inputs to drive the state transitions.

View a [Sample JSON of this standard](https://github.com/ConsenSysMesh/agreements-protocol/blob/master/src/templates/grant-agreement-DFSM.json) or dive into the documentation details below.

## Document Structure

The protocol consists of four main sections:

1. **Metadata** - Document identification and status information
2. **Variables** - Typed data elements that drive the agreement, including blockchain integrations
3. **Prose** - The human-readable legal text of the agreement
4. **Execution Flow** - State machine definition controlling agreement progression

## Metadata Section

The metadata section contains critical identity and status information:
- **id**: Decentralized identifier (DID) for the specific agreement instance
- **templateId**: Template reference using DID syntax
- **version**: Semantic versioning of the document format
- **jurisdiction**: Legal jurisdiction governing the agreement
- **createdAt**: ISO-8601 timestamp for document creation

## Variables Section

The variables section defines all data elements used throughout the agreement, including blockchain networks and smart contract interactions. Variables are strongly typed and serve different roles in the agreement lifecycle.

### Variable Types

| Type | Description | Example Use |
|------|-------------|-------------|
| `date` | Calendar date values | Effective dates, term end dates |
| `identity` | DID-based entity identification | Foundation, grant recipient |
| `zkproof` | Zero-knowledge proof | Proof of ownership, proof of humanity |
| `uint256` | 256-bit unsigned integer | Grant amounts |
| `eip712Signature` | Ethereum typed data signature | Agreement approval signatures |
| `evm` | Ethereum Virtual Machine contract | Grant transfer contract |
| `transactionProof` | Blockchain transaction evidence | Proof of fund transfer |

### Variable Categories

Variables are organized into functional categories:
- **agreementVariable**: Basic agreement parameters
- **verifiableInput**: Cryptographic proofs and verifications
- **identities**: DID-based parties to the agreement
- **blockchain**: On-chain assets and interactions

### Variable Properties

Each variable contains properties controlling its behavior:
- **value**: Current data value
- **displayName/description**: Human-readable metadata

### Example Variable: Zero-Knowledge Proof

```json
"proofOfOwnership": {
    "id": "proofOfOwnership",
    "type": "zkproof",
    "displayName": "Proof of Ownership",
    "description": "Zero-knowledge proof verifying the foundation's ownership of grant tokens",
    "category": "verifiableInput",
    "props": {
        "proofSystem": "groth16",
        "value": null,
        "publicInputs": {
            "identityCommitment": "${foundation.id}"
        }
    }
}
```

### Blockchain Integration Variables

The protocol includes variables that define blockchain networks and smart contracts for integration with on-chain operations:

#### Contract Definition Variables

```json
"grantContract": {
    "id": "grantContract",
    "type": "evm",
    "props": {
        "address": "0x86f2F989D8ba54785427EE3d18D4D849362C7448",
        "chainId": 11155111,
        "name": "Sepolia",
        "symbol": "NST",
        "abi": {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "to",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    }
}
```

#### Transaction Proof Variables

```json
"grantTransactionProof": {
    "id": "grantTransactionProof",
    "type": "transactionProof",
    "displayName": "Grant Transaction Proof",
    "description": "Proof of successful token transfer to grant recipient",
    "category": "verifiableInput",
    "props": {
        "contractId": "${grantContract.id}",
        "method": "transfer",
        "params": {
            "to": "${grantRecipient.props.blockchainAddress}",
            "amount": "${grantAmount}"
        },
        "txHash": "${transactionHash}",
        "blockNumber": "${blockNumber}",
        "blockHash": "${blockHash}",
        "merkleProof": "${merkleProof}",
        "signature": "${senderSignature}",
        "status": "${transactionStatus}",
        "chainId": "${chainId}"
    }
}
```

## Prose Section

The prose section defines the human-readable legal text of the agreement using a structured content model:

```json
"prose": {
    "sections": [
        {
            "id": "heading",
            "type": "heading",
            "level": 1,
            "content": [...]
        },
        {
            "id": "introduction",
            "type": "paragraph",
            "content": [...]
        }
    ]
}
```

Content is organized into sections with different types (heading, paragraph) and each section contains content elements with text and styling information. The content can reference variables using `${variableName}` syntax for dynamic content insertion.

## Execution Flow (Finite State Machine)

**Version 1 implements a deterministic finite state machine** to control agreement progression. This approach provides a precise, predictable execution path with defined states and transitions.

```json
"executionFlow": {
    "states": [
        "DRAFT",
        "IDENTITY_VERIFICATION",
        "AWAITING_SIGNATURES",
        "ACTIVE",
        "PENDING_REVIEW",
        "APPROVED",
        "REJECTED",
        "PAYMENT_PENDING",
        "COMPLETED"
    ],
    "transitions": [
        {
            "from": "DRAFT",
            "to": "IDENTITY_VERIFICATION",
            "conditions": [
                {
                    "type": "variablesSet",
                    "variables": [
                        "effectiveDate",
                        "grantAmount",
                        "termEndDate"
                    ]
                }
            ]
        },
        // Additional transitions...
    ]
}
```

Key aspects of the execution flow:
1. **States**: Enumerated list of possible agreement states
2. **Transitions**: Rules for moving between states
3. **Conditions**: Logic determining when transitions can occur, including:
   - Variable validation
   - Cryptographic proof verification
   - Signature validation
   - Temporal conditions
   - Logical operations (AND, OR)

The finite state machine approach means:
- All possible states are known in advance
- Transitions follow predetermined paths
- Conditions are evaluated using a fixed set of operations
- Agreement execution is fully deterministic

## Future Developments:
[IP-001.MD](./Improvement-proposals/IP-001.MD) - Upgrade from a DFSM to an Abstract State Machine (ASM), for a Turing-complete expression language and dynamic state generation.
