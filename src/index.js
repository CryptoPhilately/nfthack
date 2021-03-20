import config from '@config/index'
import User from '@model/User'
import Router from '@view/Router'
import IPFS from '@model/IPFS'
import EthCollections from '@model/EthCollections'

import MerkleTree from '@model/merkle/index'

import { web3soliditySha3 } from '@model/merkle/utils'
import '@view/index'

// @TODO: remove in PROD
window.App = { config, User, Router, IPFS } // for debug in console

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize routing
  Router.start(document.getElementById('page'), // mountpoint
    [
      { path: '/', auth: false, html: '<welcome-screen>' },
      { path: '/stamps', auth: true, html: '<stamps-list>' },
      { path: '/stamps/create-collection', auth: true, html: '<create-collection>' },
      { path: '/stamps/add', auth: true, html: '<add-stamp>' }
    ]
  )
  // redirect to main page if this is not Ethereum browser
  if (window.location.pathname !== '/' && !User.metamaskExist()) {
    Router.navigateTo('/')
  }

  // remove loader
  document.body.classList.remove('loading')

  // test
  const ethCollections = new EthCollections(User.web3, User.getNetwork())
  window.App.ethCollections = ethCollections
  // ethCollections.test()

  // merkle tree
  const elements = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(e => web3soliditySha3(e))
  const merkleTree = new MerkleTree(elements, true)
  console.log('merkleTree root', merkleTree.getRootHex())
})
