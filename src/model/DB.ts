
import Dexie from 'dexie'

// Stamps Collections
export interface IGroup {
  id?: number; // Primary key. Optional (autoincremented)
  status: string;
  ticker: string;
  name: string;
  desc: string;
  denomination: number;
  URI: string; // ipfs link to collection info
}

// Stamps
export interface IStamp {
  id?: number; // Primary key. Optional (autoincremented)
  groupId: number; // "Foreign key" to an IGroup
  status: string;
  name: string;
  desc: string;
  denomination: number;
  image: string; // ipfs link to image file
  URI: string; // ipfs link to stamp info
}

export default class Stamps extends Dexie {
  groups: Dexie.Table<IGroup, number>;
  stamps: Dexie.Table<IStamp, number>;

  constructor (dbName) {
    super(dbName)

    this.version(1).stores({
      groups: '++id, URI, status, ticker',
      stamps: '++id, URI, status, groupId'
    })

    this.groups = this.table('groups')
    this.stamps = this.table('stamps')
  }
}
