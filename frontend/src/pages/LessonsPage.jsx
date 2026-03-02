import { motion } from 'framer-motion';
import { BookOpen, Code, Terminal, Zap } from 'lucide-react';

const CATEGORIES = [
    {
        id: 'foundation',
        title: 'Home Row Protocol',
        desc: 'Establish the core neural pathways for absolute terminal precision.',
        lessons: 8,
        difficulty: 'INITIATE',
        icon: BookOpen
    },
    {
        id: 'ascend',
        title: 'Vortex Ascension',
        desc: 'Integrating complex movements and top-row alphanumerics.',
        lessons: 12,
        difficulty: 'OPERATIVE',
        icon: Zap
    },
    {
        id: 'syntax',
        title: 'Semantic Cipher',
        desc: 'Advanced punctuation, symbols, and rapid shift maneuvers.',
        lessons: 15,
        difficulty: 'SPECIALIST',
        icon: Code
    },
    {
        id: 'terminal',
        title: 'Matrix Runtime',
        desc: 'Writing code blocks, logic flows, and technical documentation.',
        lessons: 20,
        difficulty: 'ARCHITECT',
        icon: Terminal
    }
];

const LessonsPage = ({ theme }) => {
    return (
        <div className="w-full max-w-6xl mx-auto space-y-20 py-12">
            <header className="text-center space-y-6">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl font-black tracking-tighter mb-4 italic uppercase text-primary"
                >
                    Academy Archive
                </motion.h2>
                <div className="flex justify-center flex-col items-center gap-2">
                    <div className="w-20 h-1 bg-primary rounded-full opacity-20" />
                    <p className="text-secondary font-mono text-[9px] uppercase tracking-[0.5em] opacity-50">Proprietary Training Protocols</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {CATEGORIES.map((cat, i) => (
                    <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative p-12 rounded-[2.5rem] border border-border-sub bg-sub shadow-2xl cursor-pointer transition-all duration-500 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-10">
                                <div className="p-4 rounded-2xl bg-background border border-border-sub text-primary shadow-xl group-hover:rotate-12 group-hover:scale-110 transition-all">
                                    <cat.icon size={28} />
                                </div>
                                <div className="px-4 py-1.5 rounded-xl border border-primary/20 bg-primary/5 text-primary font-mono text-[8px] tracking-[0.3em]">
                                    {cat.difficulty}
                                </div>
                            </div>

                            <h3 className="text-3xl font-black mb-4 uppercase italic tracking-tighter text-primary group-hover:translate-x-2 transition-transform">
                                {cat.title}
                            </h3>
                            <p className="text-secondary text-[11px] leading-relaxed mb-10 max-w-sm opacity-60">
                                {cat.desc}
                            </p>

                            <div className="flex items-center justify-between pt-8 border-t border-border-sub">
                                <span className="text-[9px] font-mono text-secondary uppercase tracking-widest">{cat.lessons} Training Cycles</span>
                                <motion.button
                                    whileHover={{ x: 5 }}
                                    className="text-[9px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-3"
                                >
                                    Initialize <ArrowIcon />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="p-16 rounded-[2.5rem] border border-dashed border-primary/20 bg-primary/5 text-center"
            >
                <h4 className="text-xl font-black text-primary mb-3 uppercase tracking-tighter italic">Vanguard Synchronization Pending</h4>
                <p className="text-secondary text-[10px] font-mono uppercase tracking-[0.3em] max-w-xl mx-auto leading-loose opacity-40">
                    Additional technical modules for architectural design and terminal shortcuts are currently being synchronized for terminal accessibility.
                </p>
            </motion.div>
        </div>
    );
};

const ArrowIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

export default LessonsPage;
