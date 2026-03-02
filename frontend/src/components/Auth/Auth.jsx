import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../../config/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { User, Lock, Mail, ArrowRight, UserCircle, Fingerprint, Zap } from 'lucide-react';

const Auth = ({ onAuthChange, theme }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [regSuccess, setRegSuccess] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Check if username unique (simplified for this step)
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await setDoc(doc(db, 'users', user.uid), {
                    username: username || email.split('@')[0],
                    email: user.email,
                    role: user.email === 'type@gmail.com' ? 'admin' : 'user',
                    joinedAt: serverTimestamp(),
                    stats: { bestWpm: 0, averageWpm: 0, totalTests: 0 }
                });
                // REQUIRE MANUAL LOGIN: Sign out immediately after registration
                await auth.signOut();
                setRegSuccess(true);
                setIsLogin(true);
                setEmail('');
                setPassword('');
                setUsername('');
                return; // Don't call onAuthChange yet
            }
            onAuthChange?.();
        } catch (err) {
            setError(err.message.includes('auth/') ? err.message.split('/')[1].replace(/-/g, ' ') : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-sub/80 border border-white/5 p-6 sm:p-12 rounded-3xl sm:rounded-[3rem] shadow-4xl backdrop-blur-2xl">
            <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-10">
                    <div className="relative flex items-center justify-center scale-125 group">
                        <div className="w-14 h-14 border-2 border-primary bg-primary/5 rounded-2xl flex items-center justify-center rotate-3 transition-all duration-500 shadow-xl shadow-primary/20 group-hover:rotate-12 group-hover:scale-110">
                            <span className="text-primary font-black text-4xl relative z-10 -rotate-3 transition-all group-hover:-rotate-12">T</span>
                        </div>
                        <div className="absolute -right-3 -bottom-2 p-1.5 bg-background rounded-xl border border-white/5">
                            <Zap className="text-primary fill-primary animate-pulse" size={20} />
                        </div>
                    </div>
                </div>
                <h2 className="text-3xl font-black mb-2 tracking-tighter italic uppercase text-text">
                    {isLogin ? 'Access Node' : 'Register Genetic Signature'}
                </h2>
                <p className="text-secondary text-[9px] font-mono uppercase tracking-[0.5em] opacity-30">
                    Neural Synchronization Gateway
                </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
                <AnimatePresence mode="wait">
                    {!isLogin && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative"
                        >
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary opacity-20" size={18} />
                            <input
                                type="text"
                                placeholder="Universal Username"
                                className="w-full bg-background border border-white/5 rounded-2xl p-5 pl-14 focus:outline-none focus:border-primary/50 font-mono text-sm transition-all text-text select-auto pointer-events-auto"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required={!isLogin}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary opacity-20" size={18} />
                    <input
                        type="email"
                        placeholder="Neural ID (Email)"
                        className="w-full bg-background border border-white/5 rounded-2xl p-5 pl-14 focus:outline-none focus:border-primary/50 font-mono text-sm transition-all text-text select-auto pointer-events-auto"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary opacity-20" size={18} />
                    <input
                        type="password"
                        placeholder="Access Cipher"
                        className="w-full bg-background border border-white/5 rounded-2xl p-5 pl-14 focus:outline-none focus:border-primary/50 font-mono text-sm transition-all text-text select-auto pointer-events-auto"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-400 text-[10px] font-mono uppercase tracking-widest text-center bg-rose-500/5 py-4 rounded-2xl border border-rose-500/10">
                        Signal Error: {error}
                    </motion.div>
                )}

                {regSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 text-[10px] font-mono uppercase tracking-widest text-center bg-emerald-500/5 py-4 rounded-2xl border border-emerald-500/10">
                        Registration Successful // Manual Auth Required
                    </motion.div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:opacity-90 text-background font-black py-5 rounded-2xl shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-[11px] transition-all active:scale-95"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-3 border-background/20 border-t-background rounded-full animate-spin" />
                    ) : (
                        <>
                            {isLogin ? 'Establish Connection' : 'Register Operator'}
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-10 flex justify-center">
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-secondary hover:text-primary text-[10px] font-mono uppercase tracking-widest transition-colors opacity-50 hover:opacity-100"
                >
                    {isLogin ? "Generate New Operator Node" : "Existing Operator Signature?"}
                </button>
            </div>
        </div>
    );
};

export default Auth;
