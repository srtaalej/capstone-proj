import './globals.css'
import AppWalletProvider from './components/AppWalletProvider'
import { ReactQueryProvider } from './react-query-provider'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import ReduxProvider from './components/providers/ReduxProvider'
import { WalletContextProvider } from "./components/context/wallet_provider";
import Navbar from "./components/common/navbar";
import "@solana/wallet-adapter-react-ui/styles.css";
import KycStatusProvider from './components/providers/KycStatusProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-900">
        <div suppressHydrationWarning>
          <ReactQueryProvider>
            <ReduxProvider>
              <WalletContextProvider>
                <AppWalletProvider>
                  <KycStatusProvider>
                    <Navbar />
                    <main className="max-w-6xl mx-auto min-h-screen">
                      {children}
                    </main>
                  </KycStatusProvider>
                  <ToastContainer
                    position="bottom-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                  />
                </AppWalletProvider>
              </WalletContextProvider>
            </ReduxProvider>
          </ReactQueryProvider>
        </div>
      </body>
    </html>
  )
}