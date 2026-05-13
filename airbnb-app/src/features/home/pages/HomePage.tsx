import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../../../shared/components/Footer';
import { Chatbox } from '../../../shared/components/Chatbox';

/**
 * Pixel-perfect Home page (ListOn "Home (Main)"):
 * - Fetches the original template HTML we saved in /public/liston-v2.3/index.html
 * - Injects the body markup (minus footer + scripts) into the React page
 * - Loads the template JS (jQuery + plugins) only for this route
 *
 * NOTE: Links inside the injected HTML are left as-is (they are part of the template).
 */

const TEMPLATE_URL = '/liston-v2.3/index.html';

const LISTON_SCRIPTS = [
  '/liston-v2.3/assets/plugins/jQuery/jquery.min.js',
  '/liston-v2.3/assets/plugins/bootstrap/js/bootstrap.bundle.min.js',
  '/liston-v2.3/assets/plugins/aos/aos.min.js',
  '/liston-v2.3/assets/plugins/macy/macy.js',
  '/liston-v2.3/assets/plugins/simple-parallax/simpleParallax.min.js',
  '/liston-v2.3/assets/plugins/OwlCarousel2/owl.carousel.min.js',
  '/liston-v2.3/assets/plugins/theia-sticky-sidebar/ResizeSensor.min.js',
  '/liston-v2.3/assets/plugins/theia-sticky-sidebar/theia-sticky-sidebar.min.js',
  '/liston-v2.3/assets/plugins/waypoints/jquery.waypoints.min.js',
  '/liston-v2.3/assets/plugins/counter-up/jquery.counterup.min.js',
  '/liston-v2.3/assets/plugins/jquery-fancyfileuploader/fancy-file-uploader/jquery.ui.widget.js',
  '/liston-v2.3/assets/plugins/jquery-fancyfileuploader/fancy-file-uploader/jquery.fileupload.js',
  '/liston-v2.3/assets/plugins/jquery-fancyfileuploader/fancy-file-uploader/jquery.iframe-transport.js',
  '/liston-v2.3/assets/plugins/jquery-fancyfileuploader/fancy-file-uploader/jquery.fancy-fileupload.js',
  '/liston-v2.3/assets/plugins/ion.rangeSlider/ion.rangeSlider.min.js',
  '/liston-v2.3/assets/plugins/magnific-popup/jquery.magnific-popup.min.js',
  '/liston-v2.3/assets/plugins/select2/select2.min.js',
  '/liston-v2.3/assets/js/script.js',
] as const;

function extractBody(html: string) {
  const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return m ? m[1] : html;
}

function removeFooterAndScripts(bodyHtml: string) {
  // Remove the first footer on the page; our React <Footer/> renders the template footer.
  const withoutFooter = bodyHtml.replace(/<footer[\s\S]*?<\/footer>/i, '');
  // Remove any script tags from the template body.
  return withoutFooter.replace(/<script[\s\S]*?<\/script>/gi, '');
}

