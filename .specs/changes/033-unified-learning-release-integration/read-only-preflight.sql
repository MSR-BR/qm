-- Run only after confirming QUANTUM project plqiofznjlbpfufigpcp.
-- Metadata only; no learner rows, secrets, mutation or executable history SQL.
begin read only;
select version, name, cardinality(statements) as statement_count,
       md5(array_to_string(statements,E'\n')) as recorded_sql_md5
from supabase_migrations.schema_migrations order by version;
select version() as database_version;
select extname,extversion from pg_extension
where extname in ('pgcrypto','ltree','btree_gist');
select to_regprocedure('public.rls_auto_enable()') is not null as managed_rls_helper_exists;
select n.nspname as schema,c.relname as object,c.relrowsecurity as rls,c.relforcerowsecurity as force_rls
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname in ('public','private') and c.relkind='r' and c.relname like 'qm_%'
order by 1,2;
select n.nspname as schema,p.proname,pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef as security_definer,p.proconfig,
       has_function_privilege('anon',p.oid,'execute') as anon_execute,
       has_function_privilege('authenticated',p.oid,'execute') as authenticated_execute,
       has_function_privilege('service_role',p.oid,'execute') as service_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname in ('public','private') and p.proname like '%qm_%'
order by 1,2,3;
select schemaname,tablename,policyname,roles,cmd,qual,with_check
from pg_policies where schemaname in ('public','private') and tablename like 'qm_%'
order by 1,2,3;
select table_schema,table_name,grantee,privilege_type from information_schema.table_privileges
where table_schema in ('public','private') and table_name like 'qm_%'
  and grantee in ('PUBLIC','anon','authenticated','service_role') order by 1,2,3,4;
commit;
