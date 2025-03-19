// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @notice Interface for verifying different types of inputs
interface IInputVerifier {
    function verifyInput(
        bytes32 agreementId,
        string memory inputId,
        bytes calldata data
    ) external view returns (bool);
}

/// @notice Main FSM contract that manages state transitions
contract AgreementFSM is AccessControl {
    IEAS public immutable eas;
    
    // Role for managing verifiers
    bytes32 public constant VERIFIER_ADMIN_ROLE = keccak256("VERIFIER_ADMIN_ROLE");
    
    struct Agreement {
        bytes32 schemaId;      // EAS schema ID for the agreement
        string currentState;    // Current state in the FSM
        uint256 nonce;         // State transition counter
        bool isInitialized;    // Whether the agreement exists
    }

    struct VerifierConfig {
        address verifier;      // Address of verifier contract
        bool isActive;         // Whether verifier is currently active
    }

    // Agreement ID => Agreement
    mapping(bytes32 => Agreement) public agreements;
    
    // Input Type => Verifier
    mapping(bytes32 => VerifierConfig) public verifiers;

    event AgreementCreated(bytes32 indexed agreementId, bytes32 schemaId);
    event StateTransitioned(bytes32 indexed agreementId, string fromState, string toState, uint256 nonce);
    event VerifierUpdated(bytes32 indexed inputType, address verifier, bool isActive);

    constructor(address _eas) {
        eas = IEAS(_eas);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ADMIN_ROLE, msg.sender);
    }

    /// @notice Register a new verifier for a specific input type
    function registerVerifier(
        bytes32 inputType,
        address verifier
    ) external onlyRole(VERIFIER_ADMIN_ROLE) {
        verifiers[inputType] = VerifierConfig({
            verifier: verifier,
            isActive: true
        });
        emit VerifierUpdated(inputType, verifier, true);
    }

    /// @notice Initialize a new agreement FSM
    function initializeAgreement(
        bytes32 agreementId,
        bytes32 schemaId,
        string calldata initialState
    ) external {
        require(!agreements[agreementId].isInitialized, "Agreement already exists");
        
        agreements[agreementId] = Agreement({
            schemaId: schemaId,
            currentState: initialState,
            nonce: 0,
            isInitialized: true
        });

        emit AgreementCreated(agreementId, schemaId);
    }

    /// @notice Process a state transition with verifiable inputs
    function processStateTransition(
        bytes32 agreementId,
        string calldata targetState,
        TransitionInput[] calldata inputs
    ) external returns (bool) {
        Agreement storage agreement = agreements[agreementId];
        require(agreement.isInitialized, "Agreement not initialized");

        // Verify all inputs
        for (uint256 i = 0; i < inputs.length; i++) {
            require(
                verifyInput(agreementId, inputs[i]),
                string.concat("Input verification failed: ", inputs[i].inputId)
            );
        }

        // Update state
        string memory previousState = agreement.currentState;
        agreement.currentState = targetState;
        agreement.nonce++;

        emit StateTransitioned(
            agreementId,
            previousState,
            targetState,
            agreement.nonce
        );

        return true;
    }

    /// @notice Verify a single input using the appropriate verifier
    function verifyInput(
        bytes32 agreementId,
        TransitionInput calldata input
    ) public view returns (bool) {
        VerifierConfig memory config = verifiers[input.inputType];
        require(config.isActive, "Verifier not active");

        return IInputVerifier(config.verifier).verifyInput(
            agreementId,
            input.inputId,
            input.data
        );
    }
}

/// @notice Implementation of EAS attestation verifier
contract EASAttestationVerifier is IInputVerifier {
    IEAS public immutable eas;
    
    constructor(address _eas) {
        eas = IEAS(_eas);
    }

    function verifyInput(
        bytes32 agreementId,
        string memory inputId,
        bytes calldata data
    ) external view override returns (bool) {
        // Decode the attestation UID from data
        bytes32 attestationUID = abi.decode(data, (bytes32));
        
        // Fetch attestation from EAS
        IEAS.Attestation memory attestation = eas.getAttestation(attestationUID);
        
        // Verify attestation exists and matches agreement
        require(attestation.schema != bytes32(0), "Attestation not found");
        
        // Additional verification logic specific to input type
        // This would vary based on the input being verified
        
        return true;
    }
}

/// @notice Implementation of EVM transaction proof verifier
contract EVMTransactionVerifier is IInputVerifier {
    function verifyInput(
        bytes32 agreementId,
        string memory inputId,
        bytes calldata data
    ) external view override returns (bool) {
        // Decode transaction proof data
        (
            bytes32 txHash,
            uint256 blockNumber,
            bytes32 blockHash,
            bytes memory proof
        ) = abi.decode(data, (bytes32, uint256, bytes32, bytes));
        
        // Verify transaction inclusion and parameters
        // This would integrate with your preferred transaction proof verification method
        
        return true;
    }
}