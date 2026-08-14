import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const outputDir = resolve(root, "slides/chapter-08");

const pages = [
  {
    id: "8.1", file: "why-perturbation-theory-is-needed.html", title: "Time-independent perturbation theory: chapter roadmap",
    subtitle: String.raw`FROM A SOLVABLE HAMILTONIAN TO FIELD-DEPENDENT OBSERVABLES`,
    guide: String.raw`Many quantum-mechanical problems require approximation methods. This chapter develops time-independent perturbation theory for spectra with and without degeneracy, then applies it to van Vleck susceptibility and the Stark effect.`,
    cards: [
      [String.raw`The two cases`, String.raw`The first part treats a non-degenerate unperturbed spectrum. The second treats a spectrum with degenerate energy states. The distinction is decisive because the denominators used in the non-degenerate correction cannot be used inside a degenerate domain.`, String.raw`\[\hat H=\hat H_0+\lambda\hat W,\qquad 0\leq\lambda\leq1.\]`],
      [String.raw`Logical route`, String.raw`Begin with the eigenvectors and eigenvalues of \(\hat H_0\). Expand the energy and the vector in powers of \(\lambda\), substitute in the eigenvalue equation, and compare equal powers of \(\lambda\). For a degenerate domain, first construct and diagonalize its reduced perturbation.`],
      [String.raw`Applications`, String.raw`The resulting first- and second-order energy corrections are used with the magnetic-field expansion for van Vleck susceptibility. For the Stark effect, a constant electric field perturbs the degenerate Hydrogen spectrum.`],
      [String.raw`Reading boundary`, String.raw`This roadmap keeps the route visible. The detailed derivations, extended examples, and exercises remain in Chapter 8.`]
    ]
  },
  {
    id: "8.2", file: "hamiltonian-state-and-energy-expansions.html", title: "Non-degenerate case: overview",
    subtitle: String.raw`SETUP, PERTURBATIVE EXPANSIONS, AND ORDERS IN \(\lambda\)`,
    guide: String.raw`For a non-degenerate \(\hat H_0\), each vector \(\lvert n^{(0)}\rangle\) is associated with one energy eigenvalue. The problem is to obtain the eigenvalues and vectors of \(\hat H=\hat H_0+\lambda\hat W\) as expansions in \(\lambda\).`,
    cards: [
      [String.raw`Unperturbed and total problems`, String.raw`The unperturbed vectors are orthogonal. The perturbation \(\hat W\) is Hermitian and is written in the basis \(\{\lvert n^{(0)}\rangle\}\). The total Hamiltonian is diagonal in another orthogonal basis \(\{\lvert n\rangle\}\).`, String.raw`\[\hat H_0\lvert n^{(0)}\rangle=E_n^{(0)}\lvert n^{(0)}\rangle,\qquad \langle m^{(0)}\vert n^{(0)}\rangle=\delta_{mn},\]
\[\hat H\lvert n\rangle=E_n\lvert n\rangle,\qquad \langle m\vert n\rangle=\delta_{mn}.\]`],
      [String.raw`Expansions`, String.raw`The perturbative calculation is organized by powers of the strength \(\lambda\).`, String.raw`\[\lvert n\rangle=\lvert n^{(0)}\rangle+\lambda\lvert n^{(1)}\rangle+\lambda^2\lvert n^{(2)}\rangle+\cdots,\]
\[E_n=E_n^{(0)}+\lambda E_n^{(1)}+\lambda^2E_n^{(2)}+\cdots.\]`],
      [String.raw`Equal powers of \(\lambda\)`, String.raw`Substitution in the total eigenvalue equation gives a sequence of equations. The first three establish the route to the first- and second-order corrections.`, String.raw`\[\lambda^0:\ (\hat H_0-E_n^{(0)})\lvert n^{(0)}\rangle=0,\]
\[\lambda^1:\ (\hat H_0-E_n^{(0)})\lvert n^{(1)}\rangle=-\hat W\lvert n^{(0)}\rangle+E_n^{(1)}\lvert n^{(0)}\rangle,\]
\[\lambda^2:\ (\hat H_0-E_n^{(0)})\lvert n^{(2)}\rangle=-\hat W\lvert n^{(1)}\rangle+E_n^{(1)}\lvert n^{(1)}\rangle+E_n^{(2)}\lvert n^{(0)}\rangle.\]`],
      [String.raw`Normalization conditions`, String.raw`Orthogonality of the exact vectors also constrains the corrections.`, String.raw`\[\langle n^{(0)}\vert n^{(1)}\rangle+\langle n^{(1)}\vert n^{(0)}\rangle=0,\]
\[\langle n^{(0)}\vert n^{(2)}\rangle+\langle n^{(1)}\vert n^{(1)}\rangle+\langle n^{(2)}\vert n^{(0)}\rangle=0.\]`]
    ]
  },
  {
    id: "8.3", file: "first-order-non-degenerate-corrections.html", title: "Non-degenerate case: first-order energy and vectors",
    subtitle: String.raw`DIAGONAL ENERGY SHIFT AND STATE MIXING`,
    guide: String.raw`Applying \(\langle n^{(0)}\rvert\) to the first-order equation gives the energy correction. Applying \(\langle m^{(0)}\rvert\) for \(m\ne n\) gives the coefficients of the first vector correction.`,
    cards: [
      [String.raw`First-order energy`, String.raw`The left-hand side vanishes because \(\langle n^{(0)}\rvert\hat H_0=\langle n^{(0)}\rvert E_n^{(0)}\). Hence the first energy correction is the diagonal element of \(\hat W\) in the unperturbed basis.`, String.raw`\[E_n^{(1)}=\langle n^{(0)}\vert\hat W\vert n^{(0)}\rangle.\]`],
      [String.raw`First-order vector`, String.raw`The vector correction contains all unperturbed states other than the reference state. Its coefficient increases as the energy gap decreases.`, String.raw`\[\lvert n^{(1)}\rangle=\sum_{m\ne n}\frac{\langle m^{(0)}\vert\hat W\vert n^{(0)}\rangle}{E_n^{(0)}-E_m^{(0)}}\lvert m^{(0)}\rangle.\]`],
      [String.raw`Example 8.1 and 8.2`, String.raw`For the chapter's three-dimensional example, \(\hat H_0=\operatorname{diag}(1,3,-2)\) and \(\hat W\) has non-zero elements \(W_{12}=W_{21}=W_{33}=1\). The diagonal entries give the first-order energies, then the off-diagonal entries give the vector corrections.`, String.raw`\[E_1^{(1)}=0,\qquad E_2^{(1)}=0,\qquad E_3^{(1)}=1,\]
\[\lvert1^{(1)}\rangle=-\frac12\lvert2^{(0)}\rangle,\qquad \lvert2^{(1)}\rangle=\frac12\lvert1^{(0)}\rangle,\qquad \lvert3^{(1)}\rangle=0.\]`],
      [String.raw`Physical reading`, String.raw`A diagonal perturbation changes an energy at first order. Off-diagonal elements mix unperturbed states. The expression is valid only when \(E_n^{(0)}\ne E_m^{(0)}\) for the denominator in every term.`]
    ]
  },
  {
    id: "8.4", file: "second-order-energy-correction.html", title: "Non-degenerate case: second-order energy and vectors",
    subtitle: String.raw`SECOND-ORDER SHIFTS, NORMALIZATION, AND MIXING`,
    guide: String.raw`The second-order energy follows from the \(\lambda^2\) equation after projection on \(\langle n^{(0)}\rvert\). The second correction to the vector contains a normalization term, diagonal-off-diagonal terms, and paths through intermediate states.`,
    cards: [
      [String.raw`Second-order energy`, String.raw`Hermiticity of \(\hat W\) turns the product of matrix elements into an absolute square.`, String.raw`\[E_n^{(2)}=\sum_{m\ne n}\frac{\left\lvert\langle m^{(0)}\vert\hat W\vert n^{(0)}\rangle\right\rvert^2}{E_n^{(0)}-E_m^{(0)}}.\]`],
      [String.raw`Second-order vector`, String.raw`With \(W_{ab}=\langle a^{(0)}\vert\hat W\vert b^{(0)}\rangle\) and \(E_{ab}=E_a^{(0)}-E_b^{(0)}\), the result is:`, String.raw`\[\begin{aligned}\lvert n^{(2)}\rangle={}&-\frac12\sum_{m\ne n}\frac{|W_{mn}|^2}{E_{nm}^2}\lvert n^{(0)}\rangle-\sum_{m\ne n}\frac{W_{nn}W_{mn}}{E_{nm}^2}\lvert m^{(0)}\rangle\\&+\sum_{m\ne n}\sum_{l\ne n}\frac{W_{ml}W_{ln}}{E_{nm}E_{nl}}\lvert m^{(0)}\rangle.\end{aligned}\]`],
      [String.raw`Example 8.3`, String.raw`For the same three-dimensional example, the energy corrections are obtained directly from the non-zero off-diagonal elements.`, String.raw`\[E_1^{(2)}=-\frac12,\qquad E_2^{(2)}=\frac12,\qquad E_3^{(2)}=0,\]
\[\lvert1^{(2)}\rangle=-\frac18\lvert1^{(0)}\rangle,\qquad \lvert2^{(2)}\rangle=-\frac18\lvert2^{(0)}\rangle.\]`],
      [String.raw`Combined result`, String.raw`Keeping terms through second order reproduces the small-\(\lambda\) expansion of the exact example.`, String.raw`\[E_1=1-\frac{\lambda^2}{2},\qquad E_2=3+\frac{\lambda^2}{2},\qquad E_3=-2+\lambda,\]
\[\lvert1\rangle=\lvert1^{(0)}\rangle-\frac{\lambda}{2}\lvert2^{(0)}\rangle-\frac{\lambda^2}{8}\lvert1^{(0)}\rangle.\]`]
    ]
  },
  {
    id: "8.5", file: "why-degeneracy-changes-the-method.html", title: "Degenerate case: overview",
    subtitle: String.raw`DEGENERACY DOMAINS AND COMPLEMENTARY PROJECTORS`,
    guide: String.raw`When more than one unperturbed vector has the same energy, the non-degenerate second-order denominator diverges. The method therefore separates the degenerate domain from its complement with projection operators.`,
    cards: [
      [String.raw`The obstruction`, String.raw`There is a set of vectors \(\lvert l^{(0)}\rangle\) with the same eigenvalue. A term with \(E_n^{(0)}-E_m^{(0)}=0\) prevents direct use of the non-degenerate formulas.`, String.raw`\[\hat H_0\lvert n^{(0)}\rangle=E_n^{(0)}\lvert n^{(0)}\rangle.\]`],
      [String.raw`Projection operators`, String.raw`Let \(B\) be the degeneracy domain and \(A\) its complement. The two projectors resolve the identity.`, String.raw`\[\hat A=\sum_{k\notin B}\lvert k^{(0)}\rangle\langle k^{(0)}\rvert,\qquad \hat B=\sum_{l\in B}\lvert l^{(0)}\rangle\langle l^{(0)}\rvert,\]
\[\hat A+\hat B=1,\qquad \hat A^2=\hat A,\qquad \hat A\hat B=0,\qquad [\hat A,\hat H_0]=0.\]`],
      [String.raw`Example 8.5`, String.raw`For \(\hat H_0=\operatorname{diag}(0,1,1)\), the vectors \(\lvert2^{(0)}\rangle\) and \(\lvert3^{(0)}\rangle\) form the degenerate domain \(B\).`, String.raw`\[\hat A=\lvert1^{(0)}\rangle\langle1^{(0)}\rvert,\qquad \hat B=\lvert2^{(0)}\rangle\langle2^{(0)}\rvert+\lvert3^{(0)}\rangle\langle3^{(0)}\rvert.\]`],
      [String.raw`What changes`, String.raw`The exact vector must recover an appropriate vector inside its degeneracy domain as \(\lambda\to0\). The reduced perturbation selects that combination before energy denominators are used.`]
    ]
  },
  {
    id: "8.6", file: "first-order-degenerate-perturbation-theory.html", title: "Degenerate case: first-order energy",
    subtitle: String.raw`REDUCED PERTURBATIONS AND THE CORRECT ZEROTH-ORDER VECTORS`,
    guide: String.raw`Projecting the total eigenvalue equation onto \(A\) and \(B\) produces reduced perturbations. Within a degeneracy domain, the eigenvalues of the reduced perturbation are the first energy corrections.`,
    cards: [
      [String.raw`Projected vectors and perturbations`, String.raw`Define the components of the exact vector and the reduced perturbations.`, String.raw`\[\hat A\lvert n\rangle=\lvert n_a\rangle,\qquad \hat B\lvert n\rangle=\lvert n_b\rangle,\]
\[\hat W_A=\hat A\hat W\hat A,\qquad \hat W_B=\hat B\hat W\hat B.\]`],
      [String.raw`First-order equation in \(B\)`, String.raw`Expanding the projected equation and collecting \(\lambda^0\) and \(\lambda^1\) yields:`, String.raw`\[(\hat H_0-E_{n_b}^{(0)})\hat B\lvert n_b^{(0)}\rangle=0,\]
\[(\hat W_B-E_{n_b}^{(1)}\hat B)\lvert n_b^{(0)}\rangle=0.\]`],
      [String.raw`Meaning`, String.raw`The eigenvectors of \(\hat W_B\), expressed in the degenerate subspace, are the correct \(\lvert n_b^{(0)}\rangle\). Their eigenvalues are \(E_{n_b}^{(1)}\). The same construction applies to every degeneracy domain.`],
      [String.raw`Example 8.6`, String.raw`For the degenerate pair in Example 8.5, the \(B\)-reduced perturbation has off-diagonal entries \(2\). It gives the first-order corrections and selected combinations.`, String.raw`\[E_{1b}^{(1)}=-2,\qquad E_{2b}^{(1)}=+2,\]
\[\lvert1_b^{(0)}\rangle=\frac1{\sqrt2}\left[-\lvert2^{(0)}\rangle+\lvert3^{(0)}\rangle\right],\qquad \lvert2_b^{(0)}\rangle=\frac1{\sqrt2}\left[\lvert2^{(0)}\rangle+\lvert3^{(0)}\rangle\right].\]`],
      [String.raw`Vector correction`, String.raw`The first correction to the vectors is developed in Chapter 8. Its construction is not repeated here; it restores the components outside and within the selected degeneracy domain while preserving the \(\lambda\to0\) limit.`]
    ]
  },
  {
    id: "8.7", file: "degenerate-state-and-second-order-corrections.html", title: "Degenerate case: second-order energy",
    subtitle: String.raw`COUPLING TO STATES OUTSIDE THE DEGENERACY DOMAIN`,
    guide: String.raw`After the first-order reduced problem has chosen \(\lvert n_b^{(0)}\rangle\), the second-order energy comes from its coupling to states outside the reference domain.`,
    cards: [
      [String.raw`Projected second-order equation`, String.raw`Using the energy expansion through second order and the vector expansion through first order gives:`, String.raw`\[E_{n_b}^{(2)}\lvert n_b^{(0)}\rangle+E_{n_b}^{(1)}\lvert n_b^{(1)}\rangle=\hat B\left(\hat W\lvert n_a^{(1)}\rangle+\hat W\lvert n_b^{(1)}\rangle\right).\]`],
      [String.raw`Energy correction`, String.raw`The contribution involving \(\lvert n_b^{(1)}\rangle\) vanishes because \(\hat W_B\) is diagonal in the selected basis and the correction excludes the reference vector. The final result is:`, String.raw`\[E_{n_b}^{(2)}=\sum_{k\notin B}\frac{\left\lvert\langle k^{(0)}\vert\hat W\vert n_b^{(0)}\rangle\right\rvert^2}{E_b^{(0)}-E_k^{(0)}}.\]`],
      [String.raw`Example 8.8`, String.raw`For the chapter's three-dimensional degenerate example, the corrections are:`, String.raw`\[E_{1a}^{(2)}=-5,\qquad E_{1b}^{(2)}=\frac12,\qquad E_{2b}^{(2)}=\frac92,\]
\[E_{1a}=\lambda-5\lambda^2,\qquad E_{1b}=1-2\lambda+\frac{\lambda^2}{2},\qquad E_{2b}=1+2\lambda+\frac{9\lambda^2}{2}.\]`],
      [String.raw`Boundary of the sum`, String.raw`Unlike the non-degenerate expression, the sum explicitly excludes all states in \(B\). The internal degeneracy was already resolved by diagonalizing \(\hat W_B\) at first order.`]
    ]
  },
  {
    id: "8.8", file: "van-vleck-susceptibility.html", title: "Application: van Vleck susceptibility",
    subtitle: String.raw`FROM FIELD-DEPENDENT ENERGY TO THERMAL MAGNETIZATION`,
    guide: String.raw`van Vleck susceptibility uses perturbation theory when the spectrum cannot be determined exactly. The perturbation parameter is the magnetic-field component along a crystal axis.`,
    cards: [
      [String.raw`Magnetic moment and thermal average`, String.raw`For \(\vec B=B_u\hat u\), the Zeeman energy is \(E_i=-(\mu_i)_uB_u\). The magnetic moment and the thermal average are:`, String.raw`\[(\mu_i)_u=-\frac{\partial E_i}{\partial B_u},\qquad \langle\hat O\rangle=\frac{\sum_i O_i e^{-E_i\beta}}{\sum_i e^{-E_i\beta}},\qquad \beta=\frac1{k_BT}.\]`],
      [String.raw`Energy expansion`, String.raw`Here the expansion is in \(B_u\), with \(B_u/k_BT\ll1\).`, String.raw`\[E_i=E_i^{(0)}+E_i^{(1)}B_u+E_i^{(2)}B_u^2+\cdots,\qquad (\mu_i)_u=-E_i^{(1)}-2E_i^{(2)}B_u-\cdots.\]`],
      [String.raw`Susceptibility`, String.raw`After retaining terms through first order in \(B_u\) and using zero-field magnetization, the susceptibility for \(u=v\) is:`, String.raw`\[\chi_{uu}=N\mu_0\frac{\sum_i\left[(E_i^{(1)})^2\beta-2E_i^{(2)}\right]e^{-E_i^{(0)}\beta}}{\sum_i e^{-E_i^{(0)}\beta}}.\]`],
      [String.raw`Example 8.9`, String.raw`For \(\hat H=D\hat J_z^2+\mu_Bg_u\hat J_uB_u\), identify \(\hat H_0=D\hat J_z^2\), \(\hat W=\mu_Bg_u\hat J_u\), and \(\lambda=B_u\). The chapter develops the \(j=3/2\), \(u=x\) case by reduced perturbations before using the susceptibility expression.`]
    ]
  },
  {
    id: "8.9", file: "hydrogen-atom-in-an-electric-field.html", title: "Application: Stark effect",
    subtitle: String.raw`HYDROGEN IN A CONSTANT ELECTRIC FIELD`,
    guide: String.raw`The Stark effect is the influence of a constant electric field on a Hydrogen atom. Since the Hydrogen spectrum is degenerate, the degenerate perturbation procedure is used.`,
    cards: [
      [String.raw`Unperturbed Hydrogen atom`, String.raw`The unperturbed Hamiltonian, wave function, and spectrum are:`, String.raw`\[\hat H_0=\frac{\hat p^2}{2m}-\frac{1}{4\pi\epsilon_0}\frac{e^2}{r},\qquad \Psi_{nlm}(r,\theta,\phi)=R_{nl}(r)Y_{lm}(\theta,\phi),\]
\[E_n^{(0)}=-\frac{E_0}{n^2},\qquad \hat H_0\lvert nlm\rangle=E_n^{(0)}\lvert nlm\rangle.\]`],
      [String.raw`Electric perturbation`, String.raw`For a field along \(z\), the perturbation is:`, String.raw`\[\hat W=e\mathcal E\hat z.\]`],
      [String.raw`Selection rules`, String.raw`The commutator with \(\hat L_z\) gives the selection rule for \(m\). The angular-momentum calculation gives the rules for \(l\).`, String.raw`\[m_1=m,\qquad l_1=l\pm1,\qquad l_1=l=0.\]`],
      [String.raw`The \(n=2\) domain`, String.raw`In the \(n=2\) degenerate domain, only \(\lvert200\rangle\) and \(\lvert210\rangle\) are mixed. The reduced perturbation gives:`, String.raw`\[\lvert3_b^{(0)}\rangle=\frac1{\sqrt2}\left[\lvert210\rangle-\lvert200\rangle\right],\qquad E_{3b}^{(1)}=+3e\mathcal E a_0,\]
\[\lvert4_b^{(0)}\rangle=\frac1{\sqrt2}\left[\lvert210\rangle+\lvert200\rangle\right],\qquad E_{4b}^{(1)}=-3e\mathcal E a_0.\]`],
      [String.raw`Linear and quadratic effects`, String.raw`The mixed \(n=2\) states have first-order energies linear in \(\mathcal E\): the linear Stark effect. For \(\lvert100\rangle\), the first-order correction vanishes and the chapter obtains a quadratic correction proportional to \(\mathcal E^2\): the quadratic Stark effect.`, String.raw`\[E_{1a}^{(2)}\approx-\frac{4\alpha^2(e\mathcal E a_0)^2}{3E_0},\qquad \alpha=\frac{128\sqrt2}{243}.\]`]
    ]
  },
  {
    id: "8.10", file: "chapter-synthesis-perturbative-workflow.html", title: "Chapter synthesis: time-independent perturbation theory",
    subtitle: String.raw`CHOOSING THE BASIS, ORDER, AND PHYSICAL OBSERVABLE`,
    guide: String.raw`Time-independent perturbation theory starts from a solvable \(\hat H_0\), but the valid route depends on whether its energy spectrum is non-degenerate or degenerate.`,
    cards: [
      [String.raw`Common starting point`, String.raw`Write \(\hat H=\hat H_0+\lambda\hat W\), identify the orthonormal eigenvectors of \(\hat H_0\), and expand energies and vectors in powers of \(\lambda\). The exact results must recover the unperturbed solution as \(\lambda\to0\).`],
      [String.raw`Non-degenerate route`, String.raw`Use the diagonal element of \(\hat W\) for \(E_n^{(1)}\), then use off-diagonal elements and non-zero energy gaps for vector mixing and \(E_n^{(2)}\).`, String.raw`\[E_n^{(1)}=\langle n^{(0)}\vert\hat W\vert n^{(0)}\rangle,\qquad E_n^{(2)}=\sum_{m\ne n}\frac{|\langle m^{(0)}\vert\hat W\vert n^{(0)}\rangle|^2}{E_n^{(0)}-E_m^{(0)}}.\]`],
      [String.raw`Degenerate route`, String.raw`Do not use a vanishing denominator. Define the degeneracy domain, construct its reduced perturbation, and diagonalize it first. Then the second-order sum runs only over states outside that domain.`, String.raw`\[(\hat W_B-E_{n_b}^{(1)}\hat B)\lvert n_b^{(0)}\rangle=0,\qquad E_{n_b}^{(2)}=\sum_{k\notin B}\frac{|\langle k^{(0)}\vert\hat W\vert n_b^{(0)}\rangle|^2}{E_b^{(0)}-E_k^{(0)}}.\]`],
      [String.raw`Applications`, String.raw`In van Vleck susceptibility, the perturbation parameter is a magnetic-field component and energy corrections give the magnetic response. In the Stark effect, the field \(\mathcal E\) perturbs degenerate Hydrogen states; selection rules identify the allowed matrix elements and distinguish linear from quadratic shifts.`],
      [String.raw`Exercise-ready boundary`, String.raw`Use these pages for the setup, the main correction formulas, and compact examples. The complete algebra for vector corrections, reduced operators, selection rules, and the extended examples remains in Chapter 8.`]
    ]
  }
];

