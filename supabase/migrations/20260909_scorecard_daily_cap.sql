CREATE TABLE IF NOT EXISTS public.scorecard_daily_usage (
  date_utc DATE PRIMARY KEY,
  grounded_count INT NOT NULL DEFAULT 0
);

ALTER TABLE public.scorecard_daily_usage ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.increment_scorecard_cap(p_date DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.scorecard_daily_usage (date_utc, grounded_count)
  VALUES (p_date, 1)
  ON CONFLICT (date_utc)
  DO UPDATE SET grounded_count = public.scorecard_daily_usage.grounded_count + 1;
END;
$$;
