import express from 'express';
import Score from '../models/Score.js';

const router = express.Router();

// @route   POST /api/scores
// @desc    Save a new game score
router.post('/', async (req, res) => {
    try {
        const { userId, username, wpm, accuracy, score, mode, difficulty, category } = req.body;

        // Strict Validation for production
        if (typeof wpm !== 'number' || typeof accuracy !== 'number') {
            return res.status(400).json({ error: 'Invalid or incomplete score telemetry' });
        }

        const newScore = new Score({
            userId: userId || 'anonymous',
            username: username || 'Operator',
            wpm,
            accuracy,
            score: score || Math.round(wpm * (accuracy / 100)),
            mode: mode || 'words',
            difficulty: difficulty || 'normal',
            category: category || 'General'
        });

        await newScore.save();
        res.status(201).json({
            message: 'Synchronization Complete',
            id: newScore._id
        });
    } catch (error) {
        console.error(`❌ SCORE SAVE ERROR: ${error.message}`);
        res.status(500).json({ error: 'Telemetry storage failed' });
    }
});

// @route   GET /api/scores/:userId
// @desc    Get score history for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userScores = await Score.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(userScores);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve history' });
    }
});

export default router;
