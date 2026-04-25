export interface Profile {
  uid: string;
  username: string;
  fullname?: string;
  email: string;
  address?: string; // Street name/area for proximity
  city?: string;
  state?: string;
  phone?: string;
  notificationPreferences: {
    proximityAlerts: boolean;
    highPriorityOnly: boolean;
  };
  createdAt: any;
}

export type IncidentType = 'Armed Robbery' | 'Assault' | 'Rape' | 'Harassment' | 'Theft' | 'Other';

export type ReportStatus = 'New' | 'Active' | 'Unverified' | 'Flagged for misuse';

export interface Reply {
  id: string;
  userId: string;
  username: string;
  isAnonymous: boolean;
  content: string;
  createdAt: any;
  misuseFlags?: string[]; // userIDs who flagged
  isHidden?: boolean;
}

export interface Report {
  id: string;
  type: IncidentType;
  description: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  isAnonymous: boolean;
  status: ReportStatus;
  createdAt: any;
  updatedAt: any;
  userId?: string;
  username?: string; 
  location?: { lat: number, lng: number };
  streetAddress: string; 
  replyCount: number;
  confirmations: string[]; // userIDs who clicked 👍
  inaccurateVotes: string[]; // userIDs who clicked 👎
  misuseFlags: string[]; // userIDs who flagged 🚩
}
