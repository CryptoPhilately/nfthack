
import { html, render } from 'lit-html'
import User from '@model/User'
import IPFS from '@model/IPFS'
import Router from '@view/Router'

customElements.define('stamp-detail', class extends HTMLElement {
  async connectedCallback () {
    const id = Number(this.getAttribute('id'))
    const stamp = await User.DB.stamps.get(id)
    const group = await User.DB.groups.get(stamp?.groupId)
    if (!stamp || !group) {
      Router.navigateTo('/stamps')
    }

    const stampDetail = group => html`<div class="stamp-info">
      <h1><i class="status ${stamp.status}">${stamp.status}</i> ${stamp.name}</h1>
      <p>${stamp.desc}</p>
      <p><br></p>
      <p><b>Collection</b>: <a href="/stamps/collection/${group.id}">${group.name}</a></p>
      <p><b>Image</b>:
        <a class="uri" href=${IPFS.getLink(stamp.image)} target="_blank">
          ${stamp.image}
          <!-- <img src=${IPFS.getLink(stamp.image)} /> -->
        </a>
      </p>
      <p><b>Denomination</b>: ${stamp.denomination}</p>
    </div>`

    render(stampDetail(group), this)
  }
})
