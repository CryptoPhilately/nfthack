
import { html, render } from 'lit-html'
import User from '@model/User'
import IPFS from '@model/IPFS'
import Router from '@view/Router'

customElements.define('stamps-list', class extends HTMLElement {
  async connectedCallback () {
    const groups = await User.DB.groups.toArray()
    const groupsbyId = groups.reduce((obj, item) => {
      obj[item.id] = item
      return obj
    }, {})
    const stamps = await User.DB.stamps.toArray()

    const goTo = function (e) {
      if (e.target.tagName.toLowerCase() === 'a') return

      Router.navigateTo(this.dataset.link)
    }

    const txLink = tx => {
      const network = User.getNetwork()
      const subdomain = (network !== 'mainnet') ? network + '.' : ''
      return `https://${subdomain}etherscan.io/tx/${tx}`
    }

    const stampsTables = (groupsList, stampsList) => html`
      <div class="groups-list">
        <a class="add" href="/stamps/create-collection">Create collection</a>
        <table>
          <caption>Collections</caption>
          <thead>
            <tr>
              <th>Status</th>
              <th>Ticker</th>
              <th>Name</th>
              <th>Denomination</th>
              <th>Stamps</th>
              <th>URI</th>
              <th>TX</th>
            </tr>
          </thead>
          <tbody>
            ${groupsList.length
            ? html`${groupsList.map(group => html`
                <tr class="item" data-link="/stamps/collection/${group.id}" @click=${goTo}>
                  <td><i class="status ${group.status}">${group.status}</i></td>
                  <td>${group.ticker}</td>
                  <td><a href="/stamps/collection/${group.id}">${group.name}</a></td>
                  <td>${group.denomination}</td>
                  <td>${group.stamps}</td>
                  <td><a class="uri" href=${IPFS.getLink(group.URI)} target="_blank">${group.URI}</a></td>
                  <td>
                  <a class="uri" href="${txLink(group.TX)}" target="_blank">${group.TX}</a>
                  </td>
                </tr>
              `)}`
              : html`<tr><td class="empty" colspan="7">
                You have no stamps collections on current account and network.
                <br><br>
                <a href="/stamps/create-collection">Add first collection</a>
              </td></tr>`
            }
          </tbody>
          <tfoot>
            <tr>
              <th colspan="7">

              </th>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="stamps-list">
        <!-- <a class="add" href="/stamps/add">Add postage stamp</a> -->
        <table>
          <caption>Stamps</caption>
          <thead>
            <tr>
              <th>Status</th>
              <th>Image</th>
              <th>Name</th>
              <th>Denomination</th>
              <th>Collection</th>
              <th>URI</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${stampsList.length
            ? html`${stampsList.map(stamp => html`
                <tr class="item" data-link="/stamps/${stamp.id}" @click=${goTo}>
                  <td><i class="status ${stamp.status}">${stamp.status}</i></td>
                  <td class="image">
                    <a class="uri" href=${IPFS.getLink(stamp.image)} target="_blank">
                      ${stamp.image}
                      <!-- <img src=${IPFS.getLink(stamp.image)} /> -->
                    </a>
                  </td>
                  <td><a href="/stamps/${stamp.id}">${stamp.name}</a></td>
                  <td>${stamp.denomination}</td>
                  <td>${groupsbyId[stamp.groupId].name}</td>
                  <td><a class="uri" href=${IPFS.getLink(stamp.URI)} target="_blank">${stamp.URI}</a></td>
                  <td></td>
                </tr>
              `)}`
              : html`<tr><td class="empty" colspan="7">
                  You have no stamps.
                  First <a href="/stamps/create-collection">Add collection</a>. </td></tr>`
            }
          </tbody>
          <tfoot>
            <tr>
              <th colspan="4">

              </th>
            </tr>
          </tfoot>
        </table>
      </div>
    `

    render(stampsTables(groups, stamps), this)
  }
})
