import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const NFT_ID_PROGRAM_ID = new PublicKey('GgLTHPo25XiFsQJAkotD3KPiyMFeypJhUSx4UVcxfjcj');

export async function checkKycNftOwnership(connection: Connection, publicKey: PublicKey): Promise<'verified' | 'unverified'> {
  if (!publicKey) {
    console.log('No public key provided');
    return 'unverified';
  }
  
  try {
    console.log('Checking KYC for wallet:', publicKey.toBase58());
    
    // Get all token accounts for the user
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });
    
    console.log('Found token accounts:', tokenAccounts.value.length);

    // Derive the expected mint PDA for this user
    const [expectedMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('mint'), publicKey.toBuffer()],
      NFT_ID_PROGRAM_ID
    );
    console.log('Expected mint PDA:', expectedMintPda.toBase58());

    // Check each token account
    for (const { account } of tokenAccounts.value) {
      const tokenData = account.data.parsed.info;
      const mintAddress = new PublicKey(tokenData.mint);
      
      console.log('\nChecking token:', {
        mint: mintAddress.toBase58(),
        amount: tokenData.tokenAmount.uiAmount,
        decimals: tokenData.tokenAmount.decimals,
        symbol: tokenData.symbol || 'unknown'
      });

      // If this token's mint matches our PDA, consider verified (regardless of balance)
      if (mintAddress.equals(expectedMintPda)) {
        console.log('Found matching mint PDA! KYC verified!');
        return 'verified';
      }
    }

    console.log('No matching KYC token found');
    return 'unverified';
  } catch (error) {
    console.error('Error checking KYC token ownership:', error);
    return 'unverified';
  }
} 