use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub id: u64,
    // #[max_len(60)]
    // pub title: String,
    #[max_len(280)]
    pub description: String,
    pub start: u64,
    pub end: u64,

    // pub private: bool,
    pub candidates: u64,
}
