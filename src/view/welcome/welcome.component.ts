import User from '@model/User'
import Router from '@view/Router'

customElements.define('welcome-screen', class extends HTMLElement {
  async connectedCallback () {
    // Metamask extension not exist
    if (!User.metamaskExist()) {
      this.innerHTML = `<p>
        Please use browser with Ethereum support. <br /><br />
        See more on <a href="https://metamask.io/" target="_blank">MetaMask site</a>.
      </p>`
      return
    }

    // User wallet not connected
    await User.ready()
    if (!User.isConnected()) {
      this.innerHTML = `
        <p>Please connect your wallet </p>
        <button title="Log In with MetaMask">Connect</button>
      `
      this.getElementsByTagName('button')[0].addEventListener('click', () => { User.login() })
      return
    }

    // check network
    if (!User.networkSupported()) {
      this.innerHTML = `
        <p>Sorry... Network ${User.getNetwork()} is not supported, our contract not deployed...</p>
        <p>You can use Rinkeby</p>
      `
      return
    }

    // All ok - show user collections
    if (!window.location.pathname.includes('stamps')) {
      Router.navigateTo('/stamps')
    }
  }
})
