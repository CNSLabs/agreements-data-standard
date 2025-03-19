# Idea

Implement the executionFlow FSM component on-chain using EAS.

There are several options we could consider:

## Option 1: Pure EAS Module Approach
Description:
* Implement the FSM entirely as an EAS resolver module
* State transitions are triggered by new attestations
* Use EAS's built-in attestation validation
Pros:
* Native integration with EAS ecosystem
* Built-in revocation handling
* Simplified attestation verification
* Reusable across different agreement types
Cons:
* Limited flexibility for custom verification logic
* More complex to handle EVM transaction proofs
* State management more difficult within EAS constraints

## Option 2: Hybrid Contract with EAS Integration
* Description:
* Standalone FSM contract that consumes EAS attestations
* Uses EAS for input verification but maintains own state
* Custom verification logic for non-EAS proofs (like EVM txs)
Pros:
* More flexible state management
* Can handle both EAS and non-EAS verifiable inputs
* Clearer separation of concerns
* Easier to upgrade verification logic
Cons:
* More complex implementation
* Need to maintain separate state storage
* Higher gas costs for state transitions

## Option 3: FSM Contract with Pluggable Verifiers
Description:
* Generic FSM contract with modular verifier interfaces
* EAS verifier module for attestations
* Separate verifier modules for other proof types
* Registry of approved verifiers
Pros:
* Most flexible architecture
* Clean separation of verification logic
* Easily extensible for new proof types
* Can upgrade verifiers independently
Cons:
* Most complex implementation
* Higher initial development cost
* More contracts to maintain
* More complex security considerations
## Option 4: EAS-Centric with External Oracle
Description:
* Use EAS for state attestations
* External oracle (like Chainlink) for complex verifications
* Bridge contract to coordinate between systems
Pros:
* Leverages existing infrastructure
* Reduced on-chain computation
* Can handle complex off-chain verifications
Cons:
* Dependency on external oracle
* Higher operational costs
* More points of potential failure
* Added complexity in trust model
## Option 5: Minimal Proxy Pattern with EAS
Description:
* Template FSM contract implementation
* Clone for each agreement instance
* EAS attestations as input validation
Pros:
* Gas efficient deployment
* Isolated state per agreement
* Simpler implementation
* Clear ownership model
Cons:
* More contracts to track
* Higher deployment costs (even with minimal proxy)
* Potential limitations in upgradeability

# Recommendation
Based on the grant agreement's requirements and the need for flexibility, Option 3: FSM Contract with Pluggable Verifiers is best for the following reasons:
1. Modularity: Separate verifiers for:
* EAS attestations (signatures, approvals)
* EVM transaction proofs (grant payments)
* Future proof types
2. Flexibility: Can easily add new verification methods without changing core FSM logic
3. Security: Clear boundaries between state management and verification logic
4. Upgradeability: Can upgrade individual components without affecting the whole system