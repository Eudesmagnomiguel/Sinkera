import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product';
}

export function SEO({ title, description, image, url, type = 'website' }: SEOProps) {
  const siteName = 'Sinkera';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — Tecnologia em Angola`;
  const desc =
    description ||
    'A maior loja de tecnologia e electrónica de Angola. Smartphones, computadores, TV e muito mais.';
  const ogImage = image || '/og-image.png';
  const ogUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);

  useEffect(() => {
    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta('description', desc);
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', desc, 'property');
    setMeta('og:image', ogImage, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:site_name', siteName, 'property');
    setMeta('og:url', ogUrl, 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', ogImage);
  }, [fullTitle, desc, ogImage, ogUrl, type]);

  return null;
}
