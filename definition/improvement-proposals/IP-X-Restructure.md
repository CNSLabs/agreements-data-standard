IP-X (IDEATION): Restructure

## Executive Summary

AI: generate after parsing rest of document

## Overview

### Problem Statement

* Not consumable by npm

### Proposed Solution

* Create a monorepo to house the protocols definitions

## Restructure FS:

```
./agreements-protocol
  - /ips/ (Improviement proposal documents)
  - /packages/ (utilities and sdks)
    - /schemas/ (JSON schmea definitions)
    - /templates/ (JSON template definitions)
    - /types/ (TS schema types)
  - CONTRUBUTING.md
  - README.md (should merge PROTOCOL.md and README.md)
```

## Publish NPM Libraries
```bash
npm install @agreement-protocol/templates
npm install @agreement-protocol/types
npm install @agreement-protocol/schemas
```
