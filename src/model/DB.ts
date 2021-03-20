
import Dexie from 'dexie'

// Stamps Collections
export interface IGroup {
  id?: number; // Primary key. Optional (autoincremented)
  status: string;
  name: string;
  desc: string;
  tokenSymbol: string;
}

// Stamps
export interface IStamp {
  id?: number; // Primary key. Optional (autoincremented)
  groupId: number; // "Foreign key" to an IGroup
  status: string;
  name: string;
  desc: string;
  image: string; // ipfs link
  denomination: number;
}

export default class Stamps extends Dexie {
  groups: Dexie.Table<IGroup, number>;
  stamps: Dexie.Table<IStamp, number>;

  constructor (dbName) {
    super(dbName)

    this.version(1).stores({
      groups: '++id, status, tokenSymbol',
      stamps: '++id, status, collectionId'
    })

    this.groups = this.table('groups')
    this.stamps = this.table('stamps')
  }
}

/*
const ObservableKeyValue = new Proxy({
  account_address: null,

  subscribe (cb:(d:any) => void) {
    window.addEventListener('changed', event => cb(event.detail))
    window.addEventListener('storage', ({ key, newValue, oldValue }) => {
      window.dispatchEvent(new CustomEvent('changed-' + key, { detail: { key, newValue: null, oldValue } }))
      cb({ key, newValue, oldValue })
    })
  },
  onchange (key:string, cb:(d:any) => void) {
    window.addEventListener('changed-' + key, event => cb(event.detail))
  }
}, {
  set: (obj, key:string, newValue) => {
    const oldValue = localStorage[key]
    localStorage[key] = JSON.stringify(newValue)
    window.dispatchEvent(new CustomEvent('changed', { detail: { key, newValue, oldValue } }))
    window.dispatchEvent(new CustomEvent('changed-' + key, { detail: { key, newValue, oldValue } }))

    return true
  },

  deleteProperty: (obj, key:string) => {
    const oldValue = JSON.parse(localStorage[key])
    delete localStorage[key]
    window.dispatchEvent(new CustomEvent('changed', { detail: { key, newValue: null, oldValue } }))
    window.dispatchEvent(new CustomEvent('changed-' + key, { detail: { key, newValue: null, oldValue } }))

    return true
  },

  get: (obj, key:string) => {
    return obj[key] || JSON.parse(localStorage[key] || 'null')
  }
})
*/
