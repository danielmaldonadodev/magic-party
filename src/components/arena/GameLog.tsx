import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface GameLog {
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

interface GameLogProps {
  logs: GameLog[];
}

const GameLog = ({ logs }: GameLogProps) => {
  // Action type icons
  const actionIcons: Record<string, string> = {
    'life_change': '❤️',
    'commander_tax': '💰',
    'is_monarch': '👑',
    'has_initiative': '🏆',
    'turn': '⏱️',
    'elimination': '💀',
    'game_end': '🏁',
    'game_start': '🎮',
    'default': '📝'
  };
  
  // Group logs by date (today, yesterday, older)
  const groupedLogs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayLogs: GameLog[] = [];
    const yesterdayLogs: GameLog[] = [];
    const olderLogs: GameLog[] = [];
    
    logs.forEach(log => {
      const logDate = new Date(log.created_at);
      logDate.setHours(0, 0, 0, 0);
      
      if (logDate.getTime() === today.getTime()) {
        todayLogs.push(log);
      } else if (logDate.getTime() === yesterday.getTime()) {
        yesterdayLogs.push(log);
      } else {
        olderLogs.push(log);
      }
    });
    
    return {
      today: todayLogs,
      yesterday: yesterdayLogs,
      older: olderLogs
    };
  }, [logs]);
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: es
    });
  };
  
  // Get icon for action type
  const getActionIcon = (actionType: string) => {
    return actionIcons[actionType] || actionIcons.default;
  };
  
  // Get style for action type
  const getActionStyle = (actionType: string) => {
    switch (actionType) {
      case 'life_change':
        return 'border-red-mana/30 bg-red-mana/10';
      case 'commander_tax':
        return 'border-blue-mana/30 bg-blue-mana/10';
      case 'is_monarch':
        return 'border-gold-mana/30 bg-gold-mana/10';
      case 'has_initiative':
        return 'border-blue-mana/30 bg-blue-mana/10';
      case 'turn':
        return 'border-green-mana/30 bg-green-mana/10';
      case 'elimination':
        return 'border-black-mana/30 bg-black-mana/10';
      case 'game_end':
        return 'border-gold-mana/30 bg-gold-mana/10';
      case 'game_start':
        return 'border-blue-mana/30 bg-blue-mana/10';
      default:
        return 'border-gray-700 bg-gray-900/50';
    }
  };
  
  // Render log group
  const renderLogGroup = (title: string, groupLogs: GameLog[]) => {
    if (groupLogs.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-gray-400 text-sm mb-2">{title}</h3>
        <div className="space-y-2">
          {groupLogs.map(log => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border p-2 rounded-md ${getActionStyle(log.action_type)}`}
            >
              <div className="flex">
                <div className="mr-2">
                  <span className="text-lg">{getActionIcon(log.action_type)}</span>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-white">
                      {log.action_text}
                      {log.profile && (
                        <span className="text-xs text-gray-400 ml-1">
                          {log.action_type !== 'elimination' && log.action_type !== 'game_end' ? `por ${log.profile.username}` : ''}
                        </span>
                      )}
                    </p>
                    <span className="text-xs text-gray-500 ml-2">{formatTimestamp(log.created_at)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };
  
  // If there are no logs
  if (logs.length === 0) {
    return (
      <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-md">
        <p className="text-gray-400 text-center">No hay registros para esta partida</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-md max-h-80 overflow-y-auto">
      {renderLogGroup('Hoy', groupedLogs.today)}
      {renderLogGroup('Ayer', groupedLogs.yesterday)}
      {renderLogGroup('Anteriores', groupedLogs.older)}
    </div>
  );
};

export default GameLog;
