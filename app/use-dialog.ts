'use client';
import { useEffect, useRef } from 'react';

export function useDialog(key: string | null, close: () => void, selector: string, fallback?: () => HTMLElement | null) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!key) return;
    const dialog = document.querySelector<HTMLElement>(selector);
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const scrollY = window.scrollY;
    const url = location.href;
    const body = document.body;
    const originalStyle = body.getAttribute('style');
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (matchMedia('(max-width: 700px)').matches) {
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
    }
    if (scrollbar) body.style.paddingRight = `${scrollbar}px`;
    const background = Array.from(document.querySelectorAll<HTMLElement>('main,.site-header,.newsletter,.footer,.admin-sidebar,.admin-topbar,.admin-bottom')).filter(el => !el.contains(dialog) && !dialog.contains(el) && !el.inert);
    background.forEach(el => { el.inert = true; });
    const controls = () => Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')).filter(el => el.getClientRects().length > 0 && el.tabIndex >= 0);
    const initial = dialog.querySelector<HTMLElement>('input[type="search"],.search-input input') || controls()[0] || dialog;
    initial.focus({ preventScroll: true });
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const nodes = controls();
      const first = nodes[0] || dialog, last = nodes[nodes.length - 1] || dialog;
      if (!dialog.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keyboard);
    return () => {
      document.removeEventListener('keydown', keyboard);
      background.forEach(el => { el.inert = false; });
      if (originalStyle === null) body.removeAttribute('style'); else body.setAttribute('style', originalStyle);
      if (location.href === url) {
        window.scrollTo({ top: scrollY, behavior: 'instant' });
        const target = previous?.isConnected && !previous.closest('[inert]') ? previous : fallback?.();
        target?.focus({ preventScroll: true });
      }
    };
  }, [key, selector]);
}
