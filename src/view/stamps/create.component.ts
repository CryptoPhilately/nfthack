
import User from '@model/User'
import Router from '@view/Router'
customElements.define('create-collection', class extends HTMLElement {
  async connectedCallback () {
    const form = document.createElement('form')
    form.innerHTML = `<legend>Create new collection</legend>
    <input name="name" type="text" placeholder="Name" minlength="1" required>
    <textarea name="desc" type="text" placeholder="Description" minlength="1"></textarea>
    <input name="tokenSymbol" type="text" placeholder="Token ticker" minlength="2" maxlength="2" required>
    <input type="submit" value="Create">`

    form.onsubmit = async e => {
      e.preventDefault()
      const data = Object.fromEntries(new FormData(e.target))
      console.info('submit', data)
      const id = await User.DB.groups.put({
        ...data,
        status: 'draft'
      })
      console.log({ id })
      if (id) {
        Router.navigateTo('/stamps')
      }
    }
    this.appendChild(form)
  }
})
