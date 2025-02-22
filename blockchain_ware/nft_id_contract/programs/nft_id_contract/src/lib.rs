use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use mpl_token_metadata::instruction::create_metadata_accounts_v3;
use borsh::{BorshSerialize, BorshDeserialize};

declare_id!("CqQWuZSz2waA7QK9DoF6bUFcdmLhuw2oveDqrLP9gzRv");

#[program]
pub mod nft_id_contract {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        name: String,
        symbol: String,
        uri: String
    ) -> Result<()> {
        msg!("Minting NFT: {}", name);

        let metadata_instruction = create_metadata_accounts_v3(
            ctx.accounts.metadata_program.key(),
            ctx.accounts.metadata.key(),
            ctx.accounts.mint.key(),
            ctx.accounts.authority.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.authority.key(),
            name,
            symbol,
            uri,
            None,         // No creators
            true,         // Update authority is signer
            false,        // Is mutable?
            None,
            None,
        );

        // Invoke the instruction to create metadata
        anchor_lang::solana_program::program::invoke(
            &metadata_instruction,
            &[
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.metadata_program.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        msg!("NFT Minted Successfully!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = authority
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        space = 8 + 200, 
        seeds = [b"metadata", metadata_program.key().as_ref(), mint.key().as_ref()],
        bump
    )]
    pub metadata: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(address = mpl_token_metadata::ID)]
    pub metadata_program: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,

    pub bump: u8,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum MetadataInstruction {
    Mint(MintArgs),
    Transfer(TransferArgs),
    Update(UpdateArgs),
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum MintArgs {
    ExampleField(u64),
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum TransferArgs {
    TransferField(String),
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum UpdateArgs {
    UpdateField(String),
}
