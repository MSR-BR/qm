(() => {
  const EPS = 1e-10;
  const routeNames = {
    sequential: "Sequential: 1-2, then +3, then +4, then +5",
    pairPair: "Pair route: 1-2 and 3-4, then result +5",
    pairTail: "Mixed route: 1-2, then +3; 4-5 separately; then final"
  };

  const $ = (id) => document.getElementById(id);
  const html = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);

  function formatHalf(twoValue) {
    const sign = twoValue < 0 ? "-" : "";
    const n = Math.abs(twoValue);
    if (n === 0) return "0";
    if (n % 2 === 0) return `${sign}${n / 2}`;
    return `${sign}${n}/2`;
  }

  function latexHalf(twoValue) {
    const sign = twoValue < 0 ? "-" : "";
    const n = Math.abs(twoValue);
    if (n === 0) return "0";
    if (n % 2 === 0) return `${sign}${n / 2}`;
    return `${sign}\\frac{${n}}{2}`;
  }

  function plusLabel(twoValue) {
    if (Math.abs(twoValue) === 1) return twoValue > 0 ? "+" : "-";
    return formatHalf(twoValue);
  }

  function latexPlusLabel(twoValue) {
    if (Math.abs(twoValue) === 1) return twoValue > 0 ? "+" : "-";
    return latexHalf(twoValue);
  }

  function rangeJ2(a2, b2) {
    const out = [];
    for (let value = a2 + b2; value >= Math.abs(a2 - b2); value -= 2) out.push(value);
    return out;
  }

  function mValues2(j2) {
    const out = [];
    for (let value = j2; value >= -j2; value -= 2) out.push(value);
    return out;
  }

  function leaf(id) {
    return { type: "leaf", id };
  }

  function combine(left, right, id, label) {
    return { type: "combine", id, label, left, right };
  }

  function rawRouteTree(route) {
    if (route === "pairPair") {
      return combine(
        combine(combine(leaf(1), leaf(2), "l12", "l_{12}"), combine(leaf(3), leaf(4), "l34", "l_{34}"), "l1234", "l_{1234}"),
        leaf(5),
        "l",
        "l"
      );
    }
    if (route === "pairTail") {
      return combine(
        combine(combine(leaf(1), leaf(2), "l12", "l_{12}"), leaf(3), "l13", "l_{13}"),
        combine(leaf(4), leaf(5), "l45", "l_{45}"),
        "l",
        "l"
      );
    }
    return combine(
      combine(combine(combine(leaf(1), leaf(2), "l12", "l_{12}"), leaf(3), "l13", "l_{13}"), leaf(4), "l14", "l_{14}"),
      leaf(5),
      "l",
      "l"
    );
  }

  function pruneTree(node, activeLeaves) {
    if (!node) return null;
    if (node.type === "leaf") return activeLeaves.has(node.id) ? node : null;
    const left = pruneTree(node.left, activeLeaves);
    const right = pruneTree(node.right, activeLeaves);
    if (left && right) return { ...node, left, right };
    return left || right;
  }

  function treeFor(route, activeLeaves) {
    const tree = pruneTree(rawRouteTree(route), activeLeaves);
    if (!tree || tree.type === "leaf") return tree;
    return { ...tree, id: "l", label: "l" };
  }

  function enumerateChannels(node, leafValues) {
    if (!node) return [];
    if (node.type === "leaf") {
      return [{ finalJ2: leafValues[node.id], labels: [], leafIds: [node.id] }];
    }
    const left = enumerateChannels(node.left, leafValues);
    const right = enumerateChannels(node.right, leafValues);
    const out = [];
    left.forEach((leftChannel) => {
      right.forEach((rightChannel) => {
        rangeJ2(leftChannel.finalJ2, rightChannel.finalJ2).forEach((j2) => {
          out.push({
            finalJ2: j2,
            labels: [...leftChannel.labels, ...rightChannel.labels, { id: node.id, label: node.label, j2 }],
            leafIds: [...leftChannel.leafIds, ...rightChannel.leafIds]
          });
        });
      });
    });
    return out;
  }

  function aggregateFinals(channels) {
    const grouped = new Map();
    channels.forEach((channel) => {
      const current = grouped.get(channel.finalJ2) || { j2: channel.finalJ2, multiplicity: 0, states: 0 };
      current.multiplicity += 1;
      current.states += channel.finalJ2 + 1;
      grouped.set(channel.finalJ2, current);
    });
    return [...grouped.values()].sort((a, b) => b.j2 - a.j2);
  }

  function dimensionFromLeaves(leafValues) {
    return Object.values(leafValues).reduce((product, j2) => product * (j2 + 1), 1);
  }

  function labelChannel(channel, includeFinal = true) {
    const labels = channel.labels
      .filter((entry) => includeFinal || entry.id !== "l")
      .map((entry) => `\\(${entry.label}=${latexHalf(entry.j2)}\\)`);
    return labels.join(", ") || `\\(l=${latexHalf(channel.finalJ2)}\\)`;
  }

  function channelMap(channel) {
    return channel.labels.reduce((acc, entry) => {
      acc[entry.id] = entry.j2;
      return acc;
    }, {});
  }

  function activeLeavesFromValues(values) {
    const active = new Set();
    values.forEach((j2, index) => {
      if (j2 > 0) active.add(index + 1);
    });
    return active;
  }

  function activeLeafIdsFromValues(values) {
    return values
      .map((j2, index) => (j2 > 0 ? index + 1 : 0))
      .filter(Boolean);
  }

  function pairOptionsFromActive(activeIds) {
    const out = [];
    for (let i = 0; i < activeIds.length; i += 1) {
      for (let j = i + 1; j < activeIds.length; j += 1) {
        out.push([activeIds[i], activeIds[j]]);
      }
    }
    return out;
  }

  function pairValue(pair) {
    return pair.slice().sort((a, b) => a - b).join("-");
  }

  function parsePairValue(value) {
    return String(value || "").split("-").map(Number).filter(Boolean);
  }

  function pairIsValid(pair, activeIds) {
    return pair.length === 2 && pair.every((id) => activeIds.includes(id)) && pair[0] !== pair[1];
  }

  function intermediateLabel(ids) {
    return `l_{${ids.join("")}}`;
  }

  function buildSmartCouplingTree(activeIds, mode, firstPairValue, nextLeafValue) {
    if (activeIds.length === 0) return null;
    if (activeIds.length === 1) return leaf(activeIds[0]);

    const pairs = pairOptionsFromActive(activeIds);
    let firstPair = parsePairValue(firstPairValue);
    if (!pairIsValid(firstPair, activeIds)) firstPair = pairs[0] || activeIds.slice(0, 2);
    firstPair = firstPair.slice().sort((a, b) => a - b);

    const remaining = activeIds.filter((id) => !firstPair.includes(id));
    const firstNode = combine(leaf(firstPair[0]), leaf(firstPair[1]), intermediateLabel(firstPair), intermediateLabel(firstPair));

    if (remaining.length === 0) return combine(leaf(firstPair[0]), leaf(firstPair[1]), "l", "l");

    if (remaining.length === 1) {
      return combine(firstNode, leaf(remaining[0]), "l", "l");
    }

    const resolvedMode = mode === "auto" ? "pairwise" : mode;
    if (remaining.length === 2 && resolvedMode === "pairwise") {
      const secondPair = remaining.slice().sort((a, b) => a - b);
      const secondNode = combine(leaf(secondPair[0]), leaf(secondPair[1]), intermediateLabel(secondPair), intermediateLabel(secondPair));
      return combine(firstNode, secondNode, "l", "l");
    }

    let nextLeaf = Number(nextLeafValue);
    if (!remaining.includes(nextLeaf)) nextLeaf = remaining[0];
    const lastLeaf = remaining.find((id) => id !== nextLeaf);
    const secondIds = [...firstPair, nextLeaf].sort((a, b) => a - b);
    const secondNode = combine(firstNode, leaf(nextLeaf), intermediateLabel(secondIds), intermediateLabel(secondIds));
    return lastLeaf ? combine(secondNode, leaf(lastLeaf), "l", "l") : secondNode;
  }

  function updateMath(root = document.body) {
    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([root]).catch(() => {});
    }
  }

  function optionHtml(values, selected) {
    return values.map((value) => `<option value="${value}"${value === selected ? " selected" : ""}>${formatHalf(value)}</option>`).join("");
  }

  function maybePlural(value, singular, plural = `${singular}s`) {
    return `${value} ${value === 1 ? singular : plural}`;
  }

  function renderCoupledStatesSimulator() {
    const root = document.querySelector("[data-coupled-states-calculator]");
    if (!root) return;
    const values = [1, 1, 0, 0];
    const spinOptions = [0, 1, 2, 3, 4, 5];

    function readInputs() {
      values.forEach((_, index) => {
        values[index] = Number($(`l${index + 1}`).value);
      });
      const active = activeLeavesFromValues(values);
      const activeIds = activeLeafIdsFromValues(values);
      const leafValues = {};
      values.forEach((j2, index) => { if (j2 > 0) leafValues[index + 1] = j2; });
      return {
        active,
        activeIds,
        leafValues,
        mode: $("couplingMode").value,
        firstPair: $("firstPair").value,
        nextLeaf: $("nextMomentum").value
      };
    }

    function renderTreeText(tree) {
      if (!tree) return "No active angular momentum.";
      if (tree.type === "leaf") return `l_${tree.id}`;
      return `(${renderTreeText(tree.left)} + ${renderTreeText(tree.right)}) → ${tree.label.replace(/[{}\\]/g, "")}`;
    }

    function updateBuilderControls() {
      const activeIds = activeLeafIdsFromValues(values);
      const pairs = pairOptionsFromActive(activeIds);
      const currentPair = $("firstPair").value;
      $("firstPair").innerHTML = pairs.length
        ? pairs.map((pair) => {
          const value = pairValue(pair);
          return `<option value="${value}"${value === currentPair ? " selected" : ""}>Add l${pair[0]} with l${pair[1]}</option>`;
        }).join("")
        : `<option value="">Choose at least two active momenta</option>`;
      if (pairs.length && !pairs.some((pair) => pairValue(pair) === $("firstPair").value)) {
        $("firstPair").value = pairValue(pairs[0]);
      }

      const firstPair = parsePairValue($("firstPair").value);
      const remaining = activeIds.filter((id) => !firstPair.includes(id));
      const currentNext = $("nextMomentum").value;
      $("nextMomentum").innerHTML = remaining.length
        ? remaining.map((id) => `<option value="${id}"${String(id) === currentNext ? " selected" : ""}>Add l${id} next</option>`).join("")
        : `<option value="">No remaining momentum</option>`;
      if (remaining.length && !remaining.some((id) => String(id) === $("nextMomentum").value)) {
        $("nextMomentum").value = String(remaining[0]);
      }

      const mode = $("couplingMode").value;
      const pairwiseAllowed = activeIds.length === 4;
      $("nextMomentum").disabled = activeIds.length < 4 || mode === "pairwise" || mode === "auto";
      $("firstPair").disabled = activeIds.length < 2;
      $("couplingMode").disabled = activeIds.length < 3;
      $("builderHint").textContent = activeIds.length < 2
        ? "Activate at least two angular momenta to build a coupled basis."
        : activeIds.length === 2
          ? "With two active angular momenta, the sum is direct."
          : pairwiseAllowed
            ? "Choose the first pair. Smart mode couples the remaining two as the second pair; sequential mode adds them one at a time."
            : "Choose the first pair; the remaining angular momentum is added automatically.";
    }

    function render() {
      values.forEach((_, index) => {
        values[index] = Number($(`l${index + 1}`).value);
      });
      updateBuilderControls();
      const { active, activeIds, leafValues, mode, firstPair, nextLeaf } = readInputs();
      const tree = buildSmartCouplingTree(activeIds, mode, firstPair, nextLeaf);
      const channels = enumerateChannels(tree, leafValues);
      const finals = aggregateFinals(channels);
      const productDimension = Object.keys(leafValues).length ? dimensionFromLeaves(leafValues) : 0;
      const totalStates = finals.reduce((sum, entry) => sum + entry.states, 0);
      $("activeCount").textContent = `${active.size}`;
      $("hilbertDimension").textContent = `${productDimension}`;
      $("multipletCount").textContent = `${finals.reduce((sum, entry) => sum + entry.multiplicity, 0)}`;
      $("stateCheck").textContent = `${totalStates}`;
      $("routeTitle").textContent = activeIds.length < 2
        ? "Activate angular momenta to build the route"
        : $("couplingMode").selectedOptions[0]?.textContent || "Smart coupling route";
      $("routeTree").textContent = renderTreeText(tree);
      $("routeWarning").textContent = active.size < 2
        ? "Choose at least two nonzero angular momenta to see a nontrivial addition."
        : `Dimension check: Σ_l g_l(2l+1) = ${totalStates}, matching Π_i(2l_i+1) = ${productDimension}.`;
      $("finalTable").innerHTML = finals.length
        ? finals.map((entry) => `<tr><td>\\(${latexHalf(entry.j2)}\\)</td><td>${entry.multiplicity}</td><td>${entry.j2 + 1}</td><td>${entry.states}</td></tr>`).join("")
        : `<tr><td colspan="4">Choose at least one active angular momentum.</td></tr>`;
      $("channelTable").innerHTML = channels.length
        ? channels.map((channel, index) => `<tr><td>${index + 1}</td><td>${labelChannel(channel)}</td><td>\\(${latexHalf(channel.finalJ2)}\\)</td><td>${channel.finalJ2 + 1}</td></tr>`).join("")
        : `<tr><td colspan="4">No channels to list.</td></tr>`;
      updateMath(root);
    }

    $("spinInputs").innerHTML = values.map((value, index) => `
      <div class="control-group">
        <div class="control-row"><label class="control-label" for="l${index + 1}">\\(l_${index + 1}\\)</label></div>
        <select id="l${index + 1}">${optionHtml(spinOptions, value)}</select>
      </div>
    `).join("");
    values.forEach((_, index) => $(`l${index + 1}`).addEventListener("change", render));
    ["couplingMode", "firstPair", "nextMomentum"].forEach((id) => $(id).addEventListener("change", render));
    render();
  }

  const cgCache = new Map();

  function twoBodyKey(j1, j2) {
    return `${j1},${j2}`;
  }

  function basis2(j1, j2) {
    const out = [];
    mValues2(j1).forEach((m1) => {
      mValues2(j2).forEach((m2) => out.push({ m1, m2, key: `${m1},${m2}` }));
    });
    return out;
  }

  function vectorNorm(vector) {
    return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  }

  function normalize(vector) {
    const norm = vectorNorm(vector);
    return norm < EPS ? vector.slice() : vector.map((value) => value / norm);
  }

  function dot(a, b) {
    return a.reduce((sum, value, index) => sum + value * b[index], 0);
  }

  function subtractProjection(vector, onto) {
    const coefficient = dot(vector, onto);
    return vector.map((value, index) => value - coefficient * onto[index]);
  }

  function phaseHighest(vector) {
    const first = vector.find((value) => Math.abs(value) > EPS);
    return first < 0 ? vector.map((value) => -value) : vector;
  }

  function loweringAmplitude(j2, m2) {
    const j = j2 / 2;
    const m = m2 / 2;
    return Math.sqrt(Math.max(0, j * (j + 1) - m * (m - 1)));
  }

  function buildTwoBodyCouplings(j1, j2) {
    const key = twoBodyKey(j1, j2);
    if (cgCache.has(key)) return cgCache.get(key);
    const basis = basis2(j1, j2);
    const index = new Map(basis.map((entry, i) => [entry.key, i]));
    const vectors = new Map();
    const knownByM = new Map();

    function addKnown(m2, vector) {
      const list = knownByM.get(m2) || [];
      list.push(vector);
      knownByM.set(m2, list);
    }

    function applyLower(vector) {
      const out = Array.from({ length: basis.length }, () => 0);
      basis.forEach((entry, i) => {
        const coefficient = vector[i];
        if (Math.abs(coefficient) < EPS) return;
        if (entry.m1 > -j1) {
          const lowered = `${entry.m1 - 2},${entry.m2}`;
          out[index.get(lowered)] += coefficient * loweringAmplitude(j1, entry.m1);
        }
        if (entry.m2 > -j2) {
          const lowered = `${entry.m1},${entry.m2 - 2}`;
          out[index.get(lowered)] += coefficient * loweringAmplitude(j2, entry.m2);
        }
      });
      return out;
    }

    rangeJ2(j1, j2).forEach((J) => {
      const M = J;
      const candidates = basis
        .map((entry, i) => ({ entry, i }))
        .filter(({ entry }) => entry.m1 + entry.m2 === M);
      let highest = null;
      candidates.some(({ i }) => {
        let vector = Array.from({ length: basis.length }, () => 0);
        vector[i] = 1;
        (knownByM.get(M) || []).forEach((known) => { vector = subtractProjection(vector, known); });
        if (vectorNorm(vector) > EPS) {
          highest = phaseHighest(normalize(vector));
          return true;
        }
        return false;
      });
      if (!highest) return;
      vectors.set(`${J},${M}`, highest);
      addKnown(M, highest);
      let previous = highest;
      for (let nextM = J - 2; nextM >= -J; nextM -= 2) {
        const factor = Math.sqrt((J / 2) * (J / 2 + 1) - ((nextM + 2) / 2) * (nextM / 2));
        const lowered = applyLower(previous).map((value) => value / factor);
        vectors.set(`${J},${nextM}`, lowered);
        addKnown(nextM, lowered);
        previous = lowered;
      }
    });

    const result = { basis, vectors };
    cgCache.set(key, result);
    return result;
  }

  function cg2(j1, j2, J, m1, m2, M) {
    if (m1 + m2 !== M) return 0;
    const data = buildTwoBodyCouplings(j1, j2);
    const vector = data.vectors.get(`${J},${M}`);
    if (!vector) return 0;
    const index = data.basis.findIndex((entry) => entry.m1 === m1 && entry.m2 === m2);
    return index >= 0 ? vector[index] : 0;
  }

  function nodeJ2(node, leafValues, map) {
    if (node.type === "leaf") return leafValues[node.id];
    return map[node.id];
  }

  function validM(j2, m2) {
    return Math.abs(m2) <= j2 && (j2 - m2) % 2 === 0;
  }

  function mergeExpansion(target, keyArray, coefficient) {
    if (Math.abs(coefficient) < EPS) return;
    const key = keyArray.join(",");
    target.set(key, (target.get(key) || 0) + coefficient);
  }

  function expandNode(node, M, leafValues, map) {
    if (node.type === "leaf") {
      if (!validM(leafValues[node.id], M)) return new Map();
      return new Map([[String(M), 1]]);
    }
    const leftJ = nodeJ2(node.left, leafValues, map);
    const rightJ = nodeJ2(node.right, leafValues, map);
    const J = nodeJ2(node, leafValues, map);
    const out = new Map();
    mValues2(leftJ).forEach((leftM) => {
      const rightM = M - leftM;
      if (!validM(rightJ, rightM)) return;
      const coefficient = cg2(leftJ, rightJ, J, leftM, rightM, M);
      if (Math.abs(coefficient) < EPS) return;
      const leftExpansion = expandNode(node.left, leftM, leafValues, map);
      const rightExpansion = expandNode(node.right, rightM, leafValues, map);
      leftExpansion.forEach((leftCoeff, leftKey) => {
        rightExpansion.forEach((rightCoeff, rightKey) => {
          mergeExpansion(out, [...leftKey.split(",").map(Number), ...rightKey.split(",").map(Number)], coefficient * leftCoeff * rightCoeff);
        });
      });
    });
    return out;
  }

  function rationalApprox(value, maxDen = 72) {
    let best = { num: Math.round(value), den: 1, error: Math.abs(value - Math.round(value)) };
    for (let den = 1; den <= maxDen; den += 1) {
      const num = Math.round(value * den);
      const error = Math.abs(value - num / den);
      if (error < best.error) best = { num, den, error };
    }
    return best;
  }

  function coefficientParts(value) {
    if (Math.abs(value) < EPS) return { text: "0", latex: "0", prefix: "0" };
    const sign = value < 0 ? "-" : "";
    const squared = value * value;
    const approx = rationalApprox(squared);
    if (approx.error < 1e-8) {
      if (approx.num === approx.den) return { text: `${sign}1`, latex: `${sign}1`, prefix: sign ? "-" : "" };
      if (approx.num === 1) {
        return {
          text: `${sign}1/√${approx.den}`,
          latex: `${sign}\\frac{1}{\\sqrt{${approx.den}}}`,
          prefix: `${sign}\\frac{1}{\\sqrt{${approx.den}}}`
        };
      }
      return {
        text: `${sign}√(${approx.num}/${approx.den})`,
        latex: `${sign}\\sqrt{\\frac{${approx.num}}{${approx.den}}}`,
        prefix: `${sign}\\sqrt{\\frac{${approx.num}}{${approx.den}}}`
      };
    }
    return { text: value.toFixed(6).replace(/\.?0+$/, ""), latex: value.toFixed(6).replace(/\.?0+$/, ""), prefix: value.toFixed(6).replace(/\.?0+$/, "") };
  }

  function ketText(key) {
    return `|${key.split(",").map((value) => plusLabel(Number(value))).join(", ")}⟩`;
  }

  function ketLatex(key) {
    return `|${key.split(",").map((value) => latexPlusLabel(Number(value))).join(",")}\\rangle`;
  }

  function termLatex(key, coefficient) {
    const parts = coefficientParts(coefficient);
    if (parts.prefix === "") return ketLatex(key);
    if (parts.prefix === "-") return `-${ketLatex(key)}`;
    return `${parts.prefix}${ketLatex(key)}`;
  }

  function renderClebschGordanSimulator() {
    const root = document.querySelector("[data-clebsch-gordan-calculator]");
    if (!root) return;
    let currentChannels = [];

    function leafValues() {
      const n = Number($("spinCount").value);
      const s2 = Number($("spinValue").value);
      const values = {};
      for (let i = 1; i <= n; i += 1) values[i] = s2;
      return values;
    }

    function refreshChannelOptions() {
      const n = Number($("spinCount").value);
      const values = leafValues();
      const active = new Set(Array.from({ length: n }, (_, i) => i + 1));
      const tree = treeFor($("cgRoute").value, active);
      currentChannels = enumerateChannels(tree, values);
      $("channelSelect").innerHTML = currentChannels.map((channel, index) => `<option value="${index}">${html(labelChannel(channel, true).replace(/\\[()]/g, ""))}</option>`).join("");
      refreshMOptions();
    }

    function refreshMOptions() {
      const channel = currentChannels[Number($("channelSelect").value)] || currentChannels[0];
      const values = channel ? mValues2(channel.finalJ2) : [0];
      const selected = Number($("mSelect").value);
      $("mSelect").innerHTML = values.map((m2) => `<option value="${m2}"${m2 === selected ? " selected" : ""}>${formatHalf(m2)}</option>`).join("");
    }

    function render() {
      if (!currentChannels.length) refreshChannelOptions();
      const values = leafValues();
      const n = Number($("spinCount").value);
      const tree = treeFor($("cgRoute").value, new Set(Array.from({ length: n }, (_, i) => i + 1)));
      const channel = currentChannels[Number($("channelSelect").value)] || currentChannels[0];
      const map = channelMap(channel);
      const M = Number($("mSelect").value);
      const expansion = [...expandNode(tree, M, values, map).entries()]
        .filter(([, coefficient]) => Math.abs(coefficient) > 1e-9)
        .sort((left, right) => left[0].localeCompare(right[0], undefined, { numeric: true }));
      const dimension = dimensionFromLeaves(values);
      $("cgDimension").textContent = `${dimension}`;
      $("cgTerms").textContent = `${expansion.length}`;
      $("cgFinal").textContent = `l=${formatHalf(channel.finalJ2)}, m=${formatHalf(M)}`;
      $("cgRouteTitle").textContent = routeNames[$("cgRoute").value] || routeNames.sequential;
      $("cgChannelLabel").innerHTML = labelChannel(channel);
      $("coefficientTable").innerHTML = expansion.map(([key, coefficient]) => {
        const parts = coefficientParts(coefficient);
        return `<tr><td>\\(${ketLatex(key)}\\)</td><td>${html(parts.text)}</td><td>${coefficient.toFixed(8)}</td></tr>`;
      }).join("");
      const terms = expansion.slice(0, 42).map(([key, coefficient], index) => {
        const term = termLatex(key, coefficient);
        if (index === 0) return term;
        return coefficient < 0 ? ` ${term}` : ` + ${term}`;
      }).join("");
      const ellipsis = expansion.length > 42 ? " + \\cdots" : "";
      $("expansionFormula").innerHTML = `\\[|l,m\\rangle=${terms}${ellipsis}\\]`;
      updateMath(root);
    }

    ["spinCount", "spinValue", "cgRoute"].forEach((id) => $(id).addEventListener("change", () => {
      refreshChannelOptions();
      render();
    }));
    $("channelSelect").addEventListener("change", () => {
      refreshMOptions();
      render();
    });
    $("mSelect").addEventListener("change", render);
    refreshChannelOptions();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      renderCoupledStatesSimulator();
      renderClebschGordanSimulator();
    });
  } else {
    renderCoupledStatesSimulator();
    renderClebschGordanSimulator();
  }
})();
