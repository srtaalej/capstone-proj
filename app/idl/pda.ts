// read_pda.ts
import { AnchorProvider, Program, web3 } from "@project-serum/anchor";
import fs from "fs";

const idl = JSON.parse(fs.readFileSync("./nft_id_contract.json", "utf8"));

const connection = new web3.Connection("https://api.devnet.solana.com");
const dummy      = web3.Keypair.generate(); // read‑only wallet
const provider   = new AnchorProvider(connection, { publicKey: dummy.publicKey } as any, {});
const programId  = new web3.PublicKey("GgLTHPo25XiFsQJAkotD3KPiyMFeypJhUSx4UVcxfjcj");
const program    = new Program(idl as any, programId, provider);

(async () => {
  const pda = new web3.PublicKey("28Trd85jX8AqkKKZ9TSRMGTnwCgysE7jX8235FJW3suG");
  const data: any = await program.account.tokenData.fetch(pda);
  console.log({
    hashedName: Buffer.from(data.hashedName).toString("hex"),
    hashedDob:  Buffer.from(data.hashedDob ).toString("hex"),
    gender:     data.gender,
  });
})();
