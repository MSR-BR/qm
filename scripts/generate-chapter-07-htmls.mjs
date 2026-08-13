import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const chapterDir = path.join(rootDir, "slides", "chapter-07");
const dataPath = path.join(rootDir, "data", "chapter-07.json");
const layoutVersion = "0813.1";

const originalLinks = [
  ["Elsevier shop", "https://shop.elsevier.com/books/quantum-mechanics/reis/978-0-443-32826-8"],
  ["ScienceDirect", "https://www.sciencedirect.com/book/monograph/9780443328268/quantum-mechanics"],
  ["Google Books preview", "https://books.google.com.br/books?id=vR1LEQAAQBAJ"],
  ["Amazon", "https://a.co/d/09vYq2F7"]
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resourceLinks() {
  return `<div class="resource-links"><strong>Original book and previews:</strong><div class="resource-link-list">${originalLinks.map(([label, href]) => `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`).join("")}</div></div>`;
}

function sourceNote() {
  return `<div class="source-note"><strong>Source note:</strong> Original auxiliary summary for this book-app, based on Chapter 7 of Mario Reis, <em>Quantum Mechanics</em>, Elsevier, 2026. Book text and figures are copyright &copy; 2026 Elsevier Inc.; consult the original book for complete demonstrations, examples and exercises.</div>`;
}

function card({ title, icon = "fa-solid fa-book-open", color = "", body = "" }) {
  const colorClass = color ? ` ${color}` : "";
  return `<div class="card${colorClass}"><div class="ch${colorClass}"><i class="${icon}"></i> ${title}</div>${body}</div>`;
}

function practiceEquationItems(page) {
  const equations = (page.keyEquations || [page.keyEquation]).filter(Boolean);
  const multi = equations.length > 1;
  return equations.map((equation, index) => `<li class="practice-equation-item"><span class="practice-label">Key equation${multi ? ` ${index + 1}` : ""}:</span>
          <div class="eq">${equation}</div>
        </li>`).join("\n        ");
}

function exerciseBoundary(page) {
  return `
    <div class="card green exercise-readiness-card" data-exercise-readiness="true" style="grid-column:1 / -1!important;">
      <div class="ch green"><i class="fa-solid fa-list-check"></i> Exercise-ready boundary</div>
      <p>This page supports compact guided exercises on: ${escapeHtml(page.focus)}.</p>
      <ul class="bullet practice-list">
        <li><span class="practice-label">Use from this page:</span> the definitions, physical setup, highlighted equations and quantum-number restrictions shown here.</li>
        <li><span class="practice-label">Keep in Chapter 7:</span> the complete demonstrations, long examples, historical notes and extended exercise solutions.</li>
        <li><span class="practice-label">Boundary:</span> do not introduce notation, Hamiltonians, coupling schemes or selection rules outside the sequence presented here.</li>
      </ul>
    </div>
    <div class="card purple practice-anchor-card" data-practice-anchor="true" style="grid-column:1 / -1!important;">
      <div class="ch purple"><i class="fa-solid fa-pen-nib"></i> Practice anchors</div>
      <p>Use these anchors only within the material introduced on this page.</p>
      <ul class="bullet practice-list">
        <li><span class="practice-label">Focus:</span> ${escapeHtml(page.focus)}.</li>
        <li><span class="practice-label">Conceptual check:</span> identify the basis or angular-momentum interaction before applying the equation.</li>
        ${practiceEquationItems(page)}
        <li><span class="practice-label">Typical task:</span> ${escapeHtml(page.typicalTask || "apply one central equation and state what basis, quantum numbers or physical consequence it uses.")}</li>
      </ul>
    </div>
    <section data-termo-ai-exercise data-exercise-theme="purple" data-exercise-level="undergraduate physics" style="grid-column:1 / -1!important;"></section>`;
}

function vectorStack(rows) {
  return `<div class="vector-stack">${rows.map((row) => `<div class="vector-row">\\(${row}\\)</div>`).join("")}</div>`;
}

function sequentialBasisFigure() {
  return String.raw`<figure class="book-figure basis-book-figure">
    <img src="../../assets/chapter-07/fig-7-4-sequential-basis.png?v=0813.1" alt="Sequential construction of the coupled basis" loading="lazy" decoding="async" />
    <figcaption>Sequential construction for four \(1/2\) angular momenta: first \(l_{12}\), then \(l_{13}\), then \(l\).</figcaption>
  </figure>`;
}

function nonSequentialBasisFigure() {
  return String.raw`<figure class="book-figure basis-book-figure">
    <img src="../../assets/chapter-07/fig-7-4-non-sequential-basis.png?v=0813.1" alt="Non-sequential construction of the coupled basis" loading="lazy" decoding="async" />
    <figcaption>Non-sequential construction: first \(l_{12}\) and \(l_{34}\), then the total \(l\).</figcaption>
  </figure>`;
}

function zeemanSchematic() {
  return String.raw`<figure style="grid-column:1 / -1!important;margin:0!important;">
    <svg class="zeeman-schematic" viewBox="0 0 520 360" role="img" aria-label="Magnetic moment projection schematic">
      <defs><marker id="arrowHead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"></path></marker></defs>
      <line class="axis" x1="260" y1="328" x2="260" y2="32"/><text x="272" y="45">z</text>
      <ellipse class="cone" cx="304" cy="92" rx="86" ry="18" fill="#e7a1c9" stroke="#8a5a7a"/><path class="cone" d="M218 92 L260 178 L390 92" fill="#e7a1c9" stroke="#8a5a7a"/>
      <ellipse class="cone" cx="352" cy="156" rx="83" ry="18" transform="rotate(28 352 156)" fill="#8ca7d9" stroke="#536c9a"/><path class="cone" d="M260 178 L430 188 L320 104" fill="#8ca7d9" stroke="#536c9a"/>
      <ellipse class="cone" cx="190" cy="234" rx="89" ry="18" transform="rotate(28 190 234)" fill="#b6df96" stroke="#6f915a"/><path class="cone" d="M260 178 L96 204 L250 278" fill="#b6df96" stroke="#6f915a"/>
      <line class="vector" x1="260" y1="178" x2="342" y2="84"/><text x="350" y="88">J</text>
      <line class="vector" x1="260" y1="178" x2="407" y2="154"/><text x="416" y="158">L</text>
      <line class="vector" x1="260" y1="178" x2="232" y2="112"/><text x="214" y="112">S</text>
      <line class="vector mu" x1="260" y1="178" x2="180" y2="286"/><text x="166" y="305">μ</text>
      <line class="vector mu" x1="260" y1="178" x2="215" y2="268" stroke-dasharray="6 5"/><text x="228" y="286">μ<tspan baseline-shift="sub" font-size="10">J</tspan></text>
      <line class="vector mu" x1="260" y1="178" x2="110" y2="214"/><text x="76" y="214">μ<tspan baseline-shift="sub" font-size="10">L</tspan></text>
      <line class="vector mu" x1="260" y1="178" x2="328" y2="278"/><text x="334" y="286">μ<tspan baseline-shift="sub" font-size="10">S</tspan></text>
    </svg>
    <figcaption class="schematic-caption">Schematic of the projection used in Application 7.A: \(\vec{\hat\mu}\) is not parallel to \(\vec{\hat J}\), and only \(\vec{\hat\mu}_J\) contributes to the magnetic energy.</figcaption>
  </figure>`;
}

function hundFillingDiagram() {
  return String.raw`<div class="table-wrap hund-filling"><table>
    <thead><tr><th>\(m_l\)</th><th>+3</th><th>+2</th><th>+1</th><th>0</th><th>-1</th><th>-2</th><th>-3</th></tr></thead>
    <tbody><tr><td>\(4f^5\)</td><td>↑</td><td>↑</td><td>↑</td><td>↑</td><td>↑</td><td></td><td></td></tr></tbody>
  </table></div>`;
}

function renderPage(page, index, total) {
  const midpoint = Math.ceil(page.cards.length / 2);
  const left = page.cards.slice(0, midpoint).map(card).join("\n");
  const right = page.cards.slice(midpoint).map(card).join("\n");
  const fullWidth = (page.fullWidth || []).map((entry) => card(entry).replace("<div class=\"card", "<div style=\"grid-column:1 / -1!important;\" class=\"card")).join("\n");
  return `<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(page.title)} | Chapter 7 | Quantum Mechanics</title>
  <meta name="description" content="${escapeHtml(page.description)}" /><meta name="author" content="Prof. Mario Reis" />
  <meta name="robots" content="index,follow,max-image-preview:large" /><link rel="canonical" href="https://qm-beta.vercel.app/slides/chapter-07/${escapeHtml(page.file)}" />
  <meta property="og:type" content="article" /><meta property="og:site_name" content="Quantum Mechanics" />
  <meta property="og:title" content="${escapeHtml(page.title)} | Chapter 7 | Quantum Mechanics" /><meta property="og:description" content="${escapeHtml(page.description)}" /><meta property="og:url" content="https://qm-beta.vercel.app/slides/chapter-07/${escapeHtml(page.file)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@7.2.0/css/all.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="../../assets/chapter-07/page-layout.css?v=${layoutVersion}" /><link rel="stylesheet" href="../../assets/ai-exercises.css?v=0717.2" />
  <script>window.MathJax={tex:{inlineMath:[["\\\\(","\\\\)"]],displayMath:[["\\\\[","\\\\]"]]},startup:{typeset:true}};</script>
  <script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};</script><script defer src="/_vercel/insights/script.js"></script>
  <link rel="stylesheet" href="../../assets/termo-share.css?v=0731.1" /><script defer src="../../assets/ai-exercises.js?v=0813.1"></script>
  <script defer src="../../assets/termo-share.js?v=0717.1"></script><link rel="stylesheet" href="../../assets/termo-auth.css?v=0717.1" />
  <script defer src="../../assets/termo-auth.js?v=0717.2"></script><script defer src="../../assets/termo-user-data.js?v=0731.1"></script><script defer src="../../assets/termo-seo.js?v=0614.1"></script>
</head><body><div class="slide">
  <div class="hdr"><div class="hdr-inner"><a href="../../index.html?view=chapters&chapter=07" class="index-back-button"><i class="fa-solid fa-arrow-left"></i> Index</a><div class="chapter-label"><i class="fa-solid fa-layer-group"></i> Chapter 7 · Item ${page.id}</div><div class="hdr-title">${page.title}</div><div class="hdr-sub">${page.subtitle}</div></div><div class="slide-num">${index + 1} / ${total}</div></div>
  <div class="body">
    <div class="card orange guide-card"><div class="ch orange"><i class="fa-solid fa-map-location-dot"></i> Guided reading</div>${page.guide}</div>
    <div class="col">${left}</div>
    <div class="col">${right}</div>
${fullWidth}
    ${page.aiExercise === false ? "" : exerciseBoundary(page)}
    ${resourceLinks()}${sourceNote()}
  </div>
</div></body></html>
`;
}

const pages = [
  {
    id: "7.1",
    file: "addition-of-angular-momenta-chapter-roadmap.html",
    title: "Addition of angular momenta: chapter roadmap",
    subtitle: "From interacting angular momenta to coupled bases and applications",
    description: "Chapter 7 introduces interactions between angular momenta and then builds the coupled basis, Clebsch-Gordan coefficients, basis changes and applications.",
    aiExercise: false,
    guide: String.raw`<p>The chapter starts from physical Hamiltonians containing more than one angular momentum and then develops the basis language needed to treat those systems.</p><p>This first item is intentionally qualitative. The detailed definitions, calculations and examples are developed in the following items and in Chapter 7.</p>`,
    cards: [
      {
        title: "Physical starting point",
        icon: "fa-solid fa-magnet",
        body: String.raw`
          <p>The opening section introduces interaction terms involving two angular momenta: exchange interactions, spin-orbit coupling, local anisotropy and the Zeeman interaction.</p>
          <p>The common issue is that the Hamiltonian contains more than one angular momentum, so the local labels alone are not always the most useful basis labels.</p>
        `
      },
      {
        title: "What the chapter builds",
        icon: "fa-solid fa-layer-group",
        color: "green",
        body: String.raw`
          <p>The chapter constructs the coupled basis from angular momenta that first live in independent Hilbert subspaces.</p>
          <p>The local basis keeps the individual projections visible; the coupled basis keeps the total angular momentum and total projection visible.</p>
        `
      },
      {
        title: "Chapter sequence",
        icon: "fa-solid fa-route",
        color: "purple",
        body: String.raw`
          <ul class="bullet">
            <li>interactions between angular momenta;</li>
            <li>commutation relations and the local/coupled bases;</li>
            <li>vectors in sequential and non-sequential coupled bases;</li>
            <li>Hilbert-space expansion by tensor products;</li>
            <li>Clebsch-Gordan coefficients and basis-change matrices;</li>
            <li>basis change of operators;</li>
            <li>magnetic moment, Zeeman effect and Hund's rules.</li>
          </ul>
        `
      },
      {
        title: "Reading boundary",
        icon: "fa-solid fa-book-open",
        color: "orange",
        body: String.raw`
          <p>This roadmap should be used only to keep the logic of the chapter visible. It does not replace the worked algebra, the derivations or the examples.</p>
          <p>The mathematical details begin in the next item, with the interaction Hamiltonians and the addition problem they motivate.</p>
        `
      }
    ]
  },
  {
    id: "7.1",
    file: "interactions-between-angular-momenta.html",
    title: "Interactions between angular momenta",
    subtitle: "Hamiltonians that motivate the addition of angular momenta",
    description: "Chapter 7 begins with Heisenberg, Ising, XY, antisymmetric, spin-orbit, local anisotropy and Zeeman Hamiltonians.",
    focus: "the angular-momentum interactions that motivate the addition problem",
    keyEquations: [
      String.raw`\[\hat H=-J\vec{\hat S}_1\cdot\vec{\hat S}_2\]`,
      String.raw`\[\hat H_Z=\mu_B(2\vec{\hat S}+\vec{\hat L})\cdot\vec B\]`
    ],
    guide: String.raw`<p>The section introduces interaction Hamiltonians before the algebra of addition. The purpose is physical: once a Hamiltonian contains more than one angular momentum, a basis built from only one momentum is not enough.</p>`,
    cards: [
      {
        title: "Isotropic and anisotropic exchange",
        icon: "fa-solid fa-arrows-spin",
        body: String.raw`
          <p>The isotropic Heisenberg interaction is written as</p>
          <div class="eq key-eq">\[\hat H=-J\vec{\hat S}_1\cdot\vec{\hat S}_2.\]</div>
          <p>For \(J>0\), the spins are ordered parallel; for \(J<0\), they are ordered antiparallel. The parameter \(J\) regulates the intensity of the interaction.</p>
          <p>The Ising Hamiltonian is the \(z\)-axis anisotropic case:</p>
          <div class="eq">\[\hat H=-J\hat S_{1z}\hat S_{2z}.\]</div>
          <p>The \(XY\) interaction keeps the \(x\) and \(y\) spin components:</p>
          <div class="eq">\[\hat H=-J(\hat S_{1x}\hat S_{2x}+\hat S_{1y}\hat S_{2y}).\]</div>
        `
      },
      {
        title: "Antisymmetric and spin-orbit terms",
        icon: "fa-solid fa-code-branch",
        color: "green",
        body: String.raw`
          <p>The antisymmetric interaction is written as</p>
          <div class="eq key-eq">\[\hat H=\vec d\cdot(\vec{\hat S}_1\times\vec{\hat S}_2).\]</div>
          <p>The vector \(\vec d\) regulates the intensity of this interaction; this term is also known as the Dzialoshinsky-Moriya interaction.</p>
          <p>The spin-orbit interaction couples the orbital angular momentum of an electron with its own spin:</p>
          <div class="eq key-eq">\[\hat H=\zeta\vec{\hat S}\cdot\vec{\hat L}.\]</div>
        `
      },
      {
        title: "Local magnetocrystalline anisotropy",
        icon: "fa-solid fa-gem",
        color: "purple",
        body: String.raw`
          <p>This Hamiltonian has anisotropic character and originates from the spin-orbit interaction. It describes the interaction of a spin with the crystal lattice:</p>
          <div class="eq key-eq">\[\hat H=D\left(\hat S_z^2-\frac{1}{3}\hat S^2\right)+E(\hat S_x^2-\hat S_y^2).\]</div>
          <p>The parameter \(D\) is axial and the parameter \(E\) is rhombic.</p>
        `
      },
      {
        title: "Zeeman interaction",
        icon: "fa-solid fa-magnet",
        color: "orange",
        body: String.raw`
          <p>The Zeeman case represents the interaction between spin and/or orbital angular momenta with a magnetic field:</p>
          <div class="eq key-eq">\[\hat H=\mu_B(2\vec{\hat S}+\vec{\hat L})\cdot\vec B.\]</div>
          <p>This term returns later when the chapter applies angular-momentum addition to magnetic moments and the Zeeman effect.</p>
          <div class="callout">In real units, the Hamiltonians above have the prefactors described in Chapter 7. The displayed forms use dimensionless angular momenta, following the section.</div>
        `
      }
    ]
  },
  {
    id: "7.2",
    file: "commutation-relations.html",
    title: "Commutation relations",
    subtitle: "From local observables to the coupled basis",
    description: "Independent angular-momentum subspaces, total angular momentum, allowed l values and the projection condition m equals m1 plus m2.",
    focus: "the two commuting sets that define local and coupled angular-momentum bases",
    keyEquations: [
      String.raw`\[\{\hat L_1^2,\hat L_2^2,\hat L_{1z},\hat L_{2z}\}\]`,
      String.raw`\[\{\hat L_1^2,\hat L_2^2,\hat L^2,\hat L_z\}\]`
    ],
    guide: String.raw`<p>The section asks which observables describe a system with two independent angular momenta. The local basis is built first; the coupled basis appears when the total angular momentum is introduced.</p>`,
    cards: [
      {
        title: "Independent subspaces",
        icon: "fa-solid fa-link-slash",
        body: String.raw`
          <p>For two angular momenta \(\vec{\hat L}_1\) and \(\vec{\hat L}_2\), each belongs to its own Hilbert subspace. Components belonging to different subspaces commute:</p>
          <div class="eq key-eq">\[[\hat L_{1u},\hat L_{2v}]=0,\qquad (u,v)=(x,y,z).\]</div>
          <div class="eq">\[[\hat L_1^2,\hat L_{2v}]=0,\qquad [\hat L_2^2,\hat L_{1v}]=0,\qquad [\hat L_1^2,\hat L_2^2]=0.\]</div>
          <p>Each subspace still obeys the angular-momentum commutation rule.</p>
          <div class="eq">\[[\hat L_{1u},\hat L_{1v}]=i\hbar\epsilon_{uvw}\hat L_{1w},\qquad [\hat L_{2u},\hat L_{2v}]=i\hbar\epsilon_{uvw}\hat L_{2w}.\]</div>
        `
      },
      {
        title: "Local basis",
        icon: "fa-solid fa-location-dot",
        color: "green",
        body: String.raw`
          <p>The algebra in each subspace gives</p>
          <div class="eq">\[\hat L_{1z}|l_1,m_1\rangle=m_1\hbar|l_1,m_1\rangle,\qquad \hat L_1^2|l_1,m_1\rangle=l_1(l_1+1)\hbar^2|l_1,m_1\rangle,\]</div>
          <div class="eq">\[\hat L_{2z}|l_2,m_2\rangle=m_2\hbar|l_2,m_2\rangle,\qquad \hat L_2^2|l_2,m_2\rangle=l_2(l_2+1)\hbar^2|l_2,m_2\rangle.\]</div>
          <p>Therefore the commuting set</p>
          <div class="eq key-eq">\[\{\hat L_1^2,\hat L_2^2,\hat L_{1z},\hat L_{2z}\}\]</div>
          <p>is represented by \(|l_1,m_1\rangle\otimes |l_2,m_2\rangle=|l_1,l_2,m_1,m_2\rangle\). This is the local basis.</p>
        `
      },
      {
        title: "Total angular momentum",
        icon: "fa-solid fa-plus",
        color: "purple",
        body: String.raw`
          <p>The total angular momentum is introduced as</p>
          <div class="eq key-eq">\[\vec{\hat L}=\vec{\hat L}_1+\vec{\hat L}_2,\qquad \hat L^2=(\vec{\hat L}_1+\vec{\hat L}_2)^2=\hat L_1^2+\hat L_2^2+2\vec{\hat L}_1\cdot\vec{\hat L}_2.\]</div>
          <div class="eq">\[\hat L_x=\hat L_{1x}+\hat L_{2x},\quad \hat L_y=\hat L_{1y}+\hat L_{2y},\quad \hat L_z=\hat L_{1z}+\hat L_{2z},\quad \hat L_\pm=\hat L_{1\pm}+\hat L_{2\pm}.\]</div>
          <p>The new commuting set is</p>
          <div class="eq key-eq">\[\{\hat L_1^2,\hat L_2^2,\hat L^2,\hat L_z\},\]</div>
          <p>represented by \(|l_1,l_2,l,m\rangle\). This is the coupled basis.</p>
        `
      },
      {
        title: "Allowed values and projection condition",
        icon: "fa-solid fa-ruler-combined",
        color: "orange",
        body: String.raw`
          <p>The total angular momentum follows the same algebra as one angular momentum:</p>
          <div class="eq">\[[\hat L_u,\hat L_v]=i\hbar\epsilon_{uvw}\hat L_w.\]</div>
          <div class="eq">\[\hat L_z|l,m\rangle=m\hbar|l,m\rangle,\qquad \hat L^2|l,m\rangle=l(l+1)\hbar^2|l,m\rangle,\qquad -l\le m\le +l.\]</div>
          <p>Dimension preservation gives the possible values of \(l\):</p>
          <div class="eq key-eq">\[|l_1-l_2|\le l\le l_1+l_2.\]</div>
          <p>The projection condition is</p>
          <div class="eq key-eq">\[m=m_1+m_2.\]</div>
          <p>This condition is necessary, but not sufficient, for \(\langle m_1,m_2|l,m\rangle\) to be nonzero.</p>
        `
      }
    ],
    fullWidth: [
      {
        title: "Example: two angular momenta l1 = l2 = 1/2",
        icon: "fa-solid fa-table-cells",
        color: "green",
        body: String.raw`
          <div class="table-wrap"><table><thead><tr><th>Basis</th><th>Vectors in the short notation of the section</th><th>Dimension check</th></tr></thead><tbody>
          <tr><td>Local basis \(|m_1,m_2\rangle\)</td><td>\(|+,+\rangle,\ |+,-\rangle,\ |-,+\rangle,\ |-,-\rangle\)</td><td>\((2l_1+1)(2l_2+1)=4\)</td></tr>
          <tr><td>Coupled basis \(|l,m\rangle\)</td><td>\(|1,1\rangle,\ |1,0\rangle,\ |1,-1\rangle,\ |0,0\rangle\)</td><td>\(\sum_{l=0}^{1}(2l+1)=4\)</td></tr>
          </tbody></table></div>
          <p>In this example \(+\) and \(-\) represent \(+1/2\) and \(-1/2\), respectively.</p>
        `
      }
    ]
  },
  {
    id: "7.3",
    file: "vectors-in-the-coupled-basis.html",
    title: "Vectors in the coupled basis",
    subtitle: "Sequential and non-sequential construction",
    description: "The coupled basis is built by adding angular momenta pair by pair, either sequentially or non-sequentially.",
    focus: "construction of coupled-basis vectors for several angular momenta",
    keyEquations: [
      String.raw`\[|l_{12},l_{13},l,m\rangle\]`,
      String.raw`\[|l_{12},l_{34},l,m\rangle\]`
    ],
    guide: String.raw`<p>The section extends the two-angular-momentum example to \(N\) angular momenta. The construction always adds angular momenta in pairs and checks the allowed interval \(|l_a-l_b|\le l\le l_a+l_b\) at every step.</p>`,
    cards: [
      {
        title: "Sequentially coupled basis",
        icon: "fa-solid fa-shoe-prints",
        body: String.raw`
          <p>For four angular momenta \(l_1=l_2=l_3=l_4=1/2\), the sequential construction is</p>
          <div class="eq key-eq">\[\vec{\hat L}_{12}=\vec{\hat L}_1+\vec{\hat L}_2,\qquad \vec{\hat L}_{13}=\vec{\hat L}_{12}+\vec{\hat L}_3,\qquad \vec{\hat L}=\vec{\hat L}_{14}=\vec{\hat L}_{13}+\vec{\hat L}_4.\]</div>
          <p>The allowed intermediate values are obtained from</p>
          <div class="eq">\[|l_1-l_2|\le l_{12}\le l_1+l_2,\qquad |l_{12}-l_3|\le l_{13}\le l_{12}+l_3,\qquad |l_{13}-l_4|\le l\le l_{13}+l_4.\]</div>
          ${sequentialBasisFigure()}
        `
      },
      {
        title: "Sequential vectors",
        icon: "fa-solid fa-list",
        color: "green",
        body: String.raw`
          <p>The simplified sequential coupled basis omits the constant \(l_1,l_2,l_3,l_4\) and is written as \(|l_{12},l_{13},l,m\rangle\):</p>
          ${vectorStack(["|l_{12},l_{13},l,m\\rangle","|1,3/2,2,m\\rangle","|1,3/2,1,m\\rangle","|1,1/2,1,m\\rangle","|1,1/2,0,m\\rangle","|0,1/2,1,m\\rangle","|0,1/2,0,m\\rangle"])}
          <p>The coupled basis has one quintuplet, three triplets and two singlets, preserving the Hilbert-space dimension \(16\).</p>
        `
      },
      {
        title: "Non-sequentially coupled basis",
        icon: "fa-solid fa-code-fork",
        color: "purple",
        body: String.raw`
          <p>The angular momenta do not need to be added sequentially. For the same example of four spins \(1/2\), with \(l_1=l_2=l_3=l_4=1/2\), the section also uses</p>
          <div class="eq key-eq">\[\vec{\hat L}_{12}=\vec{\hat L}_1+\vec{\hat L}_2,\qquad \vec{\hat L}_{34}=\vec{\hat L}_3+\vec{\hat L}_4,\qquad \vec{\hat L}=\vec{\hat L}_{12}+\vec{\hat L}_{34}.\]</div>
          <p>The allowed intermediate values are obtained from</p>
          <div class="eq">\[|l_1-l_2|\le l_{12}\le l_1+l_2,\qquad |l_3-l_4|\le l_{34}\le l_3+l_4,\qquad |l_{12}-l_{34}|\le l\le l_{12}+l_{34}.\]</div>
          ${nonSequentialBasisFigure()}
          <p>This choice depends on the system under study and still uses the same allowed-value condition at each pairwise addition. Other non-sequential choices and the extension to three or more angular momenta remain in Chapter 7.</p>
        `
      },
      {
        title: "Non-sequential vectors",
        icon: "fa-solid fa-diagram-project",
        color: "orange",
        body: String.raw`
          <p>The corresponding basis is written as \(|l_{12},l_{34},l,m\rangle\):</p>
          ${vectorStack(["|l_{12},l_{34},l,m\\rangle","|1,1,2,m\\rangle","|1,1,1,m\\rangle","|1,1,0,m\\rangle","|1,0,1,m\\rangle","|0,1,1,m\\rangle","|0,0,0,m\\rangle"])}
          <p>As expected, the dimension is preserved again: one quintuplet, three triplets and two singlets.</p>
        `
      }
    ]
  },
  {
    id: "7.4",
    file: "hilbert-space-expansion.html",
    title: "Hilbert space expansion",
    subtitle: "Tensor products put all operators in the same dimension",
    description: "Matrix expansion by tensor products makes angular-momentum operators act in the total Hilbert space.",
    focus: "tensor-product expansion of operators and local basis vectors",
    keyEquations: [
      String.raw`\[\hat L_{1u}=\hat L_u^{(1)}\otimes 1^{(2)}\otimes\cdots\otimes 1^{(N)}\]`,
      String.raw`\[|l_1,\ldots,l_N,m_1,\ldots,m_N\rangle=|l_1,m_1\rangle\otimes\cdots\otimes |l_N,m_N\rangle\]`
    ],
    guide: String.raw`<p>Operators from different angular-momentum subspaces may have different matrix dimensions. The section solves this by expanding every operator and vector into the total Hilbert space.</p>`,
    cards: [
      {
        title: "Why expansion is needed",
        icon: "fa-solid fa-expand",
        body: String.raw`
          <p>If a system has \(l_1=1/2\) and \(l_2=1\), the two Hilbert subspaces have dimensions \(2\times2\) and \(3\times3\). Operations between their matrices require a common total dimension.</p>
          <div class="eq key-eq">\[\hbox{total dimension}=\prod_{i=1}^{N}(2l_i+1).\]</div>
        `
      },
      {
        title: "Operator expansion",
        icon: "fa-solid fa-layer-group",
        color: "green",
        body: String.raw`
          <p>The tensor products are</p>
          <div class="eq key-eq">\[\begin{aligned}\hat L_{1u}&=\hat L_u^{(1)}\otimes 1^{(2)}\otimes 1^{(3)}\otimes\cdots\otimes 1^{(N)},\\ \hat L_{2u}&=1^{(1)}\otimes \hat L_u^{(2)}\otimes 1^{(3)}\otimes\cdots\otimes 1^{(N)},\\ \hat L_{Nu}&=1^{(1)}\otimes 1^{(2)}\otimes 1^{(3)}\otimes\cdots\otimes \hat L_u^{(N)}.\end{aligned}\]</div>
          <p>Here \(u=(x,y,z)\). After the tensor products, all components have the correct common dimension.</p>
        `
      },
      {
        title: "Vector expansion",
        icon: "fa-solid fa-vector-square",
        color: "purple",
        body: String.raw`
          <p>The vectors are expanded in the same way:</p>
          <div class="eq key-eq">\[\begin{aligned}|l_1,l_2,l_3,\ldots,l_N,m_1,m_2,m_3,\ldots,m_N\rangle={}&|l_1,m_1\rangle\otimes |l_2,m_2\rangle\\ &\otimes |l_3,m_3\rangle\otimes\cdots\otimes |l_N,m_N\rangle.\end{aligned}\]</div>
        `
      },
      {
        title: "Example 7.4: spin product",
        icon: "fa-solid fa-table",
        color: "orange",
        body: String.raw`
          <p>The example considers</p>
          <div class="eq key-eq">\[\hat H=\vec{\hat S}_1\cdot\vec{\hat S}_2=\hat S_{1x}\hat S_{2x}+\hat S_{1y}\hat S_{2y}+\hat S_{1z}\hat S_{2z},\]</div>
          <p>with \(s_1=1/2\) and \(s_2=1\). One component is expanded as</p>
          <div class="eq">\[\hat S_{1x}=\hat S_x^{(1)}\otimes 1^{(2)},\qquad \hat S_{2x}=1^{(1)}\otimes\hat S_x^{(2)}.\]</div>
          <p>The same procedure is used for the other components before summing the Hamiltonian.</p>
        `
      }
    ],
    fullWidth: [
      {
        title: "Example 7.4: expansion step by step",
        icon: "fa-solid fa-shoe-prints",
        color: "orange",
        body: String.raw`
          <p>For \(s_1=1/2\) and \(s_2=1\), the Hilbert-space dimension is \((2s_1+1)(2s_2+1)=6\). The \(x\)-component of spin 1 is expanded with the identity in subspace 2:</p>
          <div class="eq">\[\hat S_{1x}=\hat S_x^{(1)}\otimes 1^{(2)}=\frac{\hbar}{2}\begin{pmatrix}0&0&0&1&0&0\\0&0&0&0&1&0\\0&0&0&0&0&1\\1&0&0&0&0&0\\0&1&0&0&0&0\\0&0&1&0&0&0\end{pmatrix}.\]</div>
          <p>The \(x\)-component of spin 2 is expanded with the identity in subspace 1:</p>
          <div class="eq">\[\hat S_{2x}=1^{(1)}\otimes\hat S_x^{(2)}=\frac{\hbar}{\sqrt2}\begin{pmatrix}0&1&0&0&0&0\\1&0&1&0&0&0\\0&1&0&0&0&0\\0&0&0&0&1&0\\0&0&0&1&0&1\\0&0&0&0&1&0\end{pmatrix}.\]</div>
          <p>The remaining components are obtained by the same tensor-product method before the products \(\hat S_{1x}\hat S_{2x}\), \(\hat S_{1y}\hat S_{2y}\) and \(\hat S_{1z}\hat S_{2z}\) are summed.</p>
        `
      },
      {
        title: "Matrix shown in the section",
        icon: "fa-solid fa-border-all",
        color: "green",
        body: String.raw`
          <p>For \(s_1=1/2\) and \(s_2=1\), the resulting matrix is</p>
          <div class="eq key-eq">\[\hat H=\frac{\hbar^2}{2}\begin{pmatrix}1&0&0&0&0&0\\0&0&0&\sqrt{2}&0&0\\0&0&-1&0&\sqrt{2}&0\\0&\sqrt{2}&0&-1&0&0\\0&0&\sqrt{2}&0&0&0\\0&0&0&0&0&1\end{pmatrix}.\]</div>
          <p>The local basis vector example is \(|s_1,s_2,m_1,m_2\rangle=|s_1,m_1\rangle\otimes |s_2,m_2\rangle\).</p>
        `
      },
      {
        title: "Example local vector",
        icon: "fa-solid fa-vector-square",
        color: "purple",
        body: String.raw`
          <p>The same expansion applies to vectors. The example state is</p>
          <div class="eq">\[\left|\frac12,1,\frac12,0\right\rangle=\left|\frac12,\frac12\right\rangle\otimes |1,0\rangle.\]</div>
          <p>With the column vectors used in the section, this gives</p>
          <div class="eq key-eq">\[\left|\frac12,1,\frac12,0\right\rangle=\begin{pmatrix}1\\0\end{pmatrix}\otimes\begin{pmatrix}0\\1\\0\end{pmatrix}=\begin{pmatrix}0\\1\\0\\0\\0\\0\end{pmatrix}.\]</div>
        `
      }
    ]
  },
  {
    id: "7.5",
    file: "local-basis-vs-coupled-basis-clebsch-gordan-coefficients.html",
    title: "Local basis vs. coupled basis: Clebsch-Gordan coefficients",
    subtitle: "The matrix that relates the two bases",
    description: "Clebsch-Gordan coefficients relate local and coupled basis vectors and form the change-of-basis matrix.",
    focus: "Clebsch-Gordan coefficients and the local-to-coupled basis matrix",
    keyEquations: [
      String.raw`\[|l_1,l_2,l,m\rangle=\sum_{m_1}\sum_{m_2}\langle l_1,l_2,m_1,m_2|l_1,l_2,l,m\rangle |l_1,l_2,m_1,m_2\rangle\]`,
      String.raw`\[|l,m\rangle=\hat U|m_1,m_2\rangle\]`
    ],
    guide: String.raw`<p>After the Hilbert space is expanded, the next question is how to change from the local basis to the coupled basis. The answer is the Clebsch-Gordan matrix.</p>`,
    cards: [
      {
        title: "Starting point",
        icon: "fa-solid fa-arrows-left-right",
        body: String.raw`
          <p>The total angular momentum is</p>
          <div class="eq key-eq">\[\vec{\hat L}=\vec{\hat L}_1+\vec{\hat L}_2.\]</div>
          <p>The local basis is \(|l_1,l_2,m_1,m_2\rangle\), while the coupled basis is \(|l_1,l_2,l,m\rangle\). For the maximum projection, there is a univocal relation:</p>
          <div class="eq">\[|l_1,l_2,l_{\max},m_{\max}\rangle=|l_1,l_2,m_{1\max},m_{2\max}\rangle.\]</div>
          <p>Lowering operators and orthogonality then generate the remaining coupled vectors.</p>
        `
      },
      {
        title: "Example 7.5 route: lowering and orthogonality",
        icon: "fa-solid fa-arrow-down-short-wide",
        color: "green",
        body: String.raw`
          <p>For \(l_1=l_2=1/2\), the maximum projection fixes the first vector:</p>
          <div class="eq key-eq">\[|1,+1\rangle=|+,+\rangle.\]</div>
          <p>Then apply \(\hat L_-=\hat L_{1-}+\hat L_{2-}\):</p>
          <div class="eq">\[\hat L_-|1,+1\rangle=(\hat L_{1-}+\hat L_{2-})|+,+\rangle.\]</div>
          <p>This gives the \(m=0\) triplet vector; applying \(\hat L_-\) once more gives the \(m=-1\) triplet vector:</p>
          <div class="eq">\[\begin{aligned}|1,0\rangle&=\frac{1}{\sqrt2}(|+,-\rangle+|-,+\rangle),\\ |1,-1\rangle&=|-,-\rangle.\end{aligned}\]</div>
          <p>The missing singlet is found by writing \(|0,0\rangle=a|+,-\rangle+b|-,+\rangle\), using \(\langle1,0|0,0\rangle=0\), and normalizing:</p>
          <div class="eq">\[|0,0\rangle=\frac{1}{\sqrt2}(|+,-\rangle-|-,+\rangle).\]</div>
        `
      },
      {
        title: "Completeness and coefficients",
        icon: "fa-solid fa-sigma",
        color: "purple",
        body: String.raw`
          <p>Using the completeness relation of the local basis, the coupled vector is written as</p>
          <div class="eq key-eq">\[|l_1,l_2,l,m\rangle=\sum_{m_1}\sum_{m_2}\langle l_1,l_2,m_1,m_2|l_1,l_2,l,m\rangle |l_1,l_2,m_1,m_2\rangle.\]</div>
          <p>The coefficients \(\langle l_1,l_2,m_1,m_2|l_1,l_2,l,m\rangle\) are the Clebsch-Gordan coefficients. They measure the relation between a local vector and a coupled vector. They are real and form a unitary matrix.</p>
        `
      },
      {
        title: "Selection conditions",
        icon: "fa-solid fa-filter",
        color: "orange",
        body: String.raw`
          <p>The Wigner \(3j\) symbol and the Racah formula give the coefficients. The formula is zero unless the conditions below are satisfied:</p>
          <div class="eq key-eq">\[m=m_1+m_2,\qquad |l_1-l_2|\le l\le l_1+l_2.\]</div>
          <p>These are the same conditions obtained from the coupled-basis construction.</p>
        `
      }
    ],
    fullWidth: [
      {
        title: "Example 7.6: change-of-basis matrix for l1 = l2 = 1/2",
        icon: "fa-solid fa-table-cells-large",
        color: "purple",
        body: String.raw`
          <p>The local basis is ordered as \(|+,+\rangle, |+,-\rangle, |-,+\rangle, |-,-\rangle\). The coupled basis is ordered as \(|1,1\rangle, |1,0\rangle, |1,-1\rangle, |0,0\rangle\).</p>
          <p>The Clebsch-Gordan coefficients form the matrix in</p>
          <div class="eq key-eq">\[|l,m\rangle=\hat U|m_1,m_2\rangle.\]</div>
          <p>With coupled vectors as rows and local vectors as columns, the matrix of coefficients is</p>
          <div class="eq">\[\hat U=\begin{pmatrix}\langle +,+|1,1\rangle&\langle +,-|1,1\rangle&\langle -, +|1,1\rangle&\langle -,-|1,1\rangle\\ \langle +,+|1,0\rangle&\langle +,-|1,0\rangle&\langle -, +|1,0\rangle&\langle -,-|1,0\rangle\\ \langle +,+|1,-1\rangle&\langle +,-|1,-1\rangle&\langle -, +|1,-1\rangle&\langle -,-|1,-1\rangle\\ \langle +,+|0,0\rangle&\langle +,-|0,0\rangle&\langle -, +|0,0\rangle&\langle -,-|0,0\rangle\end{pmatrix}.\]</div>
          <p>The zero entries are selected by \(m=m_1+m_2\); the nonzero entries are the Clebsch-Gordan coefficients. For this example:</p>
          <div class="eq key-eq">\[\hat U=\begin{pmatrix}1&0&0&0\\0&1/\sqrt2&1/\sqrt2&0\\0&0&0&1\\0&1/\sqrt2&-1/\sqrt2&0\end{pmatrix}.\]</div>
        `
      },
      {
        title: "Reading U and U dagger",
        icon: "fa-solid fa-arrows-left-right",
        color: "green",
        body: String.raw`
          <p>Each row of \(\hat U\) gives one coupled vector expanded in the local basis. This reproduces the vectors obtained in Example 7.5 by successive application of \(\hat L_-\).</p>
          <p>Because \(\hat U\) is unitary, the inverse change of basis is</p>
          <div class="eq key-eq">\[|m_1,m_2\rangle=\hat U^{-1}|l,m\rangle=\hat U^\dagger|l,m\rangle.\]</div>
          <p>For the same ordering of vectors,</p>
          <div class="eq">\[\hat U^\dagger=\begin{pmatrix}1&0&0&0\\0&1/\sqrt2&0&1/\sqrt2\\0&1/\sqrt2&0&-1/\sqrt2\\0&0&1&0\end{pmatrix}.\]</div>
        `
      },
      {
        title: "Reading boundary for 3+ angular momenta",
        icon: "fa-solid fa-book-open",
        color: "orange",
        body: String.raw`
          <p>For three or more angular momenta, the coupled basis can be sequential or non-sequential, and the change-of-basis matrix is built recursively from Clebsch-Gordan coefficients.</p>
          <p>This app keeps the two-angular-momentum case as the worked example. The detailed construction for three and \(N\) angular momenta remains in Chapter 7.</p>
        `
      }
    ]
  },
  {
    id: "7.6",
    file: "basis-change-of-an-operator.html",
    title: "Basis change of an operator",
    subtitle: "Using the Clebsch-Gordan matrix to transform operators",
    description: "The Clebsch-Gordan matrix changes an operator from the local basis to the coupled basis.",
    focus: "operator basis change using the Clebsch-Gordan matrix",
    keyEquations: [
      String.raw`\[\hat A_d=\hat U\hat A_a\hat U^\dagger\]`,
      String.raw`\[\hat H_d=\frac{\hbar^2}{4}\begin{pmatrix}1&0&0&0\\0&1&0&0\\0&0&1&0\\0&0&0&-3\end{pmatrix}\]`
    ],
    guide: String.raw`<p>The section uses the change-of-basis matrix obtained from Clebsch-Gordan coefficients to transform an operator. The purpose is practical: many operators are not diagonal in the local basis but become diagonal in the coupled basis.</p>`,
    cards: [
      {
        title: "Basis-change rule",
        icon: "fa-solid fa-right-left",
        body: String.raw`
          <p>The operator before the change of basis is \(\hat A_a\). After the change, it is</p>
          <div class="eq key-eq">\[\hat A_d=\hat U\hat A_a\hat U^\dagger,\]</div>
          <p>where \(\hat U\) is the change-of-basis matrix and \(\hat U^\dagger\) is its conjugate transpose.</p>
        `
      },
      {
        title: "Operator used in the example",
        icon: "fa-solid fa-circle-nodes",
        color: "green",
        body: String.raw`
          <p>The example returns to the scalar-product operator</p>
          <div class="eq key-eq">\[\hat H=\vec{\hat S}_1\cdot\vec{\hat S}_2=\hat S_{1x}\hat S_{2x}+\hat S_{1y}\hat S_{2y}+\hat S_{1z}\hat S_{2z},\]</div>
          <p>now with \(s_1=s_2=1/2\). In the local basis, after the Hilbert-space expansion, the operator is</p>
          <div class="eq">\[\hat H_a=\frac{\hbar^2}{4}\begin{pmatrix}1&0&0&0\\0&-1&2&0\\0&2&-1&0\\0&0&0&1\end{pmatrix}.\]</div>
        `
      },
      {
        title: "Transform to the coupled basis",
        icon: "fa-solid fa-repeat",
        color: "purple",
        body: String.raw`
          <p>Using the matrix \(\hat U\) from the \(l_1=l_2=1/2\) coupling,</p>
          <div class="eq key-eq">\[\hat H_d=\hat U\hat H_a\hat U^\dagger.\]</div>
          <p>The result is diagonal:</p>
          <div class="eq key-eq">\[\hat H_d=\frac{\hbar^2}{4}\begin{pmatrix}1&0&0&0\\0&1&0&0\\0&0&1&0\\0&0&0&-3\end{pmatrix}.\]</div>
        `
      },
      {
        title: "Reading the result",
        icon: "fa-solid fa-magnifying-glass-chart",
        color: "orange",
        body: String.raw`
          <p>The transformed operator has three degenerate states with eigenvalue \(\hbar^2/4\) and one non-degenerate state with eigenvalue \(-3\hbar^2/4\).</p>
          <p>The section also emphasizes that changing from local to coupled basis does not necessarily diagonalize every operator.</p>
        `
      }
    ]
  },
  {
    id: "7.7",
    file: "application-magnetic-moment-and-zeeman-effect.html",
    title: "Application 7.A: Magnetic moment and the Zeeman effect",
    subtitle: "Projection along total angular momentum and the Lande factor",
    description: "Application 7.A derives the magnetic moment projection, the Lande factor and the Zeeman Hamiltonian in the coupled basis.",
    focus: "magnetic moment, Zeeman Hamiltonian and the Lande factor",
    keyEquations: [
      String.raw`\[\vec{\hat\mu}_J=-g_J\mu_B\vec{\hat J}\]`,
      String.raw`\[g\equiv g_J=1+\frac{j(j+1)-l(l+1)+s(s+1)}{2j(j+1)},\qquad \hat H_Z=g_J\mu_B\vec{\hat J}\cdot\vec B\]`
    ],
    guide: String.raw`<p>The application uses the addition of spin and orbital angular momenta to write the magnetic moment of an atom and the Zeeman Hamiltonian. The key step is the projection of \(\vec{\hat\mu}\) along \(\vec{\hat J}\).</p>`,
    cards: [
      {
        title: "Zeeman starting point",
        icon: "fa-solid fa-magnet",
        body: String.raw`
          <p>The Zeeman Hamiltonian is first written as</p>
          <div class="eq">\[\hat H_Z=\frac{\mu_B}{\hbar}(2\vec{\hat S}+\vec{\hat L})\cdot\vec B.\]</div>
          <p>Using dimensionless angular momenta, the section rewrites it as</p>
          <div class="eq key-eq">\[\hat H_Z=\mu_B(2\vec{\hat S}+\vec{\hat L})\cdot\vec B.\]</div>
        `
      },
      {
        title: "Spin, orbital and total magnetic moments",
        icon: "fa-solid fa-compass",
        color: "green",
        body: String.raw`
          <div class="eq">\[\hat H_Z^{(S)}=2\mu_B\vec{\hat S}\cdot\vec B=-\vec{\hat\mu}_S\cdot\vec B,\qquad \vec{\hat\mu}_S=-g_S\mu_B\vec{\hat S},\quad g_S=2.\]</div>
          <div class="eq">\[\hat H_Z^{(L)}=\mu_B\vec{\hat L}\cdot\vec B=-\vec{\hat\mu}_L\cdot\vec B,\qquad \vec{\hat\mu}_L=-g_L\mu_B\vec{\hat L},\quad g_L=1.\]</div>
          <p>The total magnetic moment is therefore</p>
          <div class="eq key-eq">\[\vec{\hat\mu}=-\mu_B(\vec{\hat L}+2\vec{\hat S}).\]</div>
        `
      },
      {
        title: "Projection along J",
        icon: "fa-solid fa-arrows-to-dot",
        color: "purple",
        body: String.raw`
          <p>The total angular momentum is</p>
          <div class="eq">\[\vec{\hat J}=\vec{\hat L}+\vec{\hat S}.\]</div>
          <p>Only the component of \(\vec{\hat\mu}\) along \(\vec{\hat J}\) contributes to the magnetic energy. The projection gives</p>
          <div class="eq key-eq">\[\vec{\hat\mu}_J=-\frac{\mu_B}{2\hat J^2}(3\hat J^2-\hat L^2+\hat S^2)\vec{\hat J}.\]</div>
          <p>By analogy with \(\vec{\hat\mu}_S\) and \(\vec{\hat\mu}_L\), write</p>
          <div class="eq">\[\vec{\hat\mu}_J=-g_J\mu_B\vec{\hat J}.\]</div>
        `
      },
      {
        title: "Lande factor and final Hamiltonian",
        icon: "fa-solid fa-bullseye",
        color: "orange",
        body: String.raw`
          <p>In the coupled basis \(|s,l,j,m_j\rangle\), the Landé factor becomes</p>
          <div class="eq key-eq">\[g\equiv g_J=1+\frac{j(j+1)-l(l+1)+s(s+1)}{2j(j+1)}.\]</div>
          <p>The Zeeman Hamiltonian can be written as</p>
          <div class="eq key-eq">\[\hat H_Z=-\vec{\hat\mu}_J\cdot\vec B=g_J\mu_B\vec{\hat J}\cdot\vec B.\]</div>
        `
      }
    ],
    fullWidth: [
      {
        title: "Projection geometry",
        icon: "fa-solid fa-diagram-project",
        color: "green",
        body: String.raw`
          <p>The magnetic moment is not parallel to the total angular momentum because the spin and orbital parts have different gyromagnetic factors. The energy keeps the projection of \(\vec{\hat\mu}\) along \(\vec{\hat J}\).</p>
          ${zeemanSchematic()}
        `
      },
      {
        title: "Algebraic route to the Landé factor",
        icon: "fa-solid fa-route",
        color: "orange",
        body: String.raw`
          <p>The projection uses</p>
          <div class="eq">\[\vec{\hat J}=\vec{\hat L}+\vec{\hat S},\qquad \vec{\hat\mu}=-\mu_B(\vec{\hat L}+2\vec{\hat S}).\]</div>
          <p>The projected magnetic moment is</p>
          <div class="eq key-eq">\[\vec{\hat\mu}_J=-\frac{\mu_B}{2\hat J^2}(3\hat J^2-\hat L^2+\hat S^2)\vec{\hat J}.\]</div>
          <p>Using the eigenvalues in the coupled basis gives the Landé factor</p>
          <div class="eq key-eq">\[g\equiv g_J=1+\frac{j(j+1)-l(l+1)+s(s+1)}{2j(j+1)}.\]</div>
          <p>The tensor form of the Landé factor is complementary material and remains outside this app summary.</p>
        `
      }
    ]
  },
  {
    id: "7.8",
    file: "application-angular-momentum-of-atoms-and-hunds-rules.html",
    title: "Application 7.B: Angular momentum of atoms and Hund's rules",
    subtitle: "Effective atomic angular momenta and term symbols",
    description: "Application 7.B applies angular-momentum addition to atoms, Hund's rules and Russell-Saunders notation.",
    focus: "effective atomic angular momenta, Hund's rules and Russell-Saunders notation",
    keyEquations: [
      String.raw`\[\vec{\hat S}=\sum_i\vec{\hat S}_i,\qquad \vec{\hat L}=\sum_i\vec{\hat L}_i\]`,
      String.raw`\[{}^{2s+1}X_j\]`
    ],
    guide: String.raw`<p>The application applies the addition of angular momenta to atoms. Closed shells do not contribute to the total angular momentum; only the incomplete shells determine the effective spin, orbital and total angular momenta.</p>`,
    cards: [
      {
        title: "Effective angular momenta",
        icon: "fa-solid fa-atom",
        body: String.raw`
          <p>In complete shells the total angular momentum is zero. For incomplete shells in light atoms, the spin angular momenta first couple to produce an effective spin:</p>
          <div class="eq key-eq">\[\vec{\hat S}=\sum_i \vec{\hat S}_i.\]</div>
          <p>The orbital angular momenta also couple:</p>
          <div class="eq key-eq">\[\vec{\hat L}=\sum_i \vec{\hat L}_i.\]</div>
          <p>These interact through spin-orbit coupling:</p>
          <div class="eq">\[\hat H=\zeta\vec{\hat S}\cdot\vec{\hat L}.\]</div>
          <p>This is the Russell-Saunders coupling route used for light atoms.</p>
        `
      },
      {
        title: "Heavy atoms and j-j coupling",
        icon: "fa-solid fa-layer-group",
        color: "green",
        body: String.raw`
          <p>For heavy atoms, each electron couples its spin and orbital momentum to produce its own total angular momentum. These individual total angular momenta then couple:</p>
          <div class="eq key-eq">\[\vec{\hat J}=\sum_i\vec{\hat J}_i.\]</div>
          <p>This case is known as \(j-j\) coupling.</p>
        `
      },
      {
        title: "Hund's rules",
        icon: "fa-solid fa-list-check",
        color: "purple",
        body: String.raw`
          <ul class="bullet">
            <li>First rule: fill the available orbitals one by one, respecting the Pauli exclusion principle, so that the effective spin momentum has its maximum value.</li>
            <li>Second rule: once the spin is fixed, choose the maximum effective orbital momentum.</li>
            <li>Third rule: the sign of \(\zeta\) determines whether the ground state has \(\vec{\hat S}\) antiparallel or parallel to \(\vec{\hat L}\).</li>
          </ul>
          <div class="eq">\[\zeta>0:\ j=|l-s|,\qquad \zeta<0:\ j=l+s.\]</div>
          <p>For shells less than half filled, \(\zeta>0\). For shells more than half filled, \(\zeta<0\).</p>
        `
      },
      {
        title: "Term symbol",
        icon: "fa-solid fa-signature",
        color: "orange",
        body: String.raw`
          <p>The angular momenta are written in Russell-Saunders notation, known as the Term Symbol:</p>
          <div class="eq key-eq">\[{}^{2s+1}X_j.\]</div>
          <p>The letter \(X\) represents the effective orbital quantum number \(l\) in spectroscopic notation:</p>
          <div class="table-wrap"><table><thead><tr><th>\(l\)</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr></thead><tbody><tr><td>\(X\)</td><td>S</td><td>P</td><td>D</td><td>F</td><td>G</td><td>H</td><td>I</td></tr></tbody></table></div>
        `
      }
    ],
    fullWidth: [
      {
        title: "Example: Sm3+",
        icon: "fa-solid fa-flask",
        color: "green",
        body: String.raw`
          <p>The application uses \(Sm^{3+}\), with electronic configuration</p>
          <div class="eq">\[Sm:[Xe]4f^6 6s^2\quad\longrightarrow\quad Sm^{3+}:[Xe]4f^5.\]</div>
          ${hundFillingDiagram()}
          <p>Hund's first rule gives \(s=5/2\). Hund's second rule gives \(l=+3+2+1+0-1=+5\). Because the \(f\) shell is less than half filled, Hund's third rule gives the ground-state multiplet \(j=|s-l|=5/2\).</p>
          <p>The multiplets listed in the application are \(j=5/2\) (ground state), \(7/2\), \(11/2\), \(13/2\) and \(15/2\). The ground state is written as</p>
          <div class="eq key-eq">\[{}^6H_{5/2}.\]</div>
        `
      },
      {
        title: "Physical reading of the rules",
        icon: "fa-solid fa-compass-drafting",
        color: "orange",
        body: String.raw`
          <p>The first rule follows the Pauli exclusion principle and the tendency to occupy different orbitals before pairing. The second rule selects the largest effective orbital angular momentum compatible with the spin choice.</p>
          <p>The third rule uses the spin-orbit term: for less than half-filled shells the ground state has \(\vec{\hat S}\) antiparallel to \(\vec{\hat L}\), while for more than half-filled shells it has them parallel.</p>
        `
      }
    ]
  },
  {
    id: "7.9",
    file: "addition-of-angular-momenta-chapter-synthesis.html",
    title: "Chapter synthesis: addition of angular momenta",
    subtitle: "Local bases, coupled bases, Clebsch-Gordan matrices and atomic applications",
    description: "Chapter 7 synthesis connects angular-momentum interactions, coupled bases, Hilbert-space expansion, Clebsch-Gordan coefficients, basis changes, Zeeman effect and Hund's rules.",
    focus: "the complete Chapter 7 route from angular-momentum interactions to coupled-basis applications",
    keyEquations: [
      String.raw`\[\{\hat L_1^2,\hat L_2^2,\hat L_{1z},\hat L_{2z}\}\quad\longleftrightarrow\quad |l_1,l_2,m_1,m_2\rangle\]`,
      String.raw`\[\{\hat L_1^2,\hat L_2^2,\hat L^2,\hat L_z\}\quad\longleftrightarrow\quad |l_1,l_2,l,m\rangle\]`,
      String.raw`\[m=m_1+m_2,\qquad |l_1-l_2|\le l\le l_1+l_2\]`,
      String.raw`\[|l_1,l_2,l,m\rangle=\sum_{m_1}\sum_{m_2}\langle l_1,l_2,m_1,m_2|l_1,l_2,l,m\rangle |l_1,l_2,m_1,m_2\rangle\]`
    ],
    guide: String.raw`<p>This synthesis keeps the logical route of Chapter 7 visible: physical interactions motivate the addition problem; the local and coupled bases organize the states; Clebsch-Gordan coefficients connect the bases; the same machinery is then used in the Zeeman effect and in Hund's rules.</p>`,
    cards: [
      {
        title: "Physical motivation",
        icon: "fa-solid fa-magnet",
        body: String.raw`
          <p>The chapter begins with Hamiltonians containing more than one angular momentum: exchange interactions, spin-orbit coupling, local anisotropy and the Zeeman interaction.</p>
          <p>Once the Hamiltonian contains two angular momenta, it becomes useful to compare the local basis with the coupled basis.</p>
        `
      },
      {
        title: "Local and coupled labels",
        icon: "fa-solid fa-layer-group",
        color: "green",
        body: String.raw`
          <p>The local basis keeps the individual projections \(m_1\) and \(m_2\) visible:</p>
          <div class="eq">\[\{\hat L_1^2,\hat L_2^2,\hat L_{1z},\hat L_{2z}\}\quad\longleftrightarrow\quad |l_1,l_2,m_1,m_2\rangle.\]</div>
          <p>The coupled basis keeps the total angular momentum and its projection visible:</p>
          <div class="eq key-eq">\[\{\hat L_1^2,\hat L_2^2,\hat L^2,\hat L_z\}\quad\longleftrightarrow\quad |l_1,l_2,l,m\rangle.\]</div>
        `
      },
      {
        title: "Allowed values",
        icon: "fa-solid fa-ruler-combined",
        color: "purple",
        body: String.raw`
          <p>The coupled basis must preserve the Hilbert-space dimension. For two angular momenta, the allowed values are</p>
          <div class="eq key-eq">\[|l_1-l_2|\le l\le l_1+l_2.\]</div>
          <p>The projection condition is</p>
          <div class="eq key-eq">\[m=m_1+m_2.\]</div>
          <p>For more than two angular momenta, sequential and non-sequential pairwise constructions are possible. Detailed \(3+\) coupling constructions remain in Chapter 7.</p>
        `
      },
      {
        title: "Expansion and change of basis",
        icon: "fa-solid fa-right-left",
        color: "orange",
        body: String.raw`
          <p>Tensor products expand local operators into the total Hilbert space:</p>
          <div class="eq">\[\hat L_{1u}=\hat L_u^{(1)}\otimes 1^{(2)}\otimes\cdots\otimes 1^{(N)}.\]</div>
          <p>Clebsch-Gordan coefficients then form the change-of-basis matrix \(\hat U\), and operators transform as</p>
          <div class="eq key-eq">\[\hat A_d=\hat U\hat A_a\hat U^\dagger.\]</div>
        `
      }
    ],
    fullWidth: [
      {
        title: "Exercise-ready map",
        icon: "fa-solid fa-map",
        color: "green",
        body: String.raw`
          <div class="table-wrap"><table><thead><tr><th>Chapter step</th><th>Main object</th><th>Typical exercise action</th></tr></thead><tbody>
          <tr><td>Interactions</td><td>\(\hat H\) with two angular momenta</td><td>identify the angular momenta and the physical interaction</td></tr>
          <tr><td>Commutation relations</td><td>local and coupled commuting sets</td><td>choose the basis compatible with the observables</td></tr>
          <tr><td>Coupled vectors</td><td>\(|l_1,l_2,l,m\rangle\), \(|l_{12},l_{13},l,m\rangle\), \(|l_{12},l_{34},l,m\rangle\)</td><td>list allowed intermediate and total values</td></tr>
          <tr><td>Hilbert expansion</td><td>tensor products with \(1^{(n)}\)</td><td>put operators and vectors in the same total dimension</td></tr>
          <tr><td>Clebsch-Gordan coefficients</td><td>\(\langle l_1,l_2,m_1,m_2|l_1,l_2,l,m\rangle\)</td><td>convert local vectors into coupled vectors</td></tr>
          <tr><td>Applications</td><td>\(\vec{\hat\mu}_J\), \(g_J\), Hund rules</td><td>read magnetic-moment projections and atomic term symbols</td></tr>
          </tbody></table></div>
        `
      },
      {
        title: "One route through the chapter",
        icon: "fa-solid fa-route",
        color: "purple",
        body: String.raw`
          <p>Start with the Hamiltonian, decide whether local or coupled labels expose the physics, expand operators when several Hilbert subspaces are present, use Clebsch-Gordan coefficients for the basis change, and then read the physical result in the coupled basis.</p>
          <p>The app keeps the central equations and representative examples; extended coupling schemes, long calculations and additional examples remain in Chapter 7.</p>
        `
      }
    ]
  }
];

pages.forEach((page, index) => {
  page.id = `7.${index + 1}`;
});

await mkdir(chapterDir, { recursive: true });
for (const entry of await readdir(chapterDir)) {
  if (entry.endsWith(".html")) await unlink(path.join(chapterDir, entry));
}

await Promise.all(pages.map((page, index) => writeFile(path.join(chapterDir, page.file), renderPage(page, index, pages.length))));

const data = {
  description: "Chapter 7 - Addition of angular momenta. A book-led sequence for interactions, commuting observables, coupled bases, Hilbert-space expansion, Clebsch-Gordan coefficients, basis changes, magnetic moments and Hund's rules.",
  topics: pages.map((page) => ({
    id: page.id,
    title: page.title,
    note: page.description,
    url: `slides/chapter-07/${page.file}`,
    ...(page.aiExercise === false ? {} : { aiExercise: true })
  }))
};

await writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${pages.length} Chapter 7 pages and updated data/chapter-07.json.`);
