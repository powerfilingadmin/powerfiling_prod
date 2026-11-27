import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import blogs from "../data/blogs.json";
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  pageSeo,
  serviceSeo,
  NOINDEX_PREFIXES,
  DUPLICATE_PATHS,
} from "../data/seoData";

const normalize = (pathname) => {
  const p = pathname.replace(/\/+$/, "");
  return p === "" ? "/" : p;
};

/**
 * Work out the SEO values for the current URL.
 * Returns { title, description, canonicalPath, noindex, ogType }
 */
const resolveSeo = (pathname) => {
  const path = normalize(pathname);

  // 1. Duplicate URL (e.g. /terms-and-conditions) -> canonical is the main URL
  if (DUPLICATE_PATHS[path]) {
    const target = DUPLICATE_PATHS[path];
    return { ...pageSeo[target], canonicalPath: target, noindex: false };
  }

  // 2. Private / transactional pages -> never index
  if (NOINDEX_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return {
      title: `Account | ${SITE_NAME}`,
      description: "",
      canonicalPath: null,
      noindex: true,
    };
  }

  // 3. Fixed pages (home, calculators, legal, blog list ...)
  if (pageSeo[path]) {
    return { ...pageSeo[path], canonicalPath: path, noindex: false };
  }

  // 4. Service pages  /services/:serviceId
  if (path.startsWith("/services/")) {
    const id = path.split("/")[2];
    if (serviceSeo[id]) {
      return { ...serviceSeo[id], canonicalPath: `/services/${id}`, noindex: false };
    }
  }

  // 5. Blog posts  /blog/:id
  if (path.startsWith("/blog/")) {
    const id = path.split("/")[2];
    const post = blogs.find((b) => b.id === id);
    if (post) {
      return {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        canonicalPath: `/blog/${id}`,
        noindex: false,
        ogType: "article",
      };
    }
  }

  // 6. Anything else is a "not found" page -> noindex
  return {
    title: `Page Not Found | ${SITE_NAME}`,
    description: "",
    canonicalPath: null,
    noindex: true,
  };
};

/**
 * Mount ONCE (in App.jsx). It reads the current URL and renders the correct
 * <title>, meta description, canonical, Open Graph and robots tags.
 * Query strings (?ref=...) are deliberately ignored in the canonical URL.
 */
const RouteSEO = () => {
  const { pathname } = useLocation();
  const seo = resolveSeo(pathname);
  const canonical = seo.canonicalPath ? `${SITE_URL}${seo.canonicalPath}` : null;

  return (
    <Helmet>
      <title>{seo.title}</title>
      {seo.description && <meta name="description" content={seo.description} />}
      <meta
        name="robots"
        content={seo.noindex ? "noindex, nofollow" : "index, follow"}
      />
      {canonical && <link rel="canonical" href={canonical} />}

      <meta property="og:title" content={seo.title} />
      {seo.description && (
        <meta property="og:description" content={seo.description} />
      )}
      <meta property="og:type" content={seo.ogType || "website"} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />

      <meta name="twitter:title" content={seo.title} />
      {seo.description && (
        <meta name="twitter:description" content={seo.description} />
      )}
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
    </Helmet>
  );
};

export default RouteSEO;
