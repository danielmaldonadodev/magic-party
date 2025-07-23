-- Create commander_damage table
CREATE TABLE IF NOT EXISTS public.commander_damage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  source_player_id UUID NOT NULL REFERENCES public.game_players(id) ON DELETE CASCADE,
  target_player_id UUID NOT NULL REFERENCES public.game_players(id) ON DELETE CASCADE,
  damage_amount INT NOT NULL DEFAULT 0 CHECK (damage_amount >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Add a unique constraint to ensure only one damage record per source-target pair per game
  CONSTRAINT unique_commander_damage_per_game UNIQUE (game_id, source_player_id, target_player_id)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.commander_damage ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access for authenticated users"
  ON public.commander_damage
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow insert access to authenticated users
CREATE POLICY "Allow insert access for authenticated users"
  ON public.commander_damage
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow update access to authenticated users
CREATE POLICY "Allow update access for authenticated users"
  ON public.commander_damage
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.commander_damage;

-- Add trigger for updated_at column
CREATE OR REPLACE FUNCTION public.update_commander_damage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_commander_damage_updated_at
BEFORE UPDATE ON public.commander_damage
FOR EACH ROW
EXECUTE FUNCTION public.update_commander_damage_updated_at();

-- Add helpful indexes
CREATE INDEX idx_commander_damage_game_id ON public.commander_damage (game_id);
CREATE INDEX idx_commander_damage_source_player ON public.commander_damage (source_player_id);
CREATE INDEX idx_commander_damage_target_player ON public.commander_damage (target_player_id);
