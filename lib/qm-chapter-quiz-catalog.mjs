const CHAPTERS = {
  "01": {
    title: "Chapter 1 assessment",
    items: [
      item("qm-01-wave-benchmark", "classical-wave-benchmark", "1.2", "Wave optics as the classical benchmark", "slides/chapter-01/wave-optics-classical-benchmark.html",
        "Which classical phenomenon supplies the benchmark for the wave description used in this chapter?",
        ["Wave optics", "Nuclear decay", "Angular momentum coupling", "Perturbation theory"], "a",
        "Interference and diffraction in wave optics provide the classical benchmark.",
        "Which observation is most characteristic of the classical wave benchmark?",
        ["Interference fringes", "A single decay time", "A discrete spin projection", "A coupled angular-momentum basis"], "a"),
      item("qm-01-photoelectric", "photoelectric-effect", "1.6", "Photoelectric effect", "slides/chapter-01/photoelectric-effect.html",
        "For light above the threshold frequency, what primarily increases the maximum photoelectron kinetic energy?",
        ["Increasing the light frequency", "Increasing only the light intensity", "Increasing the illuminated area", "Waiting longer"], "a",
        "Above threshold, Einstein's relation ties maximum kinetic energy to photon frequency.",
        "Light below the threshold frequency becomes more intense. What does the ideal photoelectric model predict?",
        ["No photoelectrons are emitted", "Electrons emerge with larger maximum energy", "The threshold frequency decreases", "The work function vanishes"], "a"),
      item("qm-01-de-broglie", "de-broglie-matter-waves", "1.11", "de Broglie hypothesis", "slides/chapter-01/de-broglie-hypothesis.html",
        "Which relation gives the de Broglie wavelength of a particle with momentum p?",
        ["λ = h/p", "λ = p/h", "λ = hp", "λ = h/p²"], "a",
        "The de Broglie wavelength is inversely proportional to momentum: λ = h/p.",
        "If a nonrelativistic particle's momentum doubles, what happens to its de Broglie wavelength?",
        ["It is halved", "It doubles", "It is unchanged", "It becomes zero"], "a")
    ]
  },
  "02": {
    title: "Chapter 2 assessment",
    items: [
      item("qm-02-schrodinger", "schrodinger-equation", "2.2", "Time-dependent Schrödinger equation", "slides/chapter-02/time-dependent-schrodinger-equation.html",
        "Which equation governs the time evolution of a quantum state in this chapter?",
        ["Time-dependent Schrödinger equation", "Legendre equation", "Poisson equation", "Laplace equation"], "a",
        "The time-dependent Schrödinger equation determines the evolution of the state.",
        "In the Schrödinger picture, which object carries the explicit time evolution?",
        ["The state vector or wave function", "Only the coordinate axes", "The value of Planck's constant", "The normalization rule"], "a"),
      item("qm-02-probability", "probability-density-current", "2.4", "Probability density and current", "slides/chapter-02/probability-density-and-current.html",
        "For a normalized wave function ψ(x,t), which quantity is the position probability density?",
        ["|ψ(x,t)|²", "ψ(x,t) alone", "The phase of ψ only", "∂ψ/∂t"], "a",
        "The Born rule identifies |ψ|² as the position probability density.",
        "Which continuity-equation pair expresses local probability conservation?",
        ["Probability density and probability current", "Energy and temperature", "Charge and magnetic flux", "Position and elapsed time"], "a"),
      item("qm-02-infinite-well", "infinite-potential-well", "2.5", "Infinite potential well", "slides/chapter-02/infinite-potential-well.html",
        "Why are the energies of a particle in an infinite well discrete?",
        ["Boundary conditions admit only selected standing-wave modes", "The particle loses energy at each wall", "Time is quantized", "The mass changes at the walls"], "a",
        "Vanishing wave-function boundary conditions select discrete standing-wave modes and energies.",
        "What must the wave function do at the impenetrable walls of the standard infinite well?",
        ["Vanish", "Become infinite", "Have maximum probability current", "Change the particle mass"], "a")
    ]
  },
  "03": {
    title: "Chapter 3 assessment",
    items: [
      item("qm-03-spin", "matrix-mechanics-spin-entry", "3.2", "Stern–Gerlach experiment", "slides/chapter-03/stern-gerlach-experiment-magnetic-force-and-spin.html",
        "Which experiment motivates the chapter's discussion of spin?",
        ["Stern–Gerlach experiment", "Double-slit experiment", "Photoelectric effect", "Rutherford scattering"], "a",
        "The Stern–Gerlach experiment reveals discrete spin projections.",
        "What feature of the Stern–Gerlach beam is central to the spin interpretation?",
        ["Its separation into discrete components", "Its continuous thermal broadening", "Its complete absorption", "Its circular polarization only"], "a"),
      item("qm-03-dirac", "dirac-notation", "3.3", "Dirac notation", "slides/chapter-03/dirac-notation-kets-bras-inner-products.html",
        "In Dirac notation, what does ⟨φ|ψ⟩ represent?",
        ["An inner product", "A tensor product", "A commutator", "A time derivative"], "a",
        "A bra acting on a ket forms the inner product ⟨φ|ψ⟩.",
        "Which object is the Hermitian conjugate of the ket |ψ⟩?",
        ["The bra ⟨ψ|", "The ket |φ⟩", "The identity operator", "The commutator [ψ,φ]"], "a"),
      item("qm-03-hermitian", "hermitian-observables", "3.9", "Hermitian operators and real outcomes", "slides/chapter-03/hermitian-operators-and-real-outcomes.html",
        "Why are observables represented by Hermitian operators?",
        ["Their eigenvalues are real", "They always commute", "They have only one eigenvector", "They remove normalization"], "a",
        "Hermitian operators have real eigenvalues, consistent with real measurement outcomes.",
        "Which property is guaranteed for eigenvectors of a Hermitian operator with distinct eigenvalues?",
        ["They are orthogonal", "They are identical", "They have zero norm", "They are time independent"], "a")
    ]
  },
  "04": {
    title: "Chapter 4 assessment",
    items: [
      item("qm-04-hermite", "hermite-quantization", "4.3", "QHO: Hermite equation and energy quantization", "slides/chapter-04/qho-hermite-equation-and-energy-quantization.html",
        "Which polynomial family appears in harmonic-oscillator energy eigenfunctions?",
        ["Hermite polynomials", "Legendre polynomials", "Laguerre polynomials", "Bessel functions"], "a",
        "Hermite polynomials appear in the normalized harmonic-oscillator eigenfunctions.",
        "What is the spacing between adjacent one-dimensional harmonic-oscillator energy levels?",
        ["ℏω", "ℏω/2", "2ℏω", "It depends on n"], "a"),
      item("qm-04-finite-well", "finite-well-bound-states", "4.6", "Finite-well bound states", "slides/chapter-04/finite-potential-well-bound-state-setup.html",
        "How does a finite-well bound-state wave function behave outside the well?",
        ["It decays exponentially", "It is exactly zero everywhere", "It grows without bound", "It becomes a plane wave of constant amplitude"], "a",
        "A finite barrier permits an exponentially decaying tail outside the well.",
        "Compared with an infinite well of the same width, a finite well generally has what kind of bound-state confinement?",
        ["Weaker confinement with penetration outside", "Perfect confinement at the walls", "No discrete energies", "No normalizable states"], "a"),
      item("qm-04-tunneling", "quantum-tunneling-barrier", "4.12", "Rectangular barrier and quantum tunneling", "slides/chapter-04/rectangular-barrier-and-quantum-tunneling.html",
        "For a finite barrier and incident energy below its height, quantum mechanics predicts which result?",
        ["A nonzero transmission probability", "Exactly zero transmission", "Certain transmission", "Loss of normalization"], "a",
        "The evanescent wave inside a finite barrier produces a nonzero tunneling probability.",
        "All else fixed, what generally happens to tunneling transmission as barrier width increases?",
        ["It decreases", "It increases to one", "It is unchanged", "It oscillates independently of width"], "a")
    ]
  },
  "05": {
    title: "Chapter 5 assessment",
    items: [
      item("qm-05-spherical", "spherical-harmonics", "5.4", "Spherical harmonics", "slides/chapter-05/spherical-harmonics.html",
        "Which functions describe the angular dependence for central-potential eigenstates?",
        ["Spherical harmonics", "Hermite polynomials", "Plane waves only", "Airy functions only"], "a",
        "Spherical harmonics Yℓm describe the angular part of central-potential states.",
        "Which quantum numbers label a spherical harmonic Yℓm?",
        ["ℓ and m", "n and energy only", "Position and momentum", "Mass and charge"], "a"),
      item("qm-05-radial", "hydrogen-radial-laguerre", "5.5", "Hydrogen radial solution", "slides/chapter-05/hydrogen-atom-radial-solution-and-probability.html",
        "Which polynomial family appears in the hydrogen radial solution?",
        ["Associated Laguerre polynomials", "Hermite polynomials", "Chebyshev polynomials", "Bessel functions only"], "a",
        "Associated Laguerre polynomials appear in the hydrogen radial eigenfunctions.",
        "What factor combines with |Rnl(r)|² to form the radial probability density?",
        ["r²", "1/r²", "r", "A constant only"], "a"),
      item("qm-05-degeneracy", "hydrogen-spectrum-degeneracy", "5.6", "Hydrogen spectrum and degeneracy", "slides/chapter-05/hydrogen-spectrum-and-degeneracy.html",
        "Ignoring fine structure, on which quantum number does the Coulomb hydrogen energy depend?",
        ["The principal quantum number n", "Only m", "Only spin projection", "The azimuthal angle"], "a",
        "For the nonrelativistic Coulomb problem without corrections, energy depends on n.",
        "Why can states with different ℓ share the same hydrogen energy in this model?",
        ["The Coulomb spectrum is degenerate in ℓ", "ℓ is always zero", "The states have different masses", "The radial equation is absent"], "a")
    ]
  },
  "06": {
    title: "Chapter 6 assessment",
    items: [
      item("qm-06-compatible", "angular-momentum-algebra-ladders", "6.3", "Compatible observables L² and Lz", "slides/chapter-06/compatible-observables-l-squared-and-lz.html",
        "Which pair forms a compatible set for angular-momentum states?",
        ["L² and Lz", "Lx and Ly", "Lx and Lz", "Ly and Lz"], "a",
        "L² and one component, conventionally Lz, commute and label simultaneous eigenstates.",
        "Which labels identify the simultaneous eigenstates of L² and Lz?",
        ["ℓ and m", "x and p", "n and time", "Energy and temperature"], "a"),
      item("qm-06-commutator", "angular-momentum-commutators", "6.2", "Angular-momentum commutators", "slides/chapter-06/commutation-relations-and-physical-meaning.html",
        "Which commutator is correct for Cartesian angular-momentum components?",
        ["[Lx,Ly] = iℏLz", "[Lx,Ly] = 0", "[Lx,Ly] = iℏLx", "[Lx,Ly] = ℏ²"], "a",
        "The angular-momentum algebra is cyclic: [Lx,Ly] = iℏLz.",
        "What does the nonzero commutator of Lx and Ly imply?",
        ["They cannot have a complete common eigenbasis", "They are the same operator", "Both always vanish", "Their eigenvalues are complex"], "a"),
      item("qm-06-matrices", "angular-momentum-matrix-representation", "6.5", "Angular-momentum matrix representation", "slides/chapter-06/general-matrix-representation.html",
        "In the Lz basis, which operator is diagonal?",
        ["Lz", "Lx", "Ly", "L+ + L− only"], "a",
        "The basis vectors are eigenvectors of Lz, so its matrix is diagonal.",
        "What do ladder operators change when acting on |ℓ,m⟩?",
        ["The magnetic quantum number m", "The value of ℏ", "The particle mass", "The spatial dimension"], "a")
    ]
  },
  "07": {
    title: "Chapter 7 assessment",
    items: [
      item("qm-07-addition", "addition-angular-momenta-roadmap", "7.1", "Addition of angular momenta", "slides/chapter-07/addition-of-angular-momenta-chapter-roadmap.html",
        "What is combined in the coupling problem developed in this chapter?",
        ["Angular momenta", "Electric charges", "Radial wave functions only", "Thermodynamic potentials"], "a",
        "The chapter constructs total angular momentum from two or more angular momenta.",
        "For two angular momenta J1 and J2, how is the total operator defined?",
        ["J = J1 + J2", "J = J1 − J2 only", "J = J1J2", "J = 0 for every state"], "a"),
      item("qm-07-clebsch", "clebsch-gordan-coefficients", "7.6", "Clebsch–Gordan coefficients", "slides/chapter-07/local-basis-vs-coupled-basis-clebsch-gordan-coefficients.html",
        "What do Clebsch–Gordan coefficients connect?",
        ["Uncoupled and coupled angular-momentum bases", "Position and time coordinates", "Classical and relativistic masses", "Two radial potentials"], "a",
        "Clebsch–Gordan coefficients are the change-of-basis amplitudes between uncoupled and coupled bases.",
        "What normalization property does a coupled basis state inherit from a unitary basis transformation?",
        ["The squared coefficient magnitudes sum to one", "Every coefficient equals one", "All coefficients vanish", "Only one basis vector is allowed"], "a"),
      item("qm-07-coupled", "coupled-basis-construction", "7.4", "Vectors in the coupled basis", "slides/chapter-07/vectors-in-the-coupled-basis.html",
        "For fixed j1 and j2, which total-j values are allowed?",
        ["|j1−j2| through j1+j2 in integer steps", "Only j1+j2", "Only |j1−j2|", "Every nonnegative real number"], "a",
        "Angular-momentum addition allows j from |j1−j2| to j1+j2 in unit steps.",
        "For j1 = 1/2 and j2 = 1/2, which total-j values occur?",
        ["0 and 1", "Only 1/2", "1 and 2", "Only 0"], "a")
    ]
  }
};

