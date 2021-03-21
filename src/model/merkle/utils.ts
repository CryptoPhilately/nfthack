// import { encodePacked, hexToBytes, soliditySha3 } from 'web3-utils'
import { Buffer } from 'buffer'
const { encodePacked, hexToBytes, soliditySha3, toWei, fromWei } = window.Web3.utils

export const web3toWei = toWei
export const web3fromWei = fromWei
export const web3hexToBytes = hexToBytes
export const web3soliditySha3 = soliditySha3

export function combinedHash (first: Buffer, second: Buffer, preserveOrder: boolean): Buffer {
  if (!second) return first
  if (!first) return second

  // @ts-ignore
  const buf = (preserveOrder) ? bufJoin(first, second) : bufSortJoin(first, second)
  // @ts-ignore
  return Buffer.from(hexToBytes(soliditySha3(encodePacked(buf))))
}

export function getNextLayer (elements: Buffer[], preserveOrder: boolean): Buffer[] {
  return elements.reduce((layer, element, index, arr) => {
    if (index % 2 === 0) {
      layer.push(combinedHash(element, arr[index + 1], preserveOrder))
    }
    return layer
  }, [])
}

export function getLayers (elements: Buffer[], preserveOrder: boolean): Buffer[][] {
  if (elements.length === 0) {
    return [[]]
  }

  const layers = []
  layers.push(elements)
  while (layers[layers.length - 1].length > 1) {
    layers.push(getNextLayer(layers[layers.length - 1], preserveOrder))
  }
  return layers
}

export function getProof (index: number, layers: Buffer[][], hex: boolean): Buffer[] | string[] {
  const proof = layers.reduce((proof, layer) => {
    const pair = getPair(index, layer)
    if (pair) proof.push(pair)
    index = Math.floor(index / 2)
    return proof
  }, [])

  if (hex) {
    return proof.map(e => '0x' + e.toString('hex'))
  } else {
    return proof
  }
}

export function getPair (index: number, layer: Buffer[]): Buffer {
  const pairIndex = index % 2 ? index - 1 : index + 1
  if (pairIndex < layer.length) {
    return layer[pairIndex]
  } else {
    return null
  }
}

export function getBufIndex (element: Buffer, array: Buffer[]): number {
  for (let i = 0; i < array.length; i++) {
    if (element.equals(array[i])) {
      return i
    }
  }
  return -1
}

export function bufToHex (element: Buffer): string {
  return Buffer.isBuffer(element) ? '0x' + element.toString('hex') : element
}

export function bufJoin (first: Buffer, second: Buffer): Buffer {
  return Buffer.concat([first, second])
}

export function bufSortJoin (first: Buffer, second: Buffer): Buffer {
  return Buffer.concat([first, second].sort(Buffer.compare))
}

export function bufDedup (buffers: Buffer[]): Buffer[] {
  return buffers.filter((buffer, i) => {
    return getBufIndex(buffer, buffers) === i
  })
}