function rewriteAssetPaths(bodyHtml: string) {
  // Convert: src="assets/..." / href="assets/..." / data-src="assets/..." to "/liston-v2.3/assets/..."
  return bodyHtml
    .replace(/\b(src|href|data-src)=["']assets\//gi, (_m, attr) => `${attr}="/liston-v2.3/assets/`)
    .replace(/url\(\s*(['"]?)assets\//gi, 'url($1/liston-v2.3/assets/');
}

function normalizeTemplateNavigation(bodyHtml: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(bodyHtml, 'text/html');

  // Remove "Template" top-level nav entry.
  doc.querySelectorAll('a.nav-link').forEach(link => {
    const text = (link.textContent || '').trim().toLowerCase();
    if (text === 'template') {
      link.closest('li.nav-item')?.remove();
    }
  });

  // Remove dropdown behavior from top nav: Home, Dashboard, Listing(s)
  // We keep them as plain links to React routes.
  doc.querySelectorAll('li.nav-item.dropdown').forEach(li => {
    const a = li.querySelector<HTMLAnchorElement>('a.nav-link');
    const label = (a?.textContent || '').trim().toLowerCase();
    const isTarget =
      label === 'home' ||
      label.startsWith('home') ||
      label === 'dashboard' ||
      label === 'listing' ||
      label === 'listings';

    if (!a || !isTarget) return;

    // Remove dropdown menu DOM (so no flyout)
    li.querySelector('.dropdown-menu')?.remove();

    // Make anchor a normal link
    a.removeAttribute('data-bs-toggle');
    a.removeAttribute('aria-expanded');
    a.classList.remove('dropdown-toggle');
    a.setAttribute('role', 'link');
    a.setAttribute('href',
      label === 'dashboard'
        ? '/dashboard'
        : (label === 'listing' || label === 'listings')
          ? '/listings'
          : '/',
    );

    // Ensure li is not treated as dropdown
    li.classList.remove('dropdown');
  });

  // Point key auth/dashboard links to React routes.
  doc.querySelectorAll('a').forEach(link => {
    const text = (link.textContent || '').trim().toLowerCase();
    if (text === 'dashboard') link.setAttribute('href', '/dashboard');
    if (text === 'sign in') link.setAttribute('href', '/login');
    if (text === 'sign up') link.setAttribute('href', '/signup');
    if (text === 'explore') link.setAttribute('href', '/explore');
    if (text === 'home (main)' || text === 'home') link.setAttribute('href', '/');

    const href = link.getAttribute('href') || '';
    if (href.includes('dashboard/dashboard.html')) link.setAttribute('href', '/dashboard');
    if (href.includes('dashboard/review.html')) link.setAttribute('href', '/dashboard/reviews');
    if (href.includes('dashboard/wallet.html')) link.setAttribute('href', '/dashboard/wallet');
    if (href.includes('dashboard/booking.html')) link.setAttribute('href', '/dashboard/bookings');
    if (href.includes('dashboard/message.html')) link.setAttribute('href', '/dashboard/messages');
    if (href.includes('dashboard/notification.html')) link.setAttribute('href', '/dashboard/notifications');
    if (href.includes('dashboard/settings.html')) link.setAttribute('href', '/dashboard/settings');
    if (href.includes('dashboard/bookmark.html')) link.setAttribute('href', '/dashboard/saved');
    if (href.includes('listings-list-with-sidebar.html')) link.setAttribute('href', '/listings');
    if (href.includes('listings-list-no-sidebar.html')) link.setAttribute('href', '/listings');
    if (href.includes('listings-list-left.html')) link.setAttribute('href', '/listings');
    // Template uses both "signin.html" and "sign-in.html"
    if (href.includes('sign-in.html') || href.includes('signin.html')) link.setAttribute('href', '/login');
    if (href.includes('sign-up.html')) link.setAttribute('href', '/signup');
  });

  return doc.body.innerHTML;
}

function loadScriptSequentially(urls: readonly string[], tag: string) {
  const alreadyLoaded = (url: string) =>
    document.querySelector<HTMLScriptElement>(`script[data-liston-src="${url}"]`) != null;

  const loadOne = (url: string) =>
    new Promise<void>((resolve, reject) => {
      if (alreadyLoaded(url)) return resolve();
      const s = document.createElement('script');
      s.src = url;
      s.async = false; // keep execution order
      s.defer = true;
      s.dataset.listonSrc = url;
      s.dataset.listonTag = tag;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${url}`));
      document.body.appendChild(s);
    });

  return urls.reduce((p, url) => p.then(() => loadOne(url)), Promise.resolve());
}

function cleanupScripts(tag: string) {
  document.querySelectorAll(`script[data-liston-tag="${tag}"]`).forEach(n => n.remove());
}

