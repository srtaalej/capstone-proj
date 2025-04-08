"use client";

import { WalletContextProvider } from "./wallet_provider";
import { ReactNode } from "react";

export default function ClientWalletWrapper({ children }: { children: ReactNode }) {
  return <WalletContextProvider>{children}</WalletContextProvider>;
} 