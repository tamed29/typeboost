import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import {
    collection,
    query,
    getDocs,
    getDoc,
    deleteDoc,
    doc,
    updateDoc,
    orderBy,
    limit,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    Users,
    BarChart3,
    Settings,
    Search,
    Trash2,
    UserCircle,
    Activity,
    Database,
    Zap,
    ArrowUpRight,
    Terminal as TerminalIcon,
    Filter,
    ArrowRight,
    Clock,
    Medal,
    AlertTriangle
} from 'lucide-react';
import { Line } from 'react-chartjs-2';

const AdminPage = ({ theme, activeSection, setActiveSection }) => {
    const [users, setUsers] = useState([]);
    const [scores, setScores] = useState([]);
    const [stats, setStats] = useState({ totalGames: 0, averageWpm: 0, activeToday: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [verificationState, setVerificationState] = useState({ active: false, targetUser: null, targetId: null });
    const [adminPassword, setAdminPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ username: '', role: '' });
    const [systemConfig, setSystemConfig] = useState({ difficulty: 'normal', publicAccess: true });

    useEffect(() => {
        const fetchSystemConfig = async () => {
            try {
                const configSnap = await getDoc(doc(db, 'config', 'system'));
                if (configSnap.exists()) setSystemConfig(configSnap.data());
            } catch (e) { console.warn("Config sync error", e); }
        };
        const fetchAllData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Fetch Users
                const usersSnap = await getDocs(collection(db, 'users'));
                const usersList = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                setUsers(usersList);

                // 2. Fetch Scores
                let scoresList = [];
                try {
                    const q = query(collection(db, 'scores'), orderBy('createdAt', 'desc'), limit(100));
                    const scoresSnap = await getDocs(q);
                    scoresList = scoresSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                    setScores(scoresList);
                } catch (scoreErr) {
                    if (scoreErr.code === 'failed-precondition') {
                        const qBasic = query(collection(db, 'scores'), limit(100));
                        const scoresSnap = await getDocs(qBasic);
                        scoresList = scoresSnap.docs.map(d => ({ id: d.id, ...d.data() }))
                            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                        setScores(scoresList);
                    } else throw scoreErr;
                }
                // The original setScores(scoresList) was here, now moved inside try/catch blocks

                const totalWpm = scoresList.reduce((acc, curr) => acc + (curr.wpm || 0), 0);
                setStats({
                    totalGames: scoresList.length,
                    averageWpm: Math.round(totalWpm / Math.max(1, scoresList.length)),
                    activeToday: usersList.length
                });
            } catch (err) {
                console.error("Critical Admin Sync Failure:", err);
                setError(err.code === 'permission-denied' ? "ACCESS_DENIED: Critical Admin Breach Detected." : err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSystemConfig();
        fetchAllData();
    }, []);

    const updateSystemConfig = async (newConfig) => {
        try {
            const configRef = doc(db, 'config', 'system');
            await setDoc(configRef, newConfig, { merge: true });
            setSystemConfig(prev => ({ ...prev, ...newConfig }));
        } catch (e) { alert("System override failed."); }
    };

    const handleUpdateUser = async () => {
        try {
            const userRef = doc(db, 'users', editingUser.id);
            await updateDoc(userRef, {
                username: editForm.username,
                role: editForm.role
            });
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u));
            setEditingUser(null);
        } catch (e) {
            console.error(e);
            alert("Update Failed: Security Breach or Network Error");
        }
    };

    const confirmDeletion = async () => {
        if (adminPassword !== 'type11') {
            setPasswordError(true);
            return;
        }
        try {
            await deleteDoc(doc(db, 'users', verificationState.targetId));
            setUsers(users.filter(u => u.id !== verificationState.targetId));
            setVerificationState({ active: false, targetUser: null, targetId: null });
        } catch (e) { console.error(e); }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-[10px] font-mono text-primary uppercase tracking-[0.5em] animate-pulse">Establishing Root Link...</span>
        </div>
    );

    if (error) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 text-center px-6">
            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-500">
                <ShieldCheck size={48} />
            </div>
            <div className="space-y-4">
                <h3 className="text-3xl font-black italic uppercase text-rose-500 tracking-tighter">Security Protocol Failure</h3>
                <p className="text-[11px] font-mono text-secondary uppercase tracking-[0.4em] opacity-60 max-w-md mx-auto leading-relaxed">{error}</p>
            </div>
            <div className="bg-sub border border-primary/20 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl">
                <p className="text-[10px] text-secondary/40 mb-6 uppercase tracking-widest leading-relaxed">Copy-paste this to your Firebase Console (Build &gt; Firestore Database &gt; Rules):</p>
                <div className="relative group">
                    <pre className="bg-background/80 p-6 rounded-2xl text-[8px] font-mono text-primary text-left overflow-x-auto border border-primary/10">
                        {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && (request.auth.uid == userId || request.auth.token.email == 'type@gmail.com');
    }
    match /scores/{scoreId} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth != null && request.auth.token.email == 'type@gmail.com';
    }
  }
}`}
                    </pre>
                </div>
            </div>
            <button onClick={() => window.location.reload()} className="px-12 py-4 bg-primary text-background font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/20 hover:opacity-90 transition-all">Retry Authorization</button>
        </div>
    );

    return (
        <div className="space-y-12">
            <AnimatePresence mode="wait">
                {activeSection === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard icon={Users} label="Operatives" value={users.length} color="text-primary" />
                            <StatCard icon={Activity} label="Total Cycles" value={stats.totalGames} color="text-secondary" />
                            <StatCard icon={BarChart3} label="Global Pace" value={`${stats.averageWpm} WPM`} color="text-text" />
                            <StatCard icon={ShieldCheck} label="System Health" value="100%" color="text-emerald-500" />
                        </section>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2 bg-sub p-10 rounded-[3rem] border border-border-sub shadow-2xl">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-xl font-black uppercase italic text-text tracking-tighter">Velocity Distribution</h3>
                                    <span className="text-[10px] font-mono text-secondary uppercase tracking-[0.3em] opacity-40">Live Telemetry Feedback</span>
                                </div>
                                <div className="h-[350px] flex items-end justify-between gap-4">
                                    {/* Mock Graph Bars */}
                                    {[65, 80, 45, 90, 70, 55, 85, 60, 95, 75].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ delay: i * 0.1, duration: 1 }}
                                            className="flex-1 bg-primary/20 rounded-t-xl relative group hover:bg-primary transition-all cursor-pointer"
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                                                {h + 20} WPM
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-sub p-10 rounded-[3rem] border border-border-sub shadow-2xl space-y-8">
                                <h3 className="text-xl font-black uppercase italic text-text tracking-tighter mb-4">Neural Activity</h3>
                                {(scores.length > 0 ? scores.slice(0, 5) : [
                                    { createdAt: { seconds: Date.now() / 1000 }, mode: 'MOCK', username: 'waiting_for_data' }
                                ]).map((log, i) => (
                                    <div key={i} className="flex flex-col p-4 bg-background/40 border border-border-sub rounded-2xl hover:border-primary/30 transition-all cursor-default">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-black uppercase text-primary">SESSION_SYNC_{log.mode?.toUpperCase()}</span>
                                            <span className="text-[9px] font-mono text-secondary opacity-40">
                                                {log.createdAt?.seconds ? new Date(log.createdAt.seconds * 1000).toLocaleTimeString() : 'RECENT'}
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-mono text-secondary lowercase">@ {log.username || 'unknown_node'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeSection === 'users' && (
                    <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div className="bg-sub p-10 rounded-[3rem] border border-border-sub shadow-2xl">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-text">Operative Directory</h2>
                                <div className="relative w-full md:w-96">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary opacity-20" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search Cipher Signatures..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-background/50 border border-border-sub rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-primary/50 font-mono text-xs transition-all text-text"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                                {users.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase())).map((user, i) => (
                                    <div key={i} className="flex flex-wrap items-center justify-between p-6 bg-background/40 border border-border-sub rounded-3xl hover:border-primary/50 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-sub border border-border-sub flex items-center justify-center text-secondary group-hover:text-primary transition-all">
                                                <UserCircle size={28} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-lg font-black uppercase tracking-tight text-text">{user.username || 'ANON_NODE'}</span>
                                                <span className="text-[10px] font-mono text-secondary lowercase opacity-40">{user.email}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-12">
                                            <div className="hidden lg:flex flex-col items-end">
                                                <span className="text-[8px] font-mono text-secondary uppercase tracking-widest opacity-30">Status</span>
                                                <span className={`text-[10px] font-bold uppercase ${user.role === 'admin' ? 'text-primary' : 'text-emerald-500'}`}>{user.role || 'Operative'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setEditForm({ username: user.username || '', role: user.role || 'user' });
                                                    }}
                                                    className="w-12 h-12 flex items-center justify-center bg-sub/10 text-secondary hover:text-primary hover:bg-primary/5 border border-primary/20 rounded-2xl transition-all"
                                                >
                                                    <ArrowUpRight size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setVerificationState({ active: true, targetUser: user.username, targetId: user.id })}
                                                    className="w-12 h-12 flex items-center justify-center bg-sub/10 text-secondary hover:text-rose-400 hover:bg-rose-500/5 border border-border-sub rounded-2xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeSection === 'telemetry' && (
                    <motion.div key="telemetry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                        <div className="bg-sub p-12 rounded-[3.5rem] border border-border-sub shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-text mb-4">Neural Data Matrix</h2>
                                <p className="text-secondary text-[10px] font-mono uppercase tracking-[0.5em] opacity-40 mb-16">Global Session Synchronization History</p>

                                <div className="space-y-4">
                                    {scores.map((score, i) => (
                                        <div key={i} className="grid grid-cols-2 md:grid-cols-4 items-center p-8 bg-background/40 border border-border-sub rounded-3xl group hover:bg-primary/[0.03] transition-all">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black uppercase text-text">{score.username || 'ANON'}</span>
                                                <span className="text-[9px] font-mono text-secondary opacity-40">NODE_SYNC_{i}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl font-black text-primary italic">{score.wpm}</span>
                                                <span className="text-[8px] font-mono text-secondary uppercase tracking-widest opacity-20">Velocity</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-lg font-bold text-text opacity-60">{score.accuracy}%</span>
                                                <span className="text-[8px] font-mono text-secondary uppercase tracking-widest opacity-20">Fidelity</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="bg-primary/10 text-primary text-[8px] px-3 py-1 rounded-full uppercase font-black">{score.mode}</span>
                                                <span className="text-[8px] font-mono text-secondary opacity-30 mt-1 uppercase tracking-widest">Protocol</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Zap className="absolute -right-20 -bottom-20 text-primary opacity-[0.02] w-96 h-96 -rotate-12 pointer-events-none" />
                        </div>
                    </motion.div>
                )}

                {activeSection === 'controls' && (
                    <motion.div key="controls" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 max-w-4xl">
                        <section className="bg-sub p-12 rounded-[3.5rem] border border-border-sub shadow-2xl space-y-16">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black italic uppercase text-text tracking-tighter">System Configuration</h2>
                                <p className="text-secondary text-[9px] font-mono uppercase tracking-[0.5em] opacity-40">Core Behavior Deployment</p>
                            </div>

                            <ControlItem label="Difficulty Protocols" description="Manage global difficulty distribution rules." icon={Settings}>
                                <div className="flex bg-background/50 p-1.5 rounded-2xl border border-border-sub">
                                    {['normal', 'expert', 'master'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => updateSystemConfig({ difficulty: m })}
                                            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${systemConfig.difficulty === m ? 'bg-primary text-background' : 'text-secondary hover:text-text'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </ControlItem>

                            <ControlItem label="Terminal Status" description="Toggle public access to leaderboard sync." icon={Database}>
                                <div
                                    onClick={() => updateSystemConfig({ publicAccess: !systemConfig.publicAccess })}
                                    className={`w-14 h-8 rounded-full p-1 relative cursor-pointer transition-all ${systemConfig.publicAccess ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full absolute shadow-sm transition-all ${systemConfig.publicAccess ? 'right-1' : 'left-1'}`} />
                                </div>
                            </ControlItem>
                        </section>
                    </motion.div>
                )}

                {activeSection === 'profile' && (
                    <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 max-w-4xl">
                        <div className="bg-sub p-12 rounded-[3.5rem] border border-border-sub shadow-2xl flex flex-col items-center text-center">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-primary p-1 mb-10 shadow-3xl shadow-primary/20">
                                <div className="w-full h-full rounded-[2.3rem] bg-background flex items-center justify-center text-5xl font-black text-primary uppercase italic">
                                    {auth.currentUser?.email?.[0]}
                                </div>
                            </div>
                            <h2 className="text-4xl font-black uppercase italic text-primary tracking-tighter mb-4">{auth.currentUser?.email?.split('@')[0]}</h2>
                            <p className="text-secondary text-[10px] font-mono uppercase tracking-[0.6em] mb-12">Master System Administrator</p>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="p-8 bg-background/40 border border-border-sub rounded-3xl">
                                    <span className="text-[8px] font-mono text-secondary uppercase tracking-[0.5em] block mb-2 opacity-40">Root Access</span>
                                    <span className="text-lg font-black text-emerald-500 italic uppercase">Verified</span>
                                </div>
                                <div className="p-8 bg-background/40 border border-border-sub rounded-3xl">
                                    <span className="text-[8px] font-mono text-secondary uppercase tracking-[0.5em] block mb-2 opacity-40">Session Stability</span>
                                    <span className="text-lg font-black text-primary italic uppercase">Nominal</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* EDIT USER MODAL */}
            <AnimatePresence>
                {editingUser && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[800] flex items-center justify-center bg-black/90 backdrop-blur-3xl px-6">
                        <div className="bg-sub border border-primary/20 w-full max-w-md p-10 rounded-[3rem] shadow-4xl">
                            <div className="flex items-center gap-4 text-primary mb-10">
                                <ShieldCheck size={32} />
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Edit Operative</h3>
                            </div>

                            <div className="space-y-6">
                                {editingUser.stats && (
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-background/50 border border-border-sub p-4 rounded-2xl text-center">
                                            <span className="text-[8px] font-mono text-secondary uppercase block mb-1">Best WPM</span>
                                            <span className="text-lg font-black text-primary italic">{editingUser.stats.bestWpm || 0}</span>
                                        </div>
                                        <div className="bg-background/50 border border-border-sub p-4 rounded-2xl text-center">
                                            <span className="text-[8px] font-mono text-secondary uppercase block mb-1">Total Cycles</span>
                                            <span className="text-lg font-black text-text italic">{editingUser.stats.totalGames || 0}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-[9px] font-mono text-secondary uppercase tracking-widest pl-2">Username Alias</label>
                                    <input
                                        type="text"
                                        value={editForm.username}
                                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                        className="w-full bg-background border border-border-sub rounded-2xl p-5 font-mono text-xs focus:border-primary/50 outline-none text-text transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-mono text-secondary uppercase tracking-widest pl-2">Authorization Level</label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        className="w-full bg-background border border-border-sub rounded-2xl p-5 font-mono text-xs focus:border-primary/50 outline-none text-text transition-all appearance-none"
                                    >
                                        <option value="user">USER_PROTOCOL</option>
                                        <option value="admin">ADMIN_COMMAND</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-12">
                                <button onClick={() => setEditingUser(null)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-text bg-background border border-border-sub rounded-2xl">Abort</button>
                                <button onClick={handleUpdateUser} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest bg-primary text-background rounded-2xl shadow-xl shadow-primary/20">Commit Changes</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DELETION DIALOG */}
            <AnimatePresence>
                {verificationState.active && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[800] flex items-center justify-center bg-black/95 backdrop-blur-3xl px-6">
                        <div className="bg-sub border border-rose-500/20 w-full max-w-md p-10 rounded-[3rem] shadow-3xl">
                            <div className="flex items-center gap-4 text-rose-500 mb-6">
                                <AlertTriangle size={32} />
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Purge Protocol</h3>
                            </div>
                            <p className="text-secondary text-[11px] font-mono leading-relaxed mb-10 opacity-80">
                                You are initializing the permanent erasure of operative <span className="text-text font-black">[{verificationState.targetUser}]</span>. This action cannot be reverted. Enter master authorization cipher.
                            </p>

                            <input
                                type="password"
                                placeholder="Root Password"
                                value={adminPassword}
                                onChange={(e) => { setAdminPassword(e.target.value); setPasswordError(false); }}
                                className={`w-full bg-background border rounded-2xl p-5 text-center font-mono tracking-widest outline-none mb-6 transition-all ${passwordError ? 'border-rose-500 text-rose-500 shadow-rose' : 'border-primary/20 text-text focus:border-primary'}`}
                            />

                            <div className="flex gap-4">
                                <button onClick={() => setVerificationState({ active: false, targetUser: null, targetId: null })} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-text bg-background border border-border-sub rounded-2xl hover:bg-sub transition-all">Abort</button>
                                <button onClick={confirmDeletion} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest bg-rose-500 text-background rounded-2xl hover:opacity-90 shadow-2xl shadow-rose-500/20 transition-all">Purge</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-sub border border-border-sub p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:border-primary/50 transition-all">
        <div className="flex flex-col relative z-10">
            <span className="text-[9px] font-mono text-secondary uppercase tracking-[0.4em] mb-4 opacity-40">{label}</span>
            <span className={`text-5xl font-black italic tracking-tighter ${color} mb-2`}>{value}</span>
        </div>
        <Icon className={`absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-700 ${color}`} size={120} />
    </div>
);

const ControlItem = ({ label, description, icon: Icon, children }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-10 bg-background/30 border border-border-sub rounded-3xl hover:border-primary/20 transition-all">
        <div className="flex items-center gap-6">
            <div className="p-4 bg-background rounded-2xl border border-border-sub text-primary"><Icon size={24} /></div>
            <div className="flex flex-col">
                <span className="text-lg font-black uppercase tracking-tighter italic text-text">{label}</span>
                <span className="text-[10px] font-mono text-secondary uppercase opacity-40">{description}</span>
            </div>
        </div>
        {children}
    </div>
);

export default AdminPage;
