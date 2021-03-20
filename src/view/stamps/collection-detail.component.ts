
import { html, render } from 'lit-html'
import User from '@model/User'
import IPFS from '@model/IPFS'
import Router from '@view/Router'

customElements.define('collection-detail', class extends HTMLElement {
  async connectedCallback () {
    const groupId = Number(this.getAttribute('id'))
    const group = await User.DB.groups.get(groupId)
    if (!group) {
      Router.navigateTo('/stamps')
    }

    const stamps = await User.DB.stamps.where({ groupId }).toArray()

    const collectionDetail = group => html`<div class="collection-info">
      <h1> <i class="status ${group.status}">${group.status}</i> ${group.name}</h1>
      <p><b>Ticker</b>: ${group.ticker}</p>
      <p><b>Denomination</b>: ${group.denomination}</p>
      <p><b>Description</b>: ${group.desc}</p>

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
    </div>`

    render(collectionDetail(group), this)
  }
})
