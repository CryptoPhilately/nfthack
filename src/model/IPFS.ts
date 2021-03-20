import config from '@config/index'
import Ipfs from 'ipfs-mini' // https://github.com/silentcicero/ipfs-mini

const IPFS = new Ipfs(config.ipfsGateway)

IPFS.getLink = function (CID) {
  return IPFS.provider.protocol + '://' + IPFS.provider.host + '/ipfs/' + CID
}

IPFS.uploadImageAsSvg = async function (dataURI:string) {
  const fileContents = `<svg xmlns="http://www.w3.org/2000/svg"><image href="${dataURI}" /></svg>`
  const CID = await IPFS.add(fileContents)
  const link = IPFS.getLink(CID)
  return { CID, link }
}

export default IPFS
