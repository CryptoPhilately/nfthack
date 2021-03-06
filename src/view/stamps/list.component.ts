
import { html, render } from 'lit-html'
import User from '@model/User'
import IPFS from '@model/IPFS'
import ethCollections from '@model/EthCollections'
import Router from '@view/Router'

customElements.define('stamps-list', class extends HTMLElement {
  async connectedCallback () {
    if (!(await User.DB.groups.toArray()).length) {
      this.innerHTML = '<p class="fetching">Fetching collections from blockchain...</p>'
      await ethCollections.fetchCollectionsFromIPFS()
    }

    const [groups, stamps] = await Promise.all([User.DB.groups.toArray(), User.DB.stamps.toArray()])
    const groupsbyId = groups.reduce((obj, item) => {
      obj[item.id] = item
      return obj
    }, {})

    const goTo = function (e) {
      if (['a', 'img'].includes(e.target.tagName.toLowerCase())) return
      Router.navigateTo(this.dataset.link)
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
              <!-- <th>TX</th> -->
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
                  <td class="stamps">${group.stamps}</td>
                  <td><a class="uri" href=${IPFS.getLink(group.URI)} target="_blank">${group.URI}</a></td>
                  <!-- <td>
                  <a class="uri" href="${User.explorerLink('tx', group.TX)}" target="_blank">${group.TX}</a>
                  </td> -->
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
              <th class="image">Image</th>
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
                    <a href=${IPFS.getLink(stamp.image)} target="_blank">
                      <img src="${stamp.imageUri}" id="stamp_${stamp.id}_image">
                    </a>
                  </td>
                  <td><a href="/stamps/${stamp.id}">${stamp.name}</a></td>
                  <td>${stamp.denomination}</td>
                  <td>${groupsbyId[stamp.groupId]?.name || '-'}</td>
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

    // Load images
    stamps.forEach(async stamp => {
      if (stamp.imageUri) return
      const datauri = await IPFS.getImage(stamp.image)
      if (!datauri) return
      const img = document.getElementById(`stamp_${stamp.id}_image`)
      img.src = datauri
      User.DB.stamps.update(stamp.id, { imageUri: datauri })
    })
  }
})