function choices(values) {
  return { a: values[0], b: values[1], c: values[2], d: values[3] };
}

function item(id, conceptId, reviewItem, reviewTitle, reviewPath, prompt, optionValues, correct, explanation, retryPrompt, retryOptions, retryCorrect) {
  const sourceId = `qm-${String(reviewItem).split(".")[0].padStart(2, "0")}-${reviewItem}`;
  return {
    questionId: id,
    conceptId,
    reviewItem,
    reviewTitle,
    reviewPath,
    sourceId,
    prompt,
    options: choices(optionValues),
    correct,
    explanation,
    representation: "conceptual_recognition",
    hintLadder: [
      `Orienting cue: review ${reviewTitle}.`,
      "Strategic cue: identify the physical principle before comparing the options.",
      `Next-step cue: eliminate options that contradict the definitions and limits in item ${reviewItem}.`,
      `Worked support: ${explanation}`
    ],
    retry: {
      questionId: `${id}-transfer`,
      prompt: retryPrompt,
      options: choices(retryOptions),
      correct: retryCorrect,
      explanation,
      representation: "relation_transfer"
    }
  };
}

function cloneQuestion(base, useRetry = false) {
  if (!useRetry) return { ...base, options: { ...base.options }, hintLadder: [...base.hintLadder] };
  return {
    ...base,
    ...base.retry,
    options: { ...base.retry.options },
    hintLadder: [...base.hintLadder],
    retryOf: base.questionId
  };
}

