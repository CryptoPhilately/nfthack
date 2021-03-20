
export default class EventEmitter {
  on (event: string, listener:(d:any) => void) {
    window.addEventListener(event, e => { listener(e.detail) })
  }

  emit (event:string, data:any) {
    window.dispatchEvent(new CustomEvent(event, { detail: data }))
  }
}
