import { Buffer } from 'buffer'
import * as utils from './utils'
import { Validator, RootGetter, ProofGetter } from './interfaces'

export default class MerkleTree implements ProofGetter, RootGetter, Validator {
  private layers: Buffer[][]
  private elements: Buffer[]

  constructor (elements: string[], preserveOrder: boolean) {
    this.elements = elements
      .filter(e => e)
      .map(e => Buffer.from(utils.web3hexToBytes(e)))

    if (this.elements.some((e) => !(e.length === 32 && Buffer.isBuffer(e)))) {
      throw new Error('elements must be 32 byte buffers')
    }

    if (!preserveOrder) {
      this.elements = utils.bufDedup(this.elements)
      this.elements.sort(Buffer.compare)
    }

    this.layers = utils.getLayers(this.elements, preserveOrder)
  }

  public getRootBuffer (): Buffer {
    return this.getRoot(false) as Buffer
  }

  public getRootHex (): string {
    return this.getRoot(true) as string
  }

  private getRoot (hex: boolean): Buffer | string {
    const rootLayer = this.layers[this.layers.length - 1]

    if (rootLayer.length !== 1) {
      throw new Error('failed to get root layer: root layer is invalid')
    }

    if (hex) {
      return '0x' + rootLayer[0].toString('hex')
    }

    return rootLayer[0]
  };

  public getProofBuffer (element: string): Buffer[] {
    return this.getProof(element, false) as Buffer[]
  }

  public getProofHex (element: string): string[] {
    return this.getProof(element, true) as string[]
  }

  private getProof (element: string, hex: boolean): Buffer[] | string[] {
    const elementBuffer = Buffer.from(utils.web3hexToBytes(element))
    const index = utils.getBufIndex(elementBuffer, this.elements)
    if (index == -1) {
      throw new Error('element not found in merkle tree')
    }

    return utils.getProof(index, this.layers, hex)
  };

  public getProofOrderedBuffer (element: string, index: number): Buffer[] {
    return this.getProofOrdered(element, index, false) as Buffer[]
  }

  public getProofOrderedHex (element: string, index: number): string[] {
    return this.getProofOrdered(element, index, true) as string[]
  }

  private getProofOrdered (element: string, index: number, hex: boolean): Buffer[] | string[] {
    const elementBuffer = Buffer.from(utils.web3hexToBytes(element))

    if (!(elementBuffer.equals(this.elements[index]))) {
      throw new Error('element does not match leaf at index in tree')
    }

    return utils.getProof(index, this.layers, hex)
  }

  public validate (proof: Buffer[], root: Buffer, element: string): boolean {
    const elementBuffer = Buffer.from(utils.web3hexToBytes(element))
    return root.equals(proof.reduce((hash, pair) => {
      return utils.combinedHash(hash, pair, false)
    }, elementBuffer))
  }

  public validateOrdered (proof: Buffer[], root: Buffer, element: string, index: number): boolean {
    let tempHash = Buffer.from(utils.web3hexToBytes(element))

    index++

    for (let i = 0; i < proof.length; i++) {
      if (index % 2 === 0) {
        tempHash = utils.combinedHash(proof[i], tempHash, true)
      } else {
        tempHash = utils.combinedHash(tempHash, proof[i], true)
      }
      index = Math.round(index / 2)
    }

    return tempHash.equals(root)
  }
}
