
import { html, render } from 'lit-html'
import User from '@model/User'

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
              <th>Name</th>
              <th>Description</th>
              <th>Stamps</th>
              <th>Ticker</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${groupsList.length
            ? html`${groupsList.map(group => html`
                <tr class="item">
                  <td>${group.name}</td>
                  <td>${group.desc}</td>
                  <td>0</td>
                  <td>${group.tokenSymbol}</td>
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
              <th>Name</th>
              <th>Collection</th>
              <th>Description</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${stampsList.length
            ? html`${stampsList.map(stamp => html`
                <tr class="item">
                  <td>${stamp.name}</td>
                  <td>${stamp.groupId}</td>
                  <td>${stamp.desc}</td>
                  <td>${stamp.status}</td>
                  <td></td>
                </tr>
              `)}`
              : html`<tr><td class="empty" colspan="4">You have no stamps</td></tr>`
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
