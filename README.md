# Agreements Protocol

[![JSON Schema](https://img.shields.io/badge/schema-JSON-blue)](./schemas/core/agreement.schema.json)

The Agreements Protocol is a JSON-based standard for authoring, validating, and executing structured agreements.

The current repo is organized around a chain-neutral core plus composable profiles:

- `core` for the base agreement document model
- `evm` for EVM runtime and value semantics
- `vc` for Verifiable Credential envelope semantics
- `eip712` for typed-data proof semantics
- `compositions/*` for explicit combinations of those concerns

## Current Status

- 🚧 **[IP-001](./improvement-proposals/IP-001.md)**: DFSM to ASM
- ✅ **[IP-002](./improvement-proposals/IP-002.md)**: MDAST Content Representation
- 🚧 **[IP-003](https://github.com/CNSLabs/agreements-standard/pull/16)**: Proofs and Execution Flow specifications
- ✅ **[IP-004](./improvement-proposals/IP-004.md)**: Standardized Metadata, Flat Variables, Schemas, and Content Types
- 🚧 **[IP-005](./improvement-proposals/IP-005.md)**: Core JSON standard plus composable profiles

## Canonical Model

### 1. Core Agreement Document

The canonical agreement document is defined by:

- [Core agreement schema](./schemas/core/agreement.schema.json)
- [Core metadata schema](./schemas/core/metadata.schema.json)
- [Core variables schema](./schemas/core/variables.schema.json)
- [Core content schema](./schemas/core/content.schema.json)
- [Core MDAST schema](./schemas/core/mdast.schema.json)
- [Core DFSM schema](./schemas/core/execution/dfsm.schema.json)
- [Core execution input schema](./schemas/core/execution/input.schema.json)

Core documents define:

- `standard`
- `metadata`
- `variables`
- `content`
- optional `execution`

Draft shape:

```json
{
  "standard": {
    "id": "agreements",
    "coreVersion": "1.1.0-draft",
    "profiles": []
  },
  "metadata": {},
  "variables": [],
  "content": {}
}
```

### 2. Profiles

Profiles refine the core without changing the encoding. A profile is declared in `standard.profiles`.

#### `evm`

The `evm` profile owns EVM-specific runtime and value semantics:

- `semanticType: "evm/address"`
- EVM transaction receipt constraints
- chain-bound runtime semantics

Canonical files:

- [EVM agreement schema](./schemas/profiles/evm/agreement.schema.json)
- [EVM address semantic schema](./schemas/profiles/evm/variables/evm-address.semantic.schema.json)
- [EVM transaction receipt input schema](./schemas/profiles/evm/execution/input-transaction-receipt.schema.json)

#### `vc`

The `vc` profile owns Verifiable Credential envelope structure:

- VC `@context`, `type`, `issuer`, `credentialSubject`, and `proof`
- agreement-wrapping rules
- generic VC-oriented proof carriage

Canonical files:

- [VC agreement envelope schema](./schemas/profiles/vc/agreement-envelope.schema.json)
- [VC execution input schema](./schemas/profiles/vc/execution/input-verifiable-credential.schema.json)

#### `eip712`

The `eip712` profile owns typed-data proof semantics:

- domain structure
- type definitions
- primary type
- proof encoding

Canonical files:

- [EIP-712 agreement schema](./schemas/profiles/eip712/agreement.schema.json)
- [EIP-712 typed-data input schema](./schemas/profiles/eip712/execution/input-typed-data-signature.schema.json)
- [EIP-712 proof schema](./schemas/profiles/eip712/proofs/typed-data-proof.schema.json)

### 3. Explicit Compositions

Combinations of concerns are modeled explicitly under `schemas/compositions/`.

Canonical composition schemas in this repo:

- [EVM + EIP-712 agreement schema](./schemas/compositions/evm-eip712/agreement.schema.json)
- [EVM + EIP-712 input schema](./schemas/compositions/evm-eip712/execution/input-eip712-attestation.schema.json)
- [VC + EIP-712 envelope schema](./schemas/compositions/vc-eip712/agreement-envelope.schema.json)
- [EVM + VC + EIP-712 envelope schema](./schemas/compositions/evm-vc-eip712/agreement-envelope.schema.json)

This means:

- a VC envelope signed using EIP-712 is modeled as `vc + eip712`
- an EVM agreement executed via EIP-712 signatures is modeled as `evm + eip712`
- a wrapped EVM agreement with an EIP-712 VC proof is modeled as `evm + vc + eip712`

## Core Concepts

### Metadata

Metadata identifies and versions the agreement payload.

```json
{
  "metadata": {
    "id": "did:example:consulting-core-1",
    "templateId": "did:template:consulting-core-v1",
    "version": "1.0.0",
    "createdAt": "2024-03-20T12:00:00Z",
    "name": "Consulting Agreement",
    "author": "Example Author",
    "description": "Simple consulting agreement"
  }
}
```

### Variables

Core variables use primitive types and optional profile semantics.

```json
{
  "id": "grantRecipientAddress",
  "type": "string",
  "semanticType": "evm/address",
  "name": "Grant Recipient Address",
  "description": "Address of the grant recipient",
  "validation": {
    "required": true,
    "pattern": "^0x[a-fA-F0-9]{40}$"
  }
}
```

### Content

Content remains JSON-based and supports:

- `md`
- `mdast`

The canonical custom content node is `variable`. The core model does not define an `address` node.

Markdown example:

```md
:variable{id='clientName'}
:variable{id='grantRecipientAddress'}
```

### Execution

The core execution model is format-agnostic. Inputs describe:

- `format`
- `schemaRef`
- `displayName`
- `description`
- `constraints`

Example:

```json
{
  "id": "grantRecipientAcceptance",
  "format": "eip712/typed-data-signature",
  "schemaRef": "schemas/profiles/eip712/execution/input-typed-data-signature.schema.json",
  "displayName": "Grant Recipient Signature",
  "description": "Grant recipient acceptance attestation",
  "constraints": {
    "signer": "${grantRecipientAddress}",
    "payload": {
      "hasAcceptedTerms": true
    }
  }
}
```

## Example Documents

### Core

- [Consulting agreement (core)](./templates/core/consulting-agreement.core.json)

### Profiles

- [Grant agreement (evm)](./templates/profiles/evm/grant-agreement.evm.json)
- [Grant agreement (evm, mdast)](./templates/profiles/evm/grant-agreement.evm.mdast.json)
- [Consulting agreement envelope (vc)](./templates/profiles/vc/consulting-agreement.vc.json)

### Compositions

- [Grant agreement with EVM + EIP-712 execution](./templates/compositions/evm-eip712/grant-agreement.eip712.json)
- [Consulting agreement with VC + EIP-712 envelope](./templates/compositions/vc-eip712/consulting-agreement.vc-eip712.json)
- [Grant agreement with EVM + VC + EIP-712 envelope](./templates/compositions/evm-vc-eip712/grant-agreement.vc-eip712.json)

## Repo Layout

```text
schemas/
  core/
  profiles/
    evm/
    vc/
    eip712/
  compositions/
    evm-eip712/
    vc-eip712/
    evm-vc-eip712/

templates/
  core/
  profiles/
    evm/
    vc/
  compositions/
    evm-eip712/
    vc-eip712/
    evm-vc-eip712/

improvement-proposals/
```

More detail:

- [Schemas directory guide](./schemas/README.md)
- [Templates directory guide](./templates/README.md)

## Legacy Files

The following root-level files are retained as pre-IP-005 reference material while the composable profile model is still in draft:

- `schemas/template.schema.json`
- `schemas/execution-dfsm.schema.json`
- `schemas/mdast.schema.json`
- `schemas/verified-credential-eip712.schema.json`
- `templates/grant-agreement.json`
- `templates/grant-agreement.md.json`
- `templates/grant-agreement.md.dfsm.json`
- `templates/grant-agreement-vc-wrapped.json`
- `templates/grant-agreement.md`
- `templates/grant-agreement.md.dfsm.json.md`

They are not the canonical schema entry points for new work. New work should target the canonical files under `schemas/core`, `schemas/profiles`, `schemas/compositions`, and the corresponding `templates/` subdirectories.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
