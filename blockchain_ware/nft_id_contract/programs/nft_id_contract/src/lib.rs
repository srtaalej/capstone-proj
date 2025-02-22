use anchor_lang::prelude::*;

declare_id!("CqQWuZSz2waA7QK9DoF6bUFcdmLhuw2oveDqrLP9gzRv");

#[program]
pub mod nft_id_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Hello there from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
