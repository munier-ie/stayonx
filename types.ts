export interface User {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  streak: number;
  teamStreak?: number;
  consistencyScore: number;
}

export enum ActivityType {
  TWEET = 'TWEET',
  REPLY = 'REPLY',
  DM = 'DM'
}

export interface ActivityLog {
  id: string;
  type: ActivityType;
  count: number;
  date: string;
}

export interface SpaceGoals {
  tweets: number; // 0 means disabled/optional
  replies: number;
  dms: number;
}

export interface SpaceMember {
  id: string;
  name: string;
  handle: string;
  role: 'creator' | 'member';
  streak: number; // Streak since joining
  progress: {
      tweets: number; // Actual count done today
      replies: number;
      dms: number;
  };
}

export interface Space {
  id: string | number;
  name: string;
  category: string;
  memberCount: number;
  streak: number;
  avgOutput: number;
  description?: string;
  isPrivate: boolean;
  goals: SpaceGoals;
  creatorId?: string;
  members?: SpaceMember[];
  isJoined?: boolean; // Client-side helper
}

export interface Badge {
  id: string;
  category: 'streak' | 'consistency' | 'leaderboard' | 'space' | 'replies';
  name: string;
  description: string;
  iconPath: string;
  threshold: number;
  earned: boolean;
  earnedAt?: string;
}