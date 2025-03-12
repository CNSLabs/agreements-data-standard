# Grant Agreement Protocol

## Introduction

This document describes the structure and functionality of the Grant Agreement Protocol, a JSON-based format for creating and executing legally binding grant agreements. Version 1 implements a deterministic finite state machine approach to describing an agreement via a JSON standard (that ends up wrapped as a VC) and passed to an execution engine which will then receive verifiable inputs to drive the state transitions. Future versions could involve upgrading to an Abstract State Machine (ASM) for Turing-complete expression language and dynamic state generation.

[Current Protocol Definition](PROTOCOL.md)

[Current Sample Template](./definition/templates/grant-agreement.json)

## Contributing

We welcome contributions to the Grant Agreement Protocol! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get involved.

## Approved IPs:
* [IP-002.md](./definition/improvement-proposals/IP-002.md) - Upgrade prose section to use MDAST (Markdown Abstract Syntax Tree)

## Proposed IPs:
* None yet

## Draft IPs:
* [IP-001.md](./definition/improvement-proposals/IP-001.md) - Upgrade from a DFSM to an Abstract State Machine (ASM), for a Turing-complete expression language and dynamic state generation.

## Idea IPs:
* Global Variable Definitions - standardizing definition of agreement variables and simplifying as well
* Formal Definitions of Proofs - agreeing on how we allow verifiable proofs to be provided to the FSM (712 signatures, tx receipts, zk proofs) 
* VC Schemas - defining the VC schemas the protocol uses: agreement template, agreement instante, agreement signature
* DID Standard Expandion - further leaning into the usage of DIDs instead of assuming ethr method

Once approached, get a schema definition for Bryan so he can hit up the LLMs

## License

TBD

https://github.com/ConsenSysMesh/agreements-protocol/blob/master/definition/improvement-proposals/IP-001.MD
https://github.com/ConsenSysMesh/agreements-protocol/blob/master/definition/improvement-proposals/IP-001.md
