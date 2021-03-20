
import { html, render } from 'lit-html'
import User from '@model/User'
import IPFS from '@model/IPFS'

customElements.define('stamps-list', class extends HTMLElement {
  async connectedCallback () {
    // const listHtml = document.getElementById('stamps_list').content.cloneNode(true)
    const groups = await User.DB.groups.toArray()
    const stamps = await User.DB.stamps.toArray()

    const stampsTables = (groupsList, stampsList) => html`
      <div class="groups-list">
        <a class="add" href="/stamps/create-collection">Create collection</a>
        <table>
          <caption>Collections</caption>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Denomination</th>
              <th>Stamps</th>
              <th>Name</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${groupsList.length
            ? html`${groupsList.map(group => html`
                <tr class="item">
                  <td>${group.ticker}</td>
                  <td>${group.denomination}</td>
                  <td>0</td>
                  <td>${group.name}</td>
                  <td>${group.status}</td>
                  <td></td>
                </tr>
              `)}`
              : html`<tr><td class="empty" colspan="5">
                You have no stamps collections on current account and network.
                <br><br>
                <a href="/stamps/create-collection">Add first collection</a>
              </td></tr>`
            }
          </tbody>
          <tfoot>
            <tr>
              <th colspan="5">

              </th>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="stamps-list">
        <a class="add" href="/stamps/add">Add postage stamp</a>
        <table>
          <caption>Stamps</caption>
          <thead>
            <tr>
              <th>URI</th>
              <th>Image</th>
              <th>Name</th>
              <th>Denomination</th>
              <th>Collection</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${stampsList.length
            ? html`${stampsList.map(stamp => html`
                <tr class="item">
                  <td><a class="uri" href=${IPFS.getLink(stamp.URI)} target="_blank">${stamp.URI}</a></td>
                  <td class="image">
                    <a class="uri" href=${IPFS.getLink(stamp.image)} target="_blank">
                    ${stamp.image}
                      <!-- <img src=${IPFS.getLink(stamp.image)} /> -->
                    </a>
                  </td>
                  <td>${stamp.name}</td>
                  <td>${stamp.denomination}</td>
                  <td>${stamp.groupId}</td>
                  <td>${stamp.status}</td>
                  <td></td>
                </tr>
              `)}`
              : html`<tr><td class="empty" colspan="7">You have no stamps</td></tr>`
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
