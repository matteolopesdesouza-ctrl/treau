import type { Metadata } from 'next';
import './globals.css';
import './buttons.css';
import './campaign.css';
import './scrollcraft.css';
export const metadata:Metadata={title:'TREAU — Move Different.',description:'Une silhouette. Vos propres règles. Collection 001 : un studio streetwear indépendant.',icons:{icon:'/brand/treau-logo.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>;}
