import { html, render } from 'lit-html'
import IPFS from '@model/IPFS'
import EthCollections from '@model/EthCollections'
import User from '@model/User'
import Router from '@view/Router'

customElements.define('create-collection', class extends HTMLElement {
  async connectedCallback () {
    const emptyStamp = { name: '', denomination: '', desc: '', image: '' }
    let collectionStamps = [{ ...emptyStamp }]

    // if all forms filled add new stamp form
    const addNewStampForm = () => {
      const filteredStamps = collectionStamps.filter(stamp => !(stamp && !stamp.name && !stamp.desc && !stamp.image && !stamp.denomination))
      filteredStamps.push({ ...emptyStamp })
      if (filteredStamps.length === collectionStamps.length) {
        return
      }
      collectionStamps = filteredStamps
      render(collectionForm(collectionStamps), this)
    }

    // Upload stamp image
    const uploadImage = function () {
      const stampIndex = Number(this.dataset.key)
      const fieldset = document.querySelector('fieldset.stamp-' + stampIndex)
      fieldset.classList.add('uploading-image')
      // Set preview
      document.getElementById('preview' + stampIndex).src = window.URL.createObjectURL(this.files[0])

      // Upload to IPFS
      const reader = new FileReader()
      reader.onloadend = async () => {
        const fileData = await IPFS.uploadImageAsSvg(reader.result)
        console.info('Image uploaded', fileData.link)
        document.getElementById(`stamp_${stampIndex}_image`).value = fileData.CID
        collectionStamps[stampIndex].image = fileData.CID
        fieldset.classList.remove('uploading-image')
        addNewStampForm()
      }
      reader.readAsDataURL(this.files[0])
    }

    const removeStamp = e => {
      e.preventDefault()
      collectionStamps[e.target.dataset.key] = null
      render(collectionForm(collectionStamps), this)
      if (collectionStamps.filter(s => !!s).length === 0) {
        addNewStampForm()
      }
    }

    // Change stamp field
    let stampSetTimeout
    const stampSet = function () {
      clearTimeout(stampSetTimeout)
      stampSetTimeout = setTimeout(() => {
        collectionStamps[this.dataset.key][this.dataset.field] = this.value
        addNewStampForm()
      }, 500)
    }

    // Save collection
    const saveCollection = async e => {
      e.preventDefault()
      e.target.classList.add('saving-collection')
      const progress = document.getElementById('mint_progress')
      const stamps = collectionStamps.filter(stamp => !!stamp.image)
      const data = Object.fromEntries(new FormData(e.target))

      // Collection demonimation - sum of stamps denomination
      data.denomination = stamps.reduce((sum, s) => {
        sum += Math.ceil(Number(s.denomination))
        return sum
      }, 0)

      progress.innerText = 'Save in local Database'
      // Create group in DB
      const groupId = await User.DB.groups.put({
        status: 'draft',
        desc: data.desc,
        denomination: Math.ceil(data.denomination),
        name: data.name,
        ticker: data.ticker,
        stamps: stamps.length
      })

      // Create stamps
      await Promise.all(stamps.map(async stamp => {
        const stampId = await User.DB.stamps.put({
          status: 'draft',
          groupId: groupId,
          desc: stamp.desc,
          denomination: Math.ceil(Number(stamp.denomination)),
          name: stamp.name,
          image: stamp.image
        })
        return User.DB.stamps.get(stampId)
      }))

      const ethCollections = new EthCollections()
      ethCollections.on('create:status', data => {
        progress.innerText = data.text
      })
      const result = await ethCollections.createCollection(groupId).catch(err => {
        console.error(err)
        progress.innerText = 'Mint error...'
      })

      if (!result?.transactionHash) {
        progress.innerText = 'Mint error...'
        console.error(result)
        alert('Mint error...')
        e.target.classList.remove('saving-collection')
      } else {
        console.info('TX', result)
        progress.innerText = 'Collection Succefully minted!'
        Router.navigateTo('/stamps/collection/' + groupId)
      }
    }

    const collectionForm = (stamps) => html`<form @submit=${saveCollection}>
      <legend>Create new collection</legend>
      <input name="ticker" type="text" placeholder="Token ticker" minlength="2" maxlength="99" required>
      <!-- <input name="denomination" type="number" placeholder="Denomination" min="1" max="999999999999" step="1" required> -->
      <input name="name" type="text" placeholder="Name" minlength="1" required>
      <textarea name="desc" type="text" placeholder="Description" minlength="1"></textarea>

      <br>
      <legend>Stamps</legend>
      <div class="stamps-list">${html`${stamps.map((stamp, key) => {
        if (!stamp) return ''
        const required = (key === 0 && key !== stamps.length - 1)
        return html`<fieldset class="add-stamp stamp-${key}">
          <label class="filepicker">
            <svg enable-background="new 0 0 512 512"  viewBox="0 0 512 512"  xmlns="http://www.w3.org/2000/svg"><g><path d="m512 476h-512v-370h512z" fill="#fff8d5"/><path d="m256 106h256v370h-256z" fill="#ffe3ba"/><path d="m350 274c-24.813 0-45-20.187-45-45v-148c0-24.813 20.187-45 45-45h60c24.813 0 45 20.187 45 45v25h-30v-25c0-8.271-6.729-15-15-15h-60c-8.271 0-15 6.729-15 15v148c0 8.271 6.729 15 15 15s15-6.729 15-15v-53h30v53c0 24.813-20.187 45-45 45z" fill="#265d77"/><path d="m512 476h-512v-113.687l137-78.606 123.614 70.926 117.975-39.655 133.411 56.054z" fill="#4bbaed"/><path d="m105 256c-24.813 0-45-20.187-45-45s20.187-45 45-45 45 20.187 45 45-20.187 45-45 45z" fill="#ffd400"/><path d="m260.614 354.633-4.614-2.648v124.015h256v-104.968l-133.411-56.054z" fill="#388cb3"/></g></svg>
            <input name="file[${key}]" class="file"
              accept="image/png, image/jpeg, image/jpg"
              type="file"
              data-key=${key}
              @change=${uploadImage}
              ?required=${required}
              >
            <img id="preview${key}" class="preview" src="" >
          </label>

          <input name="stamp[${key}].name" @input=${stampSet} data-key=${key} data-field="name" type="text" placeholder="Name" minlength="1" ?required=${required}>
          <input name="stamp[${key}].denomination" @input=${stampSet} data-key=${key} data-field="denomination" type="number" placeholder="Denomination" min="1" max="999999999999" step="1" ?required=${required} >
          <textarea name="stamp[${key}].desc" @input=${stampSet} data-key=${key} data-field="desc" type="text" placeholder="Description" minlength="5"></textarea>
          <input name="stamp[${key}].image" id="stamp_${key}_image" class="ipfs-link" type="hidden" readonly  placeholder="image in ipfs" ?required=${required} >
          <button @click=${removeStamp} data-key=${key}> &times; remove</button>
        </fieldset>`
      })}`}</div>

      <p id="mint_progress"></p>
      <input type="submit" value="Mint collection">
    </form>`

    render(collectionForm(collectionStamps), this)
  }
})
