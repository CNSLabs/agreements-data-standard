# Grant Agreement Protocol

## Introduction

This document describes the structure and functionality of the Grant Agreement Protocol, a JSON-based format for creating and executing legally binding grant agreements. Version 1 implements a deterministic finite state machine approach to describing an agreement via a JSON standard (that ends up wrapped as a VC) and passed to an execution engine which will then receive verifiable inputs to drive the state transitions. Future versions could involve upgrading to an Abstract State Machine (ASM) for Turing-complete expression language and dynamic state generation.

[Current Protocol Definition](PROTOCOL.md) or dive into the documentation details below.

[Current Sample Template](./definition/templates/grant-agreement.json) or dive into the documentation details below.

## Future Developments:
* [IP-001.MD](./definition/improvement-proposals/IP-001.md) - Upgrade from a DFSM to an Abstract State Machine (ASM), for a Turing-complete expression language and dynamic state generation.
* [IP-002.MD](./definition/improvement-proposals/IP-002.md) - Upgrade prose section to use MDAST (Markdown Abstract Syntax Tree)

## Contributing

We welcome contributions to the Grant Agreement Protocol! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get involved.

## License

TBD
