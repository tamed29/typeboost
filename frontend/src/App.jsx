import { useState, useEffect } from 'react';
import { auth, db } from './config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Keyboard,
  BookOpen,
  Trophy,
  User,
  UserCircle,
  Terminal,
  Settings,
  LogOut,
  Info,
  X,
  Languages,
  Zap,
  CheckCircle,
  EyeOff,
  Sun,
  Moon,
  Keyboard as KeyIcon,
  ShieldAlert
} from 'lucide-react';

import GameEngine from './components/Game/GameEngine';
import Auth from './components/Auth/Auth';
import AdminLogin from './components/Auth/AdminLogin';
import AdminLayout from './components/Admin/AdminLayout';
import Leaderboard from './components/Dashboard/Leaderboard';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import LessonsPage from './pages/LessonsPage';
import AboutPage from './pages/AboutPage';

const THEMES = [
  { id: 'default', name: 'Original', color: '#38bdf8' },
  { id: 'carbon', name: 'Carbon', color: '#e0e0e0' },
  { id: 'serika', name: 'Serika', color: '#d1b03c' },
  { id: 'tokyo', name: 'Tokyo', color: '#f7768e' },
  { id: 'aurora', name: 'Aurora', color: '#10b981' },
  { id: 'neon', name: 'Neon', color: '#06b6d4' },
  { id: 'coffee', name: 'Coffee', color: '#92400e' },
  { id: 'ghost', name: 'Ghost', color: '#f8fafc' },
  { id: 'lavender', name: 'Lavender', color: '#9b89b3' },
  { id: 'midnight', name: 'Midnight', color: '#0ea5e9' },
  { id: 'matrix', name: 'Matrix', color: '#008f11' }
];

