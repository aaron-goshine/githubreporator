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
  const token = req.headers.authorization?.split(' ')[1]?.trim();
  const page = parseInt(req.query.page as string) || 1;
  console.log('Received request for org:', org, 'page:', page);
  if (!token) {
    return res.status(401).send('GitHub token is required');
  }

  try {
    const repos = await getRatedRepositories(org, token, page);
    res.json(repos);
  } catch (error: any) {
    console.error('Error fetching repositories:', error);
    const status = error.status || 500;
    const message = error.message || 'Error fetching repositories';
    res.status(status).send(message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
