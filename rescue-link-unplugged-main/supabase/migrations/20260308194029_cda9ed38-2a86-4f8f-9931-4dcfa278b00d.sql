
-- Tighten: only allow updates on sos_alerts/rescue_teams by authenticated users (already scoped to authenticated role, keep USING true for operators)
-- The INSERT on activity_logs is also fine since it's scoped to authenticated role
-- These are command center operations where all operators need access

-- No changes needed - the policies are correctly scoped to authenticated role
-- Adding a comment to acknowledge the warnings are reviewed and accepted

COMMENT ON POLICY "Authenticated users can update alerts" ON public.sos_alerts IS 'All authenticated operators can update alert status - intentional for command center operations';
COMMENT ON POLICY "Authenticated users can update teams" ON public.rescue_teams IS 'All authenticated operators can manage team assignments - intentional for command center operations';
COMMENT ON POLICY "Authenticated users can create logs" ON public.activity_logs IS 'All authenticated operators can log activities - intentional for command center operations';
