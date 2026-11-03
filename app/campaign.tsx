'use client';

import { CSSProperties, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, Heart, Plus } from 'lucide-react';
import { Product, SiteSettings, imageStyle, money, collectionArtIndex } from '../lib/catalog';

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const worldImages = ['/images/tee.webp', '/images/campaign-night.webp', '/images/hoodie.webp', '/images/campaign.webp'];
const worldDescriptions = ['Les essentiels, à votre façon.', 'Quand la ville change de rythme.', 'Le bleu comme point de départ.', 'Une autre idée du quotidien.'];

/** One scroll observer writes transform variables, without React renders per frame. */
function useCampaignMotion(root: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!root.current || matchMedia('(max-width: 700px), (prefers-reduced-motion: reduce)').matches) return;
    const scenes = Array.from(root.current.querySelectorAll<HTMLElement>('[data-motion-scene]'));
    const worlds = root.current.querySelector<HTMLElement>('.worlds-scene');
    const track = root.current.querySelector<HTMLElement>('.worlds-track');
    let frame = 0;
    let lastY = window.scrollY;
    let lastTime = performance.now();
    const measure = () => {
      if (worlds && track) worlds.style.setProperty('--travel', `${Math.max(0, track.scrollWidth - worlds.clientWidth)}px`);
    };
    let bounds: {element: HTMLElement; top: number; height: number}[] = [];
    const measureScenes = () => { bounds = scenes.map(element => ({element, top: element.getBoundingClientRect().top + window.scrollY, height: element.offsetHeight})); };
    const update = (time: number) => {
      const y = window.scrollY;
      const speed = clamp((y - lastY) / Math.max(16, time - lastTime) * 3, -16, 16);
      lastY = y;
      lastTime = time;
      for (const { element, top, height } of bounds) {
        const rect = {top: top - y, height};
        if (rect.top > window.innerHeight + 100 || rect.top + height < -100) continue;
        element.style.setProperty('--progress', String(clamp(-rect.top / Math.max(1, rect.height - window.innerHeight))));
        element.style.setProperty('--approach', String(clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height))));
        element.style.setProperty('--speed', `${speed}px`);
      }
      frame = 0;
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = () => { measure(); measureScenes(); scroll(); };
    const observer = new ResizeObserver(resize);
    if (track) observer.observe(track);
    observer.observe(root.current);
    measure();
    measureScenes();
    scroll();
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frame);
    };
  }, [root]);
}

export function CollectionProduct({ product, index = 0, wished, onWish, onQuickShop, className = '' }: {
  product: Product;
  index?: number;
  wished: boolean;
  onWish: () => void;
  onQuickShop: () => void;
  className?: string;
}) {
  const available = product.status === 'Published' && product.variants.some(v => v.stock > 0);
  return <article className={`product-card collection-product ${className}`}>
    <div className="collection-product-stage">
      <span className="collection-product-label">{product.slug === 'signature-hoodie' ? 'LA SIGNATURE' : product.collection}</span>
      <button className={`collection-product-wish ${wished ? 'selected' : ''}`} onClick={onWish}
        aria-label={`${wished ? 'Retirer des' : 'Ajouter aux'} favoris : ${product.name}`} aria-pressed={wished}>
        <Heart size={19} strokeWidth={1.4} fill={wished ? 'currentColor' : 'none'} />
      </button>
      <Link href={`/product/${product.slug}`} className="collection-product-image" aria-label={`Découvrir ${product.name}`}>
        <img src={product.image} alt={`${product.name} — ${product.colors[0]}`} style={imageStyle(product)} loading="lazy" />
        <span className="collection-product-explore"><ArrowUpRight size={24} /></span>
      </Link>
    </div>
    <div className="collection-product-info">
      <Link href={`/product/${product.slug}`}><h3>{product.name}</h3><span>{product.colors.join(' / ')} · Coupe oversize</span></Link>
      <strong>{product.comparePrice && <del>{money(product.comparePrice)}</del>}{money(product.price)}</strong>
    </div>
    <button className="collection-product-add" disabled={!available} onClick={onQuickShop}
      aria-label={available ? `Choisir la taille : ${product.name}` : `${product.name} est épuisé`}>
      <span>{available ? 'Choisir ma taille' : 'Épuisé'}</span><Plus size={18} strokeWidth={1.5} />
    </button>
  </article>;
}

