CREATE TABLE IF NOT EXISTS public.project_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  label text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_versions_template_id_created_at_idx
  ON public.project_versions (template_id, created_at DESC);

ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_versions_select"
ON public.project_versions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.templates t
    WHERE t.id = project_versions.template_id
      AND (
        t.user_id = auth.uid()
        OR (
          t.team_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.team_members tm
            WHERE tm.team_id = t.team_id
              AND tm.user_id = auth.uid()
          )
        )
      )
  )
);

CREATE POLICY "project_versions_insert"
ON public.project_versions
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.templates t
    WHERE t.id = project_versions.template_id
      AND (
        t.user_id = auth.uid()
        OR (
          t.team_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.team_members tm
            WHERE tm.team_id = t.team_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'editor')
          )
        )
      )
  )
);

CREATE POLICY "project_versions_update"
ON public.project_versions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.templates t
    WHERE t.id = project_versions.template_id
      AND (
        t.user_id = auth.uid()
        OR (
          t.team_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.team_members tm
            WHERE tm.team_id = t.team_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'editor')
          )
        )
      )
  )
);

CREATE POLICY "project_versions_delete"
ON public.project_versions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.templates t
    WHERE t.id = project_versions.template_id
      AND (
        t.user_id = auth.uid()
        OR (
          t.team_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.team_members tm
            WHERE tm.team_id = t.team_id
              AND tm.user_id = auth.uid()
              AND tm.role IN ('owner', 'editor')
          )
        )
      )
  )
);
