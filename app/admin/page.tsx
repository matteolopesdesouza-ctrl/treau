import './studio.css';
import Link from 'next/link';
import { getChatGPTUser,chatGPTSignInPath } from '../chatgpt-auth';
import {isAdmin} from '../../lib/server';
import AdminStudio from './studio';
export const dynamic='force-dynamic';
export default async function AdminPage(){const user=await getChatGPTUser();if(!user||!isAdmin(user))return <main className="admin-gate"><Link href="/" className="wordmark">TREAU®</Link><p className="eyebrow">PRIVATE STUDIO / ADMINISTRATION</p><h1>BEHIND<br/>THE <span className="serif">SCENES.</span></h1><p>{user?'Ce compte n’a pas accès à l’administration. Utilisez un compte autorisé dans la configuration du site.':'Connectez-vous avec votre compte administrateur pour gérer la boutique.'}</p><a className="button dark" href={chatGPTSignInPath('/admin')} target="_top">CONNEXION SÉCURISÉE ↗</a><Link className="text-link" href="/">RETOUR À TREAU</Link></main>;return <AdminStudio name={user.displayName}/>;}
