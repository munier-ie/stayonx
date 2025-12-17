import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { Badge } from '../types';
import { ALL_BADGES, BadgeDefinition } from '../src/lib/badgeDefinitions';

interface BadgeSectionProps {
  userId?: string;
  className?: string;
  expanded?: boolean;
}

/**
 * Get unlock requirement text based on badge category and threshold
 */
const getUnlockRequirement = (badge: BadgeDefinition): string => {
  switch (badge.category) {
    case 'streak':
      return `Maintain a ${badge.threshold}-day streak`;
    case 'consistency':
      if (badge.id.includes('w')) {
        const weeks = Math.floor(badge.threshold / 7);
        return `Stay consistent for ${weeks} weeks`;
      }
      return `Meet daily goals for ${badge.threshold} days`;
    case 'leaderboard':
      if (badge.threshold === 1) return 'Reach #1 on global leaderboard';
      return `Reach top ${badge.threshold} on global leaderboard`;
    case 'space':
      if (badge.threshold === 1) return 'Reach #1 in your space';
      return `Reach top ${badge.threshold} in your space`;
    case 'replies':
      return `Send ${badge.threshold.toLocaleString()} replies on X`;
    default:
      return badge.description;
  }
};

/**
 * BadgeSection component displays earned badges in a horizontal scroll
 * Shows locked badges as grayscale with progress hints
 */
export const BadgeSection: React.FC<BadgeSectionProps> = ({ userId, className = '', expanded = false }) => {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchBadges = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('badges')
          .eq('id', userId)
          .single();

        if (error) {
          console.warn('[BadgeSection] Error fetching badges:', error);
          setEarnedBadges([]);
        } else {
          setEarnedBadges(data?.badges || []);
        }
      } catch (e) {
        console.warn('[BadgeSection] Fetch error:', e);
        setEarnedBadges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [userId]);

  // Merge definitions with earned status
  const badgesWithStatus = ALL_BADGES.map((def: BadgeDefinition) => {
    const earned = earnedBadges.find((b: Badge) => b.id === def.id);
    return {
      ...def,
      earned: !!earned,
      earnedAt: earned?.earnedAt
    };
  });

  // Sort: earned first, then by category
  const sortedBadges = [...badgesWithStatus].sort((a, b) => {
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;
    return 0;
  });

  // Show all badges if expanded, otherwise show top 8
  const displayBadges = expanded ? sortedBadges : sortedBadges.slice(0, 8);

  if (loading) {
    return (
      <div className={`flex gap-3 overflow-x-auto pb-2 ${className}`}>
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i}
            className="w-12 h-12 bg-gray-100 rounded-lg animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  if (earnedBadges.length === 0 && !loading) {
    return (
      <div className={`py-4 ${className}`}>
        <p className="text-sm text-gray-400 text-center">
          No badges earned yet. Keep building your streak!
        </p>
        <div className={`flex gap-3 mt-4 ${expanded ? 'flex-wrap justify-start' : 'justify-center'}`}>
          {(expanded ? ALL_BADGES : ALL_BADGES.slice(0, 4)).map((badge) => (
            <BadgeItem key={badge.id} badge={{ ...badge, earned: false }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${expanded ? 'flex flex-wrap gap-3 pb-2' : 'flex gap-3 overflow-x-auto pb-2 scrollbar-hide'} ${className}`}>
      {displayBadges.map((badge) => (
        <BadgeItem key={badge.id} badge={badge} />
      ))}
    </div>
  );
};

interface BadgeItemProps {
  badge: BadgeDefinition & { earned: boolean; earnedAt?: string };
}

const BadgeItem: React.FC<BadgeItemProps> = ({ badge }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="relative flex-shrink-0 group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Badge Image */}
      <div 
        className={`
          w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300
          ${badge.earned 
            ? 'border-gray-900 shadow-md' 
            : 'border-gray-200 grayscale opacity-50 hover:opacity-70'
          }
        `}
      >
        <img 
          src={badge.iconPath} 
          alt={badge.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Earned Indicator */}
      {badge.earned && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap text-center min-w-[140px] max-w-[200px]">
            <p className="text-xs font-semibold">{badge.name}</p>
            <p className="text-[10px] text-gray-300 mt-0.5">{badge.description}</p>
            {badge.earned && badge.earnedAt && (
              <p className="text-[9px] text-gray-400 mt-1">
                Earned {new Date(badge.earnedAt).toLocaleDateString()}
              </p>
            )}
            {!badge.earned && (
              <div className="mt-1.5 pt-1.5 border-t border-gray-700">
                <p className="text-[9px] text-yellow-400 font-medium">
                  🔒 How to unlock:
                </p>
                <p className="text-[9px] text-gray-300 mt-0.5 whitespace-normal">
                  {getUnlockRequirement(badge)}
                </p>
              </div>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

export default BadgeSection;