const TypeBoostLogo = ({ onClick }) => (
  <div onClick={onClick} className="flex items-center gap-5 select-none group cursor-pointer">
    <div className="relative flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-primary bg-primary/5 rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-all duration-700 shadow-2xl shadow-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="text-primary font-black font-cyber text-2xl relative z-10 -rotate-3 group-hover:rotate-0 transition-all">T</span>
      </div>
      <div className="absolute -right-2 -top-2">
        <div className="relative">
          <Zap className="text-primary fill-primary animate-pulse z-10 relative" size={18} />
          <div className="absolute inset-0 bg-primary blur-md opacity-50 animate-pulse" />
        </div>
      </div>
    </div>
    <div className="flex flex-col">
      <h1 className="text-2xl font-black italic tracking-tighter text-text group-hover:text-primary transition-colors flex items-baseline">
        <span className="font-cyber">TYPE</span>
        <span className="text-primary ml-1">BOOST</span>
      </h1>
      <div className="flex items-center gap-2">
        <div className="h-[1px] w-4 bg-primary/40" />
        <span className="text-[8px] font-mono text-secondary uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">Node_v4.2.1</span>
      </div>
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('game');
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('nexus-theme') || 'default');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [adminSection, setAdminSection] = useState('overview');

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus-settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse settings", e);
    }
    return {
      difficulty: 'normal',
      blindMode: false,
      quickRestart: 'tab',
      showHistory: true,
      smoothCaret: true,
      language: 'english'
    };
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserInfo(data);
            const userRole = (data.role === 'admin' || authUser.email === 'type@gmail.com') ? 'admin' : 'user';
            setRole(userRole);
          } else if (authUser.email === 'type@gmail.com') {
            setRole('admin');
          }
        } catch (err) {
          console.warn("Auth Sync Error:", err.code);
          // Fallback userInfo if database is locked
          setUserInfo({
            username: authUser.email.split('@')[0],
            role: authUser.email === 'type@gmail.com' ? 'admin' : 'user'
          });
          if (authUser.email === 'type@gmail.com') {
            setRole('admin');
          }
        } finally {
          setLoading(false);
        }
      } else {
        setRole('user');
        setUserInfo(null);
        if (activeTab === 'admin' || activeTab === 'profile') setActiveTab('game');
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      const isPathAdmin = window.location.pathname === '/admin';

      if (isPathAdmin) {
        if (activeTab !== 'admin') {
          setActiveTab('admin');
          setAdminSection('overview');
        }
      } else if (activeTab === 'admin') {
        setActiveTab('game');
      }
    };

    // Initial check
    handleLocationChange();

    // Listen for URL changes (popstate for back/forward, and custom intervals for manual edits)
    window.addEventListener('popstate', handleLocationChange);
    const interval = setInterval(handleLocationChange, 500); // Poll for manual URL edits

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(interval);
    };
  }, [activeTab]);

  useEffect(() => {
    THEMES.forEach(t => document.body.classList.remove(`theme-${t.id}`));
    if (currentTheme !== 'default') document.body.classList.add(`theme-${currentTheme}`);
    localStorage.setItem('nexus-theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('nexus-settings', JSON.stringify(settings));
  }, [settings]);

  const NavIcon = ({ id, icon: Icon, label }) => {
    const isProtected = id === 'game' || id === 'profile' || id === 'admin';

    return (
      <button
        onClick={() => {
          if (isProtected && !user) {
            setShowAuthModal(true);
          } else {
            setActiveTab(id);
          }
        }}
        className={`p-3 rounded-xl transition-all relative flex items-center justify-center ${activeTab === id ? 'text-primary' : 'text-secondary hover:text-text'
          }`}
        title={label}
      >
        <Icon size={20} />
        {activeTab === id && (
          <motion.div layoutId="activeNav" className="h-1.5 w-1.5 bg-primary rounded-full absolute -bottom-1" />
        )}
      </button>
    );
  };

  const handleLogout = async () => {
    await signOut(auth);
    setActiveTab('game');
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-8">
      <div className="relative">
        <div className="w-20 h-20 border-2 border-primary/20 border-t-primary rounded-3xl animate-spin" />
        <Zap className="absolute inset-0 m-auto text-primary animate-pulse" size={32} />
      </div>
      <span className="text-primary font-mono text-[9px] uppercase tracking-[0.6em] animate-pulse">Establishing Signal...</span>
    </div>
  );

  // ADMIN UI TREE (STRICT ISOLATION)
  if (role === 'admin' && user?.email === 'type@gmail.com') {
    return (
      <AdminLayout
        activeSection={adminSection}
        setActiveSection={setAdminSection}
        onLogout={handleLogout}
        userInfo={userInfo}
      >
        <AdminPage theme={currentTheme} activeSection={adminSection} setActiveSection={setAdminSection} />
      </AdminLayout>
    );
  }

  // NORMAL USER UI TREE
  return (
    <div className="min-h-screen flex flex-col font-sans w-full overflow-hidden">
      <header className="px-4 md:px-16 py-6 md:py-8 flex items-center justify-between sticky top-0 z-50 bg-background w-full">
        <TypeBoostLogo onClick={() => setActiveTab('game')} />

        <nav className="hidden lg:flex items-center gap-6 bg-sub px-6 py-2 rounded-[2rem] border border-border-sub">
          <NavIcon id="game" icon={Keyboard} label="Protocol" />
          <NavIcon id="lessons" icon={BookOpen} label="Academy" />
          <NavIcon id="leaderboard" icon={Trophy} label="Rankings" />
          <NavIcon id="about" icon={Info} label="Architecture" />
          {user && <NavIcon id="profile" icon={User} label="Identity" />}
        </nav>

        <div className="flex items-center gap-3 md:gap-5 lg:gap-8">
          {user ? (
            <div className="flex items-center gap-5">
              <div onClick={() => setActiveTab('profile')} className="flex items-center gap-4 cursor-pointer group">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-[10px] font-black uppercase text-text group-hover:text-primary transition-colors tracking-tighter">
                    {userInfo?.username || user.email.split('@')[0]}
                  </span>
                  <span className="text-[7px] text-secondary font-mono uppercase tracking-[0.2em]">Operative level</span>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-sub border border-border-sub flex items-center justify-center text-secondary group-hover:text-primary transition-all">
                  <User size={16} className="md:w-[18px] md:h-[18px]" />
                </div>
              </div>
              <button onClick={handleLogout} className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 flex items-center justify-center transition-all">
                <LogOut size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-sub border border-border-sub flex items-center justify-center text-secondary hover:text-primary transition-all">
              <UserCircle size={18} className="md:w-[22px] md:h-[22px]" />
            </button>
          )}

          <button onClick={() => setShowSettings(!showSettings)} className={`w-8 h-8 md:w-10 md:h-10 rounded-xl transition-all border border-border-sub bg-sub flex items-center justify-center ${showSettings ? 'rotate-90 text-primary' : 'text-secondary hover:text-primary'}`}>
            <Settings size={18} className="md:w-[20px] md:h-[20px]" />
          </button>
        </div>
      </header>

      {/* MOBILE TOP NAVIGATION BAR */}
      <nav className="lg:hidden flex items-center justify-around bg-sub border-b border-white/5 px-4 py-2 sticky top-[80px] z-40 backdrop-blur-md">
        <NavIcon id="game" icon={Keyboard} />
        <NavIcon id="lessons" icon={BookOpen} />
        <NavIcon id="leaderboard" icon={Trophy} />
        <NavIcon id="about" icon={Info} />
        {user && <NavIcon id="profile" icon={User} />}
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-16 py-6 md:py-12 pb-12 lg:pb-12 overflow-x-hidden">
        <AnimatePresence>
          {showAuthModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[600] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6"
            >
              <div className="relative w-full max-w-md">
                <button onClick={() => setShowAuthModal(false)} className="absolute -top-16 right-0 text-secondary hover:text-primary transition-all p-3 bg-sub border border-border-sub rounded-full">
                  <X size={24} />
                </button>
                <Auth onAuthChange={() => setShowAuthModal(false)} theme={currentTheme} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === 'game' && (
            <motion.div key="game" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full">
              {user ? (
                <GameEngine theme={currentTheme} settings={settings} />
              ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-sub/20 rounded-[4rem] border border-white/5 gap-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="relative">
                    <Terminal size={64} className="text-primary/20 group-hover:text-primary/40 transition-colors duration-700" />
                    <div className="absolute inset-0 bg-primary blur-3xl opacity-10 animate-pulse" />
                  </div>
                  <div className="text-center relative z-10">
                    <h3 className="text-2xl font-black italic uppercase text-text tracking-tighter mb-2 font-cyber">Neural Link Required</h3>
                    <p className="text-[10px] font-mono text-secondary uppercase tracking-[0.5em] opacity-40">Access to protocol node restricted. Establish connection.</p>
                  </div>
                  <button onClick={() => setShowAuthModal(true)} className="relative group/btn px-10 py-4 bg-primary text-background font-black uppercase text-xs tracking-[0.2em] rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95">
                    <span className="relative z-10">Establish Connection</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
          {activeTab === 'lessons' && (
            <motion.div key="lessons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full">
              <LessonsPage theme={currentTheme} />
            </motion.div>
          )}
          {activeTab === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full">
              <Leaderboard theme={currentTheme} />
            </motion.div>
          )}
          {activeTab === 'about' && (
            <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full">
              <AboutPage theme={currentTheme} />
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full">
              {user ? (
                <ProfilePage theme={currentTheme} userInfo={userInfo} />
              ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-sub/20 rounded-[4rem] border border-white/5 gap-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="relative">
                    <User size={64} className="text-primary/20 group-hover:text-primary/40 transition-colors duration-700" />
                    <div className="absolute inset-0 bg-primary blur-3xl opacity-10 animate-pulse" />
                  </div>
                  <div className="text-center relative z-10">
                    <h3 className="text-2xl font-black italic uppercase text-text tracking-tighter mb-2 font-cyber">Identity Verification Required</h3>
                    <p className="text-[10px] font-mono text-secondary uppercase tracking-[0.5em] opacity-40">Biometric signature mismatch. Please authenticate.</p>
                  </div>
                  <button onClick={() => setShowAuthModal(true)} className="relative group/btn px-10 py-4 bg-primary text-background font-black uppercase text-xs tracking-[0.2em] rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95">
                    <span className="relative z-10">Authenticate Identity</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full">
              {role === 'admin' ? (
                <AdminPage theme={currentTheme} />
              ) : (
                <div className="py-20 flex items-center justify-center w-full">
                  <AdminLogin onAdminAuth={() => setActiveTab('admin')} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[700] flex items-center justify-center bg-black/90 backdrop-blur-2xl px-6">
              <div className="bg-sub border border-primary/20 w-full max-w-2xl h-[85vh] overflow-y-auto rounded-[3rem] p-10 md:p-14 custom-scrollbar">
                <div className="flex justify-between items-center mb-16">
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-background rounded-2xl border border-border-sub text-primary"><Settings size={22} /></div>
                    <div className="flex flex-col">
                      <h2 className="text-2xl font-black italic uppercase text-text">Configuration</h2>
                    </div>
                  </div>
                  <button onClick={() => setShowSettings(false)} className="p-3 text-secondary hover:text-rose-400 bg-background rounded-full border border-border-sub"><X size={24} /></button>
                </div>

                <div className="space-y-16">
                  <section className="space-y-10">
                    <h3 className="text-[9px] font-mono text-secondary uppercase tracking-[0.5em] pb-3 border-b border-border-sub flex items-center gap-3"><Sun size={14} className="text-primary" /> Visuals</h3>
                    <div>
                      <p className="font-bold text-base text-text mb-6">Accent Themes</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {THEMES.map(t => (
                          <button key={t.id} onClick={() => setCurrentTheme(t.id)} className={`p-5 rounded-2xl border transition-all ${currentTheme === t.id ? 'border-primary bg-primary/5' : 'border-white/5 bg-background/40'}`}>
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-8 h-8 rounded-full shadow-lg" style={{ backgroundColor: t.color }} />
                              <span className="text-[9px] font-black uppercase tracking-widest text-text">{t.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="space-y-10">
                    <h3 className="text-[9px] font-mono text-secondary uppercase tracking-[0.5em] pb-3 border-b border-white/5 flex items-center gap-3"><Zap size={14} className="text-primary" /> Behavioral</h3>
                    <div className="space-y-10">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-base text-text">Difficulty Protocol</p>
                        <div className="flex bg-background/50 p-1 rounded-xl">
                          {['normal', 'expert', 'master'].map(d => (
                            <button key={d} onClick={() => setSettings({ ...settings, difficulty: d })} className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${settings.difficulty === d ? 'bg-primary text-background' : 'text-secondary hover:text-primary'}`}>{d}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div >
  );
}

export default App;
