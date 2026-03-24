# Agreements Protocol Contributing Guide

## IP PR Guidelines

An IP (Improvement Proposal) is a proposed change to the protocol.

IP statuses:

- `IDEA` - budding concept
- `DRAFT` - proposal under active development
- `PROPOSED` - proposal ready for review
- `ACCEPTED` - proposal accepted and merged

## Canonical Repo Layout

When contributing to the current draft model, prefer these directories:

- `schemas/core/`
- `schemas/profiles/`
- `schemas/compositions/`
- `templates/core/`
- `templates/profiles/`
- `templates/compositions/`

Root-level `schemas/*.json` and `templates/*.json` files are retained as legacy reference material and should not be treated as the canonical target for new work unless the change is explicitly about legacy compatibility.

## IP State Expectations

### `IDEA`

- Open a PR updating [README.md](./README.md) to add the proposed topic to the active IP list or roadmap discussion

### `IDEA -> DRAFT`

- Add a new markdown file under [improvement-proposals](./improvement-proposals)

### `DRAFT -> PROPOSED`

The PR should include:

- the IP markdown file
- the relevant canonical schemas under [schemas](./schemas)
- the relevant canonical examples under [templates](./templates)
- README updates if the public repo shape or entry points changed

### `PROPOSED -> ACCEPTED`

- protocol team review and acceptance

## Practical Guidance

- If your change affects the core document model, update `schemas/core/`
- If your change affects one concern only, update the relevant profile under `schemas/profiles/`
- If your change combines concerns, prefer an explicit composition schema under `schemas/compositions/`
- Add or update example documents under the matching `templates/` directory

## Legacy Note

If you need to touch the legacy root-level schemas or templates, call that out explicitly in the PR description so reviewers know the change is intentional.
