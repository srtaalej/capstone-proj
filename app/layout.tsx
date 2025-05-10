import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/app/components/common/navbar";
import Footer from "@/app/components/common/footer_card";
import { WalletContextProvider } from "@/app/components/context/wallet_provider";
import "@solana/wallet-adapter-react-ui/styles.css";


export const metadata: Metadata = {
  title: "BlockVote",
  description: "Decentralized voting platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className= "antialiased">
        <div suppressHydrationWarning>
          <WalletContextProvider>
            <Navbar />
            {children}
            <Footer />
          </WalletContextProvider>
        </div>
      </body>
    </html>
  );
}
