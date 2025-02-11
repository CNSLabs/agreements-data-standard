// Document Atoms - Basic building blocks
interface BaseAtom {
    id: string;
    type: 'smart-contract' | 'prose' | 'agreement-reference' | 'signature' | 'contract-execution' | 'metadata';
    label: string;
    required?: boolean;
    description?: string;
  }
  
  // Smart contract interaction types
  interface ContractABI {
    type: 'function' | 'event' | 'constructor';
    name?: string;
    inputs: {
      name: string;
      type: string;
      components?: any[];
    }[];
    outputs?: {
      name: string;
      type: string;
      components?: any[];
    }[];
    stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
  }
  
  interface ContractParameter {
    name: string;
    type: string;
    value: string | number;
    templateVariable?: string; // Reference to document template variable
  }
  
  interface TransactionDetails {
    chainId: number;
    contractAddress: string;
    methodName: string;
    abi: ContractABI[];
    parameters: ContractParameter[];
    value?: string; // ETH value to send
    gasLimit?: string;
  }
  
  // Base template variable definition
  interface TemplateVariable {
    type: 'template';
    name: string;
    defaultValue?: string | number | boolean;
    description?: string;
    required?: boolean;
  }
  
  // Extended template variable types to support blockchain data
  interface ExtendedTemplateVariable extends TemplateVariable {
    validationRules?: {
      type: 'string' | 'date' | 'address' | 'number' | 'uint256' | 'bytes32' | 'boolean';
      pattern?: string;
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      min?: string | number;
      max?: string | number;
      isAddress?: boolean;
      isBytes32?: boolean;
    };
  }
  
  // Atom Type Definitions
  interface SmartContractAtom extends BaseAtom {
    type: 'smart-contract';
    chainId: number;
    contractAddress: string;
    abi: ContractABI[];
    methods: {
      [methodName: string]: {
        description: string;
        parameters: ContractParameter[];
        validationRules?: {
          requiredSignatures?: string[];
          timelock?: {
            startTime?: string;
            endTime?: string;
          };
        };
      };
    };
  }
  
  interface ProseAtom extends BaseAtom {
    type: 'prose';
    content: string;
    version: string;
    metadata?: {
      language: string;
      jurisdiction?: string;
      governing_law?: string;
      last_modified: string;
    };
    variables?: {
      [key: string]: ExtendedTemplateVariable;
    };
  }
  
  interface AgreementReferenceAtom extends BaseAtom {
    type: 'agreement-reference';
    agreementId: string;
    version: string;
    relationship: 'incorporates' | 'amends' | 'supplements' | 'references';
    storage: {
      type: 'onchain' | 'ipfs' | 'url';
      location: string;
      verification?: {
        method: 'merkle' | 'signature' | 'hash';
        proof: string;
      };
    };
  }
  
  interface SignatureAtom extends BaseAtom {
    type: 'signature';
    signerRole: string;
    signatureType: 'ethereum' | 'multisig' | 'traditional' | 'delegated';
    requirements: {
      method: 'personal_sign' | 'eth_sign' | 'eip712' | 'multisig' | 'traditional';
      threshold?: number; // For multisig
      delegates?: string[]; // Allowed delegate addresses
      deadline?: string;
      nonce?: string;
    };
    signature?: {
      signer: string;
      signature: string;
      timestamp: string;
      metadata?: any;
    };
  }
  
  // Contract execution atom
  interface ContractExecutionAtom extends BaseAtom {
    type: 'contract-execution';
    transaction: TransactionDetails;
    conditions?: {
      requiredSignatures?: string[];
      timelock?: {
        startTime?: string;
        endTime?: string;
      };
      dependencies?: string[]; // IDs of other atoms that must be completed first
    };
  }
  
  // Document metadata atom
  interface MetadataAtom extends BaseAtom {
    type: 'metadata';
    title: string;
    version: string;
    documentType: string;
    jurisdiction: string;
    language: string;
    lastModified: string;
  }
  
  // Update DocumentAtom type
  type DocumentAtom = SmartContractAtom | ProseAtom | AgreementReferenceAtom | SignatureAtom | ContractExecutionAtom | MetadataAtom;
  
  // Smart Legal Document definition using atoms
  interface SmartLegalDocument {
    atoms: {
      [key: string]: DocumentAtom;
    };
    blockchain: {
      networks: {
        [chainId: number]: {
          name: string;
          rpcUrl?: string;
        };
      };
      transactions: TransactionDetails[];
    };
    variables: {
      [key: string]: ExtendedTemplateVariable;
    };
    executionFlow?: {
      type: 'sequential' | 'parallel';
      steps: string[]; // Node IDs in execution order
    };
    metadata?: {
      title: string;
      version: string;
      documentType: string;
      jurisdiction: string;
      language: string;
      lastModified: string;
    };
    content?: Array<any>; // Define proper type if needed
  }
  
  // Example usage:
  const grantAgreementWithExecution: SmartLegalDocument = {
    atoms: {
      "metadata": {
        id: "metadata",
        type: "metadata",
        label: "Document Metadata",
        title: "Smart Grant Agreement",
        version: "1.0.0",
        documentType: "smart-agreement",
        jurisdiction: "Cayman Islands",
        language: "en",
        lastModified: new Date().toISOString()
      },
      "grant-contract": {
        id: "grant-contract",
        type: "smart-contract",
        label: "Grant Distribution Contract",
        chainId: 1,
        contractAddress: "0x1234...",
        abi: [{
          type: "function",
          name: "distributeGrant",
          inputs: [
            { name: "recipient", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "grantId", type: "bytes32" }
          ],
          outputs: [],
          stateMutability: "nonpayable"
        }],
        methods: {
          "distributeGrant": {
            description: "Distributes grant funds to the recipient",
            parameters: [
              {
                name: "recipient",
                type: "address",
                value: "",
                templateVariable: "recipientAddress"
              },
              {
                name: "amount",
                type: "uint256",
                value: "",
                templateVariable: "grantAmount"
              },
              {
                name: "grantId",
                type: "bytes32",
                value: "",
                templateVariable: "grantId"
              }
            ],
            validationRules: {
              requiredSignatures: ["grantor", "grantee"],
              timelock: {
                startTime: "2024-02-06T00:00:00Z",
                endTime: "2024-12-31T23:59:59Z"
              }
            }
          }
        }
      },
      "grant-terms": {
        id: "grant-terms",
        type: "prose",
        label: "Grant Terms and Conditions",
        content: "This Grant Agreement (\"Agreement\") is entered into...",
        version: "1.0.0",
        metadata: {
          language: "en",
          jurisdiction: "Cayman Islands",
          governing_law: "Cayman Islands Law",
          last_modified: new Date().toISOString()
        },
        variables: {
          recipientAddress: {
            type: "template",
            name: "recipientAddress",
            validationRules: {
              type: "address",
              required: true,
              isAddress: true
            }
          }
        }
      },
      "master-agreement": {
        id: "master-agreement",
        type: "agreement-reference",
        label: "Master Grant Agreement",
        agreementId: "master-grant-v1",
        version: "1.0.0",
        relationship: "incorporates",
        storage: {
          type: "ipfs",
          location: "ipfs://Qm...",
          verification: {
            method: "merkle",
            proof: "0x..."
          }
        }
      },
      "grantor-signature": {
        id: "grantor-signature",
        type: "signature",
        label: "Grantor Signature",
        signerRole: "grantor",
        signatureType: "ethereum",
        requirements: {
          method: "eip712",
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      "grantee-signature": {
        id: "grantee-signature",
        type: "signature",
        label: "Grantee Signature",
        signerRole: "grantee",
        signatureType: "ethereum",
        requirements: {
          method: "eip712",
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    },
    metadata: {
      title: "Smart Grant Agreement",
      version: "1.0.0",
      documentType: "smart-agreement",
      jurisdiction: "Cayman Islands",
      language: "en",
      lastModified: new Date().toISOString(),
    },
    blockchain: {
      networks: {
        1: { name: "Ethereum Mainnet" },
        5: { name: "Goerli Testnet" }
      },
      transactions: [{
        chainId: 1,
        contractAddress: "0x1234...",
        methodName: "distributeGrant",
        abi: [{
          type: "function",
          name: "distributeGrant",
          inputs: [
            { name: "recipient", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "grantId", type: "bytes32" }
          ],
          outputs: [],
          stateMutability: "nonpayable"
        }],
        parameters: [
          {
            name: "recipient",
            type: "address",
            value: "",
            templateVariable: "recipientAddress"
          },
          {
            name: "amount",
            type: "uint256",
            value: "",
            templateVariable: "grantAmount"
          },
          {
            name: "grantId",
            type: "bytes32",
            value: "",
            templateVariable: "grantId"
          }
        ]
      }]
    },
    variables: {
      recipientAddress: {
        type: "template",
        name: "recipientAddress",
        validationRules: {
          type: "address",
          required: true,
          isAddress: true
        }
      },
      grantAmount: {
        type: "template",
        name: "grantAmount",
        validationRules: {
          type: "uint256",
          required: true,
          min: "0"
        }
      },
      grantId: {
        type: "template",
        name: "grantId",
        validationRules: {
          type: "bytes32",
          required: true,
          isBytes32: true
        }
      }
    },
    content: [
      // ... existing document content ...
      "execute-grant": {
        id: "execute-grant",
        type: "contract-execution",
        label: "Execute Grant Distribution",
        transaction: {
          chainId: 1,
          contractAddress: "0x1234...",
          methodName: "distributeGrant",
          abi: [/* ... */],
          parameters: [/* ... */]
        },
        conditions: {
          requiredSignatures: ["grantor", "grantee"],
          timelock: {
            startTime: "2024-02-06T00:00:00Z",
            endTime: "2024-12-31T23:59:59Z"
          }
        }
      }
    ],
    executionFlow: {
      type: "sequential",
      steps: ["document-signing", "execute-grant"]
    }
  };
  
  // Helper class to prepare and validate transaction data
  class SmartDocumentExecutor {
    static async prepareTransaction(doc: SmartLegalDocument, nodeId: string) {
      const node = doc.atoms[nodeId] as ContractExecutionAtom;
      if (!node || node.type !== 'contract-execution') throw new Error('Contract execution atom not found');
  
      // Validate conditions
      await this.validateExecutionConditions(doc, node);
  
      // Prepare transaction parameters
      const txData = await this.buildTransactionData(doc, node.transaction);
      
      return txData;
    }
  
    private static async validateExecutionConditions(doc: SmartLegalDocument, node: ContractExecutionAtom) {
      if (node.conditions?.requiredSignatures) {
        // Check signatures
        const hasAllSignatures = true; // Implement signature checking
        if (!hasAllSignatures) {
          throw new Error('Missing required signatures');
        }
      }
  
      if (node.conditions?.timelock) {
        const now = new Date();
        const start = node.conditions.timelock.startTime ? new Date(node.conditions.timelock.startTime) : null;
        const end = node.conditions.timelock.endTime ? new Date(node.conditions.timelock.endTime) : null;
  
        if (start && now < start) throw new Error('Transaction timelock not yet active');
        if (end && now > end) throw new Error('Transaction timelock expired');
      }
    }
  
    private static async buildTransactionData(doc: SmartLegalDocument, tx: TransactionDetails) {
      // Replace template variables with actual values
      const parameters = tx.parameters.map(param => {
        if (param.templateVariable) {
          const value = this.resolveTemplateVariable(doc, param.templateVariable);
          return { ...param, value };
        }
        return param;
      });
  
      // Encode transaction data using web3 or ethers
      // Return transaction object ready for signing and submission
      return {
        to: tx.contractAddress,
        data: "0x...", // Encoded transaction data
        value: tx.value || "0",
        gasLimit: tx.gasLimit
      };
    }
  
    private static resolveTemplateVariable(doc: SmartLegalDocument, variableName: string): string {
      // Implementation to get the actual value for a template variable
      // This would typically come from user input or another data source
      return "";
    }
  }