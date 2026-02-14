import api from '../lib/api';

export interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
  createdAt: string;
  myReferralCode: string;
  level: number;
  teamCount: number;
  totalTeamSize: number;
  children: TeamMember[];
}

export interface TeamResponse {
  success: boolean;
  data: TeamMember;
}

// Get user team hierarchy
export const getUserTeam = async (userId: string): Promise<TeamResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/team`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch team');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch team. Please try again.');
  }
};
