import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { playCountdownBeep, playFinishBeep, playBeep } from '../../utils/audio';
import { generateWords, QUOTES } from '../../utils/words';
import {
    Timer,
    Type,
    Quote,
    Activity,
    Keyboard as KeyIcon,
    Zap,
    RotateCcw,
    ShieldAlert,
    Cpu,
    TrendingUp
} from 'lucide-react';

const GameEngine = ({ theme, settings }) => {
    const [mode, setMode] = useState('words');
    const [duration, setDuration] = useState(20);
    const [wordCount, setWordCount] = useState(50);
    const [includePunctuation, setIncludePunctuation] = useState(false);
    const [includeNumbers, setIncludeNumbers] = useState(false);

    const [wordList, setWordList] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [stats, setStats] = useState({ wpm: 0, accuracy: 100, errors: 0 });
    const [saveError, setSaveError] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20);
    const [gameStarted, setGameStarted] = useState(false);
    const [chances, setChances] = useState(1);
    const [showWarning, setShowWarning] = useState(false);
    const [wpmHistory, setWpmHistory] = useState([]);
    const [isBooting, setIsBooting] = useState(true);

    const isConfigLocked = gameStarted && !isFinished;
    const inputRef = useRef(null);
    const inputValueRef = useRef('');
    const wordListRef = useRef([]);

    useEffect(() => {
        const bootSequence = setTimeout(() => setIsBooting(false), 800);
        return () => clearTimeout(bootSequence);
    }, []);

    useEffect(() => {
        generateNewWords();
    }, [mode, duration, wordCount, includePunctuation, includeNumbers]);

    useEffect(() => {
        const handleGlobalAction = () => {
            if (!isFinished) inputRef.current?.focus();
        };
        window.addEventListener('click', handleGlobalAction);
        return () => window.removeEventListener('click', handleGlobalAction);
    }, [isFinished]);

    useEffect(() => {
        let timer;
        if (gameStarted && startTime && !isFinished && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    const next = prev - 1;
                    if (next <= 5 && next > 0) playCountdownBeep();
                    if (next <= 0) {
                        clearInterval(timer);
                        finishGame();
                        return 0;
                    }
                    return next;
                });

                // Update real-time WPM using refs (no re-runs on type)
                const timeElapsed = (Date.now() - startTime) / 60000;
                const fullText = wordListRef.current.join(' ');
                const correctChars = inputValueRef.current.split('').filter((c, i) => c === fullText[i]).length;
                const currentWpm = Math.round((correctChars / 5) / timeElapsed) || 0;
                setWpmHistory(prev => [...prev, currentWpm]);
                setStats(prev => ({ ...prev, wpm: currentWpm }));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [gameStarted, startTime, isFinished]);

    const generateNewWords = () => {
        setIsBooting(true);
        if (mode === 'quote') {
            const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
            const quoteWords = randomQuote.split(' ');
            setWordList(quoteWords);
            wordListRef.current = quoteWords;
        } else {
            const count = mode === 'words' ? wordCount : 100;
            const words = generateWords(mode, count, { includePunctuation, includeNumbers });
            setWordList(words);
            wordListRef.current = words;
        }

        inputValueRef.current = '';
        setInputValue('');
        setStartTime(null);
        setIsFinished(false);
        setSaveError(false);
        setGameStarted(false);
        setWpmHistory([]);
        setTimeLeft(mode === 'time' ? duration : 15);
        setStats({ wpm: 0, accuracy: 100, errors: 0 });
        setChances(settings.difficulty === 'master' ? 1 : 0);
        setShowWarning(false);

        setTimeout(() => {
            setIsBooting(false);
            inputRef.current?.focus();
        }, 400);
    };

    const handleInputChange = (e) => {
        if (isFinished) return;
        const val = e.target.value;

        if (!gameStarted && val.length > 0) {
            setGameStarted(true);
            setStartTime(Date.now());
        }

        const fullText = wordList.join(' ');
        let errors = 0;
        for (let i = 0; i < val.length; i++) {
            if (val[i] !== fullText[i]) errors++;
        }

        if (errors > stats.errors) {
            playBeep(200, 50, 0.05, 'square');
            if (settings.difficulty === 'expert') return;
            if (settings.difficulty === 'master') {
                if (chances > 0) {
                    setChances(0);
                    setShowWarning(true);
                    setTimeout(() => setShowWarning(false), 2000);
                } else {
                    finishGame(val, errors);
                    return;
                }
            }
        }

        const calculatedAccuracy = Math.round(((val.length - errors) / Math.max(1, val.length)) * 100);
        setStats(prev => ({ ...prev, errors, accuracy: Math.max(0, calculatedAccuracy) }));
        inputValueRef.current = val;
        setInputValue(val);

        if ((mode === 'words' || mode === 'quote') && val.length >= fullText.length) {
            finishGame(val, errors);
        }
    };

    const finishGame = async (finalVal = inputValue, finalErrors = stats.errors) => {
        if (isFinished) return;
        setIsFinished(true);
        playFinishBeep();

        const timeElapsed = Math.max(0.1, (Date.now() - (startTime || Date.now())) / 60000);
        const fullText = wordList.join(' ');
        const correctChars = finalVal.split('').filter((c, i) => c === fullText[i]).length;
        const finalWpm = Math.round((correctChars / 5) / timeElapsed) || 0;
        const finalAccuracy = Math.round(((finalVal.length - finalErrors) / Math.max(1, finalVal.length)) * 100);

        const difficultyMultiplier = settings.difficulty === 'master' ? 1.5 : (settings.difficulty === 'expert' ? 1.2 : 1);
        const finalScore = Math.round(finalWpm * (finalAccuracy / 100) * difficultyMultiplier);

        setStats({ wpm: finalWpm, accuracy: Math.max(0, finalAccuracy), errors: finalErrors });

        if (auth.currentUser && finalWpm > 0) {
            try {
                const username = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Operator';
                const scoreData = {
                    userId: auth.currentUser.uid,
                    username,
                    wpm: finalWpm,
                    accuracy: Math.max(0, finalAccuracy),
                    errors: finalErrors,
                    score: finalScore,
                    mode,
                    category: mode === 'time' ? `${duration}s` : (mode === 'words' ? `${wordCount}w` : 'quote'),
                    createdAt: serverTimestamp()
                };

                await addDoc(collection(db, 'scores'), scoreData);
                const userRef = doc(db, 'users', auth.currentUser.uid);
                const userSnap = await getDoc(userRef);
                const currentData = userSnap.exists() ? userSnap.data() : {};
                const currentStats = currentData.stats || { bestWpm: 0, totalGames: 0, avgWpm: 0, avgAccuracy: 0 };

                await setDoc(userRef, {
                    stats: {
                        bestWpm: Math.max(currentStats.bestWpm || 0, finalWpm),
                        totalGames: (currentStats.totalGames || 0) + 1,
                        avgWpm: Math.round(((currentStats.avgWpm || 0) * (currentStats.totalGames || 0) + finalWpm) / ((currentStats.totalGames || 0) + 1)),
                        avgAccuracy: Math.round(((currentStats.avgAccuracy || 0) * (currentStats.totalGames || 0) + finalAccuracy) / ((currentStats.totalGames || 0) + 1)),
                        lastWpm: finalWpm,
                        lastAccuracy: finalAccuracy,
                        updatedAt: serverTimestamp()
                    }
                }, { merge: true });
            } catch (err) {
                if (err.code === 'permission-denied') setSaveError(true);
                console.error("Sync Error:", err);
            }
        }
    };

    return (
        <div className="flex flex-col gap-12 md:gap-24 w-full py-6 select-none">
            {/* Top Toolbar */}
            <div className={`flex justify-center flex-wrap items-center gap-4 bg-sub/40 backdrop-blur-md p-3 md:p-5 rounded-[2.5rem] self-center border border-white/5 transition-all duration-700 ${isConfigLocked ? 'opacity-20 grayscale pointer-events-none scale-95 blur-sm' : ''}`}>
                <div className="flex items-center gap-2 pr-6 border-r border-white/5">
                    <button onClick={() => setIncludePunctuation(!includePunctuation)} className={`px-3 py-2 rounded-xl font-mono text-[10px] transition-all uppercase tracking-tighter ${includePunctuation ? 'bg-primary/20 text-primary' : 'text-secondary/40 hover:text-secondary'}`}>
                        @ symbols
                    </button>
                    <button onClick={() => setIncludeNumbers(!includeNumbers)} className={`px-3 py-2 rounded-xl font-mono text-[10px] transition-all uppercase tracking-tighter ${includeNumbers ? 'bg-primary/20 text-primary' : 'text-secondary/40 hover:text-secondary'}`}>
                        # digits
                    </button>
                </div>
                <div className="flex items-center gap-1 md:gap-3 px-6 border-r border-white/5">
                    <ModeButton id="time" icon={Timer} label="Chronos" active={mode === 'time'} onClick={() => setMode('time')} />
                    <ModeButton id="words" icon={Type} label="Lexicon" active={mode === 'words'} onClick={() => setMode('words')} />
                    <ModeButton id="quote" icon={Quote} label="Wisdom" active={mode === 'quote'} onClick={() => setMode('quote')} />
                    <ModeButton id="zen" icon={Activity} label="Zen" active={mode === 'zen'} onClick={() => setMode('zen')} />
                </div>
                <div className="flex items-center gap-2 pl-6">
                    {(mode === 'time' ? [15, 30, 60, 120] : [10, 25, 50, 100]).map(val => (
                        <button key={val} onClick={() => (mode === 'time' ? setDuration(val) : setWordCount(val))} className={`w-10 h-10 flex items-center justify-center rounded-xl font-mono text-[11px] transition-all ${(mode === 'time' ? duration === val : wordCount === val) ? 'bg-primary text-background font-black' : 'text-secondary/40 hover:bg-white/5 hover:text-secondary'}`}>
                            {val}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Arena */}
            <div className="relative w-full flex flex-col items-center min-h-[300px]" onClick={() => !isFinished && inputRef.current?.focus()}>
                {!isFinished && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8 mb-16">
                        <div className="flex items-end gap-12">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-mono text-secondary uppercase tracking-[0.5em] mb-2 opacity-40">System Signal</span>
                                <div className={`text-5xl font-black font-cyber tabular-nums transition-all ${gameStarted ? (timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-primary') : 'text-primary/20'}`}>
                                    {timeLeft}<span className="text-xl ml-1">S</span>
                                </div>
                            </div>
                            {gameStarted && (
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-mono text-secondary uppercase tracking-[0.5em] mb-2 opacity-40">Current Velocity</span>
                                    <div className="text-5xl font-black font-cyber text-text animate-in fade-in slide-in-from-bottom-2">
                                        {stats.wpm}
                                    </div>
                                </div>
                            )}
                        </div>
                        {settings.difficulty !== 'normal' && (
                            <div className="flex gap-4">
                                <div className="px-5 py-2 rounded-full border border-rose-500/20 bg-rose-500/5 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 shadow-lg shadow-rose-500/10">
                                    <ShieldAlert size={14} />
                                    {settings.difficulty} Protocol Active
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {isBooting ? (
                        <motion.div key="boot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-12">
                            <Cpu className="text-primary animate-spin-slow" size={40} />
                            <span className="font-mono text-[10px] text-primary uppercase tracking-[1em] animate-pulse ml-[1em]">INITIALIZING_NODE...</span>
                        </motion.div>
                    ) : !isFinished ? (
                        <motion.div key="arena" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`typing-arena font-mono tracking-widest leading-relaxed text-center max-w-5xl px-8 transition-opacity duration-1000 ${settings.blindMode ? 'opacity-0' : 'opacity-100'}`}>
                            {wordList.join(' ').split('').map((char, i) => {
                                let colors = 'text-secondary/20';
                                if (i < inputValue.length) {
                                    colors = inputValue[i] === char ? 'text-text opacity-100' : 'text-rose-500 bg-rose-500/10 px-0.5 rounded-sm';
                                } else if (i === inputValue.length) {
                                    colors = 'caret text-primary';
                                }
                                return <span key={i} className={`${colors} transition-colors duration-75`}>{char}</span>;
                            })}
                        </motion.div>
                    ) : (
                        <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-16 py-10 w-full">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
                                <ResultCard label="Velocity" value={stats.wpm} unit="WPM" icon={Zap} color="text-primary" />
                                <ResultCard label="Precision" value={stats.accuracy} unit="%" icon={TrendingUp} color="text-text" />
                                <ResultCard label="Chaos" value={stats.errors} unit="ERR" icon={ShieldAlert} color="text-rose-500" />
                                <ResultCard label="Protocol" value={mode.toUpperCase()} unit="MODE" icon={Cpu} color="text-secondary" />
                            </div>

                            {saveError && (
                                <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20 flex gap-5 items-center max-w-lg">
                                    <ShieldAlert className="text-rose-500" />
                                    <div className="text-left">
                                        <p className="text-xs font-black uppercase text-rose-500 tracking-widest">Telemetry Error</p>
                                        <p className="text-[10px] font-mono text-secondary opacity-60">System failed to synchronize genomic data with cloud mainframe.</p>
                                    </div>
                                </div>
                            )}

                            <button onClick={generateNewWords} className="group p-8 bg-sub/50 hover:bg-primary transition-all rounded-[3rem] border border-white/5 hover:border-primary/50 shadow-2xl relative">
                                <RotateCcw size={32} className="group-hover:rotate-180 transition-transform duration-700 text-secondary group-hover:text-background" />
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <input
                    ref={inputRef}
                    type="text"
                    className="absolute inset-0 opacity-0 cursor-default pointer-events-none"
                    onChange={handleInputChange}
                    onKeyDown={(e) => settings.quickRestart === 'tab' && e.key === 'Tab' && (e.preventDefault(), generateNewWords())}
                    value={inputValue}
                    spellCheck="false"
                    autoComplete="off"
                    autoFocus
                />
            </div>

            <div className="mt-20 flex justify-center gap-12 opacity-20 pointer-events-none">
                <StatusIndicator label="Signal" value="Active" />
                <StatusIndicator label="Node" value="0x7F22" />
                <StatusIndicator label="Sync" value="Stable" />
            </div>
        </div>
    );
};

const ModeButton = ({ icon: Icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all border ${active ? 'bg-primary/10 border-primary/20 text-primary' : 'border-transparent text-secondary/50 hover:text-text'}`}>
        <Icon size={16} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
);

const ResultCard = ({ label, value, unit, icon: Icon, color }) => (
    <div className="bg-sub/30 border border-white/5 p-10 rounded-[3rem] flex flex-col items-center group hover:border-primary/20 transition-all hover:translate-y-[-4px]">
        <div className="p-4 bg-background rounded-2xl border border-white/5 mb-8 group-hover:text-primary transition-colors">
            <Icon size={24} />
        </div>
        <span className="text-[10px] font-mono text-secondary uppercase tracking-[0.5em] mb-6 opacity-40">{label}</span>
        <div className="flex items-baseline gap-2">
            <span className={`text-6xl font-black font-cyber italic ${color}`}>{value}</span>
            <span className="text-xs font-mono text-secondary opacity-30">{unit}</span>
        </div>
    </div>
);

const StatusIndicator = ({ label, value }) => (
    <div className="flex flex-col items-center font-mono">
        <span className="text-[8px] uppercase tracking-[0.4em] mb-1">{label}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{value}</span>
    </div>
);

export default GameEngine;
