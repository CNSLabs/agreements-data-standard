# Transaction Proof

## Transaction Proof Definition (from IP-003)

```tsx
// Core proof components
interface TransactionProof {
  txHash: string;
  proofDefinitionReference: string; // Reference to the proof definition variable that this proof satisfies
  
  // Core proof components
  rawTx: RawTransaction;
  txReceipt: TransactionReceipt;
  blockHeader: BlockHeader;
  receiptProof: MerkleProof;
  transactionProof: MerkleProof;
}

// Note the raw transaction changes based on the EIP version
// The transaction structure will vary based on the transaction type
// See Legacy Transactions, EIP-2930 Transactions, and EIP-1559 Transactions for more details
interface RawTransaction {
  hash: string;
  nonce: number;
  from: string;
  to: string | null; // null for contract creation
  value: string;
  gasPrice: string;
  gas: string;
  input: string;
  v: string;
  r: string;
  s: string;
  chainId: number;
}

interface TransactionReceipt {
  transactionHash: string;
  transactionIndex: number;
  type: number; // 0 for legacy, 1 for EIP-2930, 2 for EIP-1559
  blockHash: string;
  blockNumber: number;
  from: string;
  to: string | null; // null for contract creation
  gasUsed: number;
  cumulativeGasUsed: number;
  effectiveGasPrice: number;
  contractAddress: string | null; // only for contract creation
  logs: EventLog[];
  status: number;
  logsBloom: string;
}

interface BlockHeader {
  parentHash: string;
  sha3Uncles: string;
  miner: string;
  stateRoot: string;
  transactionsRoot: string;
  receiptsRoot: string;
  logsBloom: string;
  difficulty: number;
  totalDifficulty: number;
  number: number;
  gasLimit: number;
  gasUsed: number;
  timestamp: number;
  extraData: string;
  hash: string;
  mixHash: string;
  nonce: number;
  size: number;
  baseFeePerGas?: number; // EIP-1559
}

interface MerkleProof {
  proof: number[][]; // This is the path to leaf node from root node. This follows the EIP-1186 specification for merkle proofs
  value: number[]; // value of the leaf node
}

interface EventLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  removed: boolean;
}
```

## Additional Notes

### Understanding the Core Components of the Transaction Proof

Here we will describe the reasoning behind the core components of the transaction proof definition

1. `txHash` - The hash of the transaction
2. `proofDefinitionReference` - Reference to the proof definition variable that this proof satisfies
3. `rawTx` - The raw transaction data. We can use the rawTx to verify specific details about the transaction depending on the proof definition. For example, given the ABI of a contract, we can decode the input data to verify the correct method was called with the correct parameters.
4. `txReceipt` - The transaction receipt. We can use the receipt to verify the status of the transaction. The receipt also contains the transaction index which is used to verify the transaction inclusion in the block via a merkle proof.
5. `blockHeader` - The block header. Most of the fields here are used for record keeping. The important fields here are the receipt root and the transaction root. These are used to verify the transaction inclusion in the block via a merkle proof.
6. `receiptProof` - The merkle proof for the transaction receipt inclusion.
7. `transactionProof` - The merkle proof for the transaction inclusion.

### Raw Transaction Format

The raw transaction format is different for legacy transactions, EIP-2930 transactions, and EIP-1559 transactions.


#### Legacy Transactions (Type 0)
Legacy transactions are the original Ethereum transaction format:

```tsx
interface LegacyTransaction {
    nonce: number;
    gasPrice: string;
    gasLimit: string;
    to: string | null; // null for contract creation
    value: string;
    data: string;
    v: string;
    r: string;
    s: string;
}
```

#### EIP-2930 Transactions (Type 1)
EIP-2930 introduced access lists to reduce gas costs for contract interactions:

```tsx
interface EIP2930Transaction {
    chainId: number;
    nonce: number;
    gasPrice: string;
    gasLimit: string;
    to: string | null; // null for contract creation
    value: string;
    data: string;
    accessList: AccessListItem[];
    v: string;
    r: string;
    s: string;
}

interface AccessListItem {
    address: string;
    storageKeys: string[];
}
```

#### EIP-1559 Transactions (Type 2)
EIP-1559 introduced a new fee market mechanism with base fee and priority fee:

```tsx
interface EIP1559Transaction {
    chainId: number;
    nonce: number;
    maxPriorityFeePerGas: string;
    maxFeePerGas: string;
    gasLimit: string;
    to: string | null; // null for contract creation
    value: string;
    data: string;
    accessList: AccessListItem[];
    v: string;
    r: string;
    s: string;
}
```
