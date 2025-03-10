The next section of this document just describes some of the interesting differences between the V1 and V2 proposed versions.

# V1 Example: DFSM-Based Grant Legal Agreement

Deterministic Finite State Machine (DFSM)

Transitions occur only based on provable inputs (e.g., Verifiable Credentials (VCs) and Zero-Knowledge (ZK) proofs).
No memory (beyond the current state), counters, or stack.

```mermaid
stateDiagram-v2
    [*] --> ProposalSubmitted
    ProposalSubmitted --> ReviewInProgress : VC Proposal Proof
    ReviewInProgress --> Approved : VC Approval Proof
    ReviewInProgress --> Rejected : VC Rejection Proof
    Approved --> FundsDisbursed : VC Disbursement Proof
    FundsDisbursed --> Completed : VC Completion Proof
    Rejected --> [*]
    Completed --> [*]
```

Each transition is strictly triggered by a Verifiable Credential (VC) or ZK Proof.
No variables, counters, or complex computation—only state-to-state transitions.

# V2 Example: ASM-Based Grant Legal Agreement
```mermaid
stateDiagram-v2
    [*] --> ProposalSubmitted
    ProposalSubmitted --> ReviewInProgress : VC Proposal Proof / Push(ProposalID)
    ReviewInProgress --> Approved : VC Approval Proof / Inc(Counter)
    ReviewInProgress --> Rejected : VC Rejection Proof / Pop()
    Approved --> FundsDisbursed : VC Disbursement Proof / Inc(Counter)
    FundsDisbursed --> Completed : VC Completion Proof / Assert(Counter > 1)
    Rejected --> [*]
    Completed --> [*]
```

Uses a stack to track Proposal IDs.
Uses a counter to keep track of state transitions (e.g., tracking multiple approvals or fund disbursements).
Assertions (e.g., checking Counter > 1) ensure that certain conditions hold before a transition.
Still event-driven and reliant on provable inputs (VCs, ZK proofs).


| Feature                              | DFSM | ASM |
|--------------------------------------|------|-----|
| **State Transitions**                | ✅   | ✅  |
| **Provable Inputs Only (VC/ZK Proofs)** | ✅ | ✅ |
| **Memory (Counters, Stack)**         | ❌   | ✅  |
| **Computation Between Transitions**  | ❌   | ✅  |
| **Complex Logic (Assertions, Conditions)** | ❌ | ✅ |

----

Sample Grant Agreeement using DFSM (see https://github.com/ConsenSysMesh/agreements-protocol/blob/master/src/templates/grant-agreement-DFSM.json as input)

```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> IDENTITY_VERIFICATION: effectiveDate && grantAmount && termEndDate set
    IDENTITY_VERIFICATION --> AWAITING_SIGNATURES: proofOfOwnership valid && proofOfHumanity valid
    AWAITING_SIGNATURES --> ACTIVE: completionSignature valid
    ACTIVE --> PENDING_REVIEW: currentTimestamp >= termEndDate
    PENDING_REVIEW --> APPROVED: completionSignature valid
    PENDING_REVIEW --> REJECTED: rejectionSignature valid
    APPROVED --> PAYMENT_PENDING: automatic
    PAYMENT_PENDING --> COMPLETED: grantTransactionProof valid
    COMPLETED --> [*]
```