export default function HomePage() {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [rawHtml, setRawHtml] = useState<string>('');
  const [error, setError] = useState<string>('');

  const pageHtml = useMemo(() => {
    if (!rawHtml) return '';
    const body = extractBody(rawHtml);
    const stripped = removeFooterAndScripts(body);
    const rewritten = rewriteAssetPaths(stripped);
    return normalizeTemplateNavigation(rewritten);
  }, [rawHtml]);

  useEffect(() => {
    let cancelled = false;
    setError('');

    fetch(TEMPLATE_URL)
      .then(r => r.text())
      .then(t => {
        if (cancelled) return;
        setRawHtml(t);
      })
      .catch(e => {
        if (cancelled) return;
        setError(String(e));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const tag = 'liston-home-main';
    if (!pageHtml) return;

    loadScriptSequentially(LISTON_SCRIPTS, tag).catch(() => {
      // Keep the page usable even if some plugin JS fails to load.
    });

    return () => cleanupScripts(tag);
  }, [pageHtml]);

  // Ensure template <a href="/..."> uses client-side navigation (no full reload),
  // so ProtectedRoute can redirect to /login immediately for /dashboard.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const routeFromHref = (href: string) => {
      const h = href.trim();
      if (!h) return null;
      if (h.startsWith('/')) return h;

      const lower = h.toLowerCase();
      // Template-style relative pages → React routes
      if (lower.includes('dashboard/') || lower.endsWith('dashboard.html')) return '/dashboard';
      if (lower.includes('listings-') || lower.includes('listings/')) return '/listings';
      if (lower.includes('explore')) return '/explore';
      if (lower.includes('sign-in')) return '/login';
      if (lower.includes('sign-up')) return '/signup';
      if (lower === 'index.html' || lower === './' || lower === '.') return '/';
      return null;
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.('a') as HTMLAnchorElement | null;
      if (!a) return;

      const href = a.getAttribute('href') || '';
      if (!href) return;

      // Ignore external links, hash links, mailto/tel, and new-tab clicks
      if (
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) return;
      if (a.target === '_blank') return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // Prefer explicit mapping by link text for nav entries
      const text = (a.textContent || '').trim().toLowerCase();
      const next =
        text.includes('dashboard') ? '/dashboard'
        : (text === 'home' || text.includes('home')) ? '/'
        : (text === 'listing' || text === 'listings' || text.includes('listing')) ? '/listings'
        : (text.includes('explore')) ? '/explore'
        : routeFromHref(href);
      if (!next) return;

      e.preventDefault();
      e.stopPropagation();
      navigate(next);
    };

    // Capture phase so template/jQuery handlers can’t hijack navigation.
    root.addEventListener('click', onClick, true);
    return () => root.removeEventListener('click', onClick, true);
  }, [navigate, pageHtml]);

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <div>Failed to load the ListOn template HTML: {error}</div>
        <Footer />
      </div>
    );
  }

  if (!pageHtml) {
    return (
      <div style={{ padding: 24 }}>
        <div>Loading Home page…</div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <div ref={rootRef} dangerouslySetInnerHTML={{ __html: pageHtml }} />
      <Footer />
      <Chatbox />
      {/* Hide any template floating widgets/decorations */}
      <style>{`
        /* Hide ALL floating decorative elements from template */
        [class*="float"],
        [class*="widget"],
        [class*="decoration"],
        [id*="float"],
        [id*="widget"],
        .template-widget,
        .floating-decoration,
        img[src*="palm"],
        img[src*="tree"],
        img[src*="tropical"],
        img[src*="island"],
        img[src*="beach"],
        img[src*="vacation"],
        /* Hide any circular badge/icon that's not our chatbox */
        div[style*="position: fixed"][style*="bottom"][style*="right"]:not([style*="z-index: 999"]),
        /* Hide template chat widgets */
        .chat-widget,
        .whatsapp-widget,
        .messenger-widget,
        #tawk-bubble,
        #tidio-chat,
        .crisp-client,
        /* Aggressive hiding of bottom-right elements except our chatbox */
        body > div:not(#root) > div[style*="position: fixed"][style*="bottom"][style*="right"],
        body > div:not(#root) > button[style*="position: fixed"][style*="bottom"][style*="right"],
        body > div:not(#root) > a[style*="position: fixed"][style*="bottom"][style*="right"],
        /* Hide any element with tropical/vacation imagery */
        *[style*="background-image"][style*="palm"],
        *[style*="background-image"][style*="tree"],
        *[style*="background-image"][style*="tropical"],
        *[style*="background-image"][style*="island"],
        *[style*="background-image"][style*="beach"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        /* Ensure only our chatbox is visible in bottom-right */
        body > div:not(#root) {
          z-index: 998 !important;
        }
        
        /* Force hide any iframe widgets */
        iframe[src*="chat"],
        iframe[src*="widget"],
        iframe[src*="messenger"] {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

