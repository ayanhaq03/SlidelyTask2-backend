"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const dbPath = path_1.default.join(__dirname, '..', 'src', 'db.json');
// Function to ensure db.json exists and is initialized
const initializeDb = () => {
    if (!fs_1.default.existsSync(dbPath)) {
        fs_1.default.writeFileSync(dbPath, JSON.stringify([]), 'utf8');
    }
};
// Endpoint to check if server is running
router.get('/ping', (req, res) => {
    res.json({ success: true });
});
// Endpoint to save a submission
router.post('/submit', (req, res) => {
    console.log('Received submission:', req.body);
    const { name, email, phone, github_link, stopwatch_time } = req.body;
    if (!name || !email || !phone || !github_link || !stopwatch_time) {
        console.error('Validation error: All fields are required');
        return res.status(400).json({ error: 'All fields are required' });
    }
    const newSubmission = { name, email, phone, github_link, stopwatch_time };
    initializeDb();
    fs_1.default.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to read database:', err);
            return res.status(500).json({ error: 'Failed to read database' });
        }
        let submissions = [];
        try {
            submissions = JSON.parse(data);
        }
        catch (parseError) {
            console.error('Failed to parse database JSON:', parseError);
            return res.status(500).json({ error: 'Failed to parse database JSON' });
        }
        submissions.push(newSubmission);
        fs_1.default.writeFile(dbPath, JSON.stringify(submissions, null, 2), (err) => {
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
router.get('/readAll', (req, res) => {
    fs_1.default.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to read database:', err);
            return res.status(500).json({ error: 'Failed to read database' });
        }
        try {
            const submissions = JSON.parse(data);
            res.json(submissions);
        }
        catch (parseError) {
            console.error('Failed to parse database JSON:', parseError);
            res.status(500).json({ error: 'Failed to parse database JSON' });
        }
    });
});
// Endpoint to read a submission by index
router.get('/read', (req, res) => {
    const index = parseInt(req.query.index, 10);
    // Validate index
    if (isNaN(index) || index < 0) {
        return res.status(400).json({ error: 'Invalid index' });
    }
    // Read data from db.json
    fs_1.default.readFile(dbPath, 'utf8', (err, data) => {
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
exports.default = router;
