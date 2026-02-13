IP-X (IDEATION): Custom Types

## Executive Summary

AI: generate once finishing rest of document

## Overview

### Problem Statement

Lack of UI representation of web3 specific types such as address, transaction, etc...

### Proposed Solution

Adding ability to include custom types in the content sections.

## Custom Types

* TS Interface
  * Address: 

```tsx
  interface Address {
    type: "address";
    value: string;
    display?: "truncated" | "full" | "ens";
  }
```

### MDAST Interface

```json
  {
    "type": "address",
    "value": "0x123f6e75d1BE0ee699C7Eb67594FEbC14ab3AA78",
    "display": "ens"
  },
```

* MD interface api

```md
:address{value='0x123f6e75d1BE0ee699C7Eb67594FEbC14ab3AA78', display='ens'}
```

TODO: think through the other custom content types
