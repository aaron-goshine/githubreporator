import express from 'express';
import cors from 'cors';
import { getRatedRepositories } from './github';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('GitHub Reporter Server is running!');
});

app.get('/api/repositories/:org', async (req, res) => {
  const { org } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  const page = parseInt(req.query.page as string) || 1;
  console.log('Received request for org:', org, 'page:', page);
  if (!token) {
    return res.status(401).send('GitHub token is required');
  }

  try {
    const repos = await getRatedRepositories(org, token, page);
    res.json(repos);
  } catch (error) {
    res.status(500).send('Error fetching repositories');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
