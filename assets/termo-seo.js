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
    ensureMetaByName("theme-color").setAttribute("content", "#2F6B4F");

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

  /* Chapter 5 is a book-led reading path.  Its first version accumulated
     generic teaching extensions; these cards deliberately keep only the
     definitions, transformations and conclusions developed in the text. */
  function rewriteChapterFive() {
    if (!/\/slides\/chapter-05\//.test(window.location.pathname)) return;
    const body = document.querySelector(".slide > .body");
    if (!body) return;

    const key = window.location.pathname.split("/").pop().replace(/\.html$/, "");
    const pages = {
      "central-potentials-chapter-roadmap": {
        guide: String.raw`This chapter treats central potentials, for which \(V(\mathbf r)=V(r)\). The common angular problem is separated first; the radial equation is then solved separately for the hydrogen atom and for the three-dimensional harmonic oscillator.`,
        content: String.raw`<div class="col"><div class="card"><div class="ch"><i class="fa-solid fa-circle-dot"></i> Central-potential Hamiltonian</div><div class="eq key-eq">\[\hat H=\frac{\hat p^2}{2m}+V(\hat r),\qquad \hat H\Psi(\mathbf r)=E\Psi(\mathbf r)\]</div><p>The potential depends only on the distance from the origin. Spherical coordinates therefore make the geometry of the problem explicit.</p></div><div class="card green"><div class="ch green"><i class="fa-solid fa-code-branch"></i> The common separation</div><div class="eq">\[\Psi(r,\theta,\phi)=R(r)\Theta(\theta)\Phi(\phi)\]</div><p>The angular factors are determined once through the spherical harmonics. The radial factor changes when the potential changes.</p></div></div><div class="col"><div class="card orange"><div class="ch orange"><i class="fa-solid fa-list-ol"></i> Reading sequence</div><ol class="numbered"><li>Write the time-independent Schrödinger equation in spherical coordinates.</li><li>Separate its radial and angular parts.</li><li>Obtain the allowed angular functions from periodicity and regularity.</li><li>For each potential, solve the corresponding radial equation and impose normalizability.</li></ol></div><div class="card purple"><div class="ch purple"><i class="fa-solid fa-atom"></i> Two radial problems</div><p>For the hydrogen atom, the Coulomb attraction gives the Bohr scale and the spectrum \(E_n=-E_0/n^2\). For the isotropic oscillator, the quadratic potential gives equally spaced energies. The book develops both cases after the shared angular analysis.</p></div></div>`,
        keys: ["\\Psi(r,\\theta,\\phi)=R(r)\\Theta(\\theta)\\Phi(\\phi)", "\\hat H=\\hat p^2/(2m)+V(\\hat r)"]
      },
      "separation-of-variables-in-spherical-coordinates": {
        guide: String.raw`For a central potential \(V(r)\), begin with the time-independent Schrödinger equation in spherical coordinates. The product \(\Psi(r,\theta,\phi)=R(r)\Theta(\theta)\Phi(\phi)\) is then substituted, so that the radial and angular dependences can be isolated.`,
        content: String.raw`<div class="card"><div class="ch"><i class="fa-solid fa-square-root-variable"></i> Starting equation and the spherical Laplacian</div><div class="eq key-eq">\[\nabla^2\Psi+\frac{2m}{\hbar^2}[E-V(r)]\Psi=0.\]</div><p>In spherical coordinates, the Laplacian has the radial contribution and the two angular contributions:</p><div class="eq">\[\nabla^2=\frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2\frac{\partial}{\partial r}\right)+\frac{1}{r^2\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial}{\partial\theta}\right)+\frac{1}{r^2\sin^2\theta}\frac{\partial^2}{\partial\phi^2}.\]</div></div><div class="card green"><div class="ch green"><i class="fa-solid fa-code-branch"></i> Substitution of the separated product</div><div class="eq">\[\Psi(r,\theta,\phi)=R(r)\Theta(\theta)\Phi(\phi).\]</div><p>Substituting this product into the starting equation gives</p><div class="eq">\[\frac{\Theta\Phi}{r^2}\left\{\frac{\partial}{\partial r}\left(r^2\frac{\partial}{\partial r}\right)+r^2\frac{2m}{\hbar^2}[E-V(r)]\right\}R+\frac{R}{r^2}\left\{\frac{1}{\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial}{\partial\theta}\right)+\frac{1}{\sin^2\theta}\frac{\partial^2}{\partial\phi^2}\right\}\Theta\Phi=0.\]</div></div><div class="card orange"><div class="ch orange"><i class="fa-solid fa-divide"></i> The separating step</div><p>Multiplying the preceding equation by \(r^2/\Psi(r,\theta,\phi)\) leaves a sum of a term depending only on \(r\) and a term depending only on \(\theta,\phi\):</p><div class="eq">\[\frac{1}{R}\left\{\frac{\partial}{\partial r}\left(r^2\frac{\partial}{\partial r}\right)+r^2\frac{2m}{\hbar^2}[E-V(r)]\right\}R+\frac{1}{\Theta\Phi}\left\{\frac{1}{\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial}{\partial\theta}\right)+\frac{1}{\sin^2\theta}\frac{\partial^2}{\partial\phi^2}\right\}\Theta\Phi=0.\]</div><p>Because the two terms depend on independent variables, they must be constants. The book writes the radial term as \(+\lambda\) and the angular term as \(-\lambda\).</p></div><div class="col"><div class="card purple"><div class="ch purple"><i class="fa-solid fa-arrow-right-long"></i> Radial equation</div><div class="eq">\[\frac{1}{R}\left\{\frac{\partial}{\partial r}\left(r^2\frac{\partial}{\partial r}\right)+r^2\frac{2m}{\hbar^2}[E-V(r)]\right\}R=\lambda.\]</div></div><div class="card purple"><div class="ch purple"><i class="fa-solid fa-compass"></i> Angular equation</div><div class="eq">\[\frac{1}{\Theta\Phi}\left\{\frac{1}{\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial}{\partial\theta}\right)+\frac{1}{\sin^2\theta}\frac{\partial^2}{\partial\phi^2}\right\}\Theta\Phi=-\lambda.\]</div><p>The next section determines the allowed values of \(\lambda\) from the acceptable angular solutions.</p></div></div>`,
        keys: [String.raw`\Psi(r,\theta,\phi)=R(r)\Theta(\theta)\Phi(\phi)`, String.raw`\frac{1}{R}\left\{\frac{\partial}{\partial r}\left(r^2\frac{\partial}{\partial r}\right)+r^2\frac{2m}{\hbar^2}[E-V(r)]\right\}R=\lambda`, String.raw`\frac{1}{\Theta\Phi}\left\{\frac{1}{\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial}{\partial\theta}\right)+\frac{1}{\sin^2\theta}\frac{\partial^2}{\partial\phi^2}\right\}\Theta\Phi=-\lambda`]
      },
      "azimuthal-and-polar-equations": {
        guide: String.raw`The angular equation from the preceding section still contains both \(\theta\) and \(\phi\). Separating it first gives the azimuthal equation; the remaining polar equation then leads, after \(x=\cos\theta\), to the associated Legendre equation and its acceptable solutions.`,
        content: String.raw`<div class="card"><div class="ch"><i class="fa-solid fa-compass"></i> The angular equation again</div><p>For the central-potential problem, the angular contribution obtained in the separation is</p><div class="eq key-eq">\[\frac{1}{\Theta(\theta)\Phi(\phi)}\left\{\frac{1}{\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial}{\partial\theta}\right)+\frac{1}{\sin^2\theta}\frac{\partial^2}{\partial\phi^2}\right\}\Theta(\theta)\Phi(\phi)=-\lambda.\]</div><p>Written so that the two remaining variables are visible explicitly, it is</p><div class="eq">\[\frac{\Phi(\phi)}{\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial}{\partial\theta}\right)\Theta(\theta)+\frac{\Theta(\theta)}{\sin^2\theta}\frac{\partial^2}{\partial\phi^2}\Phi(\phi)+\lambda\Theta(\theta)\Phi(\phi)=0.\]</div></div><div class="card green"><div class="ch green"><i class="fa-solid fa-divide"></i> Separating polar and azimuthal terms</div><p>Multiplying by \(\sin^2\theta/[\Theta(\theta)\Phi(\phi)]\) gives</p><div class="eq">\[\left\{\frac{\sin\theta}{\Theta(\theta)}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial}{\partial\theta}\right)\Theta(\theta)+\lambda\sin^2\theta\right\}+\left\{\frac{1}{\Phi(\phi)}\frac{\partial^2}{\partial\phi^2}\Phi(\phi)\right\}=0.\]</div><p>The two braces depend on different variables. They are therefore set equal to constants with opposite signs; the azimuthal constant is \(-m^2\).</p></div><div class="col"><div class="card purple"><div class="ch purple"><i class="fa-solid fa-arrows-rotate"></i> Azimuthal contribution</div><div class="eq key-eq">\[\frac{1}{\Phi(\phi)}\frac{d^2\Phi(\phi)}{d\phi^2}=-m^2,\qquad \Phi_m(\phi)=e^{im\phi}.\]</div><p>Single-valuedness under \(\phi\to\phi+2\pi\) restricts \(m\) to the integers.</p></div><div class="card purple"><div class="ch purple"><i class="fa-solid fa-location-dot"></i> Polar equation: the consequence</div><p>With the azimuthal constant fixed, the first brace gives</p><div class="eq">\[\frac{\sin\theta}{\Theta(\theta)}\frac{d}{d\theta}\left(\sin\theta\frac{d\Theta(\theta)}{d\theta}\right)+\lambda\sin^2\theta=m^2.\]</div><p>Introduce \(x=\cos\theta\), \(d/d\theta=-\sin\theta\,d/dx\), and \(\Theta(\theta)=P(x)\). Then</p><div class="eq">\[\frac{d}{dx}\left[(1-x^2)\frac{d}{dx}\right]P(x)+\left(\lambda-\frac{m^2}{1-x^2}\right)P(x)=0.\]</div></div></div><div class="card orange"><div class="ch orange"><i class="fa-solid fa-check-double"></i> Associated Legendre solutions</div><p>The acceptable solutions on \(-1\leq x\leq1\) require \(\lambda=l(l+1)\), with \(l=0,1,2,\ldots\) and \(-l\leq m\leq l\). They are the associated Legendre functions:</p><div class="eq key-eq">\[P_l^m(x)=\frac{(-1)^m}{2^l l!}(1-x^2)^{m/2}\frac{d^{l+m}}{dx^{l+m}}(x^2-1)^l,\qquad -l\leq m\leq l.\]</div><p>Thus the polar equation and its solutions follow from the angular separation. The next section combines the polar and azimuthal factors into the spherical harmonics.</p></div>`,
        keys: [String.raw`\frac{1}{\Theta\Phi}\left\{\frac{1}{\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial}{\partial\theta}\right)+\frac{1}{\sin^2\theta}\frac{\partial^2}{\partial\phi^2}\right\}\Theta\Phi=-\lambda`, String.raw`\frac{1}{\Phi}\frac{d^2\Phi}{d\phi^2}=-m^2,\qquad \Phi_m(\phi)=e^{im\phi}`, String.raw`\frac{d}{dx}\left[(1-x^2)\frac{d}{dx}\right]P(x)+\left(\lambda-\frac{m^2}{1-x^2}\right)P(x)=0`, String.raw`P_l^m(x)=\frac{(-1)^m}{2^l l!}(1-x^2)^{m/2}\frac{d^{l+m}}{dx^{l+m}}(x^2-1)^l`]
      },
      "spherical-harmonics": {
        guide: String.raw`The polar and azimuthal solutions found in the preceding section are now combined. Their product is the spherical harmonic, the angular contribution common to every central-potential problem in this chapter.`,
        content: String.raw`<div class="col"><div class="card"><div class="ch"><i class="fa-solid fa-globe"></i> Definition</div><div class="eq key-eq">\[Y_l^m(\theta,\phi)=A_{lm}\Theta(\theta)\Phi(\phi)=A_{lm}P_l^m(\cos\theta)e^{im\phi}.\]</div><p>Here \(l=0,1,2,\ldots\), \(m=-l,-l+1,\ldots,l\), and the normalization factor is</p><div class="eq">\[A_{lm}=\left[\frac{2l+1}{4\pi}\frac{(l-m)!}{(l+m)!}\right]^{1/2}.\]</div></div><figure class="book-figure"><img src="../../assets/chapter-05/figure-5-2-spherical-harmonics.png" alt="Polar plots of low-order spherical-harmonic angular densities" /><figcaption>Low-order angular patterns. Each curve is constructed by plotting the polar representation of \(|Y_l^m(\theta,\phi)|^2\) in a meridional plane and revolving it about the \(z\)-axis. Thus the figure represents the angular factor only; the radial function is not included. The labels \(s,p,d\) correspond to \(l=0,1,2\).</figcaption></figure></div><div class="col"><div class="card green"><div class="ch green"><i class="fa-solid fa-scale-balanced"></i> Angular normalization</div><div class="eq">\[\int_0^{\pi}\!\int_0^{2\pi}\!|Y_l^m(\theta,\phi)|^2\sin\theta\,d\phi\,d\theta=1.\]</div><p>The normalization of the angular factor is independent of the radial normalization.</p></div><div class="card orange"><div class="ch orange"><i class="fa-solid fa-puzzle-piece"></i> Role in the total state</div><div class="eq">\[\Psi(r,\theta,\phi)=R(r)Y_l^m(\theta,\phi).\]</div><p>The radial function is potential dependent; \(Y_l^m\) is the angular factor common to hydrogen and to the three-dimensional oscillator.</p></div></div>`,
        keys: [String.raw`Y_l^m(\theta,\phi)=A_{lm}P_l^m(\cos\theta)e^{im\phi}`, String.raw`A_{lm}=\left[\frac{2l+1}{4\pi}\frac{(l-m)!}{(l+m)!}\right]^{1/2}`, String.raw`\int_0^{\pi}\!\int_0^{2\pi}\!|Y_l^m(\theta,\phi)|^2\sin\theta\,d\phi\,d\theta=1`]
      },
      "hydrogen-atom-and-effective-potential": {
        guide: "For hydrogen, the central potential is Coulombic. Substitution into the general radial equation produces an effective potential made of the Coulomb term and the orbital contribution.",
        content: `<div class="col"><div class="card"><div class="ch"><i class="fa-solid fa-atom"></i> Coulomb potential</div><div class="eq key-eq">\\[V(r)=-\\frac{e^2}{4\\pi\\epsilon_0r}.\\]</div><p>The book writes the radial equation using \(R_{nl}(r)\), then introduces the natural hydrogen length \(a_0=4\\pi\\epsilon_0\\hbar^2/(me^2)\).</p><div class="eq">\\[a_0=\\frac{4\\pi\\epsilon_0\\hbar^2}{me^2},\\qquad E_0=\\frac{\\hbar^2}{2ma_0^2}.\\]</div></div><div class="card green"><div class="ch green"><i class="fa-solid fa-chart-line"></i> Effective potential</div><div class="eq">\\[V_{\\rm ef}(r)=-\\frac{e^2}{4\\pi\\epsilon_0r}+\\frac{\\hbar^2l(l+1)}{2mr^2}.\\]</div><p>The first term is the central Coulomb potential; the second is the orbital contribution. The book uses their sum to organize the radial problem.</p></div></div><div class="col"><div class="card orange"><div class="ch orange"><i class="fa-solid fa-wave-square"></i> Reduced radial equation</div><p>With \(u(r)=rR(r)\), the first derivative is removed:</p><div class="eq">\\[u''+\\left[-k^2+\\frac{2}{ra_0}-\\frac{l(l+1)}{r^2}\\right]u=0,\\qquad k^2=-\\frac{2mE}{\\hbar^2}.\\]</div></div><div class="card purple"><div class="ch purple"><i class="fa-solid fa-book-open"></i> Reading the figure</div><p>The effective-potential curves in the book show how the orbital contribution changes with \(l\). The radial solution and its allowed energies are obtained next by matching this equation to the associated Laguerre equation.</p></div></div>`,
        keys: ["V_{\\rm ef}=-e^2/(4\\pi\\epsilon_0r)+\\hbar^2l(l+1)/(2mr^2)", "u''+[-k^2+2/(ra_0)-l(l+1)/r^2]u=0"]
      },
      "hydrogen-radial-equation-and-laguerre-solutions": {
        guide: "The book changes variables in the radial hydrogen equation and isolates its acceptable asymptotic behavior. The remaining function obeys the associated Laguerre differential equation.",
        content: `<div class="col"><div class="card"><div class="ch"><i class="fa-solid fa-arrow-right-arrow-left"></i> Dimensionless variable and asymptotics</div><div class="eq key-eq">\\[z=2kr,\\qquad u(z)=z^{l+1}e^{-z/2}f(z).\\]</div><p>The factors \(z^{l+1}\) and \(e^{-z/2}\) select the regular behavior at the origin and the decaying behavior for a bound state. The algebra that produces the equation for \(f\) is detailed in the text.</p></div><div class="card green"><div class="ch green"><i class="fa-solid fa-function"></i> Associated Laguerre equation</div><div class="eq">\\[xy''+(\\nu+1-x)y'+qy=0,\\qquad y=A L_\\nu^q(x).\\]</div><p>Comparison with the transformed radial equation identifies the associated Laguerre polynomial and the allowed quantum numbers.</p></div></div><div class="col"><div class="card orange"><div class="ch orange"><i class="fa-solid fa-list-check"></i> Normalizability condition</div><div class="eq">\\[q=-(l+1)+\\frac1{ka_0},\\qquad n=\\frac1{ka_0},\\qquad q=(n-1)-l.\\]</div><p>Because \(q\) is a nonnegative integer, \(l=0,1,\\ldots,n-1\). This is the mathematical condition that selects the hydrogen bound states.</p></div><div class="card purple"><div class="ch purple"><i class="fa-solid fa-arrow-right"></i> Next result</div><p>Using \(n=1/(ka_0)\) in the definition of \(k\) yields the hydrogen energy spectrum on the next page. The complete radial and total wave functions follow after this quantization step.</p></div></div>`,
        keys: ["z=2kr,\\;u=z^{l+1}e^{-z/2}f(z)", "q=(n-1)-l,\\;l=0,\\ldots,n-1"]
      },
      "hydrogen-spectrum-and-degeneracy": {
        guide: "The polynomial condition in the radial solution makes \(n\) an integer. It is this condition, rather than an independent postulate, that gives the discrete hydrogen energies.",
        content: `<div class="col"><div class="card"><div class="ch"><i class="fa-solid fa-bolt"></i> Energy quantization</div><div class="eq key-eq">\\[E_n=-\\frac{E_0}{n^2},\\qquad E_0=\\frac{\\hbar^2}{2ma_0^2},\\qquad n=1,2,3,\\ldots\\]</div><p>The book obtains this expression from \(n=1/(ka_0)\) and \(k^2=-2mE/\\hbar^2\).</p></div><div class="card green"><div class="ch green"><i class="fa-solid fa-layer-group"></i> Allowed labels</div><div class="eq">\\[l=0,1,\\ldots,n-1,\\qquad m=-l,\\ldots,l.\\]</div><p>The energy depends on \(n\), while the angular labels distinguish the states belonging to one energy level.</p></div></div><div class="col"><div class="card orange"><div class="ch orange"><i class="fa-solid fa-circle-nodes"></i> Degeneracy</div><p>For a fixed \(n\), summing the \(2l+1\) possible values of \(m\) for \(l=0\) to \(n-1\) gives \(n^2\) spatial states. This is the degeneracy of the hydrogen level in the treatment of the book.</p></div><div class="card purple"><div class="ch purple"><i class="fa-solid fa-link"></i> From energies to functions</div><p>Once \(n,l,m\) are allowed, the normalized radial function and the spherical harmonic give the complete stationary wave function.</p></div></div>`,
        keys: ["E_n=-E_0/n^2", "l=0,\\ldots,n-1,\\;m=-l,\\ldots,l"]
      },
      "hydrogen-orbitals-and-radial-probability": {
        guide: "After the radial equation has been quantized, the book combines its radial solution with the spherical harmonics. This produces the stationary hydrogen wave functions and their radial probability distributions.",
        content: `<div class="col"><div class="card"><div class="ch"><i class="fa-solid fa-atom"></i> Total stationary state</div><div class="eq key-eq">\\[\\Psi_{nlm}(r,\\theta,\\phi)=R_{nl}(r)Y_l^m(\\theta,\\phi).\\]</div><p>The radial factor contains the associated Laguerre polynomial; the angular factor is the spherical harmonic already obtained in Section 5.2.</p></div><div class="card green"><div class="ch green"><i class="fa-solid fa-chart-area"></i> Radial probability density</div><div class="eq">\\[\\rho_{nl}(r)=r^2|R_{nl}(r)|^2.\\]</div><p>\(\\rho_{nl}(r)dr\) is the probability of finding the electron between radii \(r\) and \(r+dr\), after the angular variables have been integrated.</p></div></div><div class="col"><div class="card orange"><div class="ch orange"><i class="fa-solid fa-list"></i> Quantum numbers and orbital names</div><p>The notation \(nl\) combines the principal quantum number and the orbital quantum number: \(l=0,1,2,3\) correspond to \(s,p,d,f\). The value of \(m\) labels the angular member of the same \(nl\) subshell.</p></div><div class="card purple"><div class="ch purple"><i class="fa-solid fa-book-open"></i> Connection with the radial solution</div><p>The book presents the explicit normalized functions and plots of the radial probability density. Their form follows from the Laguerre polynomial and from the factor already extracted in the radial equation.</p></div></div>`,
        keys: ["\\Psi_{nlm}=R_{nl}Y_l^m", "\\rho_{nl}(r)=r^2|R_{nl}(r)|^2"]
      },
      "three-dimensional-harmonic-oscillator": {
        guide: "The isotropic three-dimensional harmonic oscillator has a central potential. The book first recalls its Cartesian description, then treats the radial problem in the same spherical-coordinate framework used for hydrogen.",
        content: `<div class="col"><div class="card"><div class="ch"><i class="fa-solid fa-wave-square"></i> Hamiltonian</div><div class="eq key-eq">\\[V(r)=\\frac12m\\omega^2r^2,\\qquad \\hat H=\\frac{\\hat p^2}{2m}+\\frac12m\\omega^2\\hat r^2.\\]</div><p>In Cartesian coordinates this is the sum of three independent one-dimensional harmonic oscillators.</p></div><div class="card green"><div class="ch green"><i class="fa-solid fa-cubes"></i> Cartesian result</div><div class="eq">\\[E_{n_x,n_y,n_z}=\\hbar\\omega\\left(n_x+n_y+n_z+\\frac32\\right),\\quad \\Psi=\\psi_{n_x}(x)\\psi_{n_y}(y)\\psi_{n_z}(z).\\]</div></div></div><div class="col"><div class="card orange"><div class="ch orange"><i class="fa-solid fa-globe"></i> Central-potential description</div><p>In spherical coordinates the angular contribution remains \(Y_l^m(\\theta,\\phi)\). The radial contribution is determined by the oscillator effective potential and is developed in the next pages.</p></div><div class="card purple"><div class="ch purple"><i class="fa-solid fa-book-open"></i> Relation to Chapter 4</div><p>The one-dimensional oscillator supplies the Cartesian result. The book uses the radial derivation to connect that familiar result with central-potential quantum numbers.</p></div></div>`,
        keys: ["V(r)=m\\omega^2r^2/2", "E=\\hbar\\omega(n_x+n_y+n_z+3/2)"]
      },
      "3d-oscillator-radial-equation": {
        guide: "The separated radial equation can again be written with an effective potential. The book introduces a dimensionless radial coordinate and identifies the associated Laguerre equation.",
        content: `<div class="col"><div class="card"><div class="ch"><i class="fa-solid fa-chart-line"></i> Effective potential</div><div class="eq key-eq">\\[V_{\\rm ef}(r)=\\frac12m\\omega^2r^2+\\frac{\\hbar^2l(l+1)}{2mr^2}.\\]</div><p>The first term is the central oscillator potential and the second is the orbital contribution. Their competition is shown in the book's effective-potential figure.</p></div><div class="card green"><div class="ch green"><i class="fa-solid fa-ruler"></i> Dimensionless form</div><div class="eq">\\[\\xi=\\sqrt{\\frac{m\\omega}{\\hbar}}r,\\qquad \\varepsilon=\\frac{E}{\\hbar\\omega}.\\]</div><p>These variables reduce the radial equation to a dimensionless form.</p></div></div><div class="col"><div class="card orange"><div class="ch orange"><i class="fa-solid fa-function"></i> Laguerre comparison</div><p>After the changes of variable given in the book, the remaining equation is compared with</p><div class="eq">\\[xy''+(\\nu+1-x)y'+qy=0,\\qquad y=A L_\\nu^q(x).\\]</div></div><div class="card purple"><div class="ch purple"><i class="fa-solid fa-check"></i> Allowed labels</div><div class="eq">\\[n\\ge l,\\qquad n-l\\text{ is even}.\\]</div><p>Thus, for each \(n\), the allowed values are \(l=n,n-2,\\ldots\), ending at \(0\) or \(1\).</p></div></div>`,
        keys: ["V_{\\rm ef}=m\\omega^2r^2/2+\\hbar^2l(l+1)/(2mr^2)", "n\\ge l,\\;n-l\\text{ even}"]
      },
      "3d-oscillator-spectrum-and-degeneracy": {
        guide: "Matching the radial equation to the associated Laguerre equation fixes the dimensionless energy. The result agrees with the Cartesian sum of three one-dimensional oscillators.",
        content: `<div class="col"><div class="card"><div class="ch"><i class="fa-solid fa-bolt"></i> Energy spectrum</div><div class="eq key-eq">\\[E_n=\\hbar\\omega\\left(n+\\frac32\\right),\\qquad n=0,1,2,\\ldots\\]</div><p>This is the radial result of the book. It is equal to the Cartesian result when \(n=n_x+n_y+n_z\).</p></div><div class="card green"><div class="ch green"><i class="fa-solid fa-list"></i> Values of \(l\) and \(m\)</div><div class="eq">\\[l=n,n-2,\\ldots,j,\\qquad m=-l,\\ldots,l,\\]</div><p>where \(j=0\) for even \(n\) and \(j=1\) for odd \(n\).</p></div></div><div class="col"><div class="card orange"><div class="ch orange"><i class="fa-solid fa-table-cells"></i> Degenerate states</div><p>Because the energy depends only on \(n\), the distinct allowed pairs \((l,m)\) at fixed \(n\) have the same energy. Table 5.2 in the book lists the first shells and their \((n,l,m)\) labels.</p></div><div class="card purple"><div class="ch purple"><i class="fa-solid fa-arrow-right"></i> Next</div><p>The following section writes the normalized total wave functions. For the detailed radial normalization, the book remains the reference.</p></div></div>`,
        keys: ["E_n=\\hbar\\omega(n+3/2)", "l=n,n-2,\\ldots,j"]
      },
      "3d-oscillator-wave-functions-and-probability": {
        guide: "The stationary states combine a radial oscillator function with the spherical harmonics, exactly as in the hydrogen case. The detailed normalized expression is derived in the text from the associated Laguerre solution.",
        content: `<div class="col"><div class="card"><div class="ch"><i class="fa-solid fa-atom"></i> Total state</div><div class="eq key-eq">\\[\\Psi_{nlm}(r,\\theta,\\phi)=R_{nl}(r)Y_l^m(\\theta,\\phi).\\]</div><p>The angular factor is unchanged from the general central-potential problem. The radial factor contains a power of \(r\), a Gaussian factor and an associated Laguerre polynomial, as displayed in the book.</p></div><div class="card green"><div class="ch green"><i class="fa-solid fa-chart-area"></i> Radial probability density</div><div class="eq">\\[\\rho_{nl}(r)=r^2|R_{nl}(r)|^2.\\]</div><p>This distribution is used in the book to compare the location of probability for different allowed \(n\) and \(l\).</p></div></div><div class="col"><div class="card orange"><div class="ch orange"><i class="fa-solid fa-book-open"></i> Reading the radial functions</div><p>The oscillator has the same separation structure as hydrogen, but a different central potential and therefore a different radial scale and spectrum. The complete expression and normalization are best read together with the derivation in the book.</p></div></div>`,
        keys: ["\\Psi_{nlm}=R_{nl}Y_l^m", "\\rho_{nl}=r^2|R_{nl}|^2"]
      },
      "hydrogen-atom-and-the-periodic-table": {
        guide: "The book uses the quantum numbers of hydrogen as the starting language for the construction of the periodic table. The actual filling order is introduced through the empirical Madelung energy-ordering rule.",
        content: `<div class="col"><div class="card"><div class="ch"><i class="fa-solid fa-table-cells-large"></i> Subshells</div><div class="eq key-eq">\\[l=0,1,2,3\\quad\\longleftrightarrow\\quad s,p,d,f.\\]</div><p>For fixed \(l\), there are \(2l+1\) values of \(m\). Including the two spin states, each subshell holds \(2(2l+1)\) electrons.</p></div><div class="card green"><div class="ch green"><i class="fa-solid fa-arrow-down-1-9"></i> Madelung energy-ordering rule</div><ul class="bullet"><li>States with lower \(n+l\) are filled first.</li><li>If \(n+l\) is equal, the state with lower \(n\) is filled first.</li></ul><p>The book emphasizes that this ordering rule is empirical and useful for the construction.</p></div></div><div class="col"><div class="card orange"><div class="ch orange"><i class="fa-solid fa-diagram-project"></i> From diagram to table</div><p>The Pauling diagram organizes the \(s,p,d,f\) blocks using the rule above. Periods follow the diagram; the columns are the groups. The capacity of a shell is \(2n^2\).</p></div><div class="card purple"><div class="ch purple"><i class="fa-solid fa-lightbulb"></i> First entries</div><p>The \(1s\) subshell holds two electrons, giving hydrogen and helium. The next subshell is \(2s\), followed by \(2p\); the latter has three \(m\) states and holds six electrons including spin.</p></div></div>`,
        keys: ["\\text{subshell capacity}=2(2l+1)", "\\text{shell capacity}=2n^2"]
      },
      "hydrogen-expectation-values": {
        guide: "The appendix calculates \(\langle r^q\rangle\) for hydrogen states. It first obtains a recurrence relation, then uses the Feynman-Hellmann theorem to provide the missing inverse-power input.",
        content: `<div class="col"><div class="card"><div class="ch"><i class="fa-solid fa-brackets-curly"></i> Radial expectation value</div><div class="eq key-eq">\\[\\langle r^q\\rangle=\\int_0^\\infty R_{nl}^*(r)r^qR_{nl}(r)r^2dr.\\]</div><p>With \(\\rho=r/a_0\), the book reduces the calculation to the dimensionless moments \(\\langle q\\rangle=\\int_0^\\infty\\rho^qf^2(\\rho)d\\rho\).</p></div><div class="card green"><div class="ch green"><i class="fa-solid fa-arrow-right-arrow-left"></i> Kramers-Pasternack relation</div><div class="eq">\\[4(q+1)\\langle q\\rangle-4n^2(2q+1)\\langle q-1\\rangle+n^2[(2l+1)^2-q^2]\\langle q-2\\rangle=0.\\]</div></div></div><div class="col"><div class="card orange"><div class="ch orange"><i class="fa-solid fa-check"></i> First results</div><div class="eq">\\[\\langle r^{-1}\\rangle=\\frac1{n^2a_0},\\qquad \\langle r\\rangle=\\frac{a_0}{2}[3n^2-l(l+1)].\\]</div><div class="eq">\\[\\langle r^2\\rangle=\\frac{a_0^2n^2}{2}[5n^2+1-3l(l+1)].\\]</div></div><div class="card purple"><div class="ch purple"><i class="fa-solid fa-scale-balanced"></i> Feynman-Hellmann theorem</div><div class="eq">\\[\\frac{\\partial E_n}{\\partial\\gamma}=\\left\\langle\\frac{\\partial\\hat H}{\\partial\\gamma}\\right\\rangle.\\]</div><p>The book applies it to obtain \(\\langle r^{-2}\\rangle=1/[n^3a_0^2(l+1/2)]\), then returns to the recurrence for negative powers.</p></div></div>`,
        keys: ["\\langle r^q\\rangle=\\int_0^\\infty R_{nl}^*r^qR_{nl}r^2dr", "\\partial E_n/\\partial\\gamma=\\langle\\partial\\hat H/\\partial\\gamma\\rangle"]
      },
      "chapter-synthesis-solving-central-potentials": {
        guide: "Central symmetry produces one common angular problem and potential-specific radial problems. This final page keeps the comparison qualitative and points back to the book for the full derivations.",
        content: `<div class="col"><div class="card"><div class="ch"><i class="fa-solid fa-globe"></i> What is common</div><p>For every \(V(r)\), separation gives the same spherical harmonics \(Y_l^m\) and the same allowed angular labels \(l,m\). The total state has the form</p><div class="eq key-eq">\\[\\Psi(r,\\theta,\\phi)=R(r)Y_l^m(\\theta,\\phi).\\]</div></div><div class="card green"><div class="ch green"><i class="fa-solid fa-arrows-split-up-and-left"></i> What changes</div><p>The central potential fixes the radial equation. Hydrogen uses a Coulomb potential and associated Laguerre functions; the three-dimensional oscillator uses a quadratic potential and its own radial Laguerre construction.</p></div></div><div class="col"><div class="card orange"><div class="ch orange"><i class="fa-solid fa-bolt"></i> Spectra</div><div class="eq">\\[E_n^{\\rm H}=-\\frac{E_0}{n^2},\\qquad E_n^{\\rm osc}=\\hbar\\omega\\left(n+\\frac32\\right).\\]</div><p>These different spectra come from different radial dynamics, while their angular structure is shared.</p></div><div class="card purple"><div class="ch purple"><i class="fa-solid fa-book-open"></i> Use the book for</div><p>the variable changes, the special-function derivations, normalizations, complete wave functions, figures and exercise solutions. The purpose of this chapter view is to retain the sequence of the argument and the central results.</p></div></div>`,
        keys: ["\\Psi=RY_l^m", "E_n^{\\rm H}=-E_0/n^2,\\;E_n^{\\rm osc}=\\hbar\\omega(n+3/2)"]
      }
    };

    const page = pages[key];
    if (!page) return;
    if (key === "azimuthal-and-polar-equations") {
      page.content = page.content
        .replace(/<p>Written so that the two remaining variables are visible explicitly, it is<\/p><div class="eq">.*?<\/div><\/div><div class="card green">/, '</div><div class="card green">')
        .replace(
          String.raw`Single-valuedness under \(\phi\to\phi+2\pi\) restricts \(m\) to the integers.`,
          String.raw`Single-valuedness under \(\phi\to\phi+2\pi\) restricts \(m\) to the integers: \(m=0,\pm1,\pm2,\ldots\).`
        );
    }
    const preserved = [...body.children].filter((node) =>
      node.matches("[data-exercise-readiness], [data-practice-anchor], [data-termo-ai-exercise], .resource-links, .source-note")
    );
    body.replaceChildren();
    const fragment = document.createRange().createContextualFragment(`<div class="card orange guide-card"><div class="ch orange"><i class="fa-solid fa-map-location-dot"></i> Guided reading</div><p>${page.guide}</p></div>${page.content}`);
    body.append(fragment);
    const anchor = preserved.find((node) => node.matches("[data-practice-anchor]"));
    if (anchor) {
      const eqs = page.keys.map((equation, index) => `<li><span class="practice-label">Key equation ${index + 1}:</span></li><div class="eq">\\[${equation}\\]</div>`).join("");
      anchor.innerHTML = `<div class="ch purple"><i class="fa-solid fa-pen-nib"></i> Practice anchors</div><p>Use only the setup and equations introduced on this page. For the intermediate algebra and complete derivations, return to the corresponding part of the book.</p><ul class="bullet practice-list"><li><span class="practice-label">Focus:</span> follow the book's sequence from the starting equation to the stated result.</li><li><span class="practice-label">Conceptual check:</span> identify which condition selects the allowed result.</li>${eqs}<li><span class="practice-label">Boundary:</span> do not introduce notation or results not developed in this section.</li></ul>`;
    }
    preserved.forEach((node) => body.append(node));
    const typeset = () => window.MathJax && window.MathJax.typesetPromise && window.MathJax.typesetPromise([body]);
    window.setTimeout(typeset, 0);
    window.addEventListener("load", typeset, { once: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { updateIndexSeo(); rewriteChapterFive(); }, { once: true });
  } else {
    updateIndexSeo();
    rewriteChapterFive();
  }
})();
