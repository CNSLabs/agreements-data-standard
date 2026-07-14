# Canonical package v0 verification

The reference package is verified by two implementations:

- the TypeScript strict compiler in `agreements-protocol-evm`; and
- the dependency-free Python verifier in this repository.

Run the independent verifier from the repository root:

```sh
python3 tools/verify-canonical-package.py
```

It must reproduce the source SHA-256, canonical UTF-8 length, and legacy
Keccak-256 package digest in `reference-package.expected.json`. It also proves
that changes to prose, execution policy, initialization values, or target chain
produce different digests. The verifier deliberately contains its own
Keccak-f[1600] implementation and does not import the TypeScript compiler or an
Ethereum hashing library.

The current proof vector uses only integer JSON numbers. The verifier rejects
floats rather than approximating ECMAScript number serialization; executable
amounts that could exceed the safe-integer range remain decimal strings in the
package format.
