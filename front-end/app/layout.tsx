import './globals.css'
import { VotingProvider } from '../context/VotingContext'

export const metadata = {
    title: 'Weighted Voting Platform',
    description: 'A decentralized governance platform with weighted voting',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <VotingProvider>
                    {children}
                </VotingProvider>
            </body>
        </html>
    )
}