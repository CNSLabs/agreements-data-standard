# Grant Agreement Protocol Documentation (v1)

## Introduction

This document describes the structure and functionality of the Grant Agreement Protocol (v1), a JSON-based format for creating and executing legally binding grant agreements. Version 1 implements a deterministic finite state machine approach to agreement execution, providing a structured, predictable workflow for grant funding processes.

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
- **status**: Current state in the agreement lifecycle

## Variables Section

The variables section defines all data elements used throughout the agreement, including blockchain networks and smart contract interactions. Variables are strongly typed and serve different roles in the agreement lifecycle.

### Variable Types

| Type | Description | Example Use |
|------|-------------|-------------|
| `date` | Calendar date values | Effective dates, term end dates |
| `identity` | Entity identification | Foundation, grant recipient |
| `zkproof` | Zero-knowledge proof | Proof of ownership, proof of humanity |
| `uint256` | 256-bit unsigned integer | Grant amounts |
| `eip712Signature` | Ethereum typed data signature | Agreement approval signatures |
| `evm` | Ethereum Virtual Machine contract | Grant transfer contract |
| `transactionProof` | Blockchain transaction evidence | Proof of fund transfer |
