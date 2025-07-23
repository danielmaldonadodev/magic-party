// Common types used across the application

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  color_identity?: string[];
}

export interface Deck {
  id: string;
  name: string;
  color_identity: string[];
  commander?: string;
  image_url?: string;
}

export interface CommanderDamage {
  id: string;
  game_id: string;
  source_player_id: string;
  target_player_id: string;
  damage_amount: number;
  created_at: string;
  updated_at: string;
  // Optional related objects
  source_player?: GamePlayer;
  target_player?: GamePlayer;
}

export interface GamePlayer {
  id: string;
  game_id: string;
  user_id: string;
  deck_id: string;
  life_total: number;
  commander_tax: number;
  is_monarch: boolean;
  has_initiative: boolean;
  is_eliminated: boolean;
  // Optional related objects
  profile?: Profile;
  deck?: Deck;
  // Optional computed properties
  commander_damage_received?: CommanderDamage[]; // damage received from other commanders
}

export interface Game {
  id: string;
  creator_id: string;
  format: string;
  status: string;
  created_at: string;
  updated_at: string;
  winner_id?: string;
  event_id?: string;
  turn_count: number;
  // Related objects
  game_players: GamePlayer[];
}

export interface GameLog {
  id: string;
  game_id: string;
  user_id: string;
  action_type: string;
  action_text: string;
  created_at: string;
  profile?: {
    username: string;
  };
}
