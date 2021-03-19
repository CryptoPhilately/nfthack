
customElements.define('main-screen', class extends HTMLElement {
  async connectedCallback () {
    this.innerHTML = `<p>
        Hello NFT world
      </p>`
  }
})
