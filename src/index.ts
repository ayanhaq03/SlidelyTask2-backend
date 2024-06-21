import express from 'express';
import routes from './routes';

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api', routes);  // Ensure routes are mounted at /api

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
