
/* eslint-disable  @typescript-eslint/no-explicit-any */

export interface Candidate {
  publicKey: string
  cid: number
  pollId: number
  name: string
  votes: number
  hasRegistered: boolean
}

export interface Poll {
  publicKey: string
  id: number
  // title: string
  description: string
  start: number // Unix timestamp
  end: number // Unix timestamp
  // isPrivate: boolean
  candidates: number
}

export interface GlobalState {
  poll: Poll | null
  candidates: Candidate[]
  voters: any[]
  regModal: string
}

export interface RootState {
  globalStates: GlobalState
}
