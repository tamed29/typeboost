import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Activity, User, Trophy, Calendar, Zap, Edit3 } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ProfilePage = ({ theme, userInfo }) => {
    const [stats, setStats] = useState({ bestWpm: 0, avgWpm: 0, accuracy: 0, totalGames: 0 });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [updating, setUpdating] = useState(false);

    const displayName = userInfo?.username || auth.currentUser?.email?.split('@')[0] || 'Anonymous Typer';

    useEffect(() => {
        const fetchUserData = async () => {
            if (!auth.currentUser) return;
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch scores with resilient logic
                let data = [];
                try {
                    const q = query(
                        collection(db, 'scores'),
                        where('userId', '==', auth.currentUser.uid),
                        orderBy('createdAt', 'desc'),
                        limit(25)
                    );
                    const querySnapshot = await getDocs(q);
                    data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                } catch (idxErr) {
                    console.warn("Optimal Profile Query Restricted:", idxErr.code);
                    if (idxErr.code === 'failed-precondition') {
                        // FALLBACK: Fetch all user scores and sort in memory
                        const qBasic = query(
                            collection(db, 'scores'),
                            where('userId', '==', auth.currentUser.uid),
                            limit(50)
                        );
                        const querySnapshot = await getDocs(qBasic);
                        data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                    } else {
                        throw idxErr;
                    }
                }

                setHistory(data);

                if (data.length > 0) {
                    const wpms = data.map(s => s.wpm || 0);
                    const best = Math.max(...wpms);
                    const avg = Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length);
                    const acc = Math.round(data.reduce((a, b) => a + (b.accuracy || 0), 0) / data.length);
                    setStats({
                        bestWpm: best,
                        avgWpm: avg,
                        accuracy: acc,
                        totalGames: data.length
                    });
                }
            } catch (err) {
                console.warn("Profile Sync Restricted:", err.code);
                if (err.code === 'failed-precondition') {
                    setError("INDEX_REQUIRED: Statistical sorting requires a database index. Please check your browser console for a blue link to auto-generate the index.");
                } else if (err.code === 'permission-denied') {
                    setError("ACCESS_DENIED: You do not have permission to view these stats.");
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleUpdateProfile = async () => {
        if (!newUsername.trim() || !auth.currentUser) return;
        setUpdating(true);
        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userRef, {
                username: newUsername.trim(),
                updatedAt: new Date(),
                role: 'user' // Default role for new profiles
            }, { merge: true });
            setEditing(false);
            // Reload page or force re-fetch user info (best to let App.jsx handle or just reload)
            window.location.reload();
        } catch (err) {
            console.error("Update Error:", err);
        } finally {
            setUpdating(false);
        }
    };

    // Get CSS Variable value
    const getVar = (name) => getComputedStyle(document.body).getPropertyValue(name).trim();

    const chartData = {
        labels: history.map((_, i) => `S-${history.length - i}`).reverse(),
        datasets: [
            {
                label: 'WPM VELOCITY',
                data: history.map(s => s.wpm).reverse(),
                borderColor: getVar('--primary') || '#3b82f6',
                backgroundColor: `${getVar('--primary')}20` || 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: getVar('--sub'),
                titleColor: getVar('--text'),
                bodyColor: getVar('--primary'),
                borderColor: getVar('--primary'),
                borderWidth: 1,
            }
        },
        scales: {
            x: {
                display: false,
                grid: { display: false }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: getVar('--secondary'), font: { family: 'JetBrains Mono' } }
            }
        }
    };

    const StatCard = ({ label, value, color, description }) => (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-8 rounded-[2rem] border border-border-sub bg-sub shadow-2xl backdrop-blur-md transition-all duration-500"
        >
            <div className="flex flex-col items-center text-center">
                <span className="text-[10px] font-mono text-secondary uppercase tracking-[0.3em] mb-4">{label}</span>
                <span className={`text-6xl font-black tracking-tighter mb-2 ${color}`}>{value}</span>
                <span className="text-[9px] text-secondary uppercase tracking-widest">{description}</span>
            </div>
        </motion.div>
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-primary font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Loading Profile...</span>
        </div>
    );

    return (
        <div className="w-full max-w-6xl mx-auto space-y-16 py-8">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] flex items-center justify-between gap-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-500 text-background rounded-full"><Zap size={16} /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Data Load Warning</p>
                            <p className="text-[9px] font-mono text-secondary uppercase tracking-widest opacity-60">Could not load latest stats due to database permission rules.</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* PROFILE HEADER */}
            <header className="flex flex-col md:flex-row items-center gap-10">
                <motion.div
                    initial={{ rotate: -10, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    className="w-40 h-40 rounded-[2.5rem] bg-primary p-1 shadow-2xl shadow-primary/20"
                >
                    <div className="w-full h-full rounded-[2.3rem] bg-background flex items-center justify-center font-black text-6xl text-primary">
                        {auth.currentUser?.email?.[0].toUpperCase()}
                    </div>
                </motion.div>
                <div className="text-center md:text-left flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                        {editing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="bg-background border border-primary/30 rounded-xl px-4 py-2 text-2xl font-black uppercase italic tracking-tighter text-primary outline-none focus:border-primary"
                                    placeholder="New Username"
                                />
                                <button
                                    disabled={updating}
                                    onClick={handleUpdateProfile}
                                    className="p-2 bg-primary text-background rounded-xl hover:opacity-90 disabled:opacity-50"
                                >
                                    {updating ? '...' : 'SAVE'}
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="p-2 bg-sub text-secondary rounded-xl hover:text-rose-400"
                                >
                                    CANCEL
                                </button>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-6xl font-black tracking-tight uppercase italic text-primary">
                                    {displayName}
                                </h1>
                                <button
                                    onClick={() => {
                                        setNewUsername(displayName);
                                        setEditing(true);
                                    }}
                                    className="p-2 bg-sub text-secondary rounded-xl hover:text-primary transition-all border border-border-sub"
                                    title="Edit Profile"
                                >
                                    <Activity size={16} />
                                </button>
                            </>
                        )}
                    </div>
                    <div className="flex wrap justify-center md:justify-start gap-4">
                        <span className="bg-primary/10 text-primary text-[9px] px-6 py-2 rounded-xl border border-primary/20 font-mono uppercase tracking-widest">Verified Typer</span>
                    </div>
                </div>
            </header>

            {/* CHARTS & ANALYTICS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-10 rounded-[2.5rem] border border-border-sub bg-sub shadow-2xl h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black uppercase italic tracking-tighter text-primary">Performance Trend</h3>
                        <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">WPM Progression (Last 20)</span>
                    </div>
                    <div className="h-full pb-10">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <StatCard label="Highest Speed" value={stats.bestWpm} color="text-primary" description="Words Per Minute" />
                    <StatCard label="Accuracy" value={`${stats.accuracy}%`} color="text-primary" description="Keystroke Accuracy" />
                </div>
            </div>

            {/* CORE STATS (Remaining) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <StatCard label="Average Speed" value={stats.avgWpm} color="text-primary" description="Average Across All Games" />
                <StatCard label="Games Played" value={stats.totalGames} color="text-secondary" description="Total games completed" />
            </div>

            {/* ACTIVITY LOG */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black flex items-center gap-4 italic tracking-tight text-primary">
                        <span className="w-2 h-8 bg-primary rounded-full" />
                        RECENT ACTIVITY
                    </h3>
                </div>

                <div className="rounded-[2rem] border border-border-sub bg-sub/40 overflow-hidden shadow-2xl">
                    <table className="w-full text-left font-mono text-[10px]">
                        <thead>
                            <tr className="border-b border-border-sub bg-sub/50 transition-colors">
                                <th className="p-8 text-secondary uppercase tracking-[0.3em] font-black">Game Session</th>
                                <th className="p-8 text-secondary uppercase tracking-[0.3em] font-black text-center">Speed (WPM)</th>
                                <th className="p-8 text-secondary uppercase tracking-[0.3em] font-black text-center">Accuracy</th>
                                <th className="p-8 text-secondary uppercase tracking-[0.3em] font-black text-right">Date / Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-sub text-secondary">
                            {history.map((s, i) => (
                                <tr key={s.id || i} className="hover:bg-primary/5 transition-all group">
                                    <td className="p-8 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary group-hover:animate-ping" />
                                        <span className="font-black italic">GAME_{i}</span>
                                    </td>
                                    <td className="p-8 text-center text-2xl font-black group-hover:text-primary transition-colors">
                                        {s.wpm}
                                    </td>
                                    <td className="p-8 text-center text-primary font-bold text-lg">{s.accuracy || 100}%</td>
                                    <td className="p-8 text-right text-secondary italic opacity-50">
                                        {s.createdAt?.seconds ? new Date(s.createdAt.seconds * 1000).toLocaleString() : 'Recent'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default ProfilePage;
