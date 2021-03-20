export interface RootGetter {
  getRootBuffer(): Buffer
  getRootHex(): string
}

export interface ProofGetter {
  getProofBuffer(element: string): Buffer[]
  getProofHex(element: string): string[]
  getProofOrderedBuffer(element: string, index: number): Buffer[]
  getProofOrderedHex(element: string, index: number): string[]
}

export interface Validator {
  validate(proof: Buffer[], root: Buffer, element: string): boolean
  validateOrdered(proof: Buffer[], root: Buffer, element: string, index: number): boolean
}