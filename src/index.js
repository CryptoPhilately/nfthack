
import User from './User'
import './view/login/login.component'
import './view/welcome/welcome.component'
window.App = { User } // for debug only

document.addEventListener('DOMContentLoaded', async () => {
  // remove loader
  document.body.classList.remove('loading')
})
