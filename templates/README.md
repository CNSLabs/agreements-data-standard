# Templates

Canonical example documents are organized into:

- `core/` for core-only agreements
- `profiles/` for single-profile examples
- `compositions/` for multi-profile examples

The canonical examples are also exposed as the `@cns-labs/agreements-fixtures` workspace package, with [fixtures.manifest.json](./fixtures.manifest.json) as the package root export.

Current canonical examples:

- [core/consulting-agreement.core.json](./core/consulting-agreement.core.json)
- [profiles/evm/grant-agreement.evm.json](./profiles/evm/grant-agreement.evm.json)
- [profiles/evm/grant-agreement.evm.mdast.json](./profiles/evm/grant-agreement.evm.mdast.json)
- [profiles/vc/consulting-agreement.vc.json](./profiles/vc/consulting-agreement.vc.json)
- [compositions/evm-eip712/grant-agreement.eip712.json](./compositions/evm-eip712/grant-agreement.eip712.json)
- [compositions/vc-eip712/consulting-agreement.vc-eip712.json](./compositions/vc-eip712/consulting-agreement.vc-eip712.json)
- [compositions/evm-vc-eip712/grant-agreement.vc-eip712.json](./compositions/evm-vc-eip712/grant-agreement.vc-eip712.json)

Legacy pre-IP-005 examples are still present at the root of this directory:

- `grant-agreement.json`
- `grant-agreement.md.json`
- `grant-agreement.md.dfsm.json`
- `grant-agreement-vc-wrapped.json`
- `grant-agreement.md`
- `grant-agreement.md.dfsm.json.md`

Those files are retained for reference and legacy compatibility only.
