# Model routing record

## C20 execution

- Task class: governance and repository documentation.
- Requested routing constraint: use the GPT/Codex route indicated by the active Pó Mágico reference.
- Runtime used: GPT-based Codex runtime. The environment does not expose a more specific model identifier to this Change record.
- Reasoning setting: inherited runtime setting; exact tier not exposed.
- External model/provider calls: none.
- Fallback/escalation: not needed; file inspection and deterministic documentation checks completed in one pass.
- Checkpoint: repository files under `.specs/` and `CODEX_CONTEXT.md`.

## Future routing rule

1. Use the available GPT/Codex route appropriate to the task.
2. Start with the lowest reasoning level that can safely execute the bounded subtask; use higher reasoning for cross-cutting architecture, security, data migration, or editorial-contract work.
3. Escalate after two non-improving validation passes, a repeated failure, or a correction cycle.
4. Change one diagnosed cause at a time and resume from validated checkpoints.
5. Record the actual route, reasoning evidence, fallback cause, and gate result; never infer unavailable runtime metadata.
6. For technical translation work comparable to the Pó Mágico Titular evidence, prefer the documented Sol Ultra route only if that exact route is available and actually selected.
