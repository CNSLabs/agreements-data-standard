# Schemas

Canonical schemas are organized into three layers:

- `core/` for the base agreement document model
- `profiles/` for orthogonal concerns such as `evm`, `vc`, and `eip712`
- `compositions/` for explicit combinations of profiles

These canonical schema directories are also npm workspace packages:

- `core/` -> `@cns/agreements-core`
- `profiles/evm/` -> `@cns/agreements-profile-evm`
- `profiles/vc/` -> `@cns/agreements-profile-vc`
- `profiles/eip712/` -> `@cns/agreements-profile-eip712`
- `compositions/evm-eip712/` -> `@cns/agreements-composition-evm-eip712`
- `compositions/vc-eip712/` -> `@cns/agreements-composition-vc-eip712`
- `compositions/evm-vc-eip712/` -> `@cns/agreements-composition-evm-vc-eip712`

Use these as the authoritative schema entry points for new work:

- [core/agreement.schema.json](./core/agreement.schema.json)
- [profiles/evm/agreement.schema.json](./profiles/evm/agreement.schema.json)
- [profiles/vc/agreement-envelope.schema.json](./profiles/vc/agreement-envelope.schema.json)
- [profiles/eip712/agreement.schema.json](./profiles/eip712/agreement.schema.json)
- [compositions/evm-eip712/agreement.schema.json](./compositions/evm-eip712/agreement.schema.json)
- [compositions/vc-eip712/agreement-envelope.schema.json](./compositions/vc-eip712/agreement-envelope.schema.json)
- [compositions/evm-vc-eip712/agreement-envelope.schema.json](./compositions/evm-vc-eip712/agreement-envelope.schema.json)

Legacy pre-IP-005 schema files are still present at the root of this directory:

- `template.schema.json`
- `execution-dfsm.schema.json`
- `mdast.schema.json`
- `verified-credential-eip712.schema.json`

Those files are retained for reference and legacy compatibility only.
