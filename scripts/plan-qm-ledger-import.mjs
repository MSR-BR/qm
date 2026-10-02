import { readFileSync } from "node:fs";
import { planLedgerImport } from "../lib/qm-ledger-reconciliation.mjs";

if (process.argv.length !== 3 || process.argv[2].startsWith("--")) {
  console.error("Usage: node scripts/plan-qm-ledger-import.mjs /path/to/complete-scoped-snapshot.json (dry-run only)");
  process.exitCode = 1;
} else {
  try {
    const plan = planLedgerImport(JSON.parse(readFileSync(process.argv[2],"utf8")));
    console.log(JSON.stringify(plan,null,2));
    if (plan.counts.blocked) process.exitCode = 2;
  } catch {
    console.error("Invalid or incomplete snapshot. No changes made.");
    process.exitCode = 1;
  }
}
