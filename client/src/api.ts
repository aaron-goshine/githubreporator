import axios from 'axios';

// --- Start of embedded types ---
interface RatingCriteria {
  description: { score: number; maxScore: number };
  readme: { score: number; maxScore: number };
  staleBranches: { score: number; maxScore: number; count: number };
  oldPullRequests: { score: number; maxScore: number; count: number };
}

interface SimpleRepository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
}

interface RatedRepository extends SimpleRepository {
  rating: number;
  ratingDetails: RatingCriteria;
}
// --- End of embedded types ---

const API_BASE_URL = 'http://localhost:3001/api';

export const fetchRepositories = async (organization: string, token: string): Promise<RatedRepository[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/repositories/${organization}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || error.message);
    }
    throw new Error('An unknown error occurred');
  }
};
