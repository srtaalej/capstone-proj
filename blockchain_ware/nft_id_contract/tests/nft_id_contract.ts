import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { NftIdContract } from "../target/types/nft_id_contract";

// Set up connection to Devnet
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// Load the deployed program
const program = anchor.workspace.NftIdContract as Program<NftIdContract>;

// Generate new mint and metadata accounts
const mint = Keypair.generate();
const metadata = Keypair.generate();
const user = provider.wallet.publicKey;

// Metaplex & Token Program IDs
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

async function mintNFT() {
  console.log("Minting NFT...");

  const tx = await program.methods.initialize("My NFT","MYNFT","https://example.com/metadata.json")
    .accounts({
      payer: user,
      mint: mint.publicKey,
      metadata: metadata.publicKey,
      authority: user,
      metadataProgram: TOKEN_METADATA_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .signers([mint])
    .rpc();

  console.log("NFT Minted! Transaction Signature:", tx);
}

// Run the script
mintNFT().catch(console.error);
