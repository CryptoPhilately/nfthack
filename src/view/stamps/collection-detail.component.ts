
import { html, render } from 'lit-html'
import User from '@model/User'
import IPFS from '@model/IPFS'
import Router from '@view/Router'
import EthCollections from '@model/EthCollections'

customElements.define('collection-detail', class extends HTMLElement {
  async connectedCallback () {
    const groupId = Number(this.getAttribute('id'))
    const group = await User.DB.groups.get(groupId)
    if (!group) {
      Router.navigateTo('/stamps')
    }
    const stamps = await User.DB.stamps.where({ groupId }).toArray()

    // Send collection to blockchain
    const mint = async () => {
      const progress = document.getElementById('mint_progress')
      const ethCollections = new EthCollections()
      ethCollections.on('create:status', data => {
        progress.innerText = data.text
      })
      await ethCollections.createCollection(groupId).catch(err => {
        console.error(err)
        progress.innerText = 'Mint error...'
      })
      setTimeout(() => { window.location.reload() }, 1000)
    }

    const deposit = async () => {
      const ethCollections = new EthCollections()
      const tx = await ethCollections.depositCollection(groupId).catch(err => {
        console.error(err)
      })
      if (tx) {
        Router.navigateTo('/stamps')
      }
    }

    const collectionDetail = group => html`<div class="collection-info">

    ${(group.status === 'minted')
        ? html`<button class="deposit-collection" @click=${() => deposit(group.id)}>Deposit</button>`
        : html``
      }

      <h1> <i class="status ${group.status}">${group.status}</i> ${group.name}</h1>
      <p><b>Ticker</b>: ${group.ticker}</p>
      <p><b>Denomination</b>: ${group.denomination}</p>
      <p><b>Description</b>: ${group.desc}</p>
      <p><b>URI</b>: <a target="_blank" href="${IPFS.getLink(group.URI)}">${group.URI}</a></p>
      <p><b>TX</b>: <a target="_blank" href="${User.explorerLink('tx', group.TX)}">${group.TX}</a></p>

      <div class="stamps-list">
        <table>
          <caption>Stamps</caption>
          <thead>
            <tr>
              <th>Status</th>
              <th>Image</th>
              <th>Name</th>
              <th>Denomination</th>
              <th>URI</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${stamps.map(stamp => html`
              <tr class="item">
                <td>${stamp.status}</td>
                <td class="image">
                  <a class="uri" href=${IPFS.getLink(stamp.image)} target="_blank">
                    ${stamp.image}
                    <!-- <img src=${IPFS.getLink(stamp.image)} /> -->
                  </a>
                </td>
                <td><a href="/stamps/${stamp.id}">${stamp.name}</a></td>
                <td>${stamp.denomination}</td>
                <td><a class="uri" href=${IPFS.getLink(stamp.URI)} target="_blank">${stamp.URI}</a></td>
                <td></td>
              </tr>
            `)}
          </tbody>
          <tfoot>
            <tr>
              <th colspan="4">

              </th>
            </tr>
          </tfoot>
        </table>
      </div>

      ${(group.status !== 'minted')
        ? html`<p id="mint_progress"></p><button class="mint-collection" @click=${mint}>Mint collection</button>`
        : html``
      }

    </div>`

    render(collectionDetail(group), this)
  }
})
