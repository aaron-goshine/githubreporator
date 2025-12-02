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


  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRepositories(organizationName, githubToken);
      setRepositories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch repositories.');
    } finally {
      setLoading(false);
    }
  };

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
            onClick={fetchData}
            disabled={loading || !githubToken || !organizationName}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Get Repositories'}
          </Button>
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
      </Container>
    </Box>
  );
}

export default App;
