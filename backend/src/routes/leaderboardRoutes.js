import express from 'express';
const router = express.Router();

// Mock leaderboard data
const leaderboard = [
    { username: 'TypingGenius', wpm: 120, accuracy: 98 },
    { username: 'SpeedDemon', wpm: 115, accuracy: 95 },
    { username: 'QuickFingers', wpm: 105, accuracy: 97 },
    { username: 'WordWizard', wpm: 95, accuracy: 99 },
];

// @route   GET /api/leaderboard
// @desc    Get global top scores
router.get('/', (req, res) => {
    res.json(leaderboard.sort((a, b) => b.wpm - a.wpm));
});

export default router;
