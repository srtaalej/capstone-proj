// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import VoteIDL from '../target/idl/vote.json'
import type { Vote } from '../target/types/vote'

// Re-export the generated IDL and type
export { Vote, VoteIDL }

// The programId is imported from the program IDL.
export const VOTE_PROGRAM_ID = new PublicKey(VoteIDL.address)

// This is a helper function to get the Vote Anchor program.
export function getVoteProgram(provider: AnchorProvider) {
  return new Program(VoteIDL as Vote, provider)
}

// This is a helper function to get the program ID for the Votee program depending on the cluster.
export function getVoteProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Vote program on devnet and testnet.
      return new PublicKey('TuPK3H9j9vsfJtHMizmosMrpRndrCJ6Ftuqh4BohmiF')
    case 'mainnet-beta':
    default:
      return VOTE_PROGRAM_ID
  }
}
