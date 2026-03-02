import { motion } from 'framer-motion';
import { Target, Zap, ShieldCheck, ChevronRight } from 'lucide-react';

const Tutorial = () => {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-20 py-10 select-none">
            <header className="flex flex-col items-center gap-4">
                <div className="px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
                    Operational Directive
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-text italic tracking-tighter uppercase font-cyber">MISSION BRIEFING</h2>
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <BriefingCard
                    step="01"
                    title="Focus"
                    icon={Target}
                    color="text-primary"
                    desc="TypeFlow is optimized for sensory isolation. The interface is reactive; simply begin typing to initialize the protocol."
                />
                <BriefingCard
                    step="02"
                    title="Precision"
                    icon={ShieldCheck}
                    color="text-rose-500"
                    desc="System entropy manifests as red-shift. Correct errors immediately using backspace to maintain neural fidelity."
                />
                <BriefingCard
                    step="03"
                    title="Mastery"
                    icon={Zap}
                    color="text-amber-400"
                    desc="Real-time velocity telemetry filters through the HUD. Consistency and rhythm are the keys to elite performance."
                />
            </div>

            <div className="bg-sub/30 border border-white/5 rounded-[3rem] p-10 md:p-16 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="absolute top-0 right-0 p-8 font-mono text-[10px] text-primary/20 uppercase tracking-[0.5em] leading-none hidden md:block">PRACTICE_STRATEGY_v4</div>

                <div className="relative z-10 space-y-8">
                    <h3 className="text-3xl font-black text-primary italic uppercase font-cyber tracking-tight">Tactical Guidelines</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        <Guideline text="Focus on screen telemetry; avoid visual contact with the physical interface." />
                        <Guideline text="Develop a rhythmic cadence; velocity is a byproduct of smoothness." />
                        <Guideline text="Utilize 'Normal' protocol for calibration before attempting 'Expert' or 'Master' nodes." />
                        <Guideline text="Master the 'Tab' quick-restart key for rapid iteration cycles." />
                    </ul>
                </div>
            </div>
        </div>
    );
};

const BriefingCard = ({ step, title, icon: Icon, desc, color }) => (
    <motion.div
        whileHover={{ y: -8, transition: { duration: 0.4 } }}
        className="bg-sub/50 p-10 rounded-[3rem] border border-white/5 hover:border-primary/20 transition-all group flex flex-col items-center text-center shadow-2xl"
    >
        <div className={`w-16 h-16 bg-background rounded-2xl flex items-center justify-center ${color} mb-8 border border-white/5 group-hover:scale-110 transition-transform`}>
            <Icon size={28} />
        </div>
        <span className="text-[10px] font-black font-mono text-secondary/40 uppercase tracking-[0.6em] mb-4">Phase_{step}</span>
        <h3 className="text-2xl font-black mb-4 uppercase tracking-tight text-white font-cyber">{title}</h3>
        <p className="text-secondary/60 text-sm leading-relaxed font-medium">{desc}</p>
    </motion.div>
);

const Guideline = ({ text }) => (
    <li className="flex gap-5 items-start">
        <div className="mt-1 p-1 bg-primary/10 rounded-lg">
            <ChevronRight size={14} className="text-primary" />
        </div>
        <span className="text-secondary leading-relaxed font-medium">{text}</span>
    </li>
);

export default Tutorial;
