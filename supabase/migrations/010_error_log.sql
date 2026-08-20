-- error_log: the per-product failure table the UX Scout reads.
--
-- Added 2026-08-20. This product shipped edge functions with no failure table at all, so
-- every caught error went to console.error and vanished. It had 9 users at the time.
-- Plan: production-monitor/docs/PLAN-UX-SCOUT-2026-08-20.md
--
-- Shape is copied verbatim from the ReplyFlow production table (read via the Management API
-- on 2026-08-20) so one scout query works unchanged across every product.
--
-- `context` is JSONB and callers MUST pass an OBJECT, never JSON.stringify(...). Passing a
-- string stores the jsonb STRING "{}" instead of the object {}, which makes
-- context->>'user_id' permanently null. That bug shipped in all five existing copies of the
-- error-log helper and was only caught on 2026-08-20; the helper added alongside this
-- migration has it right from the start.

CREATE TABLE IF NOT EXISTS public.error_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  function_name text NOT NULL,
  operation text NOT NULL,
  error_message text,
  context jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_error_log_created_at ON public.error_log USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_log_function ON public.error_log USING btree (function_name, created_at DESC);

-- Writes come from edge functions using the service key, which bypasses RLS. No client role
-- gets any grant: an error log is internal diagnostics and must never be readable, or
-- writable, from the browser.
ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.error_log FROM anon, authenticated;
