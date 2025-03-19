## Risc0 Execution Implementation

# IDEA
Implement a generic zk circuit using [Risc0]((https://risczero.com)) for state machine verifiable input processing.
Host will need to provide any network call access and thus a trusted environment for the machine will be required. EVM tx inputs can be verified using [Risc0's Steel solution](https://risczero.com/steel).

## Key Benefits
1. Trustless Verification: All state transitions are proven via RISC Zero's zkVM
2. EVM Integration: Using Steel for direct verification of on-chain state and transactions
3. Flexible Input Types: Handles both EIP-712 signatures and transaction proofs
4. Gas Efficiency: Complex verification logic runs off-chain, only proof verification happens on-chain
5. Generic Design: Can be adapted for different agreement types by modifying the state machine configuration
6. This implementation allows for trustless verification of complex agreement workflows while keeping gas costs minimal by leveraging RISC Zero's zkVM for off-chain computation with on-chain verification.

# Implementation Hypothesis

## State Machine Structure

```rust
struct GrantAgreementState {
    status: String,
    metadata: DocumentMetadata,
    required_inputs: HashMap<String, VerifiableInput>,
    transitions: Vec<StateTransition>
}

enum VerifiableInput {
    EIP712Credential {
        credential: VerifiableCredential,
        expected_signer: Address,
        verification_method: String
    },
    EVMTransactionProof {
        chain_id: u64,
        tx_hash: H256,
        contract_address: Address,
        method_signature: [u8; 4],
        params: Vec<u8>
    }
}
```

## Steel Integration for EVM Proofs

```rust
use risc0_steel::{
    EthereumBlockHeader,
    ProofOfInclusion,
    ReceiptProof
};

impl GrantAgreementState {
    pub fn verify_transaction_proof(&self, input: &EVMTransactionProof) -> Result<bool> {
        // Use Steel to verify EVM transaction receipt
        let receipt_proof = ReceiptProof::new(
            input.tx_hash,
            input.chain_id,
            input.block_number
        );

        // Verify the transaction was included in the block
        receipt_proof.verify_inclusion()?;

        // Verify the method call matches expected
        receipt_proof.verify_method_call(
            input.contract_address,
            input.method_signature,
            input.params
        )?;

        Ok(true)
    }
}
```

## EIP-712 Signature Verification
Note this could be extended to do full VC validation (and use Veramo's VC Rust library)

```rust
impl GrantAgreementState {
    pub fn verify_credential(&self, input: &EIP712Credential) -> Result<bool> {
        // Verify EIP-712 signature
        let typed_data = input.credential.proof.eip712;
        let message_hash = hash_typed_data(&typed_data)?;
        
        // Recover signer
        let recovered_address = ecrecover(
            message_hash,
            input.credential.proof.proof_value
        )?;

        // Verify against expected signer
        Ok(recovered_address == input.expected_signer)
    }
}
```

## State Transition Logic

```rust
impl GrantAgreementState {
    pub fn process_input(&mut self, input: VerifiableInput) -> Result<()> {
        // Find valid transitions from current state
        let valid_transitions = self.transitions.iter()
            .filter(|t| t.from == self.status);

        for transition in valid_transitions {
            // Verify all conditions are met
            let conditions_met = transition.conditions.iter()
                .all(|condition| match condition {
                    Condition::VariablesSet(vars) => self.verify_variables_set(vars),
                    Condition::IsValid(input_id) => self.verify_input(input_id)
                })?;

            if conditions_met {
                self.status = transition.to.clone();
                break;
            }
        }

        Ok(())
    }
}
```

## Risc0 Guest Program

```rust
risc0_zkvm::guest::entry!(main);

pub fn main() {
    // Read inputs
    let state: GrantAgreementState = env::read();
    let input: VerifiableInput = env::read();
    
    // Process state transition
    let mut state_machine = GrantAgreementState::new(state);
    state_machine.process_input(input).expect("Invalid state transition");
    
    // Commit new state
    env::commit(&state_machine);
}
```

# More details

* [Type definitions for both 712 signature and EVM tx proofs](./types.rs)
* [Generic Risc0-based state machine with verifiable inputs](./state-machine.rs)

# Interesting Reference Projects

* [Risc0 + Steel - zk view state proofs](https://risczero.com/steel)
* [AO <> EVM zk Bridge](https://github.com/AO-ZKP/ao-zk-bridge/blob/main/oracle/index.ts)
