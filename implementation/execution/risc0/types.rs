use ethers::types::{Address, H256, Bytes};
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VerifiableInput {
    EIP712Credential {
        credential: VerifiableCredential,
        expected_signer: Address,
        verification_method: String,
    },
    EVMTransactionProof {
        chain_id: u64,
        tx_hash: H256,
        contract_address: Address,
        method_signature: [u8; 4],
        params: Vec<u8>,
        block_number: u64,
        block_hash: H256,
        merkle_proof: MerkleProof,
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifiableCredential {
    pub id: String,
    pub issuer: Issuer,
    #[serde(rename = "@context")]
    pub context: Vec<String>,
    #[serde(rename = "type")]
    pub type_: Vec<String>,
    pub issuance_date: String,
    pub credential_subject: CredentialSubject,
    pub proof: Proof,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Issuer {
    pub id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CredentialSubject {
    pub id: String,
    pub document: String,
    pub time_stamp: String,
    pub signatories: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Proof {
    pub verification_method: String,
    pub created: String,
    pub proof_purpose: String,
    #[serde(rename = "type")]
    pub type_: String,
    pub proof_value: String,
    pub eip712: EIP712Data,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EIP712Data {
    pub domain: EIP712Domain,
    pub types: HashMap<String, Vec<EIP712Type>>,
    pub primary_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EIP712Domain {
    pub name: String,
    pub version: String,
    pub chain_id: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EIP712Type {
    pub name: String,
    pub type_: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MerkleProof {
    pub proof: Vec<H256>,
    pub path: Vec<bool>,
    pub root: H256,
}

// Example implementation for creating EIP712Credential
impl VerifiableInput {
    pub fn new_eip712_credential(
        credential: VerifiableCredential,
        expected_signer: Address,
        verification_method: String,
    ) -> Self {
        Self::EIP712Credential {
            credential,
            expected_signer,
            verification_method,
        }
    }

    // Example implementation for creating EVMTransactionProof
    pub fn new_evm_transaction_proof(
        chain_id: u64,
        tx_hash: H256,
        contract_address: Address,
        method_signature: [u8; 4],
        params: Vec<u8>,
        block_number: u64,
        block_hash: H256,
        merkle_proof: MerkleProof,
    ) -> Self {
        Self::EVMTransactionProof {
            chain_id,
            tx_hash,
            contract_address,
            method_signature,
            params,
            block_number,
            block_hash,
            merkle_proof,
        }
    }
}

// Example usage
impl VerifiableInput {
    pub fn example_eip712_credential() -> Self {
        VerifiableInput::new_eip712_credential(
            VerifiableCredential {
                id: "credential-123".to_string(),
                issuer: Issuer {
                    id: "did:pkh:eip155:1:0x1234...".to_string(),
                },
                context: vec!["https://www.w3.org/2018/credentials/v1".to_string()],
                type_: vec!["VerifiableCredential".to_string(), "Agreement".to_string()],
                issuance_date: "2024-03-20T12:00:00Z".to_string(),
                credential_subject: CredentialSubject {
                    id: "did:pkh:eip155:1:0x5678...".to_string(),
                    document: "base64_encoded_document...".to_string(),
                    time_stamp: "2024-03-20T12:00:00Z".to_string(),
                    signatories: vec!["0x5678...".to_string()],
                },
                proof: Proof {
                    verification_method: "did:pkh:eip155:1:0x1234...#key-1".to_string(),
                    created: "2024-03-20T12:00:00Z".to_string(),
                    proof_purpose: "assertionMethod".to_string(),
                    type_: "EthereumEip712Signature2021".to_string(),
                    proof_value: "0x1234...".to_string(),
                    eip712: EIP712Data {
                        domain: EIP712Domain {
                            name: "VerifiableCredential".to_string(),
                            version: "1".to_string(),
                            chain_id: 1,
                        },
                        types: HashMap::from([
                            ("EIP712Domain".to_string(), vec![
                                EIP712Type {
                                    name: "name".to_string(),
                                    type_: "string".to_string(),
                                },
                                // ... other types
                            ]),
                        ]),
                        primary_type: "VerifiableCredential".to_string(),
                    },
                },
            },
            Address::from_slice(&hex::decode("1234...").unwrap()),
            "did:pkh:eip155:1:0x1234...#key-1".to_string(),
        )
    }

    pub fn example_evm_transaction_proof() -> Self {
        VerifiableInput::new_evm_transaction_proof(
            1, // chain_id
            H256::from_slice(&hex::decode("1234...").unwrap()), // tx_hash
            Address::from_slice(&hex::decode("5678...").unwrap()), // contract_address
            [0x12, 0x34, 0x56, 0x78], // method_signature
            vec![0x12, 0x34], // params
            12345, // block_number
            H256::from_slice(&hex::decode("9abc...").unwrap()), // block_hash
            MerkleProof {
                proof: vec![H256::from_slice(&hex::decode("def0...").unwrap())],
                path: vec![true, false],
                root: H256::from_slice(&hex::decode("1234...").unwrap()),
            },
        )
    }
}