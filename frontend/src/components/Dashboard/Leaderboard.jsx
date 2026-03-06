import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Hash, User, Target, Zap } from 'lucide-react';

const Leaderboard = () => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                // Fetch top scores
                const q = query(
                    collection(db, 'scores'),
                    orderBy('score', 'desc'),
                    limit(50)
                );
                const querySnapshot = await getDocs(q);
                const scoresData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Get local guest best score if it exists
                let guestScore = null;
                try {
                    guestScore = JSON.parse(localStorage.getItem('guestBestScore'));
                } catch (e) {
                    console.error("Local storage read error", e);
                }

                if (guestScore) {
                    scoresData.push(guestScore);
                }

                // Sort again to ensure guest score is in the correct order
                scoresData.sort((a, b) => b.score - a.score);

                // Filter for unique per user (Top 1 score per user)
                const uniqueScores = [];
                const userScoreCounts = {}; // { userId/username: count }

                for (const score of scoresData) {
                    const identifier = score.userId || score.username;
                    if (!identifier) continue;

                    const currentCount = userScoreCounts[identifier] || 0;
                    if (currentCount < 1) {
                        uniqueScores.push(score);
                        userScoreCounts[identifier] = 1;
                    }
                }

                setScores(uniqueScores.slice(0, 20));
            } catch (error) {
                console.error("Leaderboard Sync Error:", error);
                setError(error.message);
                // Muted mock high-performers
                setScores([
                    { username: 'NeuralArchitect', wpm: 156, accuracy: 100 },
                    { username: 'SignalMatrix', wpm: 142, accuracy: 99 },
                    { username: 'CipherNode', wpm: 138, accuracy: 98 },
                    { username: 'DataTyper', wpm: 125, accuracy: 99 },
                    { username: 'VoidInput', wpm: 121, accuracy: 97 },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, []);

    const RankIcon = ({ index }) => {
        if (index === 0) return <Trophy size={16} className="text-[#FFD700]" />;
        if (index === 1) return <Medal size={16} className="text-[#C0C0C0]" />;
        if (index === 2) return <Medal size={16} className="text-[#CD7F32]" />;
        return <span className="text-xs font-semibold text-secondary/40">{index + 1}</span>;
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 md:space-y-10 mb-10 mt-4 md:mt-8">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-2 md:px-0">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-1 md:w-1.5 h-6 md:h-8 bg-primary rounded-full shadow-md shadow-primary/20" />
                    <div className="flex flex-col">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-text">Leaderboard</h2>
                        <p className="text-[10px] md:text-xs font-medium text-secondary/60">Top Typists Worldwide</p>
                    </div>
                </div>

                <div className="bg-sub px-3 md:px-4 py-1.5 md:py-2 rounded-lg flex items-center gap-3 md:gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <Target size={14} className="text-primary/70" />
                        <span className="text-[10px] md:text-xs font-semibold text-secondary/80">ACCURACY: 100%</span>
                    </div>
                    <div className="w-px h-3 bg-secondary/20" />
                    <div className="flex items-center gap-2">
                        <Hash size={14} className="text-primary/70" />
                        <span className="text-[10px] md:text-xs font-semibold text-secondary/80">TOP PLAYERS</span>
                    </div>
                </div>
            </header>

            <div className="bg-sub/30 rounded-2xl overflow-hidden shadow-sm border border-secondary/10">
                <div className="flex flex-col divide-y divide-secondary/10">
                    {/* LEADERBOARD HEADER MAP */}
                    <div className="hidden md:flex justify-between items-center px-6 md:px-8 py-3 bg-background/30 text-[10px] md:text-xs font-semibold text-secondary/60">
                        <div className="flex gap-4 items-center w-1/2">
                            <div className="w-8">RANK</div>
                            <div>PLAYER</div>
                        </div>
                        <div className="flex gap-4 w-1/2 justify-end">
                            <div className="w-20 md:w-24 text-right">SCORE</div>
                            <div className="w-16 md:w-24 text-right">WPM</div>
                        </div>
                    </div>

                    {scores.map((score, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.02 }}
                            key={score.id || index}
                            className={`flex flex-row items-center justify-between px-3 sm:px-6 md:px-8 py-2 md:py-3 transition-colors group relative ${score.id === 'local-guest' ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-primary/5 bg-sub/50'}`}
                        >
                            <div className="flex items-center gap-3 md:gap-4 w-[60%] md:w-1/2 overflow-hidden">
                                <div className="w-6 md:w-8 flex justify-center flex-shrink-0">
                                    <RankIcon index={index} />
                                </div>
                                <div className="hidden sm:flex w-8 h-8 rounded-full bg-background items-center justify-center text-secondary/40 group-hover:text-primary transition-colors flex-shrink-0 border border-secondary/5">
                                    <User size={14} />
                                </div>
                                <div className="flex flex-col min-w-0 pr-2">
                                    <p className="text-sm md:text-base font-semibold text-text truncate group-hover:text-primary transition-colors">
                                        {score.username || 'ANONYMOUS'}
                                    </p>
                                    <p className="text-[9px] md:text-[10px] text-secondary/60 truncate">
                                        {score.mode} {score.category && `• ${score.category}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 md:gap-6 w-[40%] md:w-1/2">
                                <div className="flex flex-col items-end w-20 md:w-24">
                                    <span className="text-base md:text-lg font-bold text-primary group-hover:scale-105 transition-transform origin-right">
                                        {score.score || Math.round(score.wpm * (score.accuracy / 100))}
                                    </span>
                                    <span className="md:hidden text-[9px] text-secondary/50">Score</span>
                                </div>

                                <div className="w-px h-6 bg-secondary/20 hidden md:block" />

                                <div className="flex flex-col items-end w-16 md:w-24">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm md:text-base font-bold text-text/80">{score.wpm}</span>
                                        <span className="hidden md:inline text-[9px] md:text-[10px] text-secondary/60 mb-0.5">WPM</span>
                                    </div>
                                    <span className="md:hidden text-[9px] text-secondary/50">WPM</span>
                                </div>
                            </div>

                            {index < 3 && (
                                <div className="absolute top-0 right-0 bottom-0 pr-4 flex items-center opacity-[0.03] pointer-events-none">
                                    <Zap size={24} className="text-primary rotate-12" />
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {scores.length === 0 && !loading && !error && (
                        <div className="py-20 text-center text-secondary/40 text-sm font-medium">
                            No scores found. Be the first to play!
                        </div>
                    )}

                    {error && (
                        <div className="p-20 text-center space-y-6">
                            <div className="text-rose-500 font-mono text-[10px] uppercase tracking-[0.4em] opacity-80">
                                LEADERBOARD_SYNC_FAILURE // {error}
                            </div>
                            <p className="text-[9px] text-secondary/40 max-w-xs mx-auto leading-relaxed">
                                Go to Firebase Console {'>'} Firestore Database {'>'} Rules and paste this:
                            </p>
                            <pre className="bg-background/80 p-6 rounded-2xl border border-primary/20 text-[8px] font-mono text-primary text-left overflow-x-auto max-w-sm mx-auto">
                                {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && (request.auth.uid == userId || request.auth.token.email == 'type@gmail.com');
    }
    match /scores/{scoreId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`}
                            </pre>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-8 py-3 bg-primary text-background font-black uppercase text-[10px] tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20"
                            >
                                RETRY_SYNC
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <footer className="text-center py-6">
                <p className="text-[10px] md:text-xs text-secondary/40">Verified high scores across all game modes</p>
            </footer>
        </div>
    );
};

export default Leaderboard;
