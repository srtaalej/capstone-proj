import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { createClient } from "./client"; // your supabase client


const supabase = createClient();


export function useIsAdmin() {
  const { publicKey } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!publicKey) return;


    const checkAdmin = async () => {
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("wallet", publicKey.toBase58())
        .single();


      setIsAdmin(!!data && !error);
      setLoading(false);
    };


    checkAdmin();
  }, [publicKey]);


  return { isAdmin, loading };
}


