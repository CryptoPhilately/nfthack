
import { html, render } from 'lit-html'
import User from '@model/User'
import IPFS from '@model/IPFS'
import Router from '@view/Router'
import ethCollections from '@model/EthCollections'

customElements.define('stamp-detail', class extends HTMLElement {
  async connectedCallback () {
    const self = this
    const id = Number(this.getAttribute('id'))
    const stamp = await User.DB.stamps.get(id)
    const group = await User.DB.groups.get(stamp?.groupId)
    if (!stamp) {
      Router.navigateTo('/stamps')
    }

    const detach = async function () {
      this.classList.add('loading')
      this.innerText = 'Detaching...'
      const TX = await ethCollections.detachItem(stamp.id, stamp.groupId).catch(err => {
        this.innerText = 'Error...'
        console.warn('detach error', err)
      })
      console.log('detach res', TX)
      if (TX?.transactionHash) {
        await User.DB.stamps.update(stamp.id, { detachTX: TX })
      }
      this.classList.remove('loading')
      render(stampDetail((await User.DB.stamps.get(stamp.id)), group), self)
    }

    const deposit = async function () {
      this.classList.add('loading')
      this.innerText = 'Depositing...'
      const TX = await ethCollections.depositItem(stamp.id).catch(() => {
        this.innerText = 'Error...'
      })
      console.log('deposit res', TX)
      if (TX?.transactionHash) {
        await User.DB.stamps.update(stamp.id, { depositTX: TX })
      }
      this.classList.remove('loading')
      render(stampDetail((await User.DB.stamps.get(stamp.id)), group), self)
    }

    const stampDetail = (stamp, group) => html`<div class="stamp-info">
      <h1><i class="status ${stamp.status}">${stamp.status}</i> ${stamp.name}</h1>

      <a href=${IPFS.getLink(stamp.image)} target="_blank">
        <img class="image" src=${stamp.imageUri} >
      </a>

      <p><b>Denomination</b>: ${stamp.denomination}</p>
      <p><b>Collection</b>: <a href="/stamps/collection/${group?.id}">${group?.name}</a></p>
      <p><b>Image</b>:
        <a href=${IPFS.getLink(stamp.image)} target="_blank">
          ${stamp.image}
        </a>
      </p>
      <p><b>URI</b>: <a target="_blank" href="${IPFS.getLink(stamp.URI)}">${stamp.URI}</a></p>

      ${(stamp.detachTX)
        ? html`<p><b>Detach TX</b>: <a target="_blank" href="${User.explorerLink('tx', stamp.detachTX.transactionHash)}">${stamp.detachTX.transactionHash}</a></p>`
        : html``
      }
      ${(stamp.depositTX)
        ? html`<p><b>Deposit TX</b>: <a target="_blank" href="${User.explorerLink('tx', stamp.depositTX.transactionHash)}">${stamp.depositTX.transactionHash}</a></p>`
        : html``
      }

      <br />
      <p>${stamp.desc}</p>
      <br style="clear:both">

      ${(stamp.groupId && stamp.status === 'minted')
        ? html`<p id="detach_progress"></p><button class="detach-stamp" @click=${detach}>Detach from collection</button>`
        : html``
      }
      ${(stamp.groupId && stamp.status === 'detached')
        ? html`<p id="deposit_progress"></p><button class="deposit-stamp" @click=${deposit}>Deposit stamp</button>`
        : html``
      }
    </div>`

    render(stampDetail(stamp, group), this)
  }
})
