'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { COLORS, Product, imageStyle, money } from '../lib/catalog';
import { availableToAdd } from '../lib/storefront-state';

type CartLine = { id: string; size: string; color: string; quantity: number };
export default function QuickShop({ product, cart, add, close }: {
  product: Product;
  cart: CartLine[];
  close: () => void;
  add: (product: Product, size: string, color: string, quantity: number) => void;
}) {
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : '');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const available = (s: string, c = color) => availableToAdd(product, cart, c, s);
  const stock = size ? available(size) : 0;
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!size) { setError('Choisissez votre taille pour continuer.'); return; }
    if (!stock || product.status !== 'Published') { setError('Cette taille n’est plus disponible.'); return; }
    if (quantity > stock) { setError('Cette quantité n’est plus disponible. Réduisez-la pour continuer.'); return; }
    add(product, size, color, quantity);
  }
  return <form className="quick-shop-form" onSubmit={submit}>
    <div className="quick-shop-image"><img src={product.image} style={imageStyle(product, color)} alt={`${product.name} — ${color}`} /></div>
    <div className="quick-shop-body"><span className="section-kicker">{product.collection}</span>
      <div className="quick-shop-title"><h2>{product.name}</h2><strong>{money(product.price)}</strong></div>
      <p>Une coupe ample. Votre taille habituelle pour un volume oversize.</p>
      <fieldset className="quick-shop-colors"><legend>Couleur : {color}</legend><div>{product.colors.map(c => <button type="button" key={c}
        onClick={() => { setColor(c); setSize(product.sizes.length === 1 ? product.sizes[0] : ''); setQuantity(1); setError(''); }}
        aria-pressed={color === c} className={color === c ? 'selected' : ''}><i style={{ background: COLORS[c] || '#777' }} />{c}</button>)}</div></fieldset>
      <fieldset className="quick-shop-sizes"><legend>Votre taille</legend><div>{product.sizes.map(s => <button type="button" key={s}
        disabled={available(s) < 1} aria-pressed={size === s} className={size === s ? 'selected' : ''}
        onClick={() => { setSize(s); setQuantity(1); setError(''); }}>{s}</button>)}</div></fieldset>
      <div className="quick-shop-quantity"><span>Quantité</span><div className="quantity"><button type="button" disabled={quantity <= 1} aria-label="Diminuer la quantité" onClick={() => setQuantity(quantity - 1)}><Minus size={14} /></button><span>{quantity}</span><button type="button" disabled={!size || quantity >= stock} aria-label="Augmenter la quantité" onClick={() => setQuantity(quantity + 1)}><Plus size={14} /></button></div></div>
      {error && <p className="quick-shop-error" role="alert">{error}</p>}
      <button className="campaign-cta cta-black quick-shop-submit" type="submit">AJOUTER AU PANIER — {money(product.price * quantity)}<Plus size={20} /></button>
      <Link href={`/product/${product.slug}`} className="quick-shop-details" onClick={close}>Tous les détails de la pièce<ArrowRight size={17} /></Link>
    </div>
  </form>;
}
