# Standards Repo Role

This repository is the standards and semantics home for the agreements system.

It should own:

- core agreement semantics
- schema shape and validation rules
- normalization and canonicalization rules
- profile declaration
- cross-engine profiles such as VC and attestation-oriented representations

It should not become the place where engine-specific implementation details or private migration process notes accumulate.

Related repo boundaries:

- `agreements-standard` defines the shared meaning of agreements
- `agreements-evm-protocol` implements the EVM profile, compiler, contracts, and EVM SDK
- `cns-service` integrates those packages into running applications and services

The private operational coordination for the current multi-repo boundary and branch/versioning migration lives in `cns-service`, because that is the main internal working repo. This repo should stay focused on the public standard and its engine-agnostic definitions.
