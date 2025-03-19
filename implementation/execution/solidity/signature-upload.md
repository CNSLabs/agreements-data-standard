# Using EAS + IPFS to upload and attest a VC against the agreement

## Steps

1. Upload JSON Document Off-Chain (e.g., IPFS/Arweave).
2. Compute Hash of the JSON Content.
3. Sign the Hash using EIP-712 (Typed Data Signature).
4. Submit the Attestation with the Signature to EAS.

## Store JSON, Hash It, and Sign with EIP-712

```typescript
import { ethers } from "ethers";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas";
import dotenv from "dotenv";
import crypto from "crypto";
import axios from "axios";

dotenv.config();

// ✅ Replace with your Schema UID
const SCHEMA_UID = "0xYOUR_SCHEMA_UID";

// ✅ Ethereum Provider & Wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ✅ Connect to EAS Contract
const EAS_CONTRACT_ADDRESS = "0x4200000000000000000000000000000021";
const eas = new EAS(EAS_CONTRACT_ADDRESS);
eas.connect(wallet);

// ✅ Upload JSON Document to IPFS (or use Arweave)
async function uploadToIPFS(jsonData) {
    const response = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", jsonData, {
        headers: {
            "pinata_api_key": process.env.PINATA_API_KEY,
            "pinata_secret_api_key": process.env.PINATA_SECRET_API_KEY
        }
    });
    return response.data.IpfsHash;
}

// ✅ Compute Hash of JSON Content
function computeHash(jsonData) {
    const jsonString = JSON.stringify(jsonData);
    return ethers.keccak256(ethers.toUtf8Bytes(jsonString));
}

// ✅ Sign Hash with EIP-712
async function signHashEIP712(hash) {
    const domain = {
        name: "EAS",
        version: "1",
        chainId: await provider.getNetwork().then(net => net.chainId),
        verifyingContract: EAS_CONTRACT_ADDRESS
    };

    const types = {
        Attestation: [
            { name: "hash", type: "bytes32" }
        ]
    };

    const value = { hash };
    return await wallet.signTypedData(domain, types, value);
}

async function submitVC() {
    // ✅ 1. JSON Data (Example VC)
    const jsonData = {
        issuer: "did:ethr:0xYourAddress",
        subject: "did:ethr:0xRecipientAddress",
        claim: { name: "Alice", age: 30 },
        issuanceDate: new Date().toISOString()
    };

    // ✅ 2. Upload JSON to IPFS
    const ipfsCID = await uploadToIPFS(jsonData);
    console.log("✅ Stored JSON on IPFS:", `https://ipfs.io/ipfs/${ipfsCID}`);

    // ✅ 3. Compute Hash of JSON Content
    const contentHash = computeHash(jsonData);
    console.log("✅ Computed Hash:", contentHash);

    // ✅ 4. Sign the Hash using EIP-712
    const signature = await signHashEIP712(contentHash);
    console.log("✅ EIP-712 Signature:", signature);

    // ✅ 5. Encode the Data for EAS
    const schemaEncoder = new SchemaEncoder("string ipfsCID, bytes32 hash, bytes signature");
    const encodedData = schemaEncoder.encodeData([
        { name: "ipfsCID", value: ipfsCID, type: "string" },
        { name: "hash", value: contentHash, type: "bytes32" },
        { name: "signature", value: signature, type: "bytes" }
    ]);

    // ✅ 6. Submit the Attestation
    console.log("⏳ Submitting attestation...");
    const tx = await eas.attest({
        schema: SCHEMA_UID,
        data: {
            recipient: ethers.ZeroAddress,
            expirationTime: 0,
            revocable: true,
            data: encodedData,
        },
    });

    const receipt = await tx.wait();
    console.log("✅ Attestation successful. Tx Hash:", receipt.transactionHash);
    console.log("🔗 Attestation on EAS Explorer:", `https://easscan.org/attestation/${receipt.transactionHash}`);
}

submitVC().catch(console.error);
```

## Retrieve and Verify Attestation

```typescript
import { ethers } from "ethers";
import dotenv from "dotenv";
import axios from "axios";
import crypto from "crypto";

dotenv.config();

// ✅ Ethereum Provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// ✅ Fetch Attestation from EAS GraphQL
async function fetchAttestation(attestationId) {
    console.log("⏳ Fetching attestation from EAS...");

    const query = { query: `{ attestation(id: "${attestationId}") { data } }` };
    const response = await axios.post("https://easscan.org/graphql", query);
    const encodedData = response.data.data.attestation.data;
    console.log("✅ Retrieved attestation data:", encodedData);

    // ✅ Decode the Attestation
    const schemaDecoder = new ethers.AbiCoder();
    const [ipfsCID, contentHash, signature] = schemaDecoder.decode(["string", "bytes32", "bytes"], encodedData);

    console.log("🔗 IPFS CID:", `https://ipfs.io/ipfs/${ipfsCID}`);
    console.log("✅ Extracted Hash:", contentHash);
    console.log("✅ Extracted Signature:", signature);

    // ✅ Fetch JSON from IPFS
    const ipfsResponse = await axios.get(`https://ipfs.io/ipfs/${ipfsCID}`);
    const jsonData = ipfsResponse.data;

    // ✅ Compute Hash of Retrieved JSON
    const computedHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(jsonData)));

    if (computedHash === contentHash) {
        console.log("🎉 Content Hash Verified!");
    } else {
        console.log("❌ Hash Mismatch! Possible Data Tampering.");
    }

    // ✅ Verify EIP-712 Signature
    const domain = {
        name: "EAS",
        version: "1",
        chainId: await provider.getNetwork().then(net => net.chainId),
        verifyingContract: "0x4200000000000000000000000000000000000021"
    };

    const types = { Attestation: [{ name: "hash", type: "bytes32" }] };
    const recoveredAddress = await ethers.verifyTypedData(domain, types, { hash: contentHash }, signature);

    console.log("✅ Signature Verified, Signed By:", recoveredAddress);
}

const ATTESTATION_ID = "0xYourAttestationID"; // Replace with actual attestation ID
fetchAttestation(ATTESTATION_ID).catch(console.error);
```

# Using an EAS Module to Gate Acceptance of VC Attestation

## Attestation Submission Flow:

1. The user submits an attestation containing:

* IPFS CID (off-chain JSON storage)
  * Content Hash (hash of the JSON)
  * EIP-712 Signature (signed hash)

2. Module Verification:

* The validateAttestation function:
  * Decodes the submitted data.
  * Verifies that the EIP-712 signature matches the attester's address.
  * Ensures the schema is valid.

3. Approval or Rejection:

* If the signature is valid, the attestation is approved.
* If the signature is invalid, the attestation is rejected.

## Module Contract

[Sample EAS EIP-712 Verification Module](./EIP712VerificationModule.sol)

## Requirement

1. Module must be deployed on-chain as a new contract
2. Module must be attached to the EAS schema for the agreement