function esc(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function card([heading, text, equation], index) {
  const accent = ["", "green", "orange", "purple"][index % 4];
  return `<section class="card ${accent}"><h2 class="ch ${accent}">${esc(heading)}</h2><p>${text}</p>${equation ? `<div class="eq ${index % 3 === 0 ? "key-eq" : ""}">\\[${equation.replace(/^\\\[|\\\]$/g, "")}\\]</div>` : ""}</section>`;
}

function pageHtml(page, index) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(page.title)} | Chapter 8 | Quantum Mechanics</title>
<meta name="description" content="${esc(page.guide)}"><meta name="author" content="Prof. Mario Reis">
<link rel="canonical" href="https://qm-beta.vercel.app/slides/chapter-08/${page.file}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&amp;family=Lora:ital,wght@0,400;0,600;1,400&amp;display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@7.2.0/css/all.min.css" rel="stylesheet">
<link rel="stylesheet" href="../../assets/chapter-08/page-layout.css?v=0814.1">
<script>window.MathJax={tex:{inlineMath:[["\\(","\\)"]],displayMath:[["\\[","\\]"]]},startup:{typeset:true}};</script><script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<link rel="stylesheet" href="../../assets/termo-share.css?v=0731.1"><script defer src="../../assets/termo-share.js?v=0717.1"></script>
<link rel="stylesheet" href="../../assets/termo-auth.css?v=0717.1"><script defer src="../../assets/termo-auth.js?v=0717.2"></script><script defer src="../../assets/termo-user-data.js?v=0731.1"></script><script defer src="../../assets/termo-seo.js?v=0814.1"></script></head>
<body><main class="slide"><header class="hdr"><div class="hdr-inner"><a href="../../index.html?view=chapters&amp;chapter=08" class="index-back-button"><i class="fa-solid fa-arrow-left"></i> Index</a><div class="chapter-label"><i class="fa-solid fa-layer-group"></i> Chapter 8 · Item ${page.id}</div><h1 class="hdr-title">${esc(page.title)}</h1><div class="hdr-sub">${page.subtitle}</div></div><div class="slide-num">${index + 1} / ${pages.length}</div></header>
<div class="body"><section class="card orange guide-card"><h2 class="ch orange"><i class="fa-solid fa-map-location-dot"></i> Guided reading</h2><p>${page.guide}</p></section><div class="col">${page.cards.filter((_, i) => i % 2 === 0).map((item, i) => card(item, i)).join("")}</div><div class="col">${page.cards.filter((_, i) => i % 2 === 1).map((item, i) => card(item, i + 1)).join("")}</div><section class="card purple practice-anchor-card"><h2 class="ch purple"><i class="fa-solid fa-pen-nib"></i> Practice anchors</h2><p>Use the definitions, highlighted equations, and example route on this page for a compact exercise. The longer derivations and full worked examples remain in Chapter 8.</p></section><div class="resource-links"><strong>Original book and previews:</strong><div class="resource-link-list"><a href="https://shop.elsevier.com/books/quantum-mechanics/reis/978-0-443-32826-8" target="_blank">Elsevier shop</a><a href="https://www.sciencedirect.com/book/monograph/9780443328268/quantum-mechanics" target="_blank">ScienceDirect</a></div></div><div class="source-note"><strong>Source note:</strong> Guided reading based on Chapter 8 of Mario Reis, <em>Quantum Mechanics</em>, Elsevier, 2026. Consult the original chapter for complete derivations and exercises.</div></div></main></body></html>`;
}

mkdirSync(outputDir, { recursive: true });
for (const [index, page] of pages.entries()) writeFileSync(resolve(outputDir, page.file), pageHtml(page, index));
console.log(`Generated ${pages.length} Chapter 8 pages.`);
