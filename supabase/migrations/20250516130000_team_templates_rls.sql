-- Team members can read all projects in workspaces they belong to
DROP POLICY IF EXISTS "templates_select_team_members" ON public.templates;

CREATE POLICY "templates_select_team_members"
ON public.templates
FOR SELECT
TO authenticated
USING (
  team_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.team_id = templates.team_id
      AND tm.user_id = auth.uid()
  )
);

-- Editors and owners can create team projects
DROP POLICY IF EXISTS "templates_insert_team_members" ON public.templates;

CREATE POLICY "templates_insert_team_members"
ON public.templates
FOR INSERT
TO authenticated
WITH CHECK (
  team_id IS NOT NULL
  AND user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.team_id = templates.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'editor')
  )
);

-- Editors and owners can update team projects
DROP POLICY IF EXISTS "templates_update_team_members" ON public.templates;

CREATE POLICY "templates_update_team_members"
ON public.templates
FOR UPDATE
TO authenticated
USING (
  team_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.team_id = templates.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'editor')
  )
);

-- Editors and owners can delete team projects
DROP POLICY IF EXISTS "templates_delete_team_members" ON public.templates;

CREATE POLICY "templates_delete_team_members"
ON public.templates
FOR DELETE
TO authenticated
USING (
  team_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.team_id = templates.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'editor')
  )
);
