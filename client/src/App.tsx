import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Paper,
  AppBar,
  Toolbar,
  Typography,
  Box,
} from '@mui/material';
import { fetchRepositories } from './api';

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

function App() {
  const [githubToken, setGithubToken] = useState<string>('');
  const [organizationName, setOrganizationName] = useState<string>('');
  const [repositories, setRepositories] = useState<RatedRepository[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filterTerm, setFilterTerm] = useState<string>('');
  const [fromCache, setFromCache] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);


  const fetchData = async (pageNum: number, forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const { data, fromCache } = await fetchRepositories(organizationName, githubToken, pageNum, forceRefresh);
      if (pageNum === 1) {
        setRepositories(data);
      } else {
        setRepositories(prev => [...prev, ...data]);
      }
      setFromCache(fromCache);
      setPage(pageNum);
      if (data.length < 10) { // Assuming 10 is per_page
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch repositories.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setHasMore(true);
    fetchData(1, false);
  }

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(filterTerm.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            GitHub Repository Reporter
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          <TextField
            label="GitHub Personal Access Token"
            type="password"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Organization Name"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !githubToken || !organizationName}
            sx={{ mt: 2 }}
          >
            {loading && page === 1 ? <CircularProgress size={24} color="inherit" /> : 'Get Repositories'}
          </Button>
          {repositories.length > 0 && (
            <Button
              variant="outlined"
              onClick={() => fetchData(1, true)} // Refresh resets to page 1
              disabled={loading || !githubToken || !organizationName}
            >
              Refresh Data
            </Button>
          )}
        </Box>

        {repositories.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Filter by Repository Name"
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
            />
          </Box>
        )}

        {fromCache && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Data loaded from cache. Click "Refresh Data" to fetch latest.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {filteredRepositories.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Repository Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Rating (1-10)</TableCell>
                  <TableCell align="right">README Lines</TableCell>
                  <TableCell align="right">Stale Branches</TableCell>
                  <TableCell align="right">Old PRs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRepositories.map((repo) => (
                  <TableRow key={repo.id}>
                    <TableCell>
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                        {repo.name}
                      </a>
                    </TableCell>
                    <TableCell>{repo.description || 'N/A'}</TableCell>
                    <TableCell align="right">{repo.rating}</TableCell>
                    <TableCell align="right">
                      {repo.ratingDetails.readme.score > 0 ? '> 100' : '< 100'}
                    </TableCell>
                    <TableCell align="right">{repo.ratingDetails.staleBranches.count}</TableCell>
                    <TableCell align="right">{repo.ratingDetails.oldPullRequests.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {repositories.length > 0 && hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => fetchData(page + 1, false)}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Load More'}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;
