import { IdlTypes, TypeDef } from "@project-serum/anchor";
import type { NftIdContract as NftIdContractIDL } from "../target/types/nft_id_contract";

export type NftIdContract = NftIdContractIDL;

export type InitTokenParams = TypeDef<
  {
    name: string;
    dob: string;
    gender: string;
  },
  IdlTypes<NftIdContract>
>;

export type TokenData = TypeDef<
  {
    hashedName: number[];
    hashedDob: number[];
    hashedGender: number[];
    isActive: boolean;
  },
  IdlTypes<NftIdContract>
>;

export type TokenRegistry = TypeDef<
  {
    records: TokenData[];
  },
  IdlTypes<NftIdContract>
>; 