export function getQuiz(chapterId, { retryConceptIds = [] } = {}) {
  const id = String(chapterId || "").padStart(2, "0");
  const chapter = CHAPTERS[id];
  if (!chapter) return null;
  const retrySet = new Set(retryConceptIds);
  const items = retrySet.size ? chapter.items.filter(entry => retrySet.has(entry.conceptId)) : chapter.items;
  return {
    quizKey: `qm-${id}-${retrySet.size ? "retry" : "assessment"}-v2`,
    itemSetVersion: "qm-reviewed-question-set-2026-09-26.1",
    chapterId: id,
    title: retrySet.size ? `Chapter ${Number(id)} focused retry` : chapter.title,
    mode: retrySet.size ? "retry" : "assessment",
    questions: items.map(entry => cloneQuestion(entry, retrySet.size > 0))
  };
}

export function questionById(questionId) {
  for (const chapter of Object.values(CHAPTERS)) {
    for (const entry of chapter.items) {
      if (entry.questionId === questionId) return cloneQuestion(entry, false);
      if (entry.retry.questionId === questionId) return cloneQuestion(entry, true);
    }
  }
  return null;
}

export function dailyQuestionPool() {
  return Object.entries(CHAPTERS).flatMap(([chapterId, chapter]) => chapter.items.flatMap(entry => [
    { ...cloneQuestion(entry, false), chapterId },
    { ...cloneQuestion(entry, true), chapterId }
  ]));
}

