import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const chapterDir = path.join(rootDir, "slides", "chapter-02");
const dataPath = path.join(rootDir, "data", "chapter-02.json");
const figureDir = "../../assets/chapter-02/figures";
const figureAssetVersion = "0714.1";
const layoutVersion = "0714.1";

const originalLinks = [
  ["Elsevier shop", "https://shop.elsevier.com/books/quantum-mechanics/reis/978-0-443-32826-8"],
  ["ScienceDirect", "https://www.sciencedirect.com/book/monograph/9780443328268/quantum-mechanics"],
  ["Google Books preview", "https://books.google.com.br/books?id=vR1LEQAAQBAJ&lpg=PA6&hl=pt-BR&pg=PA109#v=onepage&q&f=false"],
  ["Amazon", "https://a.co/d/09vYq2F7"]
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function figure(file, caption, alt = caption) {
  return `
          <figure class="book-figure">
            <img src="${figureDir}/${escapeHtml(file)}?v=${figureAssetVersion}" alt="${escapeHtml(alt)}" loading="lazy" />
            <figcaption>${escapeHtml(caption)} Copyright &copy; 2026 Elsevier Inc.</figcaption>
          </figure>`;
}

const pages = [
  {
    id: "2.1",
    file: "why-wave-mechanics-is-needed.html",
    title: "Why wave mechanics is needed",
    subtitle: "From matter waves to a dynamical equation",
    cards: [
      {
        icon: "fa-solid fa-compass",
        title: "The problem left by old quantum physics",
        body: String.raw`
          <p>Chapter 1 produced the right clues before it had the right language: photons explain energy exchange, matter waves explain diffraction, and standing waves explain why some states are allowed. Chapter 2 turns those clues into a theory that can calculate states, probabilities and measurements.</p>
          <p>The central move is to stop describing the microscopic object only by a trajectory \(x(t)\). Wave mechanics describes the state by a complex wave function \(\Psi(x,t)\), whose evolution is fixed by a wave equation.</p>
        `
      },
      {
        icon: "fa-solid fa-route",
        color: "green",
        title: "Logical chain for the chapter",
        body: String.raw`
          <div class="table-wrap">
            <table>
              <thead><tr><th>Step</th><th>Question answered</th><th>Tool introduced</th></tr></thead>
              <tbody>
                <tr><td>Matter wave</td><td>How do \(p\) and \(\lambda\) enter a state?</td><td>\(p=\hbar k\)</td></tr>
                <tr><td>Dynamics</td><td>How does the wave function change?</td><td>TDSE</td></tr>
                <tr><td>Stationary states</td><td>Which energies are allowed?</td><td>TISE</td></tr>
                <tr><td>Born rule</td><td>What does the wave function predict?</td><td>\(|\Psi|^2\)</td></tr>
                <tr><td>Postulates</td><td>How are measurements represented?</td><td>States, operators, probabilities</td></tr>
                <tr><td>Wave packets</td><td>How can a particle be localized?</td><td>Fourier superposition</td></tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        icon: "fa-solid fa-key",
        color: "orange",
        title: "Relations that become the language",
        body: String.raw`
          <div class="eq key-eq">\[p=\hbar k,\qquad E=\hbar\omega,\qquad \hat p=-i\hbar\frac{\partial}{\partial x}\]</div>
          <p>The first two relations translate particle quantities into wave quantities. The third relation is the operational form of momentum: it tells us how momentum acts on a wave function.</p>
        `
      },
      {
        icon: "fa-solid fa-lightbulb",
        color: "purple",
        title: "Reading strategy",
        body: String.raw`
          <p>Do not read the equations as isolated formulas. Read each one as an answer to a physical question: what is the state, how does it evolve, which values can be measured and with what probability?</p>
          <div class="callout">The practical goal of this chapter is to connect a wave equation with measurable outcomes.</div>
        `
      }
    ]
  },
  {
    id: "2.2",
    file: "time-dependent-schrodinger-equation.html",
    title: "Time-dependent Schrodinger equation",
    subtitle: "Building the wave equation from energy balance",
    cards: [
      {
        icon: "fa-solid fa-wave-square",
        title: "Start from a plane wave",
        body: String.raw`
          <p>A free matter wave with definite wave number and angular frequency can be written as</p>
          <div class="eq">\[\Psi(x,t)=A e^{i(kx-\omega t)}.\]</div>
          <p>de Broglie's relations identify \(p=\hbar k\) and \(E=\hbar\omega\). The task is to find a differential equation for which this wave is a solution and whose coefficients reproduce the classical energy relation.</p>
        `
      },
      {
        icon: "fa-solid fa-arrow-right-long",
        color: "orange",
        title: "The kinetic-energy part",
        body: String.raw`
          <p>Differentiate the plane wave twice in space:</p>
          <div class="eq">\[\frac{\partial^2\Psi}{\partial x^2}=-k^2\Psi.\]</div>
          <p>Multiplying by \(-\hbar^2/2m\) converts the wave number into momentum:</p>
          <div class="eq key-eq">\[-\frac{\hbar^2}{2m}\frac{\partial^2\Psi}{\partial x^2}=\frac{\hbar^2 k^2}{2m}\Psi=\frac{p^2}{2m}\Psi.\]</div>
        `
      },
      {
        icon: "fa-solid fa-clock",
        color: "green",
        title: "The total-energy part",
        body: String.raw`
          <p>Differentiate once in time:</p>
          <div class="eq">\[\frac{\partial\Psi}{\partial t}=-i\omega\Psi.\]</div>
          <p>Multiplying by \(i\hbar\) converts angular frequency into energy:</p>
          <div class="eq key-eq">\[i\hbar\frac{\partial\Psi}{\partial t}=\hbar\omega\Psi=E\Psi.\]</div>
        `
      },
      {
        icon: "fa-solid fa-equals",
        color: "purple",
        title: "Assemble the energy balance",
        body: String.raw`
          <p>For a particle in a potential \(V(x,t)\), the classical energy is \(E=p^2/2m+V\). Replacing the energy and momentum pieces by the differential actions above gives</p>
          <div class="eq key-eq">\[\left[-\frac{\hbar^2}{2m}\frac{\partial^2}{\partial x^2}+V(x,t)\right]\Psi(x,t)=i\hbar\frac{\partial\Psi(x,t)}{\partial t}.\]</div>
          <p>This is the one-dimensional time-dependent Schrodinger equation. It is a dynamical law for the wave function, not a rule for a particle trajectory.</p>
        `
      }
    ]
  },
  {
    id: "2.3",
    file: "stationary-states-and-tise.html",
    title: "Stationary states and the TISE",
    subtitle: "Separating space and time when the potential is fixed",
    cards: [
      {
        icon: "fa-solid fa-scissors",
        title: "When separation is allowed",
        body: String.raw`
          <p>If the potential depends only on position, \(V=V(x)\), the time-dependent equation can be solved by trying a product form:</p>
          <div class="eq">\[\Psi(x,t)=\psi(x)\,\phi(t).\]</div>
          <p>The assumption is not arbitrary decoration. It asks whether the same state can be described by a fixed spatial shape multiplied by a time-dependent phase.</p>
        `
      },
      {
        icon: "fa-solid fa-code-branch",
        color: "orange",
        title: "Separate the variables",
        body: String.raw`
          <p>Substituting \(\Psi=\psi\phi\) in the TDSE and dividing by \(\psi\phi\) gives</p>
          <div class="eq">\[-\frac{\hbar^2}{2m}\frac{1}{\psi}\frac{d^2\psi}{dx^2}+V(x)=i\hbar\frac{1}{\phi}\frac{d\phi}{dt}.\]</div>
          <p>The left side depends only on \(x\), and the right side depends only on \(t\). Therefore both must be the same constant, identified as the energy \(E\).</p>
        `
      },
      {
        icon: "fa-solid fa-bullseye",
        color: "green",
        title: "The spatial eigenvalue equation",
        body: String.raw`
          <div class="eq key-eq">\[\left[-\frac{\hbar^2}{2m}\frac{d^2}{dx^2}+V(x)\right]\psi(x)=E\psi(x).\]</div>
          <p>This is the time-independent Schrodinger equation. It is an eigenvalue problem: boundary conditions select allowed functions \(\psi_n(x)\) and allowed energies \(E_n\).</p>
        `
      },
      {
        icon: "fa-solid fa-hourglass-half",
        color: "purple",
        title: "Why stationary states are stationary",
        body: String.raw`
          <p>The time part satisfies \(i\hbar\,d\phi/dt=E\phi\), so</p>
          <div class="eq">\[\phi(t)=e^{-iEt/\hbar},\qquad \Psi(x,t)=\psi(x)e^{-iEt/\hbar}.\]</div>
          <p>The phase changes in time, but the probability density does not:</p>
          <div class="eq">\[|\Psi(x,t)|^2=|\psi(x)|^2.\]</div>
        `
      }
    ]
  },
  {
    id: "2.4",
    file: "probability-density-and-current.html",
    title: "Probability density and current",
    subtitle: "What the wave function predicts in space",
    cards: [
      {
        icon: "fa-solid fa-location-dot",
        title: "Born's interpretation",
        body: String.raw`
          <p>The wave function itself is complex, so it is not directly a probability. The measurable probability density is the squared modulus:</p>
          <div class="eq key-eq">\[\rho(x,t)=|\Psi(x,t)|^2=\Psi^*(x,t)\Psi(x,t).\]</div>
          <p>The probability of finding the particle in a small interval \(dx\) around \(x\) is \(dP=\rho(x,t)\,dx\).</p>
        `
      },
      {
        icon: "fa-solid fa-chart-area",
        color: "orange",
        title: "Probability in an interval",
        body: String.raw`
          <div class="eq">\[\mathrm{Prob}(a\lt x\lt b)=\int_a^b |\Psi(x,t)|^2\,dx.\]</div>
          <p>For a single particle somewhere on the line, the total probability must be one:</p>
          <div class="eq key-eq">\[\int_{-\infty}^{+\infty}|\Psi(x,t)|^2\,dx=1.\]</div>
        `
      },
      {
        icon: "fa-solid fa-water",
        color: "green",
        title: "Continuity equation",
        body: String.raw`
          <p>Probability is conserved locally. In one dimension, the density and probability current satisfy</p>
          <div class="eq key-eq">\[\frac{\partial\rho}{\partial t}+\frac{\partial j}{\partial x}=0,\qquad j=\frac{\hbar}{2mi}\left(\Psi^*\frac{\partial\Psi}{\partial x}-\Psi\frac{\partial\Psi^*}{\partial x}\right).\]</div>
          <p>The current \(j\) tells how probability flows across position, just as a fluid current tells how mass flows through space.</p>
        `
      },
      {
        icon: "fa-solid fa-circle-check",
        color: "purple",
        title: "Conceptual checkpoint",
        body: String.raw`
          <ul class="bullet">
            <li>\(\Psi\) carries amplitude and phase information.</li>
            <li>\(|\Psi|^2\) is real and nonnegative.</li>
            <li>Normalization makes the wave function predictive.</li>
            <li>The continuity equation protects total probability during time evolution.</li>
          </ul>
        `
      },
      {
        icon: "fa-solid fa-pen-nib",
        color: "red",
        title: "Challenge: derive the continuity equation",
        body: String.raw`
          <p><strong>Challenge (see the book for solution).</strong> Starting from the TDSE and its complex conjugate, derive the continuity equation instead of taking \(\rho\) and \(j\) as definitions.</p>
          <div class="eq">\[i\hbar\frac{\partial\Psi}{\partial t}=-\frac{\hbar^2}{2m}\frac{\partial^2\Psi}{\partial x^2}+V\Psi,\qquad -i\hbar\frac{\partial\Psi^*}{\partial t}=-\frac{\hbar^2}{2m}\frac{\partial^2\Psi^*}{\partial x^2}+V\Psi^*.\]</div>
          <p>Multiply the first equation by \(\Psi^*\), the second by \(\Psi\), subtract the two expressions and rearrange the result as</p>
          <div class="eq key-eq">\[\frac{\partial}{\partial t}(\Psi^*\Psi)+\frac{\partial}{\partial x}\left[\frac{\hbar}{2mi}\left(\Psi^*\frac{\partial\Psi}{\partial x}-\Psi\frac{\partial\Psi^*}{\partial x}\right)\right]=0.\]</div>
          <p>This verifies \(\rho=\Psi^*\Psi\) and \(j=\frac{\hbar}{2mi}\left(\Psi^*\partial_x\Psi-\Psi\partial_x\Psi^*\right)\).</p>
        `
      }
    ]
  },
  {
    id: "2.5",
    file: "infinite-potential-well.html",
    title: "Infinite potential well",
    subtitle: "Boundary conditions turn waves into discrete states",
    cards: [
      {
        icon: "fa-solid fa-box",
        title: "System and boundary conditions",
        body: String.raw`
          ${figure("fig-2-1-infinite-well.png", "Fig. 2.1, adapted from the original chapter: wave functions and probability densities for the infinite potential well.")}
          <p>The potential is zero inside the interval and infinite outside:</p>
          <div class="eq">\[V(x)=0\quad(0\lt x\lt a),\qquad V(x)=+\infty\quad(x\le 0\ \mathrm{or}\ x\ge a).\]</div>
          <p>The infinite walls force the wave function to vanish at the boundaries:</p>
          <div class="eq key-eq">\[\psi(0)=\psi(a)=0.\]</div>
        `
      },
      {
        icon: "fa-solid fa-calculator",
        color: "orange",
        title: "Solve inside the well",
        body: String.raw`
          <p>Inside the well, \(V=0\), so the TISE becomes</p>
          <div class="eq">\[\frac{d^2\psi}{dx^2}+k^2\psi=0,\qquad k^2=\frac{2mE}{\hbar^2}.\]</div>
          <p>The general oscillatory solution is</p>
          <div class="eq">\[\psi(x)=A e^{ikx}+B e^{-ikx}.\]</div>
          <p>The first boundary condition gives \(A+B=0\), so \(B=-A\) and the solution becomes a sine wave.</p>
        `
      },
      {
        icon: "fa-solid fa-wave-square",
        color: "green",
        title: "Allowed wavelengths and energies",
        body: String.raw`
          <p>After using \(\psi(0)=0\), write \(\psi(x)=\tilde A\sin(kx)\). The second boundary condition gives</p>
          <div class="eq">\[\psi(a)=\tilde A\sin(ka)=0\quad\Rightarrow\quad ka=n\pi.\]</div>
          <p>Therefore</p>
          <div class="eq key-eq">\[k_n=\frac{n\pi}{a},\qquad E_n=\frac{\hbar^2 k_n^2}{2m}=\frac{n^2\pi^2\hbar^2}{2ma^2},\qquad n=1,2,3,\ldots\]</div>
        `
      },
      {
        icon: "fa-solid fa-scale-balanced",
        color: "purple",
        title: "Normalize and interpret",
        body: String.raw`
          <p>Normalization fixes the remaining amplitude:</p>
          <div class="eq">\[\int_0^a |\psi_n(x)|^2dx=1\quad\Rightarrow\quad \psi_n(x)=\sqrt{\frac{2}{a}}\sin\left(\frac{n\pi x}{a}\right).\]</div>
          <p>Each higher \(n\) adds nodes and raises the energy quadratically. The result is not a decorative standing wave: it is the first concrete example of an energy spectrum obtained from boundary conditions.</p>
        `
      },
      {
        icon: "fa-solid fa-link",
        color: "red",
        title: "Compare with the semi-classical rule",
        body: String.raw`
          <p>This result is worth comparing with <a href="../chapter-01/scqr-examples.html">Chapter 1 · Item 1.13</a>. The semi-classical quantization rule treats the particle as moving classically from wall to wall and back, so the closed action is</p>
          <div class="eq">\[\oint p\,dx=2pa=nh.\]</div>
          <p>That gives \(p_n=nh/(2a)\) and therefore the same energy spectrum,</p>
          <div class="eq key-eq">\[E_n=\frac{n^2h^2}{8ma^2}=\frac{n^2\pi^2\hbar^2}{2ma^2}.\]</div>
          <p>The agreement is useful, but the wave-mechanics solution is richer: it gives \(\psi_n(x)\), nodes, normalization and the probability density \(|\psi_n(x)|^2\), not only the allowed energies.</p>
        `
      }
    ]
  },
  {
    id: "2.6",
    file: "postulates-rules-ahead.html",
    title: "Postulates of quantum mechanics: the rules ahead",
    subtitle: "From one solved model to the general rules",
    cards: [
      {
        icon: "fa-solid fa-map-signs",
        title: "Why postulates enter here",
        body: String.raw`
          <p>The infinite well shows how one Hamiltonian produces eigenfunctions and discrete energies. The next question is broader: what do wave functions, operators, probabilities and measurements mean for any quantum system?</p>
          <p>The postulates give the translation rules between mathematical objects and experimental predictions.</p>
        `
      },
      {
        icon: "fa-solid fa-table-list",
        color: "green",
        title: "Postulate map",
        body: String.raw`
          <div class="table-wrap">
            <table>
              <thead><tr><th>Postulate</th><th>Core statement</th><th>Question answered</th></tr></thead>
              <tbody>
                <tr><td>Quantum states</td><td>A state is represented by a wave function or state vector.</td><td>What describes the system?</td></tr>
                <tr><td>Observables</td><td>A measurable quantity is represented by a Hermitian operator.</td><td>What can be measured?</td></tr>
                <tr><td>Probability</td><td>Expansion coefficients determine measurement probabilities.</td><td>How likely is each result?</td></tr>
                <tr><td>Measurement</td><td>A definite outcome leaves the system in the corresponding eigenstate.</td><td>What happens after a result?</td></tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        icon: "fa-solid fa-layer-group",
        color: "orange",
        title: "Why basis states matter",
        body: String.raw`
          <p>The well eigenfunctions \(\psi_n(x)\) are not only solutions of a particular problem. They illustrate a general idea: a state can often be expanded in a basis of allowed states.</p>
          <div class="eq key-eq">\[\Psi(x)=\sum_n C_n\psi_n(x).\]</div>
          <p>The coefficients \(C_n\) become the bridge between the state and the probabilities of measurement outcomes.</p>
        `
      },
      {
        icon: "fa-solid fa-lightbulb",
        color: "purple",
        title: "How to read the next pages",
        body: String.raw`
          <p>Each postulate should be read with two questions in mind: what mathematical object is being introduced, and what experimental prediction does it make possible?</p>
          <div class="callout">This page is a signpost. The next four pages identify the postulates explicitly before using them.</div>
        `
      }
    ]
  },
  {
    id: "2.7",
    file: "quantum-states-superpositions.html",
    title: "Quantum states as superpositions",
    subtitle: "The state postulate and expansion in a basis",
    cards: [
      {
        icon: "fa-solid fa-flag",
        title: "Postulate for quantum states",
        body: String.raw`
          <p>A physical state is represented by a wave function \(\Psi(x,t)\), or more abstractly by a state vector. The wave function contains all the information needed to predict the probabilities of possible measurement outcomes.</p>
          <p>Two valid state solutions can be combined to form another valid state whenever the Schrodinger equation is linear.</p>
        `
      },
      {
        icon: "fa-solid fa-layer-group",
        color: "orange",
        title: "Superposition principle",
        body: String.raw`
          <div class="eq key-eq">\[\Psi(x)=\sum_{n} C_n\psi_n(x).\]</div>
          <p>The functions \(\psi_n\) are basis states. The complex numbers \(C_n\) are amplitudes. The state is not secretly one term before measurement; it is the full superposition until a measurement selects an outcome.</p>
        `
      },
      {
        icon: "fa-solid fa-ruler-combined",
        color: "green",
        title: "Orthonormal basis and coefficients",
        body: String.raw`
          <p>For a convenient basis, the states are orthonormal:</p>
          <div class="eq">\[\int \psi_m^*(x)\psi_n(x)\,dx=\delta_{mn}.\]</div>
          <p>Multiplying \(\Psi=\sum_n C_n\psi_n\) by \(\psi_m^*\) and integrating isolates one coefficient:</p>
          <div class="eq key-eq">\[C_m=\int \psi_m^*(x)\Psi(x)\,dx.\]</div>
        `
      },
      {
        icon: "fa-solid fa-vial",
        color: "purple",
        title: "Small example",
        body: String.raw`
          <p>In the infinite well, a state such as</p>
          <div class="eq">\[\Psi(x)=\frac{1}{\sqrt{3}}\psi_1(x)+\sqrt{\frac{2}{3}}\psi_2(x)\]</div>
          <p>is not an eigenstate of energy. It is a normalized superposition of two energy eigenstates, so an energy measurement can return either \(E_1\) or \(E_2\).</p>
        `
      }
    ]
  },
  {
    id: "2.8",
    file: "observables-operators-commutators.html",
    title: "Observables, operators and commutators",
    subtitle: "The operator postulate and compatibility of measurements",
    cards: [
      {
        icon: "fa-solid fa-flag",
        title: "Postulate for observables",
        body: String.raw`
          <p>Each observable quantity is represented by a Hermitian operator. The possible results of measuring that quantity are the operator eigenvalues.</p>
          <div class="eq key-eq">\[\hat A\psi_n=a_n\psi_n.\]</div>
          <p>Hermiticity is essential because measured values must be real.</p>
        `
      },
      {
        icon: "fa-solid fa-toolbox",
        color: "orange",
        title: "Basic operators in one dimension",
        body: String.raw`
          <div class="eq">\[\hat x=x,\qquad \hat p=-i\hbar\frac{d}{dx},\qquad \hat H=-\frac{\hbar^2}{2m}\frac{d^2}{dx^2}+V(x).\]</div>
          <p>The Hamiltonian operator \(\hat H\) represents total energy. Solving \(\hat H\psi=E\psi\) is exactly the TISE written as an eigenvalue problem.</p>
        `
      },
      {
        icon: "fa-solid fa-arrows-rotate",
        color: "green",
        title: "Commutators encode order",
        body: String.raw`
          <p>The commutator of two operators is</p>
          <div class="eq">\[[\hat A,\hat B]=\hat A\hat B-\hat B\hat A.\]</div>
          <p>Position and momentum do not commute:</p>
          <div class="eq key-eq">\[[\hat x,\hat p]=i\hbar.\]</div>
          <p>This algebraic fact is the seed of the position-momentum uncertainty principle.</p>
        `
      },
      {
        icon: "fa-solid fa-scale-balanced",
        color: "purple",
        title: "Hermitian operators and real averages",
        body: String.raw`
          <p>An operator is Hermitian when</p>
          <div class="eq key-eq">\[\hat A^\dagger=(\hat A^*)^T,\qquad \hat A^\dagger=\hat A.\]</div>
          <p>In a matrix representation, the dagger means transpose plus complex conjugation. The Hermitian condition says that the operator is equal to its own adjoint.</p>
          <div class="eq">\[\int \psi^*(\hat A\phi)\,dx=\int (\hat A\psi)^*\phi\,dx\]</div>
          <p>for allowed functions satisfying the boundary conditions. In practice, Hermitian operators have real eigenvalues and orthogonal eigenfunctions, which is why they can represent observables.</p>
        `
      }
    ]
  },
  {
    id: "2.9",
    file: "measurement-probabilities.html",
    title: "Measurement probabilities",
    subtitle: "The probability postulate and expansion coefficients",
    cards: [
      {
        icon: "fa-solid fa-flag",
        title: "Postulate of probability",
        body: String.raw`
          <p>If a normalized state is expanded in eigenstates of the measured observable,</p>
          <div class="eq">\[\Psi=\sum_n C_n\psi_n,\]</div>
          <p>then the probability of obtaining the eigenvalue associated with \(\psi_n\) is</p>
          <div class="eq key-eq">\[P_n=|C_n|^2.\]</div>
        `
      },
      {
        icon: "fa-solid fa-square-root-variable",
        color: "orange",
        title: "Why normalization becomes probability",
        body: String.raw`
          <p>Using orthonormality, the normalization condition becomes</p>
          <div class="eq">\[1=\int \Psi^*\Psi\,dx=\sum_{m,n}C_m^*C_n\int\psi_m^*\psi_n\,dx=\sum_n |C_n|^2.\]</div>
          <p>This is exactly the structure expected of probabilities: all mutually exclusive outcomes add to one.</p>
        `
      },
      {
        icon: "fa-solid fa-filter",
        color: "green",
        title: "Projection extracts the amplitude",
        body: String.raw`
          <p>The coefficient \(C_n\) is found by projecting the state onto the eigenstate:</p>
          <div class="eq key-eq">\[C_n=\int \psi_n^*(x)\Psi(x)\,dx.\]</div>
          <p>The amplitude can be complex. The probability discards the overall phase through the squared modulus \(C_n^*C_n\).</p>
        `
      },
      {
        icon: "fa-solid fa-dice",
        color: "purple",
        title: "Example in the energy basis",
        body: String.raw`
          <p>For</p>
          <div class="eq">\[\Psi=\frac{1}{\sqrt{3}}\psi_1+\sqrt{\frac{2}{3}}\psi_2,\]</div>
          <p>an energy measurement gives</p>
          <div class="eq">\[P(E_1)=\frac{1}{3},\qquad P(E_2)=\frac{2}{3}.\]</div>
          <p>The theory predicts probabilities for individual outcomes, not which result a single run must produce.</p>
        `
      }
    ]
  },
  {
    id: "2.10",
    file: "expectation-values-and-collapse.html",
    title: "Expectation values and collapse",
    subtitle: "The measurement postulate and statistical averages",
    cards: [
      {
        icon: "fa-solid fa-flag",
        title: "Measurement postulate",
        body: String.raw`
          <p>When a measurement of observable \(\hat A\) gives the eigenvalue \(a_m\), the state immediately after the measurement is the corresponding eigenstate \(\psi_m\), apart from normalization and phase.</p>
          <div class="eq key-eq">\[\Psi=\sum_n C_n\psi_n\quad \xrightarrow{\mathrm{measure}\ a_m}\quad \psi_m.\]</div>
          <p>This is the collapse rule. It connects a probabilistic state before measurement to a definite state after a recorded result.</p>
        `
      },
      {
        icon: "fa-solid fa-chart-simple",
        color: "orange",
        title: "Expectation value as ensemble average",
        body: String.raw`
          <p>If many identical preparations are measured, the average result is</p>
          <div class="eq key-eq">\[\langle \hat A\rangle=\sum_n |C_n|^2 a_n.\]</div>
          <p>This average is not necessarily one of the possible individual outcomes. It is the weighted mean over repeated measurements.</p>
        `
      },
      {
        icon: "fa-solid fa-integral",
        color: "green",
        title: "Integral form",
        body: String.raw`
          <p>In the position representation, the expectation value is computed by inserting the operator between \(\Psi^*\) and \(\Psi\):</p>
          <div class="eq key-eq">\[\langle \hat A\rangle=\int \Psi^*(x,t)\,\hat A\,\Psi(x,t)\,dx.\]</div>
          <p>For position, \(\hat A=\hat x=x\). For momentum, \(\hat A=\hat p=-i\hbar\,d/dx\).</p>
        `
      },
      {
        icon: "fa-solid fa-box-open",
        color: "purple",
        title: "Energy measurement in the well",
        body: String.raw`
          <p>If the well state is \(\Psi=(\psi_1+\psi_2)/\sqrt{2}\), a measurement can return \(E_1\) or \(E_2\) with equal probability. If the result is \(E_1\), the state after measurement is \(\psi_1\).</p>
          <div class="callout">The same state can therefore be a superposition before measurement and a single eigenstate after a definite outcome.</div>
        `
      }
    ]
  },
  {
    id: "2.11",
    file: "ehrenfest-and-virial-theorems.html",
    title: "Equations of motion: Ehrenfest and Virial",
    subtitle: "How expectation values move",
    cards: [
      {
        icon: "fa-solid fa-clock-rotate-left",
        title: "Time derivative of an expectation value",
        body: String.raw`
          <p>The Schrodinger equation implies a compact equation for the time evolution of expectation values:</p>
          <div class="eq key-eq">\[\frac{d}{dt}\langle \hat A\rangle=\left\langle\frac{\partial \hat A}{\partial t}\right\rangle+\frac{i}{\hbar}\langle[\hat H,\hat A]\rangle.\]</div>
          <p>The first term is explicit time dependence of the operator. The second term comes from the noncommuting relation between the observable and the Hamiltonian.</p>
          <p>A direct consequence is important: if \(\hat A\) has no explicit time dependence and \([\hat H,\hat A]=0\), then \(\langle\hat A\rangle\) is constant in time. The commutator therefore tells which average quantities are conserved.</p>
        `
      },
      {
        icon: "fa-solid fa-person-running",
        color: "orange",
        title: "Ehrenfest theorem",
        body: String.raw`
          <p>For the usual Hamiltonian \(\hat H=\hat p^2/2m+V(\hat x)\), the position and momentum averages obey</p>
          <div class="eq key-eq">\[\frac{d}{dt}\langle \hat x\rangle=\frac{\langle \hat p\rangle}{m},\qquad \frac{d}{dt}\langle \hat p\rangle=-\left\langle V'(\hat x)\right\rangle.\]</div>
          <p>This resembles Newton's law for expectation values, but the force is averaged over the quantum state. If the packet is narrow enough that \(\langle V'(\hat x)\rangle\approx V'(\langle\hat x\rangle)\), the mean position follows an approximately classical trajectory.</p>
        `
      },
      {
        icon: "fa-solid fa-balance-scale",
        color: "green",
        title: "Virial theorem",
        body: String.raw`
          <p>For bound stationary states, the virial theorem relates average kinetic and potential behavior:</p>
          <div class="eq key-eq">\[2\langle T\rangle=\left\langle x\frac{dV}{dx}\right\rangle.\]</div>
          <p>If \(V(x)\propto x^2\), then \(x\,dV/dx=2V\), so \(\langle T\rangle=\langle V\rangle\). If \(V(r)\propto -1/r\), the relation gives the familiar Coulomb balance.</p>
        `
      },
      {
        icon: "fa-solid fa-bridge",
        color: "purple",
        title: "Conceptual bridge",
        body: String.raw`
          <p>Ehrenfest's theorem does not restore classical trajectories for individual particles. It shows that certain averages can follow classical-looking equations when the state is sufficiently localized or when the potential is smooth over the spread of the wave packet.</p>
        `
      }
    ]
  },
  {
    id: "2.12",
    file: "plane-waves-and-localized-packets.html",
    title: "Plane waves and localized packets",
    subtitle: "Sharp momentum versus spatial localization",
    cards: [
      {
        icon: "fa-solid fa-wave-square",
        title: "The plane-wave solution",
        body: String.raw`
          ${figure("fig-2-2-plane-wave.png", "Fig. 2.2, adapted from the original chapter: graphical representation of a one-dimensional plane wave.")}
          <p>For a free particle, \(V=0\), a plane wave has the form</p>
          <div class="eq">\[\Psi(x,t)=A e^{i(k_0x-\omega t)},\qquad p_0=\hbar k_0.\]</div>
          <p>It has a definite momentum, because it is an eigenfunction of \(\hat p\).</p>
        `
      },
      {
        icon: "fa-solid fa-gauge-high",
        color: "orange",
        title: "Dispersion relation",
        body: String.raw`
          <p>For a free particle, \(E=p^2/2m\). Using \(E=\hbar\omega\) and \(p=\hbar k\),</p>
          <div class="eq key-eq">\[\omega(k)=\frac{\hbar k^2}{2m}.\]</div>
          <p>The frequency depends on \(k\), so different wave-number components in a packet evolve with different phases.</p>
        `
      },
      {
        icon: "fa-solid fa-location-crosshairs",
        color: "green",
        title: "Why one plane wave is not enough",
        body: String.raw`
          <p>A plane wave extends through all space, so it does not represent a localized particle. It gives a sharp momentum but a completely spread-out position distribution.</p>
          <div class="callout">Localization requires combining many plane waves with nearby, but not identical, wave numbers.</div>
        `
      },
      {
        icon: "fa-solid fa-layer-group",
        color: "purple",
        title: "Build a packet by superposition",
        body: String.raw`
          <div class="eq key-eq">\[\Psi(x,t)=\frac{1}{\sqrt{2\pi}}\int_{-\infty}^{+\infty}\phi(k)e^{i[kx-\omega(k)t]}\,dk.\]</div>
          <p>The function \(\phi(k)\) is the wave-number distribution. A narrow \(\phi(k)\) gives a nearly definite momentum; a broad \(\phi(k)\) is needed to localize the packet in space.</p>
        `
      }
    ]
  },
  {
    id: "2.13",
    file: "gaussian-wave-packet-fourier-width.html",
    title: "Gaussian wave packet and Fourier width",
    subtitle: "A localized packet and its momentum-space partner",
    cards: [
      {
        icon: "fa-solid fa-chart-line",
        title: "A packet with carrier and envelope",
        body: String.raw`
          ${figure("fig-2-3-gaussian-wave-packet.png", "Fig. 2.3, adapted from the original chapter: Gaussian wave packet and its probability density.")}
          <p>A useful localized wave packet is a plane-wave oscillation multiplied by a Gaussian envelope. Here it is the initial condition, specified at \(t=0\):</p>
          <div class="eq key-eq">\[\Psi(x,0)=\frac{1}{(a^2\pi)^{1/4}}\,e^{ik_0x}e^{-x^2/2a^2}.\]</div>
          <p>The oscillating factor \(e^{ik_0x}\) carries the average wave number \(k_0\). The Gaussian factor localizes the packet around \(x=0\). The next step is to read from this initial state both its position width and its momentum width.</p>
        `
      },
      {
        icon: "fa-solid fa-chart-area",
        color: "orange",
        title: "Position probability",
        body: String.raw`
          <p>The probability density removes the phase \(e^{ik_0x}\):</p>
          <div class="eq">\[|\Psi(x,0)|^2=\frac{1}{a\sqrt{\pi}}e^{-x^2/a^2}.\]</div>
          <p>The parameter \(a\) controls spatial width. Larger \(a\) means a broader packet in \(x\).</p>
        `
      },
      {
        icon: "fa-solid fa-right-left",
        color: "green",
        title: "Fourier partner in wave-number space",
        body: String.raw`
          <p>The wave-number distribution is obtained by Fourier transform:</p>
          <div class="eq">\[\phi(k)=\frac{1}{\sqrt{2\pi}}\int_{-\infty}^{+\infty}\Psi(x,0)e^{-ikx}\,dx.\]</div>
          <p>For the Gaussian packet, this gives another Gaussian centered at \(k_0\):</p>
          <div class="eq key-eq">\[\phi(k)=\frac{\sqrt{a}}{\pi^{1/4}}e^{-a^2(k-k_0)^2/2}.\]</div>
        `
      },
      {
        icon: "fa-solid fa-ruler",
        color: "purple",
        title: "Width relation",
        body: String.raw`
          <p>The width is computed from the variance. For any variable \(q\),</p>
          <div class="eq">\[\mathrm{var}(q)=\langle q^2\rangle-\langle q\rangle^2,\qquad \Delta q=\sqrt{\mathrm{var}(q)}.\]</div>
          <p>For the initial Gaussian, \(|\Psi(x,0)|^2\) is centered at zero. The odd integral vanishes, and the second moment gives</p>
          <div class="eq">\[\langle x\rangle=0,\qquad \langle x^2\rangle=\frac{a^2}{2},\qquad \mathrm{var}(x)=\frac{a^2}{2}.\]</div>
          <p>The Fourier partner \(|\phi(k)|^2\) is centered at \(k_0\). For the shifted variable \(k-k_0\),</p>
          <div class="eq">\[\langle k-k_0\rangle=0,\qquad \left\langle (k-k_0)^2\right\rangle=\frac{1}{2a^2}.\]</div>
          <p>Therefore the wave-number variance is simply</p>
          <div class="eq">\[\mathrm{var}(k)=\frac{1}{2a^2}.\]</div>
          <p>Since \(p=\hbar k\), the momentum variance is \(\mathrm{var}(p)=\hbar^2\mathrm{var}(k)\). Therefore</p>
          <div class="eq key-eq">\[\Delta x=\frac{a}{\sqrt2},\qquad \Delta p=\frac{\hbar}{\sqrt2\,a},\qquad \Delta x\,\Delta p=\frac{\hbar}{2}.\]</div>
          <p>This initial Gaussian is a minimum-uncertainty packet. Making it broader in position makes its momentum distribution narrower; the product cannot be pushed below \(\hbar/2\).</p>
        `
      }
    ]
  },
  {
    id: "2.14",
    file: "wave-packet-spreading-uncertainty.html",
    title: "Wave packet spreading and uncertainty",
    subtitle: "Dispersion, velocities and the uncertainty product",
    cards: [
      {
        icon: "fa-solid fa-up-right-and-down-left-from-center",
        title: "Position width versus wave-number width",
        body: String.raw`
          ${figure("fig-2-4-width-comparison.png", "Fig. 2.4, adapted from the original chapter: position and wave-number distributions for increasing packet width.")}
          <p>The panels show the central Fourier tradeoff. When the position distribution \(|\Psi(x)|^2\) becomes wider, the wave-number distribution \(|\phi(k)|^2\) becomes narrower, and vice versa.</p>
        `
      },
      {
        icon: "fa-solid fa-forward",
        color: "orange",
        title: "Time evolution of the packet",
        body: String.raw`
          <p>The initial packet from Item 2.13 evolves by giving each plane-wave component its free-particle phase:</p>
          <div class="eq key-eq">\[\Psi(x,t)=\frac{1}{\sqrt{2\pi}}\int_{-\infty}^{+\infty}\phi(k)\,e^{i[kx-\omega(k)t]}\,dk,\qquad \omega(k)=\frac{\hbar k^2}{2m}.\]</div>
          <p>This form is used because each component \(e^{ikx}\) has energy \(E=\hbar\omega(k)=\hbar^2k^2/2m\). Time evolution changes the relative phases of the components, and those changing phases reshape the packet in \(x\)-space.</p>
        `
      },
      {
        icon: "fa-solid fa-person-walking-arrow-right",
        color: "green",
        title: "Phase and group velocities",
        body: String.raw`
          <p>These quantities are obtained from the time-dependent packet in the previous card. The phase \(kx-\omega(k)t\) inside \(\Psi(x,t)\) gives the phase velocity \(v_p\), also written \(v_{\mathrm{ph}}\), while the \(k\)-dependence of \(\omega(k)\) gives the group velocity \(v_g\):</p>
          <div class="eq key-eq">\[v_p\equiv v_{\mathrm{ph}}=\frac{\omega}{k}=\frac{\hbar k}{2m},\qquad v_g=\frac{d\omega}{dk}=\frac{\hbar k}{m}.\]</div>
          <p>The packet center moves with \(v_g\). At the central wave number \(k_0\), this gives \(v_g=\hbar k_0/m=p_0/m\), the classical velocity associated with the mean momentum.</p>
        `
      },
      {
        icon: "fa-solid fa-clock",
        color: "purple",
        title: "Spreading in time",
        body: String.raw`
          <p>Different \(k\) components have different \(\omega(k)\), so their phases do not remain locked together. The result is packet spreading. For the Gaussian packet,</p>
          <div class="eq key-eq">\[\mathrm{var}(x,t)=\frac{a^2}{2}\left[1+\left(\frac{t}{\tau}\right)^2\right],\qquad \tau=\frac{ma^2}{\hbar}.\]</div>
          <p>The wave-number distribution \(|\phi(k)|^2\) does not change shape for a free particle, so</p>
          <div class="eq">\[\mathrm{var}(k,t)=\frac{1}{2a^2},\qquad \mathrm{var}(p,t)=\frac{\hbar^2}{2a^2}.\]</div>
          <p>Position spreads with time, but the momentum spread stays fixed.</p>
        `
      },
      {
        icon: "fa-solid fa-triangle-exclamation",
        color: "red",
        title: "Uncertainty principle",
        body: String.raw`
          <p>Combining the time-dependent position variance with the fixed momentum variance gives</p>
          <div class="eq">\[\Delta x(t)\Delta p(t)=\sqrt{\mathrm{var}(x,t)\mathrm{var}(p,t)}=\frac{\hbar}{2}\sqrt{1+\left(\frac{t}{\tau}\right)^2}.\]</div>
          <p>At \(t=0\), the product is exactly \(\hbar/2\). For later times it is larger, consistent with the general Heisenberg relation:</p>
          <div class="eq key-eq">\[\Delta x\,\Delta p\ge \frac{\hbar}{2}.\]</div>
          <p>The initial Gaussian saturates the bound; free evolution preserves the momentum width but increases the position width.</p>
        `
      }
    ]
  },
  {
    id: "2.15",
    file: "chapter-synthesis.html",
    title: "Chapter synthesis",
    subtitle: "From wave mechanics to the abstract quantum language",
    cards: [
      {
        icon: "fa-solid fa-route",
        title: "Conceptual flow",
        body: String.raw`
          <div class="table-wrap">
            <table>
              <thead><tr><th>Idea</th><th>Mathematical form</th><th>Physical meaning</th></tr></thead>
              <tbody>
                <tr><td>Dynamics</td><td>TDSE</td><td>The wave function evolves in time.</td></tr>
                <tr><td>Stationary states</td><td>TISE</td><td>Allowed energies are eigenvalues.</td></tr>
                <tr><td>Probability</td><td>\(|\Psi|^2\)</td><td>The state predicts spatial detection probabilities.</td></tr>
                <tr><td>Observables</td><td>Hermitian operators</td><td>Measurements are tied to eigenvalues.</td></tr>
                <tr><td>Superposition</td><td>\(\Psi=\sum C_n\psi_n\)</td><td>Coefficients encode outcome amplitudes.</td></tr>
                <tr><td>Wave packets</td><td>Fourier integrals</td><td>Localization requires many wave numbers.</td></tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        icon: "fa-solid fa-key",
        color: "orange",
        title: "Equations to keep connected",
        body: String.raw`
          <div class="eq key-eq">\[i\hbar\frac{\partial\Psi}{\partial t}=\hat H\Psi,\qquad \hat H\psi_n=E_n\psi_n,\qquad P_n=|C_n|^2.\]</div>
          <p>The first equation gives time evolution. The second finds allowed stationary states. The third translates an expansion into measurement probabilities. Together they form the practical core of wave mechanics.</p>
        `
      },
      {
        icon: "fa-solid fa-circle-question",
        color: "green",
        title: "Common confusions to avoid",
        body: String.raw`
          <ul class="bullet">
            <li>The wave function is not the probability density; \(|\Psi|^2\) is.</li>
            <li>An eigenstate of one observable need not be an eigenstate of another.</li>
            <li>An expectation value is an ensemble average, not necessarily a single outcome.</li>
            <li>Uncertainty is a property of quantum states, not merely bad instruments.</li>
          </ul>
        `
      },
      {
        icon: "fa-solid fa-arrow-right",
        color: "purple",
        title: "Bridge to the next formulation",
        body: String.raw`
          <p>Wave mechanics introduces the essential language: states, operators, eigenvalues, probabilities and superpositions. Matrix mechanics will keep the same logic but express it more abstractly, replacing wave functions by vectors and differential operators by matrices.</p>
          <div class="callout">The conceptual shift is already complete: quantum theory predicts possible outcomes and their probabilities from the structure of the state.</div>
        `
      }
    ]
  }
];

const guidedThreads = {
  "2.1": String.raw`
    <p>Read Chapter 2 as the construction of a working language. Chapter 1 says that microscopic physics is wave-like and quantized; this chapter answers how to compute with that fact. The recurring pattern is state, equation, boundary condition, probability and measurement.</p>
  `,
  "2.2": String.raw`
    <p>The TDSE is easier to follow when each derivative is tied to a physical quantity. Spatial curvature of the wave function produces kinetic energy; time variation produces total energy. The equation is the quantum version of \(E=p^2/2m+V\).</p>
  `,
  "2.3": String.raw`
    <p>Separation of variables is not just a trick. It isolates states with a definite energy. The spatial equation selects the energy spectrum, while the time equation supplies a phase that leaves \(|\Psi|^2\) unchanged.</p>
  `,
  "2.4": String.raw`
    <p>The Born interpretation turns the wave function into experimental predictions. Once \(|\Psi|^2\) is accepted as probability density, normalization and probability current become necessary consistency conditions.</p>
  `,
  "2.5": String.raw`
    <p>The infinite well is the chapter's cleanest example. The particle is free inside the box, but the walls impose boundary conditions. Those boundary conditions force standing waves, and standing waves force discrete energies.</p>
  `,
  "2.6": String.raw`
    <p>After solving one model, the chapter states the general rules. Keep the postulates separate: states say what describes the system; observables say what can be measured; probabilities say how likely outcomes are; measurement says what state remains after a result.</p>
  `,
  "2.7": String.raw`
    <p>The state postulate is the conceptual center of wave mechanics. A state can be a superposition of several basis states, and the coefficients are not optional bookkeeping: they are the amplitudes that later become probabilities.</p>
  `,
  "2.8": String.raw`
    <p>Operators are the bridge from a wave function to measurable quantities. Eigenvalues are possible results, Hermiticity guarantees real results, and commutators tell whether two measurement questions can be answered simultaneously with sharp values.</p>
  `,
  "2.9": String.raw`
    <p>The probability postulate gives the operational meaning of expansion coefficients. Once the state is written in the eigenbasis of the measured observable, the squared modulus of each coefficient is the probability of the corresponding result.</p>
  `,
  "2.10": String.raw`
    <p>The measurement postulate separates preparation from outcome. Before measurement, the state may be a superposition. After a definite result, the state is updated to the eigenstate compatible with that result.</p>
  `,
  "2.11": String.raw`
    <p>Ehrenfest and Virial results show how wave mechanics talks to classical mechanics. They do not erase quantum behavior; they explain why averages can sometimes obey equations that resemble classical laws.</p>
  `,
  "2.12": String.raw`
    <p>A plane wave is mathematically simple but physically delocalized. A localized particle-like packet requires a superposition of plane waves, and the distribution \(\phi(k)\) controls how sharp or spread the momentum information is.</p>
  `,
  "2.13": String.raw`
    <p>The Gaussian packet is the best example because the Fourier transform is also Gaussian. This makes the inverse relation between position width and wave-number width completely explicit.</p>
  `,
  "2.14": String.raw`
    <p>Wave-packet spreading and uncertainty are two sides of the same Fourier logic. The packet moves with the group velocity, spreads because different \(k\) components evolve differently, and obeys a minimum product of position and momentum uncertainties.</p>
  `,
  "2.15": String.raw`
    <p>Use this synthesis as the chapter's compressed working notebook. Every important idea connects back to the same question: how does a mathematical state produce real measurement predictions?</p>
  `
};

function renderGuide(page) {
  const body = guidedThreads[page.id];
  if (!body) return "";

  return `
      <div class="card orange guide-card">
        <div class="ch orange"><i class="fa-solid fa-map-location-dot"></i> Guided reading</div>
        ${body.trim()}
      </div>`;
}

function renderCard(card) {
  const colorClass = card.color ? ` ${card.color}` : "";
  return `
        <div class="card${colorClass}">
          <div class="ch${colorClass}"><i class="${escapeHtml(card.icon)}"></i> ${escapeHtml(card.title)}</div>
          ${card.body.trim()}
        </div>`;
}

function renderOriginalLinks() {
  const links = originalLinks
    .map(([label, href]) => `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`)
    .join("");

  return `
      <div class="resource-links">
        <strong>Original book and previews:</strong>
        <div class="resource-link-list">${links}</div>
      </div>`;
}

function renderPage(page, index) {
  const split = Math.ceil(page.cards.length / 2);
  const firstColumn = page.cards.slice(0, split).map(renderCard).join("\n");
  const secondColumn = page.cards.slice(split).map(renderCard).join("\n");
  const pageTitle = `${page.title} | Chapter 2 | Quantum Mechanics`;
  const description = `${page.title}. Practical auxiliary summary for Chapter 2 of the Quantum Mechanics book-app.`;
  const includesFigure = page.cards.some((card) => card.body.includes("book-figure"));
  const figureNote = includesFigure
    ? "Selected figure material is reproduced/adapted from Chapter 2 of the original book and carries a visible copyright caption."
    : "No original book figure is reproduced on this page.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="author" content="Prof. Mario Reis" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@7.2.0/css/all.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="../../assets/chapter-02/page-layout.css?v=${layoutVersion}" />
  <script>
    window.MathJax = {
      tex: { inlineMath: [["\\\\(", "\\\\)"]], displayMath: [["\\\\[", "\\\\]"]] },
      startup: { typeset: true }
    };
  </script>
  <script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <script>
    window.va = window.va || function () {
      (window.vaq = window.vaq || []).push(arguments);
    };
  </script>
  <script defer src="/_vercel/insights/script.js"></script>
  <link rel="stylesheet" href="../../assets/termo-share.css?v=0619.2" />
  <script defer src="../../assets/termo-share.js?v=0619.2"></script>
  <link rel="stylesheet" href="../../assets/termo-auth.css?v=0619.2" />
  <script defer src="../../assets/termo-auth.js?v=0619.2"></script>
  <script defer src="../../assets/termo-user-data.js?v=0619.2"></script>
</head>
<body>
  <div class="slide">
    <div class="hdr">
      <div class="hdr-inner">
        <a href="../../index.html?view=chapters&chapter=02" class="index-back-button">
          <i class="fa-solid fa-arrow-left"></i>
          Index
        </a>
        <div class="chapter-label">
          <i class="fa-solid fa-layer-group"></i>
          Chapter 2 · Item ${escapeHtml(page.id)}
        </div>
        <div class="hdr-title">${escapeHtml(page.title)}</div>
        <div class="hdr-sub">${escapeHtml(page.subtitle)}</div>
      </div>
      <div class="slide-num">${index + 1} / ${pages.length}</div>
    </div>
    <div class="body">
${renderGuide(page)}
      <div class="col">
${firstColumn}
      </div>
      <div class="col">
${secondColumn}
      </div>
${renderOriginalLinks()}
      <div class="source-note">
        <strong>Source note:</strong> Original auxiliary summary for this book-app, based on Chapter 2 of Mario Reis, <em>Quantum Mechanics</em>, Elsevier, 2026. Book text and figures are copyright &copy; 2026 Elsevier Inc. ${escapeHtml(figureNote)}
      </div>
    </div>
  </div>
</body>
</html>
`;
}

await mkdir(chapterDir, { recursive: true });

for (const [index, page] of pages.entries()) {
  await writeFile(path.join(chapterDir, page.file), renderPage(page, index), "utf8");
}

const data = JSON.parse(await readFile(dataPath, "utf8"));
data.topics = data.topics.map((topic) => {
  const page = pages.find((entry) => entry.id === topic.id);
  if (!page) return topic;
  const { status: _status, ...rest } = topic;
  return {
    ...rest,
    url: `slides/chapter-02/${page.file}`
  };
});

await writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");

console.log(`Generated ${pages.length} enriched Chapter 2 HTML pages.`);
