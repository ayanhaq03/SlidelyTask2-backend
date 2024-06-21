import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const dbPath = path.join(__dirname, '..', 'src', 'db.json');

// Function to ensure db.json exists and is initialized
const initializeDb = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([]), 'utf8');
  }
};

// Endpoint to check if server is running
router.get('/ping', (req: Request, res: Response) => {
  res.json({ success: true });
});

// Endpoint to save a submission
router.post('/submit', (req: Request, res: Response) => {
  console.log('Received submission:', req.body);
  
  const { name, email, phone, github_link, stopwatch_time } = req.body;
  if (!name || !email || !phone || !github_link || !stopwatch_time) {
    console.error('Validation error: All fields are required');
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newSubmission = { name, email, phone, github_link, stopwatch_time };

  initializeDb();
  
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read database:', err);
      return res.status(500).json({ error: 'Failed to read database' });
    }

    let submissions = [];
    try {
      submissions = JSON.parse(data);
    } catch (parseError) {
      console.error('Failed to parse database JSON:', parseError);
      return res.status(500).json({ error: 'Failed to parse database JSON' });
    }

    submissions.push(newSubmission);

    fs.writeFile(dbPath, JSON.stringify(submissions, null, 2), (err) => {
      if (err) {
        console.error('Failed to save submission:', err);
        return res.status(500).json({ error: 'Failed to save submission' });
      }

      console.log('Submission saved successfully');
      res.status(201).json({ message: 'Submission saved successfully' });
    });
  });
});

// Endpoint to read all submissions
router.get('/readAll', (req: Request, res: Response) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read database:', err);
      return res.status(500).json({ error: 'Failed to read database' });
    }

    try {
      const submissions = JSON.parse(data);
      res.json(submissions);
    } catch (parseError) {
      console.error('Failed to parse database JSON:', parseError);
      res.status(500).json({ error: 'Failed to parse database JSON' });
    }
  });
});

// Endpoint to read a submission by index
router.get('/read', (req: Request, res: Response) => {
  const index = parseInt(req.query.index as string, 10);

  // Validate index
  if (isNaN(index) || index < 0) {
    return res.status(400).json({ error: 'Invalid index' });
  }

  // Read data from db.json
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read database:', err);
      return res.status(500).json({ error: 'Failed to read database' });
    }

    // Parse JSON data
    const submissions = JSON.parse(data);

    // Check if index is valid
    if (index >= submissions.length) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Return the submission at the specified index
    res.json(submissions[index]);
  });
});

export default router;