export default function Campaign({ products, settings, wishlist, favorite, quickShop }: {
  products: Product[];
  settings: SiteSettings;
  wishlist: string[];
  favorite: (id: string) => void;
  quickShop: (product: Product) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  useCampaignMotion(root);
  const featured = products.filter(p => p.featured);
  const selection = (featured.length ? featured : products).slice(0, 3);
  const signature = products.find(p => p.slug === 'signature-hoodie') || products[0];
  const lookbook = settings.lookbook[0] && settings.lookbook[0] !== '/images/campaign.webp' ? settings.lookbook[0] : '/images/campaign-night.webp';
  const headline = settings.heroSubtitle.trim().split(/\s+/);
  const cta = settings.cta === 'SHOP THE DROP' ? 'DÉCOUVRIR LE DROP' : settings.cta;
  return <div className="treau-campaign" ref={root}>
    <section className="product-opening" aria-label="TREAU — Collection 001">
      <div className="opening-grid" aria-hidden="true" />
      <span className="opening-edition">{settings.heroTitle} STUDIO / COLLECTION 001</span>
      <div className="opening-piece">
        <span aria-hidden="true">001</span>
        {signature && <img src={signature.image} alt={`${signature.name}, la pièce signature TREAU`} fetchPriority="high" width="1000" height="1000" />}
        <div><span>LA PIÈCE SIGNATURE</span><strong>{signature ? money(signature.price) : 'COLLECTION 001'}</strong></div>
      </div>
      <div className="opening-copy"><span className="section-kicker">INDÉPENDANT. PAR NATURE.</span>
        <h1><span className="opening-first-line">{headline[0]}</span><span>{headline.slice(1).join(' ')}</span></h1>
        <p>Des volumes libres.<br />Une signature qui vous ressemble.</p>
        <Link href="/shop" className="campaign-cta cta-white">{cta}<ArrowUpRight size={21}/></Link>
      </div>
      <a href="#drop" className="opening-scroll">EXPLORER LE DROP<ArrowDown size={16}/></a>
    </section>

    <div className="campaign-announcement"><span>{settings.announcement}</span><ArrowUpRight size={15} /></div>

    <section className="drop-selection" id="drop">
      <div className="campaign-section-heading"><div><span className="section-kicker">LE DROP / 001</span><h2>LES PIÈCES<br />QUI RESTENT.</h2></div><div><p>Trois façons de prendre sa place.<br />La même liberté de mouvement.</p><Link href="/shop" className="campaign-text-link">TOUT VOIR<ArrowUpRight size={19} /></Link></div></div>
      <div className="drop-products">{selection.map((p, i) => <CollectionProduct key={p.id} product={p} index={i} wished={wishlist.includes(p.id)} onWish={() => favorite(p.id)} onQuickShop={() => quickShop(p)} className={`drop-product-${i}`} />)}</div>
      <div className="drop-bottom"><span>UNISEXE. SANS UNIFORME.</span><Link href="/shop">EXPLORER LA COLLECTION<ArrowRight size={17} /></Link></div>
    </section>

    <section className="kinetic-divider" aria-label="TREAU — Independent by design"><div aria-hidden="true">TREAU. MOVE DIFFERENT. TREAU.</div><div aria-hidden="true">INDEPENDENT BY DESIGN. TREAU.</div><span>VOTRE MOUVEMENT. VOTRE SIGNATURE.</span></section>

    {settings.sections.manifesto && <section className="attitude-scene" data-motion-scene>
      <div className="attitude-stage"><span className="section-kicker">L’ESPRIT TREAU</span><div className="attitude-photo"><img src="/images/campaign-night.webp" alt="Campagne TREAU, silhouettes en mouvement" loading="lazy" /></div>
        <h2 aria-label="Pas fait pour rentrer dans le cadre.">{['PAS FAIT', 'POUR RENTRER', 'DANS LE CADRE.'].map((line, i) => <span key={line} data-line={line} aria-hidden="true" style={{ '--line': i } as CSSProperties}><i>{line}</i></span>)}</h2>
        <div className="attitude-bottom"><p>Choisir son rythme.<br />Tracer sa propre ligne.</p><Link href="/about" className="campaign-text-link">NOTRE HISTOIRE<ArrowUpRight size={19} /></Link></div>
      </div>
    </section>}

    {settings.sections.anatomy && signature && <section className="signature-scene" data-motion-scene>
      <div className="signature-stage"><div className="signature-heading"><span className="section-kicker">LA SIGNATURE / 01</span><h2>LE POIDS<br />DU DÉTAIL.</h2><p>Une coupe ample.<br />Une présence qui reste.</p></div>
        <div className="signature-line" /><span className="signature-weight">420<small>GSM</small></span>
        <div className="signature-garment"><img src={signature.image} alt="Hoodie signature TREAU, coton épais et coupe ample" loading="lazy" /></div>
        <div className="signature-callout callout-fabric"><i /><span>COTON ÉPAIS<small>De la structure. Du caractère.</small></span></div>
        <div className="signature-callout callout-fit"><i /><span>COUPE OVERSIZE<small>Le mouvement avant tout.</small></span></div>
        <div className="signature-callout callout-detail"><i /><span>SIGNATURE DISCRÈTE<small>Juste ce qu’il faut.</small></span></div>
        <div className="signature-buy"><div><span>{signature.name}</span><strong>{money(signature.price)}</strong></div><button className="campaign-cta cta-blue" onClick={() => quickShop(signature)}>CHOISIR MA TAILLE<Plus size={20} /></button></div>
      </div>
    </section>}

    {settings.sections.collections && <section className="worlds-scene" data-motion-scene>
      <div className="worlds-stage"><div className="worlds-heading"><div><span className="section-kicker">UNE IDENTITÉ. PLUSIEURS UNIVERS.</span><h2>CHANGEZ DE PERSPECTIVE.</h2></div><span className="worlds-indicator">01<i />0{settings.collections.length}</span></div>
        <div className="worlds-track">{settings.collections.map((name, i) => <Link href={`/shop?collection=${encodeURIComponent(name)}`} key={name} className={`world-card world-card-${collectionArtIndex(name,i)}`}>
          <img src={worldImages[collectionArtIndex(name,i)]} alt={`Collection ${name}`} loading="lazy" /><span className="world-number">0{i + 1}</span><div><span>{worldDescriptions[collectionArtIndex(name,i)]}</span><h3>{name}</h3><i><ArrowUpRight size={25} /></i></div>
        </Link>)}</div>
      </div>
    </section>}

    {settings.sections.tunnel && <section className="rotation-scene" data-motion-scene>
      <div className="rotation-stage"><div className="rotation-heading"><span className="section-kicker">VOS ESSENTIELS. VOTRE ROTATION.</span><h2>À VOTRE FAÇON.</h2><Link href="/shop" className="campaign-text-link">LES {products.length} PIÈCES<ArrowUpRight size={19} /></Link></div>
        <div className="rotation-deck">{products.slice(0, 6).map((p, i) => <Link href={`/product/${p.slug}`} className="rotation-card" key={p.id} style={{ '--i': i, '--offset': i - Math.min(products.length, 6) / 2 + .5 } as CSSProperties}>
          <span>0{i + 1}</span><img src={p.image} style={imageStyle(p)} alt={p.name} loading="lazy" /><div><h3>{p.name}</h3><small>{money(p.price)} / {p.colors[0]}</small></div>
        </Link>)}</div>
        <p className="rotation-note">La pièce fait partie du look. Vous faites le reste.</p>
      </div>
    </section>}

    {settings.sections.ticker && <section className="movement-type" data-motion-scene aria-label="Votre mouvement. Vos règles."><div>VOTRE MOUVEMENT. VOTRE MOUVEMENT.</div><div>VOS RÈGLES. VOS RÈGLES.</div><span>TREAU — MOVE DIFFERENT.</span></section>}

    {settings.sections.lookbook && <section className="city-scene" data-motion-scene>
      <div className="city-stage"><div className="city-image"><img src={lookbook} alt="TREAU, campagne dans la ville après la tombée du jour" loading="lazy" /></div><div className="city-shade" />
        <span className="city-label">LOOKBOOK / COLLECTION 001</span><div className="city-copy"><h2>VOTRE VILLE.<br />VOTRE TERRAIN.</h2><p>La collection prend vie.<br />À vous d’écrire la suite.</p><Link href="/collections" className="campaign-cta cta-white">VOIR LE LOOKBOOK<ArrowUpRight size={20} /></Link></div><span className="city-end">TREAU STUDIO — LE PREMIER CHAPITRE.</span>
      </div>
    </section>}
  </div>;
}
