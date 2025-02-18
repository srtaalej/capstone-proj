use anchor_lang::prelude::*;

declare_id!("F2KMtCzRhtG5kvc9R4Av37GCrhGzjDLbrE9TwEJcdozm");

#[program]
pub mod nft_id_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
