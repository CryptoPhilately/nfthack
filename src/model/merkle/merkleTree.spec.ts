import { assert } from 'chai'
import MerkleTree from './index'
import { web3soliditySha3 } from './utils'

describe('ordered', () => {
  it('success ordered', () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(e => web3soliditySha3(e))
    const merkleTree = new MerkleTree(elements, true)
    const root = merkleTree.getRootBuffer()
    const proof = merkleTree.getProofOrderedBuffer(elements[4], 4)

    const valid = merkleTree.validateOrdered(proof, root, elements[4], 4)
    assert.equal(valid, true)
  })

  it('invalid proof ordered', () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(e => web3soliditySha3(e))
    const merkleTree = new MerkleTree(elements, true)
    const root = merkleTree.getRootBuffer()
    const proof = merkleTree.getProofOrderedBuffer(elements[4], 4)

    proof.pop()
    const valid = merkleTree.validateOrdered(proof, root, elements[4], 4)
    assert.equal(valid, false)
  })
})

describe('not ordered', () => {
  it('success not ordered', () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(e => web3soliditySha3(e))
    const merkleTree = new MerkleTree(elements, false)
    const root = merkleTree.getRootBuffer()
    const proof = merkleTree.getProofBuffer(elements[4])

    const valid = merkleTree.validate(proof, root, elements[4])
    assert.equal(valid, true)
  })

  it('invalid proof not ordered', () => {
    const elements = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(e => web3soliditySha3(e))
    const merkleTree = new MerkleTree(elements, false)
    const root = merkleTree.getRootBuffer()
    const proof = merkleTree.getProofBuffer(elements[4])

    proof.pop()
    const valid = merkleTree.validate(proof, root, elements[4])
    assert.equal(valid, false)
  })
})
