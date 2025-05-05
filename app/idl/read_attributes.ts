import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("GgLTHPo25XiFsQJAkotD3KPiyMFeypJhUSx4UVcxfjcj");
const mint      = new PublicKey("2VQ3A6DuWtDnHAHgzdEmAza9UoNf1Lwj2nukNCXRz8uR");

const [pda] = PublicKey.findProgramAddressSync(
  [Buffer.from("token_data"), mint.toBuffer()],
  programId
);

console.log("token_data PDA:", pda.toBase58());