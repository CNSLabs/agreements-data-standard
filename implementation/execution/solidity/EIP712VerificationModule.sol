// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/SchemaRegistry.sol";

contract EIP712VerificationModule is EIP712 {
    using ECDSA for bytes32;

    address public easContract;
    address public schemaRegistry;

    // EIP-712 TypeHash for Verifying Signatures
    bytes32 public constant ATTESTATION_TYPEHASH =
        keccak256("Attestation(bytes32 hash)");

    constructor(address _easContract, address _schemaRegistry)
        EIP712("EAS", "1")
    {
        easContract = _easContract;
        schemaRegistry = _schemaRegistry;
    }

    function verifyAttestation(
        bytes32 schemaUID,
        bytes32 contentHash,
        bytes memory signature,
        address expectedSigner
    ) public view returns (bool) {
        // Construct the EIP-712 digest
        bytes32 digest = _hashTypedDataV4(
            keccak256(abi.encode(ATTESTATION_TYPEHASH, contentHash))
        );

        // Recover signer from signature
        address recoveredSigner = digest.recover(signature);
        return recoveredSigner == expectedSigner;
    }

    function validateAttestation(
        bytes32 schemaUID,
        address attester,
        address recipient,
        uint64 expirationTime,
        bool revocable,
        bytes calldata data
    ) external view returns (bool) {
        require(
            msg.sender == easContract,
            "Only the EAS contract can call this function"
        );

        // Decode the attestation data
        (string memory ipfsCID, bytes32 contentHash, bytes memory signature) = abi
            .decode(data, (string, bytes32, bytes));

        // Fetch schema details
        require(
            ISchemaRegistry(schemaRegistry).getSchema(schemaUID) != bytes32(0),
            "Schema does not exist"
        );

        // Verify EIP-712 signature
        require(
            verifyAttestation(schemaUID, contentHash, signature, attester),
            "Signature verification failed"
        );

        return true;
    }
}
