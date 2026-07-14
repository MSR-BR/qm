(() => {
  const SITE_URL = "https://qm-beta.vercel.app";
  const COURSE_TITLE = "Quantum Mechanics";
  const AUTHOR_NAME = "Prof. Mario Reis";
  const PUBLISHER_NAME = "Institute of Physics — Fluminense Federal University";
  const DEFAULT_DESCRIPTION = "Interactive Quantum Mechanics book with chapters, favorites, and a personal study area by Prof. Mario Reis (IF-UFF).";
  const CHAPTER_META = {
    "01": {
      title: "Old quantum physics",
      description: "Experimental foundations, Bohr model, de Broglie hypothesis and semi-classical quantization."
    },
    "02": {
      title: "Construction of quantum theory I: wave mechanics",
      description: "Schrödinger equation, wave functions, postulates and uncertainty."
    },
    "03": {
      title: "Construction of quantum theory II: matrix mechanics",
      description: "State vectors, observables, commutation relations and time evolution."
    },
    "04": {
      title: "One-dimensional problems: bound and unbound states",
      description: "Harmonic oscillator, finite wells, scattering coefficients and one-dimensional potentials."
    },
    "05": {
      title: "Traditional problems with central potential",
      description: "Separation of variables, Hydrogen atom and three-dimensional harmonic oscillator."
    },
    "06": {
      title: "Angular momentum",
      description: "Angular momentum algebra, matrix representation and position-space representation."
    },
    "07": {
      title: "Addition of angular momenta",
      description: "Coupled bases, Clebsch-Gordan coefficients and applications to atomic angular momentum."
    },
    "08": {
      title: "Time-independent perturbation theory",
      description: "Non-degenerate and degenerate perturbation theory with physical applications."
    },
    "09": {
      title: "Time-dependent perturbation theory",
      description: "Interaction picture, coupled equations, Dyson series and magnetic resonance."
    },
    "10": {
      title: "Scattering: partial waves",
      description: "Scattering quantities, partial-wave expansion and spherical examples."
    },
    "11": {
      title: "Density operator",
      description: "Pure and mixed states, bipartite systems, partial trace and statistical mechanics connections."
    },
    "12": {
      title: "Entangled states",
      description: "Classical and quantum correlations, concurrence and entanglement of formation."
    },
    "13": {
      title: "Relativistic quantum mechanics",
      description: "Klein-Gordon and Dirac approaches, spinors, potentials and the Klein paradox."
    }
  };

  const PRIVATE_VIEWS = new Set(["saved", "favorites", "validation-review"]);

  function isIndexPage() {
    return /(^|\/)index\.html$/i.test(window.location.pathname) || window.location.pathname === "/";
  }

  function textContent(node) {
    return node && node.textContent ? node.textContent.replace(/\s+/g, " ").trim() : "";
  }

  function truncate(value, maxLength) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 1).trimEnd()}...`;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureMetaByName(name) {
    let node = document.head.querySelector(`meta[name="${name}"]`);
    if (!node) {
      node = document.createElement("meta");
      node.setAttribute("name", name);
      document.head.appendChild(node);
    }
    return node;
  }

  function ensureMetaByProperty(property) {
    let node = document.head.querySelector(`meta[property="${property}"]`);
    if (!node) {
      node = document.createElement("meta");
      node.setAttribute("property", property);
      document.head.appendChild(node);
    }
    return node;
  }

  function ensureCanonical() {
    let node = document.head.querySelector('link[rel="canonical"]');
    if (!node) {
      node = document.createElement("link");
      node.setAttribute("rel", "canonical");
      document.head.appendChild(node);
    }
    return node;
  }

  function ensureJsonLdNode() {
    let node = document.head.querySelector('script[data-termo-seo-runtime="true"]');
    if (!node) {
      node = document.createElement("script");
      node.type = "application/ld+json";
      node.setAttribute("data-termo-seo-runtime", "true");
      document.head.appendChild(node);
    }
    return node;
  }

  function buildCanonicalForIndex(view, chapterId) {
    const canonical = new URL(SITE_URL);

    if (view === "chapters" && chapterId) {
      canonical.searchParams.set("view", "chapters");
      canonical.searchParams.set("chapter", chapterId);
      return canonical.toString();
    }

    if (view === "simulators") {
      canonical.searchParams.set("view", "simulators");
      return canonical.toString();
    }

    return canonical.toString();
  }

  function buildIndexMeta() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view") || "chapters";
    const chapterId = params.get("chapter") || "";

    if (PRIVATE_VIEWS.has(view)) {
      return {
        title: `Personal area | ${COURSE_TITLE}`,
        description: "Personal area with favorites and study history for the interactive Quantum Mechanics book.",
        canonical: buildCanonicalForIndex("chapters", ""),
        robots: "noindex,nofollow,noarchive",
        ogType: "website",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `Personal area | ${COURSE_TITLE}`,
          description: "Personal study area.",
          isPartOf: {
            "@type": "WebSite",
            name: COURSE_TITLE,
            url: SITE_URL
          },
          inLanguage: "en"
        }
      };
    }

    if (view === "simulators") {
      return {
        title: `Quantum Mechanics simulators | ${COURSE_TITLE}`,
        description: "Yesuladores interativos de materiais complementares, exercises e recursos interativos.",
        canonical: buildCanonicalForIndex(view, chapterId),
        robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
        ogType: "website",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Quantum Mechanics simulators | ${COURSE_TITLE}`,
          description: "Collection of interactive Quantum Mechanics simulators.",
          url: buildCanonicalForIndex(view, chapterId),
          inLanguage: "en",
          isPartOf: {
            "@type": "WebSite",
            name: COURSE_TITLE,
            url: SITE_URL
          }
        }
      };
    }

    if (view === "chapters" && chapterId && CHAPTER_META[chapterId]) {
      const chapter = CHAPTER_META[chapterId];
      return {
        title: `${chapter.title} | Chapter ${Number(chapterId)} | ${COURSE_TITLE}`,
        description: truncate(`${chapter.description} Interactive material with teaching content, automatic exercises, and study support by Prof. Mario Reis.`, 170),
        canonical: buildCanonicalForIndex(view, chapterId),
        robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
        ogType: "website",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${chapter.title} | ${COURSE_TITLE}`,
          description: chapter.description,
          url: buildCanonicalForIndex(view, chapterId),
          inLanguage: "en",
          isPartOf: {
            "@type": "Course",
            name: COURSE_TITLE,
            provider: {
              "@type": "CollegeOrUniversity",
              name: PUBLISHER_NAME
            }
          }
        }
      };
    }

    return {
      title: `${COURSE_TITLE} | Interactive Quantum Mechanics book`,
      description: DEFAULT_DESCRIPTION,
      canonical: buildCanonicalForIndex(view, chapterId),
      robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
      ogType: "website",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: COURSE_TITLE,
          url: SITE_URL,
          inLanguage: "en"
        },
        {
          "@context": "https://schema.org",
          "@type": "Course",
          name: COURSE_TITLE,
          description: DEFAULT_DESCRIPTION,
          provider: {
            "@type": "CollegeOrUniversity",
            name: PUBLISHER_NAME
          },
          creator: {
            "@type": "Person",
            name: AUTHOR_NAME
          },
          url: SITE_URL
        }
      ]
    };
  }

  function applyMeta(meta) {
    document.title = meta.title;
    document.documentElement.lang = "en";

    ensureMetaByName("description").setAttribute("content", meta.description);
    ensureMetaByName("author").setAttribute("content", AUTHOR_NAME);
    ensureMetaByName("robots").setAttribute("content", meta.robots);
    ensureMetaByName("googlebot").setAttribute("content", meta.robots);
    ensureMetaByName("theme-color").setAttribute("content", "#C66A1A");

    ensureMetaByProperty("og:locale").setAttribute("content", "pt_BR");
    ensureMetaByProperty("og:type").setAttribute("content", meta.ogType);
    ensureMetaByProperty("og:site_name").setAttribute("content", COURSE_TITLE);
    ensureMetaByProperty("og:title").setAttribute("content", meta.title);
    ensureMetaByProperty("og:description").setAttribute("content", meta.description);
    ensureMetaByProperty("og:url").setAttribute("content", meta.canonical);

    ensureMetaByName("twitter:card").setAttribute("content", "summary");
    ensureMetaByName("twitter:title").setAttribute("content", meta.title);
    ensureMetaByName("twitter:description").setAttribute("content", meta.description);

    ensureCanonical().setAttribute("href", meta.canonical);

    ensureJsonLdNode().textContent = JSON.stringify(meta.jsonLd);
  }

  function updateIndexSeo() {
    if (!isIndexPage()) return;
    applyMeta(buildIndexMeta());
  }

  const originalReplaceState = window.history.replaceState;
  window.history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args);
    window.setTimeout(updateIndexSeo, 0);
    return result;
  };

  const originalPushState = window.history.pushState;
  window.history.pushState = function (...args) {
    const result = originalPushState.apply(this, args);
    window.setTimeout(updateIndexSeo, 0);
    return result;
  };

  window.addEventListener("popstate", updateIndexSeo);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateIndexSeo, { once: true });
  } else {
    updateIndexSeo();
  }
})();
