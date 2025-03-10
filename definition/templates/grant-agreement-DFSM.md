```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> IDENTITY_VERIFICATION: Variables Set
    IDENTITY_VERIFICATION --> AWAITING_SIGNATURES
    AWAITING_SIGNATURES --> ACTIVE: Completion Signature Valid
    ACTIVE --> PENDING_REVIEW
    PENDING_REVIEW --> APPROVED: Completion Signature Valid
    PENDING_REVIEW --> REJECTED: Rejection Signature Valid
    APPROVED --> PAYMENT_PENDING: Automatic
    PAYMENT_PENDING --> COMPLETED: Grant Transaction Proof Valid
    COMPLETED --> [*]
    REJECTED --> [*]

    note right of DRAFT: Required variables:\neffectiveDate, grantAmount,\ntermEndDate, grantContract
    note right of AWAITING_SIGNATURES: Requires valid signature\nfrom token allocator
    note right of PENDING_REVIEW: Review can result in\napproval or rejection
    note right of PAYMENT_PENDING: Requires blockchain proof\nof token transfer
```