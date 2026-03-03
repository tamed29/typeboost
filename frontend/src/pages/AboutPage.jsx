import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    History,
    Cpu,
    Activity,
    Globe,
    Terminal,
    Shield,
    Zap,
    Github,
    Award,
    Network
} from 'lucide-react';

const AboutPage = ({ theme }) => {
    const [telemetry, setTelemetry] = useState({
        syncs: 14208,
        uptime: '99.98%',
        fidelity: '1.2ms'
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setTelemetry(prev => ({
                ...prev,
                syncs: prev.syncs + Math.floor(Math.random() * 3)
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const TechBadge = ({ icon: Icon, label }) => (
        <div className="flex items-center gap-2 px-4 py-2 bg-sub/10 border border-border-sub rounded-xl">
            <Icon size={14} className="text-primary" />
            <span className="text-[10px] font-mono text-text uppercase tracking-widest">{label}</span>
        </div>
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
    };

    return (
        <div className="w-full space-y-24 pb-32 max-w-7xl mx-auto overflow-hidden px-4 sm:px-0">
            {/* Mission Hero */}
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-16 pt-8"
            >
                <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Terminal size={28} className="text-primary" />
                        <span className="text-xs font-mono text-primary uppercase tracking-[0.8em]">System Architecture</span>
                    </div>
                    <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black text-text italic tracking-tighter leading-[0.9] mb-6 md:mb-8">
                        NEURAL <br />
                        <span className="text-gradient">SYNCHRONIZATION</span>
                    </h1>
                    <p className="text-secondary text-base lg:text-xl leading-relaxed opacity-80 font-medium max-w-2xl px-1 sm:px-0">
                        TypeBoost is a high-performance, precision-focused typing system designed for operatives who demand the utmost accuracy and speed.
                        By leveraging low-latency input engines, adaptive modes, and synchronized neural feedback, we transform
                        standard typing practices into a high-fidelity protocol.
                    </p>
                    <p className="mt-4 text-secondary text-sm lg:text-lg leading-relaxed opacity-60 font-medium max-w-2xl px-1 sm:px-0 hidden sm:block">
                        Whether tracking Words Per Minute (WPM) strictly or challenging yourself against expert-level constraints, our minimalist architecture guarantees sub-millisecond keystroke detection globally. You can fully customize your layout, toggle dynamic themes, and trace exact error entropy. Build, measure, and scale your keyboard bandwidth.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto mt-8 lg:mt-0">
                    <StatCard label="Total Synchronizations" value={telemetry.syncs.toLocaleString()} sub="GLOBAL" color="text-primary" />
                    <StatCard label="Network Fidelity" value={telemetry.fidelity} sub="LATENCY" color="text-emerald-400" />
                </div>
            </motion.header>

            {/* Architecture Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
                <motion.section variants={itemVariants} className="bg-sub/10 border border-border-sub p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] backdrop-blur-xl flex flex-col h-full transform transition-transform duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5">
                    <div className="flex items-center gap-4 mb-6 md:mb-8">
                        <div className="p-3 md:p-4 bg-background rounded-2xl text-primary border border-border-sub shadow-inner"><Cpu size={20} md:size={24} /></div>
                        <h2 className="text-xl md:text-2xl font-black italic tracking-tight uppercase">Core Logic</h2>
                    </div>
                    <ul className="space-y-4 md:space-y-6 flex-grow">
                        <LogPoint label="Vite + React 19" sub="Lightning Reactive Engine" />
                        <LogPoint label="Firebase Engine" sub="Real-time Neural Persistence" />
                        <LogPoint label="Tailwind v4" sub="Adaptive Style Topology" />
                        <LogPoint label="Framer Motion" sub="Kinetic Entrance Vectors" />
                    </ul>
                </motion.section>

                <motion.section variants={itemVariants} className="bg-sub/10 border border-border-sub p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] backdrop-blur-xl flex flex-col h-full transform transition-transform duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/5">
                    <div className="flex items-center gap-4 mb-6 md:mb-8">
                        <div className="p-3 md:p-4 bg-background rounded-2xl text-emerald-500 border border-border-sub shadow-inner"><Shield size={20} md:size={24} /></div>
                        <h2 className="text-xl md:text-2xl font-black italic tracking-tight uppercase">Security</h2>
                    </div>
                    <ul className="space-y-4 md:space-y-6 flex-grow">
                        <LogPoint label="Auth Secure" sub="Biometric Signature Flow" />
                        <LogPoint label="Firestore Rules" sub="Closed-loop Data Protection" />
                        <LogPoint label="Admin Command" sub="Tier 1 Elevated Control" />
                        <LogPoint label="Encrypted Routing" sub="Route-level Verification" />
                    </ul>
                </motion.section>

                <motion.section variants={itemVariants} className="bg-sub/10 border border-border-sub p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] backdrop-blur-xl flex flex-col h-full md:col-span-2 lg:col-span-1 transform transition-transform duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/5">
                    <div className="flex items-center gap-4 mb-6 md:mb-8">
                        <div className="p-3 md:p-4 bg-background rounded-2xl text-orange-500 border border-border-sub shadow-inner"><Network size={20} md:size={24} /></div>
                        <h2 className="text-xl md:text-2xl font-black italic tracking-tight uppercase">Topology</h2>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-4 mt-2">
                        <TechBadge icon={Globe} label="Region: Global" />
                        <TechBadge icon={Zap} label="Low-Latency" />
                        <TechBadge icon={Activity} label="Status: Operational" />
                        <TechBadge icon={Award} label="Version: v4.2 Nexus" />
                    </div>
                    <p className="mt-6 md:mt-8 text-secondary opacity-60 text-xs md:text-sm leading-relaxed border-t border-border-sub pt-4 md:pt-6">
                        The TypeBoost infrastructure is deployed across edge nodes globally, ensuring that every simulated terminal responds with instantaneous feedback.
                    </p>
                </motion.section>
            </motion.div>

            {/* History Ribbon */}
            <motion.footer
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="pt-20 border-t border-border-sub"
            >
                <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
                        <Github size={24} className="text-text cursor-pointer hover:text-primary transition-colors" />
                        <span className="text-[10px] font-mono text-secondary uppercase tracking-[0.4em]">Proprietary Data Transmission &copy; 2026</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-px w-20 bg-white/5 hidden md:block" />
                        <span className="text-[10px] font-black uppercase italic tracking-tighter text-primary">Operative Command Authorized</span>
                    </div>
                </div>
            </motion.footer>
        </div>
    );
};

const StatCard = ({ label, value, sub, color }) => (
    <div className="bg-sub/5 border border-border-sub p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-start md:items-center justify-center min-w-[140px] md:min-w-[200px] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="text-[10px] md:text-xs font-mono text-secondary uppercase tracking-[0.2em] md:tracking-[0.4em] mb-2 md:mb-4 opacity-70 text-left md:text-center relative z-10">{label}</span>
        <div className="flex items-baseline gap-2 md:gap-3 relative z-10">
            <span className={`text-3xl md:text-6xl font-black italic tracking-tighter ${color}`}>{value}</span>
            <span className="text-[10px] md:text-xs font-mono text-secondary opacity-50 uppercase tracking-widest">{sub}</span>
        </div>
    </div>
);

const LogPoint = ({ label, sub }) => (
    <li className="flex flex-col pl-4 md:pl-6 border-l-4 border-primary/30 py-1 hover:border-primary transition-colors duration-300 group">
        <span className="text-base md:text-lg font-black uppercase tracking-tight text-text leading-tight group-hover:text-primary transition-colors">{label}</span>
        <span className="text-[10px] md:text-xs font-mono text-secondary opacity-70 lowercase tracking-widest mt-1 md:mt-1.5">{sub}</span>
    </li>
);

export default AboutPage;
