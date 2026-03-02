import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Settings,
    UserCircle,
    LogOut,
    ShieldCheck,
    Zap,
    Menu,
    X
} from 'lucide-react';

const AdminLayout = ({ children, activeSection, setActiveSection, onLogout, userInfo }) => {
    const menuItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'users', icon: Users, label: 'User Directory' },
        { id: 'telemetry', icon: BarChart3, label: 'Global Telemetry' },
        { id: 'controls', icon: Settings, label: 'System Controls' },
        { id: 'profile', icon: UserCircle, label: 'Admin Identity' },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col lg:flex-row w-full text-text overflow-hidden">
            {/* SIDEBAR */}
            <aside className="w-full lg:w-80 bg-sub border-r border-border-sub flex flex-col p-8 z-[100]">
                <div className="flex items-center gap-4 mb-16 select-none">
                    <div className="relative">
                        <div className="w-12 h-12 border-2 border-primary bg-primary/5 rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-primary/20">
                            <ShieldCheck className="text-primary" size={24} />
                        </div>
                        <Zap className="absolute -right-1 -bottom-1 text-primary fill-primary animate-pulse" size={14} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black italic tracking-tighter uppercase whitespace-nowrap">
                            COMMAND<span className="text-primary">CENTER</span>
                        </h1>
                        <span className="text-[8px] font-mono text-secondary uppercase tracking-[0.4em] opacity-40">Root Authorization Layer</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeSection === item.id
                                    ? 'bg-primary text-background font-bold shadow-xl shadow-primary/20'
                                    : 'text-secondary hover:text-primary hover:bg-primary/5'
                                }`}
                        >
                            <item.icon size={20} className={activeSection === item.id ? 'text-background' : 'group-hover:scale-110 transition-transform'} />
                            <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                            {activeSection === item.id && (
                                <motion.div layoutId="adminNav" className="ml-auto w-1.5 h-1.5 bg-background rounded-full" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-8 border-t border-border-sub">
                    <div className="flex items-center gap-4 p-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary font-bold border border-primary/20">
                            {userInfo?.username?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[10px] font-black uppercase tracking-tighter truncate">{userInfo?.username || 'SYSTEM_ADMIN'}</span>
                            <span className="text-[8px] font-mono text-secondary uppercase tracking-widest opacity-40">Level 0 Access</span>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-500 hover:bg-rose-500/5 transition-all group border border-transparent hover:border-rose-500/20"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto custom-scrollbar bg-background">
                <div className="max-w-7xl mx-auto p-6 lg:p-12">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
