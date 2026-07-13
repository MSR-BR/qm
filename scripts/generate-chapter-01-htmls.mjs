import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const chapterDir = path.join(rootDir, "slides", "chapter-01");
const dataPath = path.join(rootDir, "data", "chapter-01.json");
const figureDir = "../../assets/chapter-01/figures";
const figureAssetVersion = "0619.3";
const figureAssetVersions = {
  "fig-1-8-bohr-atom.png": "0713.1",
  "fig-1-9-bohr-spectrum.png": "0713.2",
  "fig-1-10-de-broglie-orbit.png": "0713.3",
  "fig-1-11-harmonic-oscillator-scqr.png": "0713.3",
  "fig-1-14-infinite-well.png": "0713.3"
};

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
  const version = figureAssetVersions[file] || figureAssetVersion;
  return `
          <figure class="book-figure">
            <img src="${figureDir}/${escapeHtml(file)}?v=${version}" alt="${escapeHtml(alt)}" loading="lazy" />
            <figcaption>${escapeHtml(caption)} Copyright &copy; 2026 Elsevier Inc.</figcaption>
          </figure>`;
}

const pages = [
  {
    id: "1.1",
    file: "why-old-quantum-physics-matters.html",
    title: "Why old quantum physics matters",
    subtitle: "The practical map before wave mechanics",
    cards: [
      {
        icon: "fa-solid fa-compass",
        title: "The chapter's real question",
        body: String.raw`
          <p>Old quantum physics is not a museum of failed models. It is the shortest practical path to the questions that force quantum mechanics to exist: why spectra are discrete, why radiation exchanges energy in packets, and why matter can behave as a wave.</p>
          <p>The important skill is to identify the classical expectation, the experimental contradiction and the new quantum rule introduced to repair it.</p>
        `
      },
      {
        icon: "fa-solid fa-route",
        color: "green",
        title: "Reading map",
        body: String.raw`
          <div class="table-wrap">
            <table>
              <thead><tr><th>Clue</th><th>Classical tension</th><th>Quantum response</th></tr></thead>
              <tbody>
                <tr><td>Hydrogen lines</td><td>Atoms do not emit a continuum</td><td>Discrete atomic energies</td></tr>
                <tr><td>Black-body radiation</td><td>Equipartition fails at high frequency</td><td>Energy quanta \(E=hf\)</td></tr>
                <tr><td>Photoelectric effect</td><td>Frequency controls electron energy</td><td>Photons</td></tr>
                <tr><td>Electron diffraction</td><td>Particles interfere</td><td>Matter waves \(\lambda=h/p\)</td></tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        icon: "fa-solid fa-key",
        color: "orange",
        title: "Equations to keep in memory",
        body: String.raw`
          <div class="eq key-eq">\[E=hf,\qquad \lambda=\frac{h}{p},\qquad L=n\hbar,\qquad \oint p_i\,dq_i=n_i h\]</div>
          <p>Together, these relations show the central lesson of old quantum physics: at microscopic scales, energy, momentum, angular momentum and wavelength cannot be treated as fully independent classical quantities. They are tied together by Planck's constant, revealing that nature selects only certain exchanges, orbits and wave patterns.</p>
        `
      },
      {
        icon: "fa-solid fa-lightbulb",
        color: "purple",
        title: "What makes this app useful",
        body: String.raw`
          <p>For each topic, the app gives a working summary: the physical setup, the key relation, the conceptual point and the limitation of the old model.</p>
          <p>Use the pages as a fast conceptual notebook.</p>
        `
      }
    ]
  },
  {
    id: "1.2",
    file: "wave-optics-classical-benchmark.html",
    title: "Wave optics as the classical benchmark",
    subtitle: "Young, Maxwell and the reference model for interference",
    cards: [
      {
        icon: "fa-solid fa-water",
        title: "Why start with waves?",
        body: String.raw`
          <p>Young's double-slit experiment established a diagnostic for wave behavior: a spatial pattern made of constructive and destructive interference. Maxwell later placed light inside electromagnetic field theory, making the wave description of light extremely successful.</p>
          <p>This success is exactly why the later photon idea is so disruptive. Quantum theory must preserve interference while explaining particle-like energy transfer.</p>
        `
      },
      {
        icon: "fa-solid fa-ruler-combined",
        color: "orange",
        title: "Interference condition",
        body: String.raw`
          <div class="eq key-eq">\[d\sin\theta=m\lambda\quad (m=0,\pm1,\pm2,\ldots)\]</div>
          <p>The equation connects a measurable fringe angle to a wavelength. In quantum mechanics, this same logic reappears whenever boundary conditions select allowed wavelengths.</p>
        `
      },
      {
        icon: "fa-solid fa-circle-nodes",
        color: "green",
        title: "Conceptual checkpoint",
        body: String.raw`
          <ul class="bullet">
            <li>Interference requires phase coherence.</li>
            <li>A wave description predicts patterns, not isolated impacts.</li>
            <li>The wave idea later migrates from light to matter through de Broglie's hypothesis.</li>
          </ul>
        `
      },
      {
        icon: "fa-solid fa-arrow-right",
        color: "red",
        title: "Why this benchmark matters",
        body: String.raw`
          <p>The double-slit experiment gives the chapter a reference point. The photoelectric effect will show that light cannot be only a classical wave; electron diffraction will show that matter cannot be only a classical particle.</p>
        `
      }
    ]
  },
  {
    id: "1.3",
    file: "hydrogen-spectral-lines.html",
    title: "Hydrogen spectral lines",
    subtitle: "Discrete colors as fingerprints of atomic structure",
    cards: [
      {
        icon: "fa-solid fa-rainbow",
        title: "Continuous versus discrete spectra",
        body: String.raw`
          ${figure("fig-1-1-hydrogen-spectra.png", "Fig. 1.1, adapted in layout from the original chapter: white light gives a continuous spectrum, while Hydrogen emits separated lines.")}
          <p>The contrast is the point: a heated or excited gas does not radiate arbitrary wavelengths. Hydrogen emits a structured set of lines, which means the atom has internal constraints.</p>
        `
      },
      {
        icon: "fa-solid fa-calculator",
        color: "orange",
        title: "Balmer and Rydberg formulas",
        body: String.raw`
          <div class="eq key-eq">\[\lambda=B\left(\frac{m^2}{m^2-n^2}\right),\qquad n=2,\ m>2\]</div>
          <div class="eq key-eq">\[\frac{1}{\lambda}=R\left(\frac{1}{n^2}-\frac{1}{m^2}\right),\qquad m>n\]</div>
          <p>The integers first appear as empirical labels. Bohr later gives them a physical meaning: they label atomic levels involved in a transition.</p>
        `
      },
      {
        icon: "fa-solid fa-table",
        color: "green",
        title: "Hydrogen series",
        body: String.raw`
          <div class="table-wrap">
            <table>
              <thead><tr><th>Series</th><th>Final level</th><th>Main region</th><th>Meaning</th></tr></thead>
              <tbody>
                <tr><td>Lyman</td><td>\(n=1\)</td><td>Ultraviolet</td><td>Transitions into the ground level</td></tr>
                <tr><td>Balmer</td><td>\(n=2\)</td><td>Visible/UV</td><td>Historically decisive visible lines</td></tr>
                <tr><td>Paschen</td><td>\(n=3\)</td><td>Infrared</td><td>Lower-energy transitions</td></tr>
                <tr><td>Brackett</td><td>\(n=4\)</td><td>Infrared</td><td>More weakly bound final states</td></tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        icon: "fa-solid fa-lightbulb",
        color: "purple",
        title: "Conceptual discussion",
        body: String.raw`
          <p>The formulas are powerful because they are too simple to be accidental. A continuous classical orbit would not naturally produce integer patterns of this kind. The spectrum is therefore a code for the internal structure of the atom.</p>
          <div class="callout">Practical reading: whenever a spectral line appears, think "energy difference", not "color emitted at random".</div>
        `
      }
    ]
  },
  {
    id: "1.4",
    file: "cathode-rays-and-electron.html",
    title: "Cathode rays and the electron",
    subtitle: "From beam deflection to subatomic structure",
    cards: [
      {
        icon: "fa-solid fa-wind",
        title: "Experimental setup",
        body: String.raw`
          ${figure("fig-1-2-cathode-ray-tube.png", "Fig. 1.2, adapted from the original chapter: a cathode-ray tube uses electric and magnetic fields to select and deflect the beam.")}
          <p>The cathode-ray tube turns a qualitative observation into a measurement. The beam is accelerated, velocity-selected and then deflected, allowing the charge-to-mass ratio to be inferred.</p>
        `
      },
      {
        icon: "fa-solid fa-magnet",
        color: "orange",
        title: "Forces and velocity selection",
        body: String.raw`
          <div class="eq key-eq">\[\vec F=q(\vec E+\vec v\times \vec B)\]</div>
          <div class="eq key-eq">\[v_x=\frac{E_{yA}}{B_z}\]</div>
          <p>When the electric and magnetic deflections cancel, only particles with the selected speed pass through the collimator.</p>
        `
      },
      {
        icon: "fa-solid fa-scale-balanced",
        color: "green",
        title: "Measured ratio",
        body: String.raw`
          <div class="eq key-eq">\[\frac{|q|}{m}=\frac{2d\,v_x^2}{E_{yB}\,l(l+2L)}\]</div>
          <p>The ratio is much larger than the corresponding value for Hydrogen ions. Thomson interpreted this as evidence for a much smaller mass carrier: the electron.</p>
        `
      },
      {
        icon: "fa-solid fa-atom",
        color: "purple",
        title: "Conceptual consequence",
        body: String.raw`
          <p>The atom is no longer indivisible. Cathode rays introduce a charged microscopic constituent and force atomic models to include internal structure. This is a prerequisite for Bohr's later atomic model.</p>
        `
      }
    ]
  },
  {
    id: "1.5",
    file: "black-body-radiation.html",
    title: "Black-body radiation",
    subtitle: "Thermal spectra and Planck's quantization step",
    cards: [
      {
        icon: "fa-solid fa-box-open",
        title: "Cavity model",
        body: String.raw`
          ${figure("fig-1-3-black-body-cavity.png", "Fig. 1.3, adapted from the original chapter: a cavity with a small hole models black-body radiation.")}
          <p>A black body absorbs incident radiation and emits a spectrum determined by temperature. A cavity with a small aperture provides a clean model because the interior modes repeatedly reflect and equilibrate.</p>
        `
      },
      {
        icon: "fa-solid fa-chart-line",
        color: "red",
        title: "Classical failure",
        body: String.raw`
          ${figure("fig-1-4-black-body-radiance.png", "Fig. 1.4, adapted from the original chapter: Rayleigh-Jeans succeeds at low frequency but fails at high frequency.")}
          <div class="eq key-eq">\[\frac{du}{df}=\frac{8\pi}{c^3}k_B T f^2,\qquad R(f,T)=\frac{c}{4}\frac{du}{df}\]</div>
          <p>The Rayleigh-Jeans result grows without bound as frequency increases. This ultraviolet catastrophe shows that classical equipartition cannot be the full story.</p>
        `
      },
      {
        icon: "fa-solid fa-cubes-stacked",
        color: "orange",
        title: "Planck's rule",
        body: String.raw`
          <div class="eq key-eq">\[\epsilon=hf\]</div>
          <div class="eq key-eq">\[\langle \epsilon\rangle=\frac{hf}{e^{hf/k_BT}-1}\]</div>
          <div class="eq key-eq">\[R(f,T)\propto \frac{f^3}{e^{hf/k_BT}-1}\]</div>
          <p>Planck did not merely adjust a curve. He changed the allowed energy exchange between matter and radiation.</p>
        `
      },
      {
        icon: "fa-solid fa-lightbulb",
        color: "purple",
        title: "Conceptual discussion",
        body: String.raw`
          <p>Quantization first enters as a rescue of thermal radiation. The lesson is subtle: the electromagnetic field modes may be counted classically, but the energy available to each mode is not continuous in the same way.</p>
          <div class="callout">Practical summary: Rayleigh-Jeans is a mode-counting result plus classical energy per mode; Planck keeps the modes but replaces the energy average.</div>
        `
      }
    ]
  },
  {
    id: "1.6",
    file: "photoelectric-effect.html",
    title: "Photoelectric effect",
    subtitle: "Frequency, photons and emitted electrons",
    cards: [
      {
        icon: "fa-solid fa-sun",
        title: "Experimental idea",
        body: String.raw`
          ${figure("fig-1-5-photoelectric-setup.png", "Fig. 1.5, adapted from the original chapter: light incident on a metal can eject electrons and close a circuit.")}
          <p>Light incident on a metal surface can eject electrons. The stopping potential measures the maximum kinetic energy of the emitted electrons.</p>
        `
      },
      {
        icon: "fa-solid fa-key",
        color: "orange",
        title: "Einstein's energy balance",
        body: String.raw`
          <div class="eq key-eq">\[T_{\max}=eV_c\]</div>
          <div class="eq key-eq">\[hf=eV_c+W\qquad \Rightarrow \qquad eV_c=hf-W\]</div>
          <p>The slope of \(V_c\) versus frequency determines \(h/e\), while the intercept gives the work function scale.</p>
        `
      },
      {
        icon: "fa-solid fa-sliders",
        color: "green",
        title: "Experimental observations",
        body: String.raw`
          <ul class="bullet">
            <li>No electrons are emitted below a threshold frequency, no matter how intense the light is.</li>
            <li>Above threshold, the stopping potential grows with frequency, so emitted electrons have larger maximum kinetic energy.</li>
            <li>At fixed frequency above threshold, intensity mainly increases the photocurrent, that is, the number of emitted electrons.</li>
          </ul>
        `
      },
      {
        icon: "fa-solid fa-arrows-left-right",
        color: "purple",
        title: "Conceptual discussion",
        body: String.raw`
          <p>The photoelectric effect is a turning point because it treats light as localized energy packets while interference still requires wave behavior. The quantum description must therefore be richer than either classical wave optics or classical particles alone.</p>
        `
      }
    ]
  },
  {
    id: "1.7",
    file: "elementary-charge.html",
    title: "Elementary charge",
    subtitle: "Millikan and the discreteness of electric charge",
    cards: [
      {
        icon: "fa-solid fa-droplet",
        title: "Oil-drop apparatus",
        body: String.raw`
          ${figure("fig-1-6-millikan-oil-drop.png", "Fig. 1.6, adapted from the original chapter: Millikan's oil-drop method balances weight, electric force and drag.")}
          <p>Millikan's experiment follows individual oil drops. Their terminal velocities, with and without electric field, give enough information to infer the charge carried by each drop.</p>
        `
      },
      {
        icon: "fa-solid fa-weight-hanging",
        color: "orange",
        title: "Force balance",
        body: String.raw`
          <div class="eq key-eq">\[F_a=6\pi\eta Rv,\qquad mg=6\pi\eta Rv_f\]</div>
          <div class="eq key-eq">\[R=\sqrt{\frac{9\eta v_f}{2\rho g}}\]</div>
          <p>The falling motion estimates the radius. The rising motion with an electric field then gives the charge magnitude.</p>
        `
      },
      {
        icon: "fa-solid fa-list-ol",
        color: "green",
        title: "Charge comes in units",
        body: String.raw`
          <div class="eq key-eq">\[|q|=6\pi\eta R(v_r+v_f)\,\frac{1}{E}\]</div>
          <div class="eq key-eq">\[q=ne,\qquad n\in\mathbb{Z}\]</div>
          <p>The measured charges cluster around integer multiples of one elementary value.</p>
        `
      },
      {
        icon: "fa-solid fa-link",
        color: "purple",
        title: "Connection with Thomson",
        body: String.raw`
          <p>Thomson gives \(|q|/m\). Millikan gives \(|q|=e\). Together they determine the electron mass and turn the electron into a quantitative object, not merely an inferred beam constituent.</p>
        `
      }
    ]
  },
  {
    id: "1.8",
    file: "electron-diffraction.html",
    title: "Electron diffraction",
    subtitle: "Matter waves become experimental",
    cards: [
      {
        icon: "fa-solid fa-wave-square",
        title: "Crystal as a diffraction grating",
        body: String.raw`
          ${figure("fig-1-7-electron-diffraction.png", "Fig. 1.7, adapted from the original chapter: lattice planes create path differences that select constructive interference.")}
          <p>A crystal has regularly spaced atomic planes. For suitable electron energies, the electron wavelength is comparable to those spacings, so diffraction maxima can appear.</p>
        `
      },
      {
        icon: "fa-solid fa-gem",
        color: "orange",
        title: "Bragg condition",
        body: String.raw`
          <div class="eq key-eq">\[AB=d\sin\theta\]</div>
          <div class="eq key-eq">\[2d\sin\theta=n\lambda\]</div>
          <p>The condition is the same wave logic used for X-ray diffraction, now applied to electrons.</p>
        `
      },
      {
        icon: "fa-solid fa-ruler",
        color: "green",
        title: "Matter wavelength",
        body: String.raw`
          <div class="eq key-eq">\[\lambda=\frac{h}{p}\]</div>
          <p>Davisson-Germer and related experiments made de Broglie's proposal physically measurable: a beam of particles can carry a wavelength.</p>
        `
      },
      {
        icon: "fa-solid fa-door-open",
        color: "purple",
        title: "Conceptual discussion",
        body: String.raw`
          <p>Electron diffraction is the mirror image of the photoelectric effect. Light had looked wave-like and then showed particle-like transfer; electrons had looked particle-like and then showed wave-like propagation.</p>
        `
      }
    ]
  },
  {
    id: "1.9",
    file: "bohr-model-postulates.html",
    title: "Bohr model: postulates",
    subtitle: "Stationary states and quantum jumps",
    cards: [
      {
        icon: "fa-solid fa-atom",
        title: "Bohr's picture",
        body: String.raw`
          ${figure("fig-1-8-bohr-atom.png", "Fig. 1.8, adapted from the original chapter: spectral series are interpreted as transitions between allowed atomic levels.")}
          <p>Bohr keeps the planetary picture of an electron orbiting the nucleus, but changes the rules that decide which orbits and transitions are physically allowed.</p>
        `
      },
      {
        icon: "fa-solid fa-list-ol",
        color: "orange",
        title: "The three postulates",
        body: String.raw`
          <ol class="numbered">
            <li><strong>Stationary states:</strong> the electron can occupy certain circular orbits without continuously radiating energy.</li>
            <li><strong>Angular-momentum quantization:</strong> only orbits satisfying \(L=mvr=n\hbar\) are allowed.</li>
            <li><strong>Quantum jumps:</strong> light is emitted or absorbed only when the electron moves between two allowed states.</li>
          </ol>
        `
      },
      {
        icon: "fa-solid fa-circle-nodes",
        color: "green",
        title: "Equations attached to the postulates",
        body: String.raw`
          <div class="eq key-eq">\[L=mvr=n\hbar\]</div>
          <div class="eq key-eq">\[hf=\Delta E=E_i-E_f\]</div>
          <p>The first equation selects the allowed orbits. The second equation connects a spectral line to the energy difference between two stationary states.</p>
        `
      },
      {
        icon: "fa-solid fa-scale-balanced",
        color: "purple",
        title: "Classical mechanics still inside",
        body: String.raw`
          <div class="eq key-eq">\[E=\frac{1}{2}mv^2-\frac{\kappa e^2}{r}\]</div>
          <div class="eq key-eq">\[mv^2=\frac{\kappa e^2}{r}\]</div>
          <p>The model is hybrid. Classical circular motion supplies the force balance and mechanical energy, while the postulates select the allowed values and explain why radiation appears only during transitions.</p>
        `
      }
    ]
  },
  {
    id: "1.10",
    file: "bohr-model-hydrogen-spectrum.html",
    title: "Bohr model: hydrogen spectrum",
    subtitle: "Energy levels, radii and the Rydberg formula",
    cards: [
      {
        icon: "fa-solid fa-layer-group",
        title: "Energy ladder",
        body: String.raw`
          ${figure("fig-1-9-bohr-spectrum.png", "Fig. 1.9, adapted from the original chapter: Bohr energy levels organize the Hydrogen spectral series.")}
          <p>Hydrogen levels become a ladder of bound states. Transitions between them generate the observed spectral lines.</p>
        `
      },
      {
        icon: "fa-solid fa-ruler-combined",
        color: "orange",
        title: "Radii and energy",
        body: String.raw`
          <div class="eq key-eq">\[r_n=a_0n^2,\qquad a_0=0.529\ \text{\AA}\]</div>
          <div class="eq key-eq">\[E_n=-\frac{E_0}{n^2},\qquad E_0=13.6\ \mathrm{eV}\]</div>
          <p>The radius grows as \(n^2\), while the energy approaches zero from below as \(n\) increases.</p>
        `
      },
      {
        icon: "fa-solid fa-rainbow",
        color: "green",
        title: "Recovering Rydberg",
        body: String.raw`
          <div class="eq key-eq">\[\frac{1}{\lambda}=\frac{E_0}{hc}\left(\frac{1}{n^2}-\frac{1}{m^2}\right)\]</div>
          <div class="eq key-eq">\[R=\frac{E_0}{hc}=1.097\times 10^7\ \mathrm{m^{-1}}\]</div>
          <p>What was empirical in Rydberg's formula becomes a consequence of energy quantization.</p>
        `
      },
      {
        icon: "fa-solid fa-filter",
        color: "purple",
        title: "Conceptual discussion",
        body: String.raw`
          <p>The success is real but narrow. Bohr explains Hydrogen-like spectra and the Rydberg constant, but not the general structure of quantum states, spin, multi-electron atoms or measurement. The model is a bridge toward wave mechanics.</p>
        `
      }
    ]
  },
  {
    id: "1.11",
    file: "de-broglie-hypothesis.html",
    title: "de Broglie hypothesis",
    subtitle: "Matter waves and the standing-wave view of orbits",
    cards: [
      {
        icon: "fa-solid fa-arrows-spin",
        title: "Orbit as a wave condition",
        body: String.raw`
          ${figure("fig-1-10-de-broglie-orbit.png", "Fig. 1.10, adapted from the original chapter: a stable orbit can be pictured as a standing matter wave.")}
          <p>de Broglie's hypothesis gives Bohr's quantization a wave interpretation: the orbit is allowed only when the matter wave fits itself after a full cycle.</p>
        `
      },
      {
        icon: "fa-solid fa-ruler",
        color: "orange",
        title: "Matter wavelength",
        body: String.raw`
          <div class="eq key-eq">\[\lambda=\frac{h}{p}\]</div>
          <div class="eq key-eq">\[2\pi r=n\lambda\]</div>
          <p>The circumference must contain an integer number of wavelengths.</p>
        `
      },
      {
        icon: "fa-solid fa-ring",
        color: "green",
        title: "Recovering Bohr's rule",
        body: String.raw`
          <div class="eq key-eq">\[2\pi r=n\frac{h}{mv}\quad \Rightarrow \quad mvr=n\hbar\]</div>
          <p>The angular momentum rule is no longer an isolated postulate; it becomes a standing-wave condition.</p>
        `
      },
      {
        icon: "fa-solid fa-door-open",
        color: "purple",
        title: "Conceptual discussion",
        body: String.raw`
          <p>The idea shifts the problem from "which orbit is allowed?" to "which wave states satisfy the boundary conditions?" This is the conceptual entrance to Schrodinger's equation in Chapter 2.</p>
        `
      }
    ]
  },
  {
    id: "1.12",
    file: "semi-classical-quantization-rule.html",
    title: "Semi-classical quantization rule",
    subtitle: "Action integrals as early quantum conditions",
    cards: [
      {
        icon: "fa-solid fa-repeat",
        title: "The rule",
        body: String.raw`
          <p>The Sommerfeld-Wilson-Ishiwara rule quantizes the action accumulated over one complete cycle of a periodic coordinate.</p>
          <div class="eq key-eq">\[\oint p_i\,dq_i=n_i h,\qquad n_i=1,2,3,\ldots\]</div>
          <p>The index \(i\) allows more than one coordinate to be quantized, which is essential for orbital problems beyond a single circular motion.</p>
        `
      },
      {
        icon: "fa-solid fa-bridge",
        color: "orange",
        title: "Why action?",
        body: String.raw`
          <div class="eq key-eq">\[n=\frac{\text{closed path length}}{\lambda}\]</div>
          <div class="eq key-eq">\[\lambda=\frac{h}{p}\quad \Rightarrow \quad \oint p\,dq=nh\]</div>
          <p>Action is the classical quantity that naturally measures accumulated phase. Quantizing action is an early way to impose wave self-consistency.</p>
        `
      },
      {
        icon: "fa-solid fa-clipboard-list",
        color: "green",
        title: "Practical recipe",
        body: String.raw`
          <ol class="numbered">
            <li>Identify the periodic coordinate \(q\).</li>
            <li>Write the conjugate momentum \(p(q)\).</li>
            <li>Evaluate the closed integral over one cycle.</li>
            <li>Set the result equal to \(nh\) and solve for the allowed energies or radii.</li>
          </ol>
        `
      },
      {
        icon: "fa-solid fa-triangle-exclamation",
        color: "purple",
        title: "Conceptual discussion",
        body: String.raw`
          <p>The rule is useful but not final. It gives good intuition for bound periodic systems, yet it misses effects that require full wave mechanics: zero-point shifts, degeneracy structure, spin and operator-based selection rules.</p>
        `
      }
    ]
  },
  {
    id: "1.13",
    file: "scqr-examples.html",
    title: "SCQR examples",
    subtitle: "Oscillators, wells and power-law intuition",
    cards: [
      {
        icon: "fa-solid fa-wave-square",
        title: "Harmonic oscillator: phase-space area",
        body: String.raw`
          ${figure("fig-1-11-harmonic-oscillator-scqr.png", "Fig. 1.11, adapted from the original chapter: the classical oscillator potential and the semiclassical energy ladder.")}
          <p>Start with \(E=p^2/(2m)+m\omega^2x^2/2\). For fixed \(E\), this is an ellipse in phase space \((x,p)\).</p>
          <div class="eq key-eq">\[1=\frac{p^2}{2mE}+\frac{x^2}{2E/(m\omega^2)}\]</div>
          <div class="eq key-eq">\[\oint p\,dx=A=\pi\sqrt{2mE}\sqrt{\frac{2E}{m\omega^2}}=\frac{2\pi E}{\omega}\]</div>
          <div class="eq key-eq">\[\frac{2\pi E}{\omega}=nh\quad\Rightarrow\quad E_n=n\hbar\omega\]</div>
          <p>The SCQR result explains the equal spacing. Full quantum mechanics later adds the zero-point shift, \(E_n=(n+1/2)\hbar\omega\).</p>
        `
      },
      {
        icon: "fa-solid fa-box",
        color: "green",
        title: "Infinite potential well: closed classical cycle",
        body: String.raw`
          ${figure("fig-1-14-infinite-well.png", "Fig. 1.14, adapted from the original chapter: allowed levels in an infinite potential well.")}
          <p>Inside the box, \(V=0\), so the momentum is constant. The closed classical path goes from one wall to the other and back.</p>
          <div class="eq key-eq">\[p=\sqrt{2mE},\qquad \oint p\,dx=2pa\]</div>
          <div class="eq key-eq">\[2pa=nh\quad\Rightarrow\quad p_n=\frac{nh}{2a}\]</div>
          <div class="eq key-eq">\[E_n=\frac{p_n^2}{2m}=\frac{n^2h^2}{8ma^2}\]</div>
          <p>The same result can be read as a standing-wave condition, \(a=n\lambda/2\). The walls select wavelengths, and the wavelengths select energies.</p>
        `
      },
      {
        icon: "fa-solid fa-chart-area",
        color: "orange",
        title: "Power-law potentials",
        body: String.raw`
          ${figure("fig-1-15-power-law-potential.png", "Fig. 1.15, adapted from the original chapter: power-law potentials approach the infinite well shape as the exponent grows.")}
          <div class="eq key-eq">\[V(x)=V_0\left(\frac{x}{a}\right)^q,\qquad q=\text{even}\]</div>
          <p>The action integral changes with the turning points. As \(q\) becomes large, the potential approaches the infinite-well limit.</p>
        `
      },
      {
        icon: "fa-solid fa-clipboard-check",
        color: "purple",
        title: "How to read these examples",
        body: String.raw`
          <ol class="numbered">
            <li>Find the classically allowed region.</li>
            <li>Write \(p(x)=\sqrt{2m[E-V(x)]}\).</li>
            <li>Integrate over one complete classical cycle.</li>
            <li>Set \(\oint p\,dx=nh\) and solve for \(E_n\).</li>
          </ol>
          <p>The equations make sense only in this order. The orange boxes are the calculation path, not isolated formulas.</p>
        `
      }
    ]
  },
  {
    id: "1.14",
    file: "sommerfeld-orbits-ellipse-geometry.html",
    title: "Sommerfeld orbits and ellipse geometry",
    subtitle: "Elliptical motion and refined old quantum rules",
    cards: [
      {
        icon: "fa-solid fa-ellipsis",
        title: "Beyond circular orbits",
        body: String.raw`
          ${figure("fig-1-12-sommerfeld-orbits.png", "Fig. 1.12, adapted from the original chapter: Sommerfeld orbits for fixed principal quantum number and different angular labels.")}
          <p>Sommerfeld generalized Bohr's model by allowing elliptical orbits. The price is that more than one periodic coordinate must be quantized.</p>
        `
      },
      {
        icon: "fa-solid fa-repeat",
        color: "orange",
        title: "Two action conditions",
        body: String.raw`
          <div class="eq key-eq">\[\oint p_\theta\,d\theta=n_\theta h,\qquad \oint p_r\,dr=n_r h\]</div>
          <div class="eq key-eq">\[n=n_r+n_\theta\]</div>
          <p>The circular Bohr orbit is recovered when the radial motion is absent.</p>
        `
      },
      {
        icon: "fa-solid fa-draw-polygon",
        color: "green",
        title: "Ellipse geometry",
        body: String.raw`
          ${figure("fig-1-13-ellipse-geometry.png", "Fig. 1.13, adapted from the original chapter: geometric parameters of an ellipse used in the Sommerfeld model.")}
          <div class="eq key-eq">\[b=a\sqrt{1-\varepsilon^2}\]</div>
          <div class="eq key-eq">\[\varepsilon=\sqrt{1-\frac{n_\theta^2}{n^2}}\]</div>
          <p>The eccentricity connects orbital shape with the quantum labels.</p>
        `
      },
      {
        icon: "fa-solid fa-lightbulb",
        color: "purple",
        title: "Conceptual discussion",
        body: String.raw`
          <div class="eq key-eq">\[E_n=-\frac{E_0}{n^2}\]</div>
          <p>The nonrelativistic Sommerfeld energy has the same \(n\)-dependence as Bohr's model. The new value is conceptual: it shows that additional quantum labels can describe different orbital shapes at the same energy.</p>
        `
      }
    ]
  },
  {
    id: "1.15",
    file: "timeline-conceptual-synthesis.html",
    title: "Timeline and conceptual synthesis",
    subtitle: "From empirical clues to wave mechanics",
    cards: [
      {
        icon: "fa-solid fa-timeline",
        title: "Historical flow",
        body: String.raw`
          ${figure("fig-1-16-old-quantum-timeline.png", "Fig. 1.16, adapted from the original chapter: the transition from classical physics to old quantum physics.")}
          <p>The chapter is a chain of constraints, not a loose list of discoveries. Each experiment narrows the room available to classical physics.</p>
        `
      },
      {
        icon: "fa-solid fa-table",
        color: "green",
        title: "Compact synthesis",
        body: String.raw`
          <div class="table-wrap">
            <table>
              <thead><tr><th>Step</th><th>Key idea</th><th>Survives as</th></tr></thead>
              <tbody>
                <tr><td>Hydrogen spectra</td><td>Discrete transitions</td><td>Energy eigenvalues</td></tr>
                <tr><td>Planck</td><td>Energy exchange \(hf\)</td><td>Quantum scale \(h\)</td></tr>
                <tr><td>Einstein</td><td>Photons</td><td>Quantized field excitations</td></tr>
                <tr><td>Bohr</td><td>Stationary states</td><td>Bound-state spectra</td></tr>
                <tr><td>de Broglie</td><td>Matter waves</td><td>Wave mechanics</td></tr>
                <tr><td>SCQR</td><td>Quantized action</td><td>Semiclassical approximation</td></tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        icon: "fa-solid fa-check",
        color: "orange",
        title: "Equations that summarize the chapter",
        body: String.raw`
          <div class="eq key-eq">\[\frac{1}{\lambda}=R\left(\frac{1}{n^2}-\frac{1}{m^2}\right)\]</div>
          <div class="eq key-eq">\[eV_c=hf-W,\qquad \lambda=\frac{h}{p}\]</div>
          <div class="eq key-eq">\[E_n=-\frac{E_0}{n^2},\qquad \oint p_i\,dq_i=n_i h\]</div>
        `
      },
      {
        icon: "fa-solid fa-forward",
        color: "purple",
        title: "What changes in Chapter 2",
        body: String.raw`
          <p>Old quantum physics selects allowed quantities through rules. Wave mechanics explains allowed states as solutions of an equation with boundary conditions. That is the conceptual upgrade: from imposed quantization to eigenvalue problems.</p>
        `
      }
    ]
  }
];

const guidedThreads = {
  "1.1": String.raw`
    <p>Read this first page as a map of the chapter. The logical thread is: classical physics explains macroscopic motion and electromagnetic waves very well, but microscopic experiments begin to return discrete numbers. The formulas \(E=hf\), \(\lambda=h/p\), \(L=n\hbar\) and \(\oint p_i\,dq_i=n_i h\) are different answers to the same pressure: nature is not allowing every classical value.</p>
    <p>The chapter therefore moves from evidence to rules. Spectra reveal discrete atomic transitions, radiation introduces energy quanta, the photoelectric effect turns \(hf\) into a measurable electron energy, and matter waves make quantization look like a boundary-condition problem. Keep that sequence in mind before reading the individual topics.</p>
  `,
  "1.2": String.raw`
    <p>The point of this topic is to establish the classical meaning of a wave before quantum mechanics changes the interpretation. A double-slit pattern begins with a path difference; when that difference is \(m\lambda\), waves arrive in phase and a bright fringe appears. That is why \(d\sin\theta=m\lambda\) is the useful equation here: it translates geometry into wavelength.</p>
    <p>Later in the chapter, the same logic is reused for matter. If an electron has a wavelength, then allowed patterns must also satisfy interference or standing-wave conditions. So this page is not a detour: it gives the wave language needed for de Broglie and Schrodinger.</p>
  `,
  "1.3": String.raw`
    <p>The Hydrogen spectrum is the first strong hint that atoms have internal levels. The observation is simple: white light gives a continuum, while Hydrogen gives separated lines. Balmer's formula organizes the visible lines with integers; Rydberg's formula generalizes the pattern as \(1/\lambda=R(1/n^2-1/m^2)\).</p>
    <p>The logic is not "memorize the formula"; it is "ask why integers are present." Before Bohr, \(n\) and \(m\) are empirical labels. After Bohr, they become level labels, and each spectral line becomes a transition with photon energy \(hc/\lambda=\Delta E\).</p>
  `,
  "1.4": String.raw`
    <p>The experiment is a chain that turns a visible beam deflection into \(|q|/m\). First, the Lorentz force \(\vec F=q(\vec E+\vec v\times\vec B)\) is used in capacitor A: the electric and magnetic forces cancel only for particles with \(v_x=E_{yA}/B_z\). This is a velocity selector.</p>
    <p>Then the selected beam enters capacitor B, where the electric field bends the trajectory. Measuring the total displacement \(d\), together with the known geometry \(l\) and \(L\), gives \(|q|/m=2dv_x^2/[E_{yB}l(l+2L)]\). The conceptual conclusion comes after the algebra: the ratio is so large that the beam particles must be very light compared with Hydrogen ions, pointing to the electron.</p>
  `,
  "1.5": String.raw`
    <p>Black-body radiation begins as a classical counting problem. A cavity supports electromagnetic modes, and Rayleigh-Jeans assigns the classical average energy \(k_BT\) to each mode, producing \(du/df=(8\pi/c^3)k_BT f^2\). The high-frequency divergence shows exactly where the classical assumption fails.</p>
    <p>Planck keeps the mode structure but changes the energy exchange: \(\epsilon=hf\). The average energy becomes \(\langle\epsilon\rangle=hf/(e^{hf/k_BT}-1)\), which suppresses high-frequency modes and fixes the spectrum. The equation is therefore not just a fit; it is the first operational use of quantized energy.</p>
  `,
  "1.6": String.raw`
    <p>The photoelectric effect converts Planck's quantum into a direct energy balance. The stopping potential measures the maximum kinetic energy of emitted electrons, so \(T_{\max}=eV_c\). Einstein's step is to write the incoming light energy as \(hf\), giving \(eV_c=hf-W\).</p>
    <p>This equation guides the interpretation. Increasing frequency raises the electron kinetic energy; increasing intensity mainly changes how many electrons are emitted. The threshold frequency appears because photons with \(hf&lt;W\) cannot eject electrons, no matter how many of them arrive.</p>
  `,
  "1.7": String.raw`
    <p>Millikan's experiment is a force-balance argument. Without the electric field, the falling drop reaches terminal speed when gravity is balanced by viscous drag, \(mg=6\pi\eta Rv_f\), allowing the radius \(R\) to be estimated. With the electric field on, the upward electric force is added to the balance.</p>
    <p>The resulting charge formula is useful because repeated measurements do not give arbitrary values. They cluster around \(q=ne\). This page therefore connects dynamics to discreteness: charge itself comes in units, and when combined with Thomson's \(|q|/m\), it gives the electron mass scale.</p>
  `,
  "1.8": String.raw`
    <p>Electron diffraction takes the wave equation logic from optics and applies it to matter. A crystal supplies regularly spaced planes, so constructive interference requires a path difference \(2d\sin\theta=n\lambda\). The experiment is wave-like because maxima appear only at angles satisfying that condition.</p>
    <p>The new ingredient is de Broglie's relation \(\lambda=h/p\). Once an electron beam has momentum \(p\), the equation predicts a wavelength; the diffraction pattern tests whether that wavelength is real. This is why the topic is the bridge from particles to wave mechanics.</p>
  `,
  "1.9": String.raw`
    <p>Read Bohr's model as three explicit postulates, not as a single formula. First, the electron may occupy special stationary states without radiating. Second, the allowed circular orbits satisfy \(L=mvr=n\hbar\). Third, radiation is emitted or absorbed only when the electron jumps between two allowed states, with \(hf=\Delta E\).</p>
    <p>After those rules are stated, classical mechanics enters as a calculator: Coulomb attraction supplies the circular force balance and the mechanical energy, while the postulates select which radii, energies and spectral frequencies are allowed.</p>
  `,
  "1.10": String.raw`
    <p>This topic follows the consequences of Bohr's postulates. Combining Coulomb attraction with angular-momentum quantization gives \(r_n=a_0n^2\), so atomic radii are no longer arbitrary. Substituting the allowed radii into the mechanical energy gives \(E_n=-E_0/n^2\).</p>
    <p>Now the Hydrogen spectrum becomes quantitative: a transition from \(m\) to \(n\) emits a photon with \(hc/\lambda=E_m-E_n\), which reproduces the Rydberg formula. The empirical integers in spectroscopy are now explained as energy-level labels.</p>
  `,
  "1.11": String.raw`
    <p>de Broglie's hypothesis gives a reason for Bohr's angular-momentum rule. If an electron has wavelength \(\lambda=h/p\), a stable circular orbit must close on itself as a standing wave. That condition is \(2\pi r=n\lambda\).</p>
    <p>Substituting \(\lambda=h/(mv)\) immediately gives \(mvr=n\hbar\). The logic is important: quantization is no longer just an extra rule imposed on a particle orbit; it looks like a wave self-consistency condition. This is the conceptual step toward wave mechanics.</p>
  `,
  "1.12": String.raw`
    <p>The semi-classical quantization rule generalizes the standing-wave idea. Instead of quantizing one circular orbit, it quantizes the action accumulated by each periodic coordinate: \(\oint p_i\,dq_i=n_i h\). The integral measures how much classical phase is accumulated over a closed cycle.</p>
    <p>Use this as a method. First identify the periodic motion; then write the conjugate momentum; then integrate over a full cycle; finally solve the condition for the allowed energy, radius or orbit. The rule is not the final quantum theory, but it explains why boundary conditions and action become central.</p>
  `,
  "1.13": String.raw`
    <p>Read these examples as applications of one recipe, not as a list of orange formulas. First identify the classically allowed region. Then write \(p(x)=\sqrt{2m[E-V(x)]}\). Finally integrate over a complete classical cycle and impose \(\oint p\,dx=nh\).</p>
    <p>For the harmonic oscillator, the closed curve in phase space is an ellipse whose area is \(2\pi E/\omega\), so SCQR gives \(E_n=n\hbar\omega\). For the infinite well, the particle moves with constant momentum across the box and back, giving \(2pa=nh\) and \(E_n=n^2h^2/(8ma^2)\). The method is therefore a logical chain from classical motion to allowed energies.</p>
  `,
  "1.14": String.raw`
    <p>Sommerfeld's model asks what happens if the electron orbit is not forced to be circular. An ellipse has radial and angular motion, so the semi-classical rule must be applied twice: \(\oint p_\theta d\theta=n_\theta h\) and \(\oint p_r dr=n_r h\).</p>
    <p>The geometry then connects the quantum labels to orbital shape through eccentricity. The energy remains \(E_n=-E_0/n^2\) in the nonrelativistic treatment, but the model introduces a key idea that survives in a different form: a state may need more than one quantum number.</p>
  `,
  "1.15": String.raw`
    <p>Read the timeline as a cause-and-effect chain. Hydrogen spectra require discrete atomic energies; Planck introduces \(hf\) to fix thermal radiation; Einstein uses the same quantum in \(eV_c=hf-W\); Bohr turns discreteness into atomic levels; de Broglie turns orbits into matter waves; SCQR turns the wave condition into an action integral.</p>
    <p>The synthesis is that old quantum physics finds many correct constraints but lacks one unified language. Chapter 2 supplies that language by replacing imposed rules with wave equations, boundary conditions and eigenvalues.</p>
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
  const pageTitle = `${page.title} | Chapter 1 | Quantum Mechanics`;
  const description = `${page.title}. Practical auxiliary summary for Chapter 1 of the Quantum Mechanics book-app.`;
  const includesFigure = page.cards.some((card) => card.body.includes("book-figure"));
  const figureNote = includesFigure
    ? "Selected figure material is reproduced/adapted from Chapter 1 of the original book and carries a visible copyright watermark and caption."
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
  <script>
    window.MathJax = {
      tex: { inlineMath: [["\\\\(", "\\\\)"]], displayMath: [["\\\\[", "\\\\]"]] },
      startup: { typeset: true }
    };
  </script>
  <script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <style>
    :root{
      --bg:#FCFCFA; --page:#EDEDED; --text:#2C3E50; --muted:#5D6D7E;
      --blue:#004B87; --blue-soft:#E8F0FE; --red:#B03A2E; --green:#1A7A4A;
      --purple:#6D28D9; --orange:#A04000; --orange-soft:#FFF3E8; --border:#DDE3ED; --card:#FFFFFF;
      --shadow:0 10px 28px rgba(0,0,0,.08);
      --title:clamp(1.34rem, 2.2vw, 1.76rem);
      --subtitle:clamp(.8rem, 1.2vw, .98rem);
      --body:clamp(.92rem, 1.18vw, 1.02rem);
      --small:clamp(.8rem, 1vw, .92rem);
      --card-title:clamp(.96rem, 1.25vw, 1.08rem);
    }
    *{box-sizing:border-box}
    html,body{margin:0!important;padding:0!important;width:100%!important;min-height:100%!important;height:auto!important;overflow-x:hidden!important;overflow-y:auto!important;background:var(--page)!important;color:var(--text)!important;font-family:"Lora", Georgia, serif!important;}
    body{display:flex!important;justify-content:center!important;align-items:flex-start!important;padding:clamp(8px,1.8vw,18px)!important;}
    .slide{width:min(100%,1280px)!important;max-width:1280px!important;min-height:min(720px, calc(100vh - 2*clamp(8px,1.8vw,18px)))!important;height:auto!important;background:var(--bg)!important;color:var(--text)!important;display:flex!important;flex-direction:column!important;position:relative!important;overflow:visible!important;border:1px solid rgba(0,0,0,.04)!important;box-shadow:var(--shadow)!important;}
    .hdr{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:14px!important;padding:clamp(10px,1.5vw,15px) clamp(16px,2.4vw,30px)!important;margin:clamp(10px,1.5vw,14px) clamp(16px,3vw,40px) clamp(6px,1vw,10px)!important;background:#F2F4F7!important;border-left:5px solid var(--blue)!important;border-radius:6px!important;flex-shrink:0!important;}
    .hdr-inner{display:flex!important;flex-direction:column!important;min-width:0!important;}
    .hdr-title{font-family:"Inter",sans-serif!important;font-weight:700!important;font-size:var(--title)!important;color:var(--blue)!important;line-height:1.18!important;letter-spacing:0!important;margin:0!important;text-transform:none!important;}
    .hdr-sub{font-family:"Inter",sans-serif!important;font-weight:400!important;font-size:var(--subtitle)!important;color:var(--muted)!important;line-height:1.35!important;margin-top:3px!important;text-transform:uppercase!important;letter-spacing:.045em!important;}
    .slide-num{font-family:"Inter",sans-serif!important;font-size:.78rem!important;color:#98A4B5!important;white-space:nowrap!important;align-self:center!important;}
    .body{flex:1 1 auto!important;width:100%!important;display:grid!important;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr))!important;gap:clamp(12px,1.8vw,18px)!important;padding:clamp(10px,1.5vw,14px) clamp(16px,3vw,40px) clamp(16px,2.3vw,26px)!important;align-items:start!important;min-height:0!important;overflow:visible!important;}
    .col{min-width:0!important;display:flex!important;flex-direction:column!important;gap:clamp(10px,1.5vw,14px)!important;justify-content:flex-start!important;overflow:visible!important;}
    .card{background:var(--card)!important;border:1px solid var(--border)!important;border-radius:9px!important;padding:clamp(12px,1.7vw,18px)!important;box-shadow:0 2px 10px rgba(0,0,0,.045)!important;min-width:0!important;overflow:visible!important;border-top:3px solid var(--blue)!important;}
    .card.red{border-top-color:var(--red)!important}.card.green{border-top-color:var(--green)!important}.card.purple{border-top-color:var(--purple)!important}.card.orange{border-top-color:var(--orange)!important}
    .guide-card{grid-column:1 / -1!important;background:#FFFDF8!important;}
    .guide-card p{font-size:clamp(.95rem,1.2vw,1.05rem)!important;line-height:1.62!important;margin:.45rem 0!important;}
    .ch{font-family:"Inter",sans-serif!important;font-weight:700!important;font-size:var(--card-title)!important;line-height:1.25!important;color:var(--blue)!important;display:flex!important;align-items:center!important;gap:8px!important;margin-bottom:clamp(4px,.8vw,8px)!important;text-transform:none!important;letter-spacing:.015em!important;}
    .ch.red{color:var(--red)!important}.ch.green{color:var(--green)!important}.ch.purple{color:var(--purple)!important}.ch.orange{color:var(--orange)!important}
    p,li,td{font-family:"Lora", Georgia, serif!important;font-size:var(--body)!important;line-height:1.58!important;color:var(--text)!important;text-align:justify!important;}
    p{margin:.35rem 0!important;}
    .bullet,.numbered{margin:.35rem 0!important;padding-left:1.2rem!important;}
    .bullet{list-style:none!important;}
    .numbered{padding-left:1.4rem!important;}
    li{position:relative!important;margin-bottom:.33rem!important;padding-left:.25rem!important;}
    .bullet li::before{content:"▸"!important;color:var(--blue)!important;position:absolute!important;left:-1rem!important;top:.05rem!important;font-size:.75em!important;}
    .eq{background:#F8F9FA!important;border:1px solid #D5D8DC!important;border-radius:8px!important;text-align:center!important;font-size:clamp(.95rem,1.2vw,1.06rem)!important;line-height:1.45!important;overflow-x:auto!important;overflow-y:hidden!important;max-width:100%!important;white-space:normal!important;-webkit-overflow-scrolling:touch!important;padding:11px!important;margin:10px 0!important;}
    .key-eq{background:var(--orange-soft)!important;border:2px solid rgba(160,64,0,.42)!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.65)!important;}
    .eq mjx-container,mjx-container{max-width:100%!important;overflow-x:auto!important;overflow-y:hidden!important;white-space:nowrap!important;}
    .callout{background:#FFF8F6!important;border-left:4px solid var(--red)!important;border-radius:0 8px 8px 0!important;padding:12px 14px!important;margin-top:10px!important;font-family:"Inter",sans-serif!important;font-size:var(--small)!important;line-height:1.45!important;color:#394B5D!important;}
    .book-figure{margin:2px 0 12px!important;padding:0!important;border:1px solid #DDE3ED!important;border-radius:8px!important;overflow:hidden!important;background:#FFFFFF!important;}
    .book-figure img{display:block!important;width:100%!important;height:auto!important;object-fit:contain!important;background:#FFFFFF!important;}
    .book-figure figcaption{font-family:"Inter",sans-serif!important;font-size:.73rem!important;line-height:1.35!important;color:#526173!important;padding:8px 10px!important;background:#F8FAFC!important;border-top:1px solid #E4E9F0!important;}
    .table-wrap{max-width:100%!important;overflow-x:auto!important;border-radius:8px!important;border:1px solid var(--border)!important;margin-top:10px!important;}
    table{width:100%!important;min-width:420px!important;border-collapse:collapse!important;font-family:"Inter",sans-serif!important;font-size:var(--small)!important;}
    th{background:var(--blue)!important;color:white!important;padding:7px 10px!important;text-align:left!important;}
    td{padding:7px 10px!important;border-bottom:1px solid #EEF1F5!important;text-align:left!important;}
    .resource-links,.source-note{grid-column:1 / -1!important;background:#F8FAFC!important;border:1px solid #DDE3ED!important;border-radius:9px!important;padding:10px 14px!important;font-family:"Inter",sans-serif!important;font-size:.78rem!important;line-height:1.45!important;color:#526173!important;}
    .resource-links{border-left:4px solid var(--blue)!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;flex-wrap:wrap!important;}
    .resource-links strong{color:var(--blue)!important;}
    .resource-link-list{display:flex!important;gap:8px!important;flex-wrap:wrap!important;}
    .resource-link-list a{display:inline-flex!important;align-items:center!important;text-decoration:none!important;color:var(--blue)!important;background:#EEF3FC!important;border:1px solid #C5D8F5!important;border-radius:999px!important;padding:5px 10px!important;font-weight:700!important;}
    .source-note{border-left:4px solid var(--orange)!important;border-radius:0 9px 9px 0!important;}
    .source-note strong{color:var(--orange)!important;}
    .index-back-button{width:fit-content!important;display:inline-flex!important;align-items:center!important;gap:6px!important;text-decoration:none!important;font-family:"Inter",sans-serif!important;font-size:0.78rem!important;font-weight:700!important;color:var(--blue)!important;background:#EEF3FC!important;border:1px solid #C5D8F5!important;padding:5px 10px!important;border-radius:7px!important;margin-bottom:8px!important;transition:0.18s ease!important;}
    .index-back-button:hover{background:#DCEBFF!important;transform:translateY(-1px)!important;}
    .chapter-label{display:inline-flex!important;align-items:center!important;align-self:flex-start!important;width:fit-content!important;gap:8px!important;background:var(--blue-soft)!important;color:var(--blue)!important;border-radius:999px!important;padding:8px 14px!important;font-family:"Inter",sans-serif!important;font-size:.84rem!important;font-weight:800!important;margin-bottom:18px!important;}
    @media (max-width:900px){
      body{padding:0!important;background:var(--bg)!important;}
      .slide{width:100%!important;max-width:none!important;min-height:100vh!important;border:0!important;box-shadow:none!important;}
      .hdr{margin:10px 12px 6px!important;padding:11px 14px!important;}
      .body{grid-template-columns:1fr!important;padding:10px 12px 18px!important;gap:12px!important;}
      .slide-num{display:none!important;}
      p,li,td{text-align:left!important;}
      .resource-links{align-items:flex-start!important;flex-direction:column!important;}
    }
    @media (max-width:520px){
      :root{--title:1.22rem;--subtitle:.76rem;--body:.94rem;--card-title:.98rem;}
      .hdr{flex-direction:column!important;}
      .card{padding:12px!important;}
      table{min-width:360px!important;}
      .resource-link-list a{width:100%!important;justify-content:center!important;}
    }
  </style>
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
        <a href="../../index.html?view=chapters&chapter=01" class="index-back-button">
          <i class="fa-solid fa-arrow-left"></i>
          Index
        </a>
        <div class="chapter-label">
          <i class="fa-solid fa-layer-group"></i>
          Chapter 1 · Item ${escapeHtml(page.id)}
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
        <strong>Source note:</strong> Original auxiliary summary for this book-app, based on Chapter 1 of Mario Reis, <em>Quantum Mechanics</em>, Elsevier, 2026. Book text and figures are copyright &copy; 2026 Elsevier Inc. ${escapeHtml(figureNote)}
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
    url: `slides/chapter-01/${page.file}`
  };
});

await writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");

console.log(`Generated ${pages.length} enriched Chapter 1 HTML pages.`);
