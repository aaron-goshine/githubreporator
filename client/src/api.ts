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

const API_BASE_URL = '/api';

const CACHE_PREFIX = 'github_reporter_cache_';
const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export const fetchRepositories = async (organization: string, token: string, page: number, forceRefresh: boolean = false): Promise<{ data: RatedRepository[]; fromCache: boolean }> => {
  const cacheKey = `${CACHE_PREFIX}${organization}_page_${page}`;

  if (!forceRefresh) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY_MS) {
        return { data, fromCache: true };
      }
    }
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/repositories/${organization}`, {
      params: { page },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data;
    localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
    return { data, fromCache: false };
  } catch (error) {
    // Fallback to stale cache if available
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data } = JSON.parse(cached);
      return { data, fromCache: true };
    }

    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || error.message);
    }
    throw new Error('An unknown error occurred');
  }
};
