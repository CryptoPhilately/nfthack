
import User from '@model/User'
import Router from '@view/Router'
import IPFS from '@model/IPFS'

customElements.define('add-stamp', class extends HTMLElement {
  async connectedCallback () {
    const form = document.createElement('form')
    form.innerHTML = `<legend>Add new stamp</legend>

    <label class="filepicker">
      <svg enable-background="new 0 0 512 512"  viewBox="0 0 512 512"  xmlns="http://www.w3.org/2000/svg"><g><path d="m512 476h-512v-370h512z" fill="#fff8d5"/><path d="m256 106h256v370h-256z" fill="#ffe3ba"/><path d="m350 274c-24.813 0-45-20.187-45-45v-148c0-24.813 20.187-45 45-45h60c24.813 0 45 20.187 45 45v25h-30v-25c0-8.271-6.729-15-15-15h-60c-8.271 0-15 6.729-15 15v148c0 8.271 6.729 15 15 15s15-6.729 15-15v-53h30v53c0 24.813-20.187 45-45 45z" fill="#265d77"/><path d="m512 476h-512v-113.687l137-78.606 123.614 70.926 117.975-39.655 133.411 56.054z" fill="#4bbaed"/><path d="m105 256c-24.813 0-45-20.187-45-45s20.187-45 45-45 45 20.187 45 45-20.187 45-45 45z" fill="#ffd400"/><path d="m260.614 354.633-4.614-2.648v124.015h256v-104.968l-133.411-56.054z" fill="#388cb3"/></g></svg>
      <input class="file" accept="image/png, image/jpeg, image/jpg" type="file" required  onchange="document.getElementById('preview').src = window.URL.createObjectURL(this.files[0])">
      <img id="preview">
    </label>

    <input name="name" type="text" placeholder="Name" minlength="1" required>
    <input name="denomination" type="number" placeholder="Denomination" min="0.01" max="999999999999" step="0.01" required>
    <textarea name="desc" type="text" placeholder="Description" minlength="5"></textarea>
    <input class="ipfs-link" type="text" readonly name="image" placeholder="image in ipfs" required>
    <input type="submit" value="Create">`

    form.getElementsByClassName('file')[0].addEventListener('change', function () {
      const reader = new FileReader()
      reader.onloadend = async function () {
        form.classList.add('uploading-image')
        const fileData = await IPFS.uploadImageAsSvg(reader.result)
        console.info('Image uploaded', fileData.link)
        // @ts-ignore
        form.getElementsByClassName('ipfs-link')[0].value = 'ipfs://' + fileData.CID
        form.getElementsByClassName('ipfs-link')[0].onclick = () => { window.open(fileData.link, '_blank') }
        form.classList.remove('uploading-image')
      }
      reader.readAsDataURL(this.files[0])
    })

    form.onsubmit = async e => {
      e.preventDefault()
      // @ts-ignore
      const data = Object.fromEntries(new FormData(e.target))

      const id = await User.DB.stamps.put({
        status: 'draft',
        name: data.name,
        desc: data.desc,
        image: data.image,
        denomination: data.denomination
      })
      console.log({ id })
      if (id) {
        Router.navigateTo('/stamps')
      }
    }

    this.appendChild(form)
  }
})