export function publicQuestion(question) {
  const { correct, explanation, hintLadder, retry, ...safe } = question;
  return { ...safe, hintCount: Array.isArray(hintLadder) ? hintLadder.length : 0 };
}

export function publicQuiz(quiz) {
  return { ...quiz, questions: quiz.questions.map(publicQuestion) };
}

export function hintForQuestion(questionId, level) {
  const question = questionById(questionId);
  const index = Math.max(0, Math.min(3, Number(level || 1) - 1));
  return question ? { level: index + 1, text: question.hintLadder[index], solutionRevealed: index === 3 } : null;
}

export function grade(quiz, answers) {
  const by = new Map((answers || []).map(entry => [entry.questionId, String(entry.choice || "").toLowerCase()]));
  const confidence = new Map((answers || []).map(entry => [entry.questionId, ["low", "medium", "high"].includes(entry.confidence) ? entry.confidence : "unknown"]));
  const feedback = quiz.questions.map(question => ({
    questionId: question.questionId,
    conceptId: question.conceptId,
    correct: by.get(question.questionId) === question.correct,
    confidence: confidence.get(question.questionId) || "unknown",
    explanation: question.explanation,
    reviewItem: question.reviewItem,
    reviewTitle: question.reviewTitle,
    reviewPath: question.reviewPath,
    sourceId: question.sourceId,
    representation: question.representation,
    hintLadder: question.hintLadder
  }));
  return {
    score: Math.round(100 * feedback.filter(entry => entry.correct).length / feedback.length),
    correctCount: feedback.filter(entry => entry.correct).length,
    questionCount: feedback.length,
    feedback
  };
}

export function catalogContractRows() {
  return Object.entries(CHAPTERS).flatMap(([chapterId, chapter]) => chapter.items.flatMap(entry => [
    { questionId: entry.questionId, chapterId, conceptId: entry.conceptId, sourceId: entry.sourceId, contentId: entry.reviewPath, representation: entry.representation, mode: "assessment" },
    { questionId: entry.retry.questionId, chapterId, conceptId: entry.conceptId, sourceId: entry.sourceId, contentId: entry.reviewPath, representation: entry.retry.representation, mode: "retry" }
  ]));
}
