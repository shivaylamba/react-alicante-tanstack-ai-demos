import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { inventory, quoteKit } from './contracts';
type Cart = { items: typeof inventory; total: number; add: (ids: string[]) => ReturnType<typeof quoteKit>; clear: () => void; remove: (id: string) => void };
const CartContext = createContext<Cart | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const current = useRef<string[]>([]);
  const [ids, setIds] = useState<string[]>([]);
  const add = useCallback((incoming: string[]) => {
    // One per product: replaying a completed action cannot duplicate a line.
    const merged = [...new Set([...current.current, ...incoming])];
    const result = quoteKit({ ids: merged, budget: 25 });
    current.current = merged; setIds(merged); return result;
  }, []);
  const clear = useCallback(() => { current.current = []; setIds([]); }, []);
  const remove = useCallback((id: string) => { current.current = current.current.filter(value => value !== id); setIds(current.current); }, []);
  const items = ids.map(id => inventory.find(p => p.id === id)!);
  return <CartContext.Provider value={{ items, total: items.reduce((sum, p) => sum + p.price, 0), add, clear, remove }}>{children}</CartContext.Provider>;
}
export function useCart() { const cart = useContext(CartContext); if (!cart) throw new Error('CartProvider is required'); return cart; }
export function StorefrontBar() {
  const cart = useCart();
  return <div className="storefront-bar"><strong>☀️ VAMOS ALICANTE</strong><span>Fictional shop · €25 budget</span><details><summary>Cart · {cart.items.length} items · €{cart.total}</summary><div className="cart-popover">{cart.items.length ? cart.items.map(p => <p key={p.id}>{p.name} · €{p.price} <button onClick={() => cart.remove(p.id)}>Remove {p.name}</button></p>) : <p>Your cart is empty.</p>}<p>No checkout. This cart resets on refresh.</p>{!!cart.items.length && <button onClick={cart.clear}>Empty demo cart</button>}</div></details></div>;
}
export function CatalogShelf() {
  return <div className="catalog-shelf">{inventory.map(p => <article key={p.id}><span>{p.icon}</span><strong>{p.name}</strong><b>€{p.price}</b><small>{p.stock ? `${p.stock} in stock` : 'Out of stock'}</small></article>)}</div>;
}
