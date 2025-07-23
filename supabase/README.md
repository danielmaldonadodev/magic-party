# Supabase Database Setup

This directory contains SQL migrations for the Magic Party application database.

## Commander Damage Table Setup

To set up the commander damage functionality, run the following migration script in your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open the `commander_damage.sql` file from the `migrations` folder
4. Run the SQL script to create the necessary table, policies, and indexes

This will create:
- A `commander_damage` table that tracks damage dealt from one commander to another player
- Appropriate security policies to allow access to authenticated users
- Realtime subscription support
- Indexes for better query performance

## Table Structure

The `commander_damage` table has the following structure:
- `id`: UUID primary key
- `game_id`: Foreign key to the games table
- `source_player_id`: Foreign key to the game_players table (the player dealing damage)
- `target_player_id`: Foreign key to the game_players table (the player receiving damage)
- `damage_amount`: Integer representing the amount of commander damage dealt
- `created_at`: Timestamp when the record was created
- `updated_at`: Timestamp when the record was last updated

A unique constraint ensures there's only one damage record per source-target player pair per game.
