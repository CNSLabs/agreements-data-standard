$\color{red}{\Huge{\textsf{This is a WIP. TODO: Separate into V1 based on an a DFSM and V2 based on an ASM}}}$

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

----

# Grant Agreement Template Variables and State Machine

## Variable Types

The grant agreement template uses several variable types to manage different aspects of the grant process:

### Basic Types
- `date`: Timestamps for events (e.g., `effectiveDate`, `lastUpdated`)
- `integer`: Whole numbers for counting (e.g., `monthlyReviewCount`, `numberOfMonths`)
- `uint256`: Blockchain-compatible unsigned integers (e.g., `grantAmount`)

### Signature Type
- `eip712Signature`: Ethereum-standard structured signatures that include:
  - Signer address
  - Signature parameters (name, version, chainId, contract)
  - Message payload

## Variable Categories

Variables are organized into categories:
- `global`: General purpose variables used across the agreement
- `blockchain`: Variables specifically related to on-chain operations

## State Machine Integration

### Variable Usage in State Transitions

Variables are used in the state machine through:

1. **Condition Checks**
   - `variablesSet`: Verifies required variables are populated
   - `signatureValid`: Validates EIP712 signatures
   - `comparison`: Compares variable values using operators like:
     - equals
     - lessThan
     - greaterThan

2. **Variable Updates**
   - `setVariable`: Directly sets a variable value
   - `incrementVariable`: Increases a counter variable

### Example Flow

```mermaid
graph LR
DRAFT-->|Required variables set|AWAITING_SIGNATURES
AWAITING_SIGNATURES-->|Signatures valid|ACTIVE
ACTIVE-->|Monthly review|MONTHLY_REVIEW
MONTHLY_REVIEW-->|Review count < total|MONTHLY_REVIEW
MONTHLY_REVIEW-->|Review count = total|APPROVED
APPROVED-->|Transfer executed|FULFILLED
ACTIVE-->|Rejection signature|REJECTED
MONTHLY_REVIEW-->|30 days passed|FAILED_CONTRACT_CONDITION
```

### Variable References

Variables can be referenced in conditions using the `${variableName}` syntax. Complex expressions are also supported:
- Time-based: `${lastUpdated + 30 days}`
- Comparisons: `${monthlyReviewCount} < ${numberOfMonths}`

### State Machine Actions

When transitions occur, the state machine can:
1. Update variable values
2. Record timestamps
3. Increment counters
4. Trigger blockchain transactions

## Template Interpolation

Variables are interpolated throughout the template using the `${variableName}` syntax in:
- Prose sections
- Blockchain transaction parameters
- Identity fields
- Signature message payloads
