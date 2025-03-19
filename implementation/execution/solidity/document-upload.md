# Using EAS + IPFS to upload and attest the agreement

## Notes:
* Verax could substitute EAS.
* Arweave could substitute IPFS, it would just involve referencing the tx ID instead of the CID in the attestation data. Fetching the upload content just requires the right prefix.

## Document Attestation TS sample

```typescript
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';

// EAS Contract Address on Ethereum Mainnet
const EAS_CONTRACT_ADDRESS = "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587";

async function createGrantAgreementAttestation(
    grantAgreement: any,
    signer: ethers.Signer
) {
    // 1. Upload to IPFS
    const ipfs = create({ url: process.env.IPFS_NODE_URL });
    const ipfsResult = await ipfs.add(JSON.stringify(grantAgreement));
    const documentCID = ipfsResult.cid.toString();

    // 2. Define EAS schema for grant agreement
    const schemaUID = "0x123..."; // Replace with your registered schema UID
    const schemaEncoder = new SchemaEncoder(
        "bytes32 documentHash,string documentCID,address grantRecipient,uint256 grantAmount,uint256 effectiveDate,uint256 termEndDate"
    );

    // 3. Prepare attestation data
    const encodedData = schemaEncoder.encodeData([
        {
            name: "documentHash",
            type: "bytes32",
            value: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(grantAgreement)))
        },
        {
            name: "documentCID",
            type: "string",
            value: documentCID
        },
        {
            name: "grantRecipient",
            type: "address",
            value: grantAgreement.inputTemplateVariables.grantRecipient.props.blockchainAddress
        },
        {
            name: "grantAmount",
            type: "uint256",
            value: grantAgreement.inputTemplateVariables.grantAmount.props.value
        },
        {
            name: "effectiveDate",
            type: "uint256",
            value: new Date(grantAgreement.inputTemplateVariables.effectiveDate.props.value).getTime() / 1000
        },
        {
            name: "termEndDate",
            type: "uint256",
            value: new Date(grantAgreement.inputTemplateVariables.termEndDate.props.value).getTime() / 1000
        }
    ]);

    // 4. Create EAS instance
    const eas = new EAS(EAS_CONTRACT_ADDRESS);
    eas.connect(signer);

    // 5. Create the attestation
    const tx = await eas.attest({
        schema: schemaUID,
        data: {
            recipient: grantAgreement.inputTemplateVariables.grantRecipient.props.blockchainAddress,
            expirationTime: new Date(grantAgreement.inputTemplateVariables.termEndDate.props.value).getTime() / 1000,
            revocable: true,
            data: encodedData,
        },
    });

    const newAttestationUID = await tx.wait();

    return {
        attestationUID: newAttestationUID,
        documentCID,
        ipfsUrl: `ipfs://${documentCID}`,
        easExplorerUrl: `https://easscan.org/attestation/${newAttestationUID}`
    };
}

// Schema registration (one-time setup)
async function registerGrantAgreementSchema(signer: ethers.Signer) {
    const eas = new EAS(EAS_CONTRACT_ADDRESS);
    eas.connect(signer);

    const schema = "bytes32 documentHash,string documentCID,address grantRecipient,uint256 grantAmount,uint256 effectiveDate,uint256 termEndDate";
    const resolverAddress = "0x0000000000000000000000000000000000000000"; // No resolver
    const revocable = true;

    const transaction = await eas.register({
        schema,
        resolverAddress,
        revocable,
    });

    const schemaUID = await transaction.wait();
    return schemaUID;
}

// Example usage
async function main() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // First time only: register schema
    // const schemaUID = await registerGrantAgreementSchema(signer);
    // console.log("Registered schema:", schemaUID);

    // Create attestation
    const grantAgreement = {
        // ... your grant agreement JSON ...
    };

    const result = await createGrantAgreementAttestation(grantAgreement, signer);
    console.log("Attestation created:", result);
}
```

## Document verification sample

```typescript
async function verifyGrantAgreement(
  attestationUID: string,
  provider: ethers.providers.Provider
) {
  // 1. Create EAS instance
  const eas = new EAS(EAS_CONTRACT_ADDRESS);
  eas.connect(provider);

  // 2. Get the attestation
  const attestation = await eas.getAttestation(attestationUID);
  
  // 3. Decode the attestation data
  const schemaEncoder = new SchemaEncoder(
    "bytes32 documentHash,string documentCID,address grantRecipient,uint256 grantAmount,uint256 effectiveDate,uint256 termEndDate"
  );
  const decodedData = schemaEncoder.decodeData(attestation.data);

  // 4. Fetch document from IPFS
  const ipfs = create({ url: process.env.IPFS_NODE_URL });
  const documentCID = decodedData[1].value.toString();
  const documentStream = ipfs.cat(documentCID);
  
  let document = '';
  for await (const chunk of documentStream) {
    document += chunk.toString();
  }

  // 5. Verify document hash
  const calculatedHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(document)
  );
  
  const isValid = calculatedHash === decodedData[0].value;

  return {
    isValid,
    attestation,
    decodedData,
    document: JSON.parse(document)
  };
}
```

## Key features of this implementation:
* Dual Storage
* Full document stored on IPFS
* Key metadata and references stored in EAS attestation

## Schema Design
* Includes document hash for verification
* Stores IPFS CID for retrieval
* Captures key agreement parameters

## Verification
* Document integrity through hash comparison
* Attestation authenticity through EAS
* IPFS availability check

## Metadata
* Grant recipient address
* Grant amount
* Effective dates
* Term end dates

# Security
* Document hash verification
* On-chain attestation
* Revocable if needed

The attestation provides a permanent, verifiable record of the grant agreement while IPFS ensures the full document is always available. The schema design allows for efficient on-chain verification of key parameters while maintaining the complete agreement off-chain.