# Impact and rollback

## Expected impact

- No schema columns or rows change.
- Existing RLS policies remain unchanged.
- Implicit API-role privileges are replaced by the reviewed explicit matrix.
- Browser behavior is unchanged; the unused service-role simulator grant is removed.
- Server analytics inserts gain the missing identity-sequence privilege.

## Rollback

Do not use broad `GRANT ... ON ALL TABLES` rollback. If an authorized release reveals a missing operation, identify the exact failing consumer and add a forward migration with only that operation. To reverse C27 as a whole, restore the immediately preceding per-object privilege matrix from a reviewed migration; do not restore automatic defaults or disable RLS.
