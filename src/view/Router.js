import VaillaRouter from 'vanilla-router'
import User from '@model/User'

const Router = new VaillaRouter({
  mode: 'history',
  page404: function (path) {
    console.log(path + ' - Page not found')
    Router.navigateTo('/')
  }
})

Router.start = function (mountpoint, routes) {
  routes.forEach(function (route) {
    Router.add(route.path, async function () {
      // redirect to main if route need wallet, and wallet not connected
      if (route.auth && !User.isConnected()) return Router.navigateTo('/')

      // wait full initialization user instance
      if (route.auth) await User.ready()

      // render page html
      mountpoint.innerHTML = route.html
    })
  })

  // listen location chamge
  Router.addUriListener()
  Router.check()
  document.addEventListener('click', function (e) {
    if (!e.target.href || e.target.target) return
    e.preventDefault()
    Router.navigateTo(new URL(e.target.href).pathname)
  })
}

export default Router
