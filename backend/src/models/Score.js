import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    username: String,
    wpm: {
        type: Number,
        required: true
    },
    accuracy: {
        type: Number,
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    mode: {
        type: String,
        enum: ['words', 'time', 'quote', 'classic'],
        default: 'words'
    },
    difficulty: {
        type: String,
        enum: ['normal', 'expert', 'master', 'medium'],
        default: 'normal'
    },
    category: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for leaderboard efficiency
scoreSchema.index({ score: -1, createdAt: -1 });

const Score = mongoose.model('Score', scoreSchema);

export default Score;
