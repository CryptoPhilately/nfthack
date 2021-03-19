
import User from './User'

window.App = { User } // for debug only

document.addEventListener('DOMContentLoaded', async () => {
  // remove loader
  document.body.classList.remove('loading')
})
