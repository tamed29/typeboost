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
                // Fetch top 20 scores
                const q = query(
                    collection(db, 'scores'),
                    orderBy('wpm', 'desc'),
                    limit(20)
                );
                const querySnapshot = await getDocs(q);
                const scoresData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Filter for unique per user (Top 2 scores per operative)
                const uniqueScores = [];
                const userScoreCounts = {}; // { userId/username: count }

                for (const score of scoresData) {
                    const identifier = score.userId || score.username;
                    if (!identifier) continue;

                    const currentCount = userScoreCounts[identifier] || 0;
                    if (currentCount < 2) {
                        uniqueScores.push(score);
                        userScoreCounts[identifier] = currentCount + 1;
                    }
                }

                setScores(uniqueScores);
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
        if (index === 0) return <Trophy size={20} className="text-primary fill-primary/10" />;
        if (index === 1) return <Medal size={20} className="text-secondary" />;
        if (index === 2) return <Star size={20} className="text-secondary/50" />;
        return <span className="text-[11px] font-mono opacity-20">{index + 1}</span>;
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-16">
            <header className="flex flex-col md:flex-row items-center justify-between gap-8 px-4">
                <div className="flex items-center gap-6">
                    <div className="w-2 h-12 bg-primary rounded-full shadow-lg shadow-primary/20" />
                    <div className="flex flex-col">
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase text-text">Synchronization Hall</h2>
                        <p className="text-[9px] font-mono text-secondary uppercase tracking-[0.5em] opacity-40">Elite Terminal Rankins v5.0</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-sub px-6 py-3 rounded-2xl flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <Target size={14} className="text-primary" />
                            <span className="text-[10px] font-mono text-secondary uppercase tracking-[0.2em]">MAX_ENTROPY: 0.0</span>
                        </div>
                        <div className="w-px h-4 bg-primary/20" />
                        <div className="flex items-center gap-3">
                            <Hash size={14} className="text-primary" />
                            <span className="text-[10px] font-mono text-secondary uppercase tracking-[0.2em]">CAPACITY: 20_NODES</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="bg-sub rounded-[3rem] overflow-hidden">
                <div className="grid grid-cols-1 divide-y divide-primary/5">
                    {/* LEADERBOARD HEADER MAP */}
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-10 py-6 bg-background/20 font-mono text-[9px] uppercase tracking-[0.5em] text-secondary opacity-70">
                        <div className="col-span-1">RANK</div>
                        <div className="col-span-5">OPERATIVE SIGNATURE</div>
                        <div className="col-span-3 text-right">VELOCITY (WPM)</div>
                        <div className="col-span-3 text-right">PRECISION (ACC)</div>
                    </div>

                    {scores.map((score, index) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.03 }}
                            key={score.id || index}
                            className="lg:grid lg:grid-cols-12 flex flex-col items-center lg:items-center gap-6 lg:gap-4 lg:px-10 px-6 py-10 lg:py-8 hover:bg-primary/[0.02] transition-colors group relative"
                        >
                            <div className="col-span-1 flex items-center justify-center lg:justify-start">
                                <RankIcon index={index} />
                            </div>

                            <div className="col-span-5 flex items-center gap-6 w-full lg:w-auto">
                                <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-background items-center justify-center text-secondary/30 group-hover:text-primary transition-all">
                                    <User size={22} />
                                </div>
                                <div className="space-y-1 text-center lg:text-left w-full lg:w-auto">
                                    <p className="text-lg font-black italic uppercase tracking-tight text-text group-hover:text-primary transition-all">
                                        {score.username || 'ANONYMOUS_SYS'}
                                    </p>
                                    <p className="text-[9px] font-mono text-secondary uppercase tracking-[0.4em] opacity-40">
                                        NODE_VERIFIED // {score.mode} {score.category && `[${score.category}]`}
                                    </p>
                                </div>
                            </div>

                            <div className="col-span-3 flex flex-col lg:items-end items-center w-full lg:w-auto">
                                <span className="text-4xl font-black italic text-primary tracking-tighter group-hover:scale-110 duration-500 transition-transform">{score.wpm}</span>
                                <span className="text-[8px] font-mono text-secondary uppercase tracking-[0.2em] opacity-20">Link_Velocity</span>
                            </div>

                            <div className="col-span-3 flex flex-col lg:items-end items-center w-full lg:w-auto">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-text opacity-60 italic">{score.accuracy}</span>
                                    <span className="text-[9px] font-mono text-secondary opacity-40">%</span>
                                </div>
                                <span className="text-[8px] font-mono text-secondary uppercase tracking-[0.2em] opacity-20">Neural_Fidelity</span>
                            </div>

                            {index < 3 && (
                                <div className="absolute top-0 right-0 p-2 opacity-5">
                                    <Zap size={100} className="text-primary rotate-12" />
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {scores.length === 0 && !loading && !error && (
                        <div className="p-32 text-center opacity-20 font-mono text-[10px] uppercase tracking-[0.8em]">
                            No telemetry data detected in this cycle.
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

            <footer className="text-center opacity-20 py-10">
                <p className="text-[9px] font-mono text-secondary uppercase tracking-[0.5em]">Real-time Displacement Protocol Active // High Velocity Filter Engaged</p>
            </footer>
        </div>
    );
};

export default Leaderboard;
