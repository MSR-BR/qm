function normalizeChapterId(value) {
  return String(value || "").replace(/\D/g, "").padStart(2, "0").slice(-2);
}

export function normalizeLearningPath(value) {
  return String(value || "").split(/[?#]/)[0].replace(/^\/+/, "");
}

export function rewardEventKey(row) {
  return [
    "section",
    normalizeChapterId(row.chapter_id ?? row.chapterId),
    String(row.item_id ?? row.itemId ?? "").trim(),
    normalizeLearningPath(row.page_path ?? row.pagePath)
  ].join(":");
}

export function buildEligibleSectionSet(chapters) {
  const eligible = new Set();
  for (const chapter of chapters || []) {
    const chapterId = normalizeChapterId(chapter.chapterId);
    for (const topic of chapter.topics || []) {
      eligible.add([
        chapterId,
        String(topic.id || "").trim(),
        normalizeLearningPath(topic.url)
      ].join("|"));
    }
  }
  return eligible;
}

export function planRewardReconciliation({
  progressRows = [],
  eventRows = [],
  eligibleSections = new Set()
}) {
  const existing = new Set(eventRows.map(function (row) {
    return String(row.user_id || "") + "|" + String(row.idempotency_key || "");
  }));
  const planned = new Set();
  const candidates = [];
  const skipped = {
    notCompleted: 0,
    ineligible: 0,
    existing: 0,
    duplicateProgress: 0,
    malformed: 0
  };

  for (const row of progressRows) {
    const userId = String(row?.user_id || "").trim();
    const chapterId = normalizeChapterId(row?.chapter_id);
    const itemId = String(row?.item_id || "").trim();
    const pagePath = normalizeLearningPath(row?.page_path);

    if (row?.status !== "completed") {
      skipped.notCompleted += 1;
      continue;
    }
    if (!userId || !itemId || !pagePath) {
      skipped.malformed += 1;
      continue;
    }

    const eligibleKey = [chapterId, itemId, pagePath].join("|");
    if (!eligibleSections.has(eligibleKey)) {
      skipped.ineligible += 1;
      continue;
    }

    const idempotencyKey = rewardEventKey({ chapter_id: chapterId, item_id: itemId, page_path: pagePath });
    const semanticKey = userId + "|" + idempotencyKey;
    if (existing.has(semanticKey)) {
      skipped.existing += 1;
      continue;
    }
    if (planned.has(semanticKey)) {
      skipped.duplicateProgress += 1;
      continue;
    }

    planned.add(semanticKey);
    candidates.push({
      userId,
      chapterId,
      itemId,
      pagePath,
      idempotencyKey
    });
  }

  return {
    candidates,
    skipped,
    scannedProgress: progressRows.length,
    scannedEvents: eventRows.length
  };
}
