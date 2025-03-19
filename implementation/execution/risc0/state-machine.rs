impl GrantAgreementState {
    pub fn verify_input(&self, input_id: &str) -> Result<bool> {
        // Get the required input from state
        let required_input = self.required_inputs.get(input_id)
            .ok_or(Error::InputNotFound(input_id.to_string()))?;

        match required_input {
            VerifiableInput::EIP712Credential { 
                credential, 
                expected_signer, 
                verification_method 
            } => {
                // 1. Verify the credential structure
                self.verify_credential_structure(credential)?;

                // 2. Verify the proof type is correct
                if credential.proof.type_ != "EthereumEip712Signature2021" {
                    return Err(Error::InvalidProofType);
                }

                // 3. Verify the verification method matches
                if credential.proof.verification_method != *verification_method {
                    return Err(Error::InvalidVerificationMethod);
                }

                // 4. Reconstruct EIP-712 hash
                let typed_data = &credential.proof.eip712;
                let domain_hash = hash_eip712_domain(&typed_data.domain)?;
                let message_hash = hash_eip712_message(
                    &typed_data.types,
                    &typed_data.primary_type,
                    &credential
                )?;

                // 5. Recover signer from signature
                let signature = hex::decode(&credential.proof.proof_value[2..])?; // Remove "0x"
                let recovered_address = ecrecover(
                    domain_hash,
                    message_hash,
                    &signature
                )?;

                // 6. Verify against expected signer
                Ok(recovered_address == *expected_signer)
            },

            VerifiableInput::EVMTransactionProof { 
                chain_id,
                tx_hash,
                contract_address,
                method_signature,
                params 
            } => {
                // 1. Use Steel to create receipt proof
                let receipt_proof = steel::ReceiptProof::new(
                    tx_hash,
                    *chain_id,
                    self.get_block_number()?
                );

                // 2. Verify transaction inclusion
                receipt_proof.verify_inclusion()?;

                // 3. Verify contract call
                let call_proof = receipt_proof.verify_contract_call(
                    *contract_address,
                    *method_signature
                )?;

                // 4. Verify call parameters match expected
                let decoded_params = call_proof.decode_params()?;
                if decoded_params != *params {
                    return Err(Error::InvalidTransactionParameters);
                }

                // 5. Verify transaction success
                let status = receipt_proof.get_status()?;
                if !status {
                    return Err(Error::FailedTransaction);
                }

                Ok(true)
            }
        }
    }

    // Helper function to verify credential structure
    fn verify_credential_structure(&self, credential: &VerifiableCredential) -> Result<()> {
        // Verify required fields are present
        if credential.id.is_empty() {
            return Err(Error::MissingCredentialId);
        }

        if credential.issuer.id.is_empty() {
            return Err(Error::MissingIssuerId);
        }

        // Verify credential type
        if !credential.type_.contains(&"VerifiableCredential".to_string()) {
            return Err(Error::InvalidCredentialType);
        }

        // Verify issuance date is valid ISO 8601
        DateTime::parse_from_rfc3339(&credential.issuance_date)
            .map_err(|_| Error::InvalidIssuanceDate)?;

        Ok(())
    }

    // Custom error types
    #[derive(Debug)]
    enum Error {
        InputNotFound(String),
        InvalidProofType,
        InvalidVerificationMethod,
        InvalidSignature,
        InvalidTransactionParameters,
        FailedTransaction,
        MissingCredentialId,
        MissingIssuerId,
        InvalidCredentialType,
        InvalidIssuanceDate,
    }
}

// Example usage in state transition
impl GrantAgreementState {
    pub fn process_transition(&mut self, transition: &StateTransition) -> Result<bool> {
        for condition in &transition.conditions {
            match condition {
                Condition::IsValid(input_id) => {
                    if !self.verify_input(input_id)? {
                        return Ok(false);
                    }
                },
                Condition::VariablesSet(vars) => {
                    if !self.verify_variables_set(vars)? {
                        return Ok(false);
                    }
                }
            }
        }

        // All conditions met, perform transition
        self.status = transition.to.clone();
        Ok(true)
    }
}