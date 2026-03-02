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
        <div className="w-full max-w-6xl mx-auto space-y-20 py-12 select-none">
            <header className="flex flex-col items-center gap-6 text-center">
                <div className="px-5 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">
                    Training Academy Node
                </div>
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl md:text-7xl font-black tracking-tighter italic uppercase text-text font-cyber"
                >
                    ACADEMY <span className="text-primary">ARCHIVE</span>
                </motion.h2>
                <div className="flex justify-center flex-col items-center gap-3">
                    <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                    <p className="text-secondary font-mono text-[9px] uppercase tracking-[0.6em] opacity-40">Proprietary Combat-Type Protocols</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {CATEGORIES.map((cat, i) => (
                    <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="group relative p-12 rounded-[3.5rem] border border-white/5 bg-sub/40 backdrop-blur-md shadow-2xl cursor-pointer transition-all duration-700 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000 blur-3xl" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-12">
                                <div className="p-5 rounded-2xl bg-background border border-white/5 text-primary shadow-2xl group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-500">
                                    <cat.icon size={32} />
                                </div>
                                <div className="px-5 py-2 rounded-xl border border-primary/20 bg-primary/5 text-primary font-mono text-[9px] font-black tracking-[0.4em] uppercase">
                                    {cat.difficulty}
                                </div>
                            </div>

                            <h3 className="text-4xl font-black mb-6 uppercase italic tracking-tighter text-text font-cyber group-hover:text-primary transition-colors">
                                {cat.title}
                            </h3>
                            <p className="text-secondary text-sm leading-relaxed mb-12 max-w-sm opacity-60 font-medium">
                                {cat.desc}
                            </p>

                            <div className="flex items-center justify-between pt-10 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] font-mono text-secondary uppercase tracking-[0.3em] opacity-40">{cat.lessons} Training Cycles</span>
                                </div>
                                <motion.button
                                    whileHover={{ x: 8 }}
                                    className="relative group/btn px-8 py-3 bg-primary text-background font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl overflow-hidden transition-all"
                                >
                                    <span className="relative z-10 flex items-center gap-3">Initialize <ArrowIcon /></span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="p-20 rounded-[4rem] border border-dashed border-primary/20 bg-primary/5 text-center relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <h4 className="text-3xl font-black text-primary mb-6 uppercase tracking-widest italic font-cyber">Vanguard Synchronization Pending</h4>
                <p className="text-secondary text-[11px] font-mono uppercase tracking-[0.5em] max-w-2xl mx-auto leading-[2] opacity-40 relative z-10">
                    Additional technical modules for architectural design and terminal shortcuts are currently being synchronized for terminal accessibility. Stand by for uplink.
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
