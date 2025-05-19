"use client";
import { useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useDispatch } from "react-redux";
import { globalActions } from "@/app/store/globalSlices";
import { checkKycNftOwnership } from "@/app/utils/kyc";

export default function KycStatusProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!connected || !publicKey) {
        dispatch(globalActions.setKycStatus("unknown"));
        return;
      }
      dispatch(globalActions.setKycStatus("checking"));
      const status = await checkKycNftOwnership(connection, publicKey);
      if (!cancelled) dispatch(globalActions.setKycStatus(status));
    };
    check();
    return () => { cancelled = true; };
  }, [connected, publicKey, connection, dispatch]);

  return <>{children}</>;
} 