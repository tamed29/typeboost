import { useState } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ShieldCheck, Lock, Mail, ArrowRight, Zap } from 'lucide-react';

const AdminLogin = ({ onAdminAuth }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdminAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (email !== 'type@gmail.com' || password !== 'type11') {
            setError('ACCESS DENIED: INVALID COMMAND CREDENTIALS');
            setLoading(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            onAdminAuth?.();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-sub/80 border border-primary/20 p-12 rounded-[3rem] shadow-4xl backdrop-blur-2xl">
            <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-10">
                    <div className="relative flex items-center justify-center scale-125 group">
                        <div className="w-14 h-14 border-2 border-primary bg-primary/5 rounded-2xl flex items-center justify-center rotate-3 transition-all duration-500 shadow-xl shadow-primary/20 group-hover:rotate-12 group-hover:scale-110">
                            <ShieldCheck className="text-primary" size={32} />
                        </div>
                        <div className="absolute -right-3 -bottom-2 p-1.5 bg-background rounded-xl border border-white/5">
                            <Zap className="text-primary fill-primary animate-pulse" size={20} />
                        </div>
                    </div>
                </div>
                <h2 className="text-3xl font-black mb-2 tracking-tighter italic uppercase text-text">
                    Command Authorization
                </h2>
                <p className="text-rose-500 text-[9px] font-mono uppercase tracking-[0.5em] opacity-80">
                    Restricted Access Area
                </p>
            </div>

            <form onSubmit={handleAdminAuth} className="space-y-6">
                <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary opacity-20" size={18} />
                    <input
                        type="email"
                        placeholder="Admin Identifier"
                        className="w-full bg-background border border-border-sub rounded-2xl p-5 pl-14 focus:outline-none focus:border-primary/50 font-mono text-sm transition-all text-text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary opacity-20" size={18} />
                    <input
                        type="password"
                        placeholder="Root Cipher"
                        className="w-full bg-background border border-border-sub rounded-2xl p-5 pl-14 focus:outline-none focus:border-primary/50 font-mono text-sm transition-all text-text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-400 text-[10px] font-mono uppercase tracking-widest text-center bg-rose-500/5 py-4 rounded-2xl border border-rose-500/10">
                        {error}
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
                            Authorize Entry
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;
