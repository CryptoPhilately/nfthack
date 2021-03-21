
import User from '../../model/User'
import Router from '@view/Router'

customElements.define('log-in', class extends HTMLElement {
  async connectedCallback () {
    if (!User.metamaskExist()) {
      console.warn('metamask disabled')
      return
    }

    await User.ready()

    if (!User.isConnected()) {
      const text = (await User.isLocked()) ? 'Unlock' : 'Connect'
      this.innerHTML = `<button title="Log In with MetaMask">${text}</button>`
      this.getElementsByTagName('button')[0].addEventListener('click', () => { User.login() })
    }

    User.on('address:changed', address => {
      if (!address) { return }
      const network = User.getNetwork()
      const showAddress = address.substr(0, 6) + '...' + address.substr(-4)
      this.innerHTML = `<div class="userblock">
        <a href="${User.explorerLink('address', address)}"
          target="_blank"
          title="${address} in ${network} network"
          class="address"><b>${network}</b>: ${showAddress}</a>
      </div>`
      Router.navigateTo('/stamps')
    })
  }
})
