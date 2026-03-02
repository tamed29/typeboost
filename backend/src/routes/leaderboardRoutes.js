import express from 'express';
import Score from '../models/Score.js';

const router = express.Router();

// @route   GET /api/leaderboard
// @desc    Get global top scores
router.get('/', async (req, res) => {
    try {
        // Fetch top 50 scores, sorted by score descending
        const leaderboard = await Score.find()
            .sort({ score: -1, createdAt: -1 })
            .limit(50);

        res.json(leaderboard);
    } catch (error) {
        console.error(`❌ LEADERBOARD ERROR: ${error.message}`);
        res.status(500).json({ error: 'Failed to synchronize leaderboard' });
    }
});

export default router;
