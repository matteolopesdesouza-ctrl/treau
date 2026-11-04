# Rétablissement de l’adresse Netlify de TREAU

Ce dossier publie une redirection temporaire HTTP 302 de toutes les routes Netlify vers https://treau-studio.matteolopesdesouza.chatgpt.site.

L’application, son catalogue, sa base D1, ses médias R2 et sa connexion continuent à fonctionner sur leur hébergement actuel. Le serveur du dépôt utilise Vinext et Cloudflare Workers ; une compilation Next.js Netlify ne peut pas le remplacer directement.

Le fichier `netlify.toml` à la racine fixe le dossier de base à `netlify`, la commande à `npm run build` et le dossier publié à `public`. Ce paquet ne nécessite aucune dépendance et ne lance pas le serveur Cloudflare pendant le déploiement Netlify.

`public/_redirects` conserve le chemin demandé grâce à `:splat` et utilise un statut temporaire, afin de permettre une migration ultérieure. Une page HTML avec redirection et lien explicite couvre aussi l’ouverture du dossier publié comme site statique.

Vérification : `cd netlify && npm ci --ignore-scripts --no-audit --no-fund && npm run build`.
