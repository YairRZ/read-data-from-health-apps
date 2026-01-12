
export enum ActivityType {
  WALKING = 'Walking',
  RUNNING = 'Running',
  SWIMMING = 'Swimming',
  CYCLING = 'Cycling',
  STRENGTH = 'Strength',
  YOGA = 'Yoga',
  STEPS = 'Steps',
  OTHER = 'Other'
}

export interface ActivityStat {
  label: string;
  value: string;
}

export interface AnalysisResult {
  activityType: ActivityType;
  primaryValue: number;
  unit: string;
  additionalStats: ActivityStat[];
  summary: string;
  confidence: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  result: AnalysisResult;
}
