import { motion } from 'framer-motion';

const Tutorial = () => {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-12 py-10">
            <header className="text-center">
                <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">MISSION BRIEFING</h2>
                <p className="text-slate-400 font-mono uppercase tracking-[0.3em] text-sm">Welcome to the Elite Typography Program</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div whileHover={{ y: -5 }} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 font-bold mx-auto mb-6 text-xl">01</div>
                    <h3 className="text-lg font-bold mb-3 uppercase tracking-wider text-white">Focus</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">TypeFlow is designed for pure focus. The input is invisible. Just start typing to begin the session.</p>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center">
                    <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center text-emerald-400 font-bold mx-auto mb-6 text-xl">02</div>
                    <h3 className="text-lg font-bold mb-3 uppercase tracking-wider text-white">Correction</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">Mistakes turn <span className="text-rose-500 font-bold">RED</span>. Use Backspace to fix them. Accuracy is just as vital as speed in professional environments.</p>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center">
                    <div className="w-12 h-12 bg-amber-600/20 rounded-2xl flex items-center justify-center text-amber-400 font-bold mx-auto mb-6 text-xl">03</div>
                    <h3 className="text-lg font-bold mb-3 uppercase tracking-wider text-white">Mastery</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">Aim for constant flow. Your WPM is calculated char-by-char in real-time. Consistency creates elite performance.</p>
                </motion.div>
            </div>

            <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-blue-500/40 uppercase tracking-widest leading-none">PRACTICE_MODE_ENABLED</div>
                <h3 className="text-2xl font-black text-blue-400 mb-4 uppercase">Practice Strategy</h3>
                <ul className="space-y-4 text-slate-300">
                    <li className="flex gap-4">
                        <span className="text-blue-500 font-mono">→</span>
                        <span>Keep your eyes on the screen, not the keys.</span>
                    </li>
                    <li className="flex gap-4">
                        <span className="text-blue-500 font-mono">→</span>
                        <span>Maintain a rhythm. Speed comes from smoothness.</span>
                    </li>
                    <li className="flex gap-4">
                        <span className="text-blue-500 font-mono">→</span>
                        <span>Use Easy mode to build muscle memory before jumping to Hard.</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Tutorial;
