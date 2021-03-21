
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

      <a href=${IPFS.getLink(stamp.image)} target="_blank">
        <img class="image" src=${stamp.imageUri} >
      </a>

      <p><b>Denomination</b>: ${stamp.denomination}</p>
      <p><b>Collection</b>: <a href="/stamps/collection/${group.id}">${group.name}</a></p>
      <p><b>Image</b>:
        <a href=${IPFS.getLink(stamp.image)} target="_blank">
          ${stamp.image}
        </a>
      </p>
      <p><b>URI</b>: <a target="_blank" href="${IPFS.getLink(stamp.URI)}">${stamp.URI}</a></p>

      <p style="cleat:both"><br></p>
      <p>${stamp.desc}</p>

    </div>`

    render(stampDetail(group), this)
  }
})
