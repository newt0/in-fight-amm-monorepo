import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@mysten/dapp-kit/dist/index.css'
import './wallet.css'
import SuiWalletProvider from '@/components/WalletProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '格斗直播预测市场',
  description: '实时格斗直播与预测交易平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <SuiWalletProvider>
          {children}
        </SuiWalletProvider>
      </body>
    </html>
  )
}

