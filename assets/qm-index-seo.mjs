// C26: one metadata policy for the initial HTTP response and browser navigation.
  const SITE_URL = "https://quantummechanicsbook.app";
  const APP_NAME = "QUANTUM";
  const COURSE_TITLE = "Interactive Quantum Mechanics";
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

  const PRIVATE_VIEWS = new Set(["saved", "favorites", "validation-review", "journey", "ratings"]);
  const LOCKED_CHAPTER_IDS = new Set(["08", "09", "10", "11", "12", "13"]);

  function truncate(value, maxLength) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 1).trimEnd()}...`;
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

  export function buildIndexMeta(search = "") {
    const params = new URLSearchParams(search);
    const view = params.get("view") || "chapters";
    const rawChapter = (params.get("chapter") || "").padStart(2, "0");
    const chapterId = Object.hasOwn(CHAPTER_META, rawChapter) ? rawChapter : "";

    if (PRIVATE_VIEWS.has(view)) {
      return {
        title: `Personal area | ${APP_NAME}`,
        description: "Personal area with favorites and study history for the interactive Quantum Mechanics book.",
        canonical: buildCanonicalForIndex("chapters", ""),
        robots: "noindex,nofollow,noarchive",
        ogType: "website",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `Personal area | ${APP_NAME}`,
          description: "Personal study area.",
          isPartOf: {
            "@type": "WebSite",
            name: APP_NAME,
            url: SITE_URL
          },
          inLanguage: "en"
        }
      };
    }

    if (view === "simulators") {
      return {
        title: `${APP_NAME} simulators | ${COURSE_TITLE}`,
        description: "Interactive Quantum Mechanics simulators, exercises, and supplementary learning resources.",
        canonical: buildCanonicalForIndex(view, chapterId),
        robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
        ogType: "website",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${APP_NAME} simulators | ${COURSE_TITLE}`,
          description: "Collection of interactive Quantum Mechanics simulators.",
          url: buildCanonicalForIndex(view, chapterId),
          inLanguage: "en",
          isPartOf: {
            "@type": "WebSite",
            name: APP_NAME,
            url: SITE_URL
          }
        }
      };
    }

    if (view === "chapters" && LOCKED_CHAPTER_IDS.has(chapterId)) {
      return {
        title: `Chapter ${Number(chapterId)} under editorial review | ${COURSE_TITLE}`,
        description: "This chapter is under editorial review and is not available yet.",
        canonical: buildCanonicalForIndex("chapters", ""),
        robots: "noindex,nofollow,noarchive",
        ogType: "website",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `Chapter ${Number(chapterId)} under editorial review | ${COURSE_TITLE}`,
          isPartOf: { "@type": "Course", name: COURSE_TITLE },
          inLanguage: "en"
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
      title: `${APP_NAME} | Interactive Quantum Mechanics book`,
      description: DEFAULT_DESCRIPTION,
      canonical: buildCanonicalForIndex(view, chapterId),
      robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
      ogType: "website",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: APP_NAME,
          alternateName: COURSE_TITLE,
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
