import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

// Components
import MagicSpinner from '../components/ui/MagicSpinner';
import PlayerCard from '../components/arena/PlayerCard';
import GameControls from '../components/arena/GameControls';
import GameLog from '../components/arena/GameLog';
import CommanderDamageModal from '../components/arena/CommanderDamageModal';

// Types
import { Game, GamePlayer, GameLog as GameLogType, CommanderDamage } from '../types/gameTypes';



const GamePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [game, setGame] = useState<Game | null>(null);
  const [gameLogs, setGameLogs] = useState<GameLogType[]>([]);
  const [commanderDamage, setCommanderDamage] = useState<CommanderDamage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showCommanderDamageModal, setShowCommanderDamageModal] = useState(false);
  const [selectedSourcePlayerId, setSelectedSourcePlayerId] = useState<string>('');
  
  useEffect(() => {
    if (!id) return;
    
    // Get current user
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    };
    
    getUserId();
    fetchGame();
    fetchGameLogs();
    fetchCommanderDamage();
    
    // Set up realtime subscription
    const gameSubscription = supabase
      .channel(`game_${id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${id}` }, 
        () => {
          fetchGame();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'game_players', filter: `game_id=eq.${id}` }, 
        () => {
          fetchGame();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'game_logs', filter: `game_id=eq.${id}` }, 
        () => {
          fetchGameLogs();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'commander_damage', filter: `game_id=eq.${id}` }, 
        () => {
          fetchCommanderDamage();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(gameSubscription);
    };
  }, [id]);
  
  async function fetchGame() {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('games')
        .select(`
          *,
          game_players(
            *,
            profile:user_id(*),
            deck:deck_id(*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      setGame(data);
    } catch (error: any) {
      console.error('Error fetching game:', error);
      setError('Error al cargar la partida');
      
      // If game doesn't exist, redirect to arena
      if (error.code === 'PGRST116') {
        navigate('/arena');
      }
    } finally {
      setLoading(false);
    }
  }
  
  async function fetchGameLogs() {
    if (!id) return;
    
    try {
      const { data, error: logsError } = await supabase
        .from('game_logs')
        .select(`
          *,
          profile:user_id(username)
        `)
        .eq('game_id', id)
        .order('created_at', { ascending: false });
      
      if (logsError) throw logsError;
      
      setGameLogs(data || []);
    } catch (error) {
      console.error('Error fetching game logs:', error);
    }
  }
  
  async function fetchCommanderDamage() {
    if (!id) return;
    
    try {
      // This will need to be updated when the commander_damage table is created in Supabase
      const { data, error: damageError } = await supabase
        .from('commander_damage')
        .select(`
          *,
          source_player:source_player_id(*),
          target_player:target_player_id(*)
        `)
        .eq('game_id', id);
      
      if (damageError) {
        // Table might not exist yet, don't throw error
        console.warn('Could not fetch commander damage:', damageError);
        return;
      }
      
      setCommanderDamage(data || []);
    } catch (error) {
      console.error('Error fetching commander damage:', error);
    }
  }
  
  // Game actions
  async function updateLifeTotal(playerId: string, amount: number) {
    if (!game) return;
    
    try {
      const player = game.game_players.find(p => p.id === playerId);
      if (!player) return;
      
      const newLifeTotal = Math.max(0, player.life_total + amount);
      const isEliminated = newLifeTotal <= 0;
      
      // Update player
      await supabase
        .from('game_players')
        .update({ 
          life_total: newLifeTotal,
          is_eliminated: isEliminated
        })
        .eq('id', playerId);
      
      // Add log
      await supabase
        .from('game_logs')
        .insert({
          game_id: game.id,
          user_id: currentUserId,
          action_type: 'life_change',
          action_text: `${amount > 0 ? '+' : ''}${amount} vida para ${player.profile?.username} (${newLifeTotal})`
        });
      
      if (isEliminated && !player.is_eliminated) {
        await supabase
          .from('game_logs')
          .insert({
            game_id: game.id,
            user_id: currentUserId,
            action_type: 'elimination',
            action_text: `${player.profile?.username} ha sido eliminado`
          });
      }
    } catch (error) {
      console.error('Error updating life total:', error);
    }
  }
  
  async function updateCommanderTax(playerId: string, amount: number) {
    if (!game) return;
    
    try {
      const player = game.game_players.find(p => p.id === playerId);
      if (!player) return;
      
      const newTax = Math.max(0, player.commander_tax + amount);
      
      // Update player
      await supabase
        .from('game_players')
        .update({ commander_tax: newTax })
        .eq('id', playerId);
      
      // Add log
      await supabase
        .from('game_logs')
        .insert({
          game_id: game.id,
          user_id: currentUserId,
          action_type: 'commander_tax',
          action_text: `${amount > 0 ? '+' : ''}${amount} al coste de comandante de ${player.profile?.username} (${newTax})`
        });
    } catch (error) {
      console.error('Error updating commander tax:', error);
    }
  }
  
  async function toggleStatusEffect(playerId: string, effect: 'is_monarch' | 'has_initiative') {
    if (!game) return;
    
    try {
      const player = game.game_players.find(p => p.id === playerId);
      if (!player) return;
      
      // If player already has the status, just toggle it for them
      if (player[effect]) {
        await supabase
          .from('game_players')
          .update({ [effect]: false })
          .eq('id', playerId);
        
        // Add log
        await supabase
          .from('game_logs')
          .insert({
            game_id: game.id,
            user_id: currentUserId,
            action_type: effect,
            action_text: `${player.profile?.username} ha perdido ${effect === 'is_monarch' ? 'la monarquía' : 'la iniciativa'}`
          });
        
        return;
      }
      
      // Remove status from all players
      await supabase
        .from('game_players')
        .update({ [effect]: false })
        .eq('game_id', game.id);
      
      // Add status to current player
      await supabase
        .from('game_players')
        .update({ [effect]: true })
        .eq('id', playerId);
      
      // Add log
      await supabase
        .from('game_logs')
        .insert({
          game_id: game.id,
          user_id: currentUserId,
          action_type: effect,
          action_text: `${player.profile?.username} ha obtenido ${effect === 'is_monarch' ? 'la monarquía' : 'la iniciativa'}`
        });
    } catch (error) {
      console.error('Error toggling status effect:', error);
    }
  }
  
  // Commander damage functions
  const openCommanderDamageModal = (playerId: string) => {
    setSelectedSourcePlayerId(playerId);
    setShowCommanderDamageModal(true);
  };
  
  async function updateCommanderDamage(sourcePlayerId: string, targetPlayerId: string, amount: number) {
    if (!game || !id) return;
    
    try {
      const sourcePlayer = game.game_players.find(p => p.id === sourcePlayerId);
      const targetPlayer = game.game_players.find(p => p.id === targetPlayerId);
      
      if (!sourcePlayer || !targetPlayer) return;
      
      // Check if there's already a damage entry for this pair
      const existingDamage = commanderDamage.find(
        d => d.source_player_id === sourcePlayerId && d.target_player_id === targetPlayerId
      );
      
      let newDamageAmount = amount;
      let currentDamage = 0;
      
      if (existingDamage) {
        // Update existing damage
        currentDamage = existingDamage.damage_amount;
        newDamageAmount = currentDamage + amount;
        
        await supabase
          .from('commander_damage')
          .update({ damage_amount: newDamageAmount, updated_at: new Date().toISOString() })
          .eq('id', existingDamage.id);
      } else {
        // Create new damage entry
        await supabase
          .from('commander_damage')
          .insert({
            game_id: id,
            source_player_id: sourcePlayerId,
            target_player_id: targetPlayerId,
            damage_amount: amount
          });
      }
      
      // Add log entry
      await supabase
        .from('game_logs')
        .insert({
          game_id: id,
          user_id: currentUserId,
          action_type: 'commander_damage',
          action_text: `${sourcePlayer.profile?.username} ha causado ${amount} de daño de comandante a ${targetPlayer.profile?.username} (Total: ${newDamageAmount})`
        });
      
      // Check for elimination (21+ commander damage)
      if (newDamageAmount >= 21 && !targetPlayer.is_eliminated) {
        await supabase
          .from('game_players')
          .update({ is_eliminated: true })
          .eq('id', targetPlayerId);
        
        await supabase
          .from('game_logs')
          .insert({
            game_id: id,
            user_id: currentUserId,
            action_type: 'elimination',
            action_text: `${targetPlayer.profile?.username} ha sido eliminado por daño de comandante de ${sourcePlayer.profile?.username}`
          });
      }
      
      // Refresh data
      fetchCommanderDamage();
      fetchGame();
    } catch (error) {
      console.error('Error updating commander damage:', error);
    }
  }
  
  async function incrementTurn() {
    if (!game) return;
    
    try {
      await supabase
        .from('games')
        .update({ turn_count: game.turn_count + 1 })
        .eq('id', game.id);
      
      // Add log
      await supabase
        .from('game_logs')
        .insert({
          game_id: game.id,
          user_id: currentUserId,
          action_type: 'turn',
          action_text: `Turno ${game.turn_count + 1}`
        });
    } catch (error) {
      console.error('Error incrementing turn:', error);
    }
  }
  
  async function endGame(winnerId: string) {
    if (!game) return;
    
    try {
      const winner = game.game_players.find(p => p.user_id === winnerId);
      if (!winner) return;
      
      await supabase
        .from('games')
        .update({ 
          status: 'completed',
          winner_id: winnerId
        })
        .eq('id', game.id);
      
      // Add log
      await supabase
        .from('game_logs')
        .insert({
          game_id: game.id,
          user_id: currentUserId,
          action_type: 'game_end',
          action_text: `${winner.profile?.username} ha ganado la partida`
        });
      
      // Update deck stats
      if (winner) {
        // Increment wins for winner's deck
        await supabase
          .from('decks')
          .update({ wins: supabase.rpc('increment') })
          .eq('id', winner.deck_id);
        
        // Increment losses for other players' decks
        const loserDeckIds = game.game_players
          .filter(p => p.user_id !== winnerId)
          .map(p => p.deck_id);
        
        for (const deckId of loserDeckIds) {
          await supabase
            .from('decks')
            .update({ losses: supabase.rpc('increment') })
            .eq('id', deckId);
        }
      }
    } catch (error) {
      console.error('Error ending game:', error);
    }
  }
  
  // Check if current user can modify the game
  const canModifyGame = game && currentUserId && (
    game.creator_id === currentUserId || 
    game.game_players.some(p => p.user_id === currentUserId)
  );
  
  return (
    <div className="pb-6">
      {loading ? (
        <div className="flex justify-center py-12">
          <MagicSpinner colorIdentity="WUBRG" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-mana/20 border border-red-mana rounded-md text-white mb-6">
          {error}
        </div>
      ) : !game ? (
        <div className="p-4 bg-red-mana/20 border border-red-mana rounded-md text-white mb-6">
          No se ha encontrado la partida
        </div>
      ) : (
        <>
          {/* Game header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-magical text-white">
                {game.format.charAt(0).toUpperCase() + game.format.slice(1)}
                <span className="text-gray-400 text-sm ml-2">
                  {game.status === 'active' ? `• Turno ${game.turn_count}` : '• Finalizada'}
                </span>
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowLog(!showLog)}
                className="px-3 py-1 bg-black-light/70 text-gray-300 rounded-md hover:bg-gray-800 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {showLog ? 'Ocultar log' : 'Ver log'}
              </button>
              
              {game.status === 'active' && canModifyGame && (
                <button
                  onClick={() => incrementTurn()}
                  className="px-3 py-1 bg-blue-mana/20 text-blue-light rounded-md hover:bg-blue-mana/40 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  Siguiente turno
                </button>
              )}
            </div>
          </div>
          
          {/* Game log */}
          <AnimatePresence>
            {showLog && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <GameLog logs={gameLogs} />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Game status banner */}
          {game.status === 'completed' && game.winner_id && (
            <div className="mb-4 p-3 bg-gold-mana/20 border border-gold-mana/50 rounded-md text-gold-light">
              {game.game_players.find(p => p.user_id === game.winner_id)?.profile?.username || 'Un jugador'} ha ganado la partida
            </div>
          )}
          
          {/* Players grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {game.game_players.map((player) => {
              // Get commander damage for this player
              const damageReceived = commanderDamage.filter(d => 
                d.target_player_id === player.id
              );
              
              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isActive={game.status === 'active'}
                  onLifeChange={canModifyGame ? updateLifeTotal : undefined}
                  onCommanderTaxChange={game.format === 'commander' && canModifyGame ? updateCommanderTax : undefined}
                  onToggleMonarch={canModifyGame ? () => toggleStatusEffect(player.id, 'is_monarch') : undefined}
                  onToggleInitiative={canModifyGame ? () => toggleStatusEffect(player.id, 'has_initiative') : undefined}
                  onCommanderDamage={game.format === 'commander' && canModifyGame ? () => openCommanderDamageModal(player.id) : undefined}
                  commanderDamageReceived={damageReceived}
                />
              );
            })}
          </div>
          
          {/* Game controls */}
          {game.status === 'active' && canModifyGame && (
            <div className="mt-6">
              <GameControls
                players={game.game_players}
                onEndGame={endGame}
                currentUserId={currentUserId}
              />
            </div>
          )}
          
          {/* Commander damage modal */}
          <AnimatePresence>
            {showCommanderDamageModal && game && selectedSourcePlayerId && (
              <CommanderDamageModal
                players={game.game_players}
                sourcePlayerId={selectedSourcePlayerId}
                onClose={() => setShowCommanderDamageModal(false)}
                onUpdateDamage={updateCommanderDamage}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default GamePage;
