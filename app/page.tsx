import Storefront from './storefront';
import { getCatalog,isAdmin } from '../lib/server';
import { getChatGPTUser } from './chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Page(){const [{products,settings},user]=await Promise.all([getCatalog(),getChatGPTUser()]);return <Storefront products={products} settings={settings} user={user?{...user,admin:isAdmin(user)}:null}/>;}
