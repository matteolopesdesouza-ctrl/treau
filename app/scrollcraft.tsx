'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** One-shot entrance effects; no page-wide scroll listener or React renders per frame. */
export default function Scrollcraft() {
  const path = usePathname();
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches || typeof IntersectionObserver === 'undefined') return;
    const seen = new Set<Element>();
    const root = document.querySelector('#main');
    let scanFrame = 0;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('craft-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0, rootMargin: '0px 0px 30px 0px' });
    const scan = () => {
      scanFrame = 0;
      document.querySelectorAll('.campaign-section-heading,.drop-products > article,.shop-grid > article,.collections-page > h1,.collection-cover,.about-story > article,.rotation-heading,.worlds-heading,.newsletter > div,.newsletter form,.footer-top > div').forEach(el => {
        if (seen.has(el)) return;
        seen.add(el); el.classList.add('craft-reveal'); observer.observe(el);
      });
    };
    scan();
    const mutation = new MutationObserver(() => { if (!scanFrame) scanFrame = requestAnimationFrame(scan); });
    if (root) mutation.observe(root, { childList: true, subtree: true });
    const stopMotion = () => { if (reduced.matches) seen.forEach(el => el.classList.add('craft-visible')); };
    reduced.addEventListener('change', stopMotion);
    return () => {
      observer.disconnect(); mutation.disconnect(); cancelAnimationFrame(scanFrame);
      reduced.removeEventListener('change', stopMotion);
      seen.forEach(el => el.classList.remove('craft-reveal', 'craft-visible'));
    };
  }, [path]);
  return null;
}
