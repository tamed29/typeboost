import express from 'express';
const router = express.Router();

// Mock data for now until Firebase is connected
let scores = [];

// @route   POST /api/scores
// @desc    Save a new game score
router.post('/', async (req, res) => {
    try {
        const { userId, wpm, accuracy, mode, difficulty } = req.body;

        // Validation
        if (!wpm || !accuracy) {
            return res.status(400).json({ error: 'Incomplete score data' });
        }

        const newScore = {
            userId: userId || 'anonymous',
            wpm,
            accuracy,
            mode: mode || 'classic',
            difficulty: difficulty || 'medium',
            createdAt: new Date().toISOString()
        };

        scores.push(newScore);
        res.status(201).json({ message: 'Score saved successfully', score: newScore });
    } catch (error) {
        res.status(500).json({ error: 'Server error saving score' });
    }
});

// @route   GET /api/scores/:userId
// @desc    Get score history for a user
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    const userScores = scores.filter(s => s.userId === userId);
    res.json(userScores);
});

export default router;
