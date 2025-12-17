import React from 'react';
import { UserPlus, UserMinus, Award, Sparkles } from 'lucide-react';

export interface SpaceActivityEvent {
  id: string;
  space_id: string;
  user_id: string;
  event_type: 'member_joined' | 'member_left' | 'badge_earned' | 'space_created';
  event_data?: {
    badge_name?: string;
    badge_id?: string;
    user_handle?: string;
    user_avatar?: string;
  };
  created_at: string;
  // Joined from profiles
  profiles?: {
    twitter_handle: string;
    avatar_url?: string;
  };
}

interface SpaceActivityFeedProps {
  activities: SpaceActivityEvent[];
  loading?: boolean;
  className?: string;
}

const getEventIcon = (eventType: SpaceActivityEvent['event_type']) => {
  switch (eventType) {
    case 'member_joined':
      return <UserPlus className="w-3.5 h-3.5 text-green-500" />;
    case 'member_left':
      return <UserMinus className="w-3.5 h-3.5 text-gray-400" />;
    case 'badge_earned':
      return <Award className="w-3.5 h-3.5 text-yellow-500" />;
    case 'space_created':
      return <Sparkles className="w-3.5 h-3.5 text-blue-500" />;
    default:
      return null;
  }
};

const getEventMessage = (event: SpaceActivityEvent) => {
  const handle = event.profiles?.twitter_handle || event.event_data?.user_handle || 'User';
  
  switch (event.event_type) {
    case 'member_joined':
      return <><span className="font-medium text-gray-900">{handle}</span> joined the space</>;
    case 'member_left':
      return <><span className="font-medium text-gray-900">{handle}</span> left the space</>;
    case 'badge_earned':
      const badgeName = event.event_data?.badge_name || 'a badge';
      return <><span className="font-medium text-gray-900">{handle}</span> earned <span className="text-yellow-600">{badgeName}</span></>;
    case 'space_created':
      return <><span className="font-medium text-gray-900">{handle}</span> created this space</>;
    default:
      return null;
  }
};

const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export const SpaceActivityFeed: React.FC<SpaceActivityFeedProps> = ({ 
  activities, 
  loading = false,
  className = '' 
}) => {
  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-100 rounded w-3/4" />
              <div className="h-2 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <div className="text-gray-400 text-sm">No recent activity</div>
        <div className="text-gray-300 text-xs mt-1">Activity will appear here as your team makes progress</div>
      </div>
    );
  }

  return (
    <div className={`space-y-0 ${className}`}>
      {activities.slice(0, 10).map((event, index) => (
        <div 
          key={event.id} 
          className={`flex items-start gap-3 py-3 ${index !== activities.length - 1 ? 'border-b border-gray-100' : ''}`}
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {event.profiles?.avatar_url || event.event_data?.user_avatar ? (
              <img 
                src={event.profiles?.avatar_url || event.event_data?.user_avatar} 
                alt="" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-500 font-medium">
                {(event.profiles?.twitter_handle || event.event_data?.user_handle || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              {getEventIcon(event.event_type)}
              <span className="truncate">{getEventMessage(event)}</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">
              {getRelativeTime(event.created_at)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpaceActivityFeed;
