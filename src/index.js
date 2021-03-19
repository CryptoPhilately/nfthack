
import User from './User'
import './view/main.component'
import './view/login/login.component'
window.App = { User } // for debug only

document.addEventListener('DOMContentLoaded', async () => {
  // remove loader
  document.body.classList.remove('loading')
})
