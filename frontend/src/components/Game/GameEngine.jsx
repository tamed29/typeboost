import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { playCountdownBeep, playFinishBeep } from '../../utils/audio';
import {
    Timer,
    Type,
    Quote,
    Activity,
    Settings2,
    Hash,
    AtSign,
    ChevronDown,
    Keyboard as KeyIcon,
    Zap,
    RotateCcw
} from 'lucide-react';

const WORDS_BASE = [
    "the", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog",
    "programming", "javascript", "react", "tailwind", "performance", "architecture",
    "developer", "backend", "frontend", "optimization", "asynchronous", "interface",
    "scalability", "deployment", "configuration", "authentication", "dashboard", "analytics"
];

const PUNCTUATION = [".", ",", "!", "?", ";", ":", "-", "(", ")", "\"", "'"];
const NUMBERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const QUOTES = [
    "The only way to do great work is to love what you do.",
    "Innovation distinguishes between a leader and a follower.",
    "Stay hungry, stay foolish.",
    "Talk is cheap. Show me the code.",
    "Programs must be written for people to read, and only incidentally for machines to execute.",
    "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    "First, solve the problem. Then, write the code.",
    "Experience is the name everyone gives to their mistakes.",
    "In order to be irreplaceable, one must always be different.",
    "Knowledge is power.",
    "Simplicity is the soul of efficiency.",
    "Make it work, make it right, make it fast.",
    "Code is like humor. When you have to explain it, it's bad."
];

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

    // Computed lock state
    const isConfigLocked = gameStarted && !isFinished;

    const inputRef = useRef(null);

    useEffect(() => {
        generateNewWords();
    }, [mode, duration, wordCount, includePunctuation, includeNumbers]);

    useEffect(() => {
        const handleGlobalAction = () => {
            if (!isFinished) {
                inputRef.current?.focus();
            }
        };
        window.addEventListener('click', handleGlobalAction);
        window.addEventListener('touchstart', handleGlobalAction);
        return () => {
            window.removeEventListener('click', handleGlobalAction);
            window.removeEventListener('touchstart', handleGlobalAction);
        };
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
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [gameStarted, startTime, isFinished]);

    useEffect(() => {
        if (!isFinished) {
            const timeout = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [isFinished, wordList]);

    const generateNewWords = () => {
        if (mode === 'quote') {
            const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
            setWordList(randomQuote.split(' '));
        } else {
            let pool = [...WORDS_BASE];
            const count = mode === 'words' ? wordCount : 100;

            const randomWords = [...Array(count)].map(() => {
                let word = pool[Math.floor(Math.random() * pool.length)];
                if (includeNumbers && Math.random() > 0.8) word += NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
                if (includePunctuation && Math.random() > 0.7) word += PUNCTUATION[Math.floor(Math.random() * PUNCTUATION.length)];
                return word;
            });

            setWordList(randomWords);
        }

        setInputValue('');
        setStartTime(null);
        setIsFinished(false);
        setSaveError(false);
        setGameStarted(false);
        // Initialize timeLeft based on mode
        if (mode === 'time') {
            setTimeLeft(duration);
        } else if (mode === 'words' || mode === 'quote') {
            setTimeLeft(15); // Set to 15 seconds for words/quote mode
        } else {
            setTimeLeft(0); // Zen mode or other modes might not have a timer
        }
        setStats({ wpm: 0, accuracy: 100, errors: 0 });
        setChances(settings.difficulty === 'master' ? 1 : 0);
        setShowWarning(false);

        setTimeout(() => inputRef.current?.focus(), 10);
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
            if (settings.difficulty === 'expert') {
                // Expert Mode: Block progress if character is wrong
                return;
            }
            if (settings.difficulty === 'master') {
                if (chances > 0) {
                    setChances(0);
                    setShowWarning(true);
                    setTimeout(() => setShowWarning(false), 3000);
                } else {
                    finishGame(val, errors);
                    return;
                }
            }
        }

        setStats(prev => ({ ...prev, errors }));
        setInputValue(val);

        if ((mode === 'words' || mode === 'quote') && val.length >= fullText.length) {
            finishGame(val, errors);
        }
    };

    const handleKeyDown = (e) => {
        if (settings.quickRestart === 'tab' && e.key === 'Tab') {
            e.preventDefault();
            generateNewWords();
        }
    };

    const finishGame = async (finalVal = inputValue, finalErrors = stats.errors) => {
        if (isFinished) return;
        setIsFinished(true);
        const timeElapsed = Math.max(0.1, (Date.now() - (startTime || Date.now())) / 60000);
        const fullText = wordList.join(' ');
        const correctChars = finalVal.split('').filter((c, i) => c === fullText[i]).length;
        const finalWpm = Math.round((correctChars / 5) / timeElapsed) || 0;
        const finalAccuracy = Math.round(((finalVal.length - finalErrors) / Math.max(1, finalVal.length)) * 100);

        setStats({ wpm: finalWpm, accuracy: Math.max(0, finalAccuracy), errors: finalErrors });
        playFinishBeep();

        let category = '';
        if (mode === 'time') category = `${duration}s`;
        else if (mode === 'words') category = `${wordCount}w`;
        else category = 'quote';

        if (auth.currentUser && finalWpm > 0) {
            try {
                // Optimized username fetch or fallback
                const username = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Unknown';

                await addDoc(collection(db, 'scores'), {
                    userId: auth.currentUser.uid,
                    username: username,
                    wpm: finalWpm,
                    accuracy: Math.max(0, finalAccuracy),
                    errors: finalErrors,
                    score: Math.round(finalWpm * (finalAccuracy / 100)),
                    mode,
                    category,
                    createdAt: serverTimestamp()
                });

                // 2. Update User Summary (For fast profile loading & Stats persistence)
                const userRef = doc(db, 'users', auth.currentUser.uid);
                const userSnap = await getDoc(userRef);
                const currentData = userSnap.exists() ? userSnap.data() : {};
                const currentStats = currentData.stats || { bestWpm: 0, totalGames: 0, avgWpm: 0, avgAccuracy: 0 };

                const newTotalGames = (currentStats.totalGames || 0) + 1;
                const newAvgWpm = Math.round(((currentStats.avgWpm || 0) * (currentStats.totalGames || 0) + finalWpm) / newTotalGames);
                const newAvgAcc = Math.round(((currentStats.avgAccuracy || 0) * (currentStats.totalGames || 0) + finalAccuracy) / newTotalGames);

                await setDoc(userRef, {
                    stats: {
                        bestWpm: Math.max(currentStats.bestWpm || 0, finalWpm),
                        totalGames: newTotalGames,
                        avgWpm: newAvgWpm,
                        avgAccuracy: newAvgAcc,
                        lastWpm: finalWpm,
                        lastAccuracy: finalAccuracy,
                        updatedAt: serverTimestamp()
                    }
                }, { merge: true });

            } catch (err) {
                if (err.code === 'permission-denied') {
                    setSaveError(true);
                }
                console.warn("Telemetry Sync Restricted:", err.code);
            }
        }
    };

    const ModeButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => !isConfigLocked && setMode(id)}
            disabled={isConfigLocked}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl transition-all ${mode === id ? 'text-primary' : 'text-secondary hover:text-text'} ${isConfigLocked ? 'cursor-not-allowed' : ''}`}
        >
            <Icon size={12} className="md:w-3.5 md:h-3.5" />
            <span className="text-[8px] md:text-[10px] uppercase font-black tracking-[0.2em]">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col gap-20 md:gap-32 w-full py-10">
            <div className={`flex justify-center flex-wrap items-center gap-2 md:gap-4 bg-sub p-2 md:p-4 rounded-3xl md:rounded-[2.5rem] self-center max-w-full transition-all duration-500 ${isConfigLocked ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                <div className="flex items-center gap-1 md:gap-2 pr-3 md:pr-6 border-r border-primary/10">
                    <button onClick={() => !isConfigLocked && setIncludePunctuation(!includePunctuation)} className={`text-[8px] md:text-[9px] font-mono px-2 md:px-3 py-1.5 rounded-lg transition-all ${includePunctuation ? 'text-primary' : 'text-secondary/40 hover:text-secondary'}`}>
                        @ punct
                    </button>
                    <button onClick={() => !isConfigLocked && setIncludeNumbers(!includeNumbers)} className={`text-[8px] md:text-[9px] font-mono px-2 md:px-3 py-1.5 rounded-lg transition-all ${includeNumbers ? 'text-primary' : 'text-secondary/40 hover:text-secondary'}`}>
                        # nums
                    </button>
                </div>
                <div className="flex items-center gap-1 md:gap-3 px-3 md:px-6 border-r border-primary/10">
                    <ModeButton id="time" icon={Timer} label="time" />
                    <ModeButton id="words" icon={Type} label="words" />
                    <ModeButton id="quote" icon={Quote} label="quote" />
                    <ModeButton id="zen" icon={Activity} label="zen" />
                </div>
                <div className="flex items-center gap-1 md:gap-2 pl-3 md:pl-6">
                    {(mode === 'time' ? [20, 30, 60, 120] : [10, 25, 50, 100]).map(val => (
                        <button key={val} onClick={() => !isConfigLocked && (mode === 'time' ? setDuration(val) : setWordCount(val))} className={`text-[9px] md:text-[10px] font-mono px-2 md:px-3 py-1 rounded-lg transition-all ${(mode === 'time' ? duration === val : wordCount === val) ? 'text-primary' : 'text-secondary/30 hover:text-secondary'}`}>
                            {val}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative cursor-text w-full flex flex-col items-center min-h-[150px] mt-8 md:mt-0" onClick={() => !isFinished && inputRef.current?.focus()}>
                {(mode === 'time' || mode === 'words' || mode === 'quote') && !isFinished && (
                    <div className="flex flex-col items-center gap-4">
                        <div className={`text-2xl md:text-[2rem] font-bold transition-all tabular-nums ${gameStarted ? (timeLeft <= 5 ? 'text-rose-500 animate-pulse scale-125' : 'text-primary') : 'text-primary/30'}`}>
                            {timeLeft}s
                        </div>
                        {settings.difficulty !== 'normal' && (
                            <div className="flex flex-col items-center gap-2">
                                <div className="px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/5 text-rose-500 text-[8px] font-black uppercase tracking-widest animate-pulse">
                                    {settings.difficulty} MODE
                                </div>
                                {settings.difficulty === 'master' && (
                                    <div className="text-[10px] font-mono text-secondary uppercase tracking-widest flex items-center gap-2">
                                        Chances: <span className={chances > 0 ? 'text-primary' : 'text-rose-500'}>{chances}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <AnimatePresence>
                            {showWarning && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute top-full mt-4 px-6 py-2 bg-rose-500 text-white text-[10px] font-black italic uppercase tracking-widest rounded-full shadow-lg shadow-rose-500/20"
                                >
                                    CRITICAL ERROR // ONE CHANCE REMAINING
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
                {!isFinished ? (
                    <div className={`typing-arena font-mono tracking-wider select-none text-center ${settings.blindMode ? 'opacity-0' : ''}`}>
                        {wordList.join(' ').split('').map((char, i) => {
                            let statusClasses = 'text-secondary/30';
                            if (i < inputValue.length) {
                                statusClasses = inputValue[i] === char ? 'text-text opacity-100' : 'text-rose-400 bg-rose-400/5 px-0.5 rounded-sm';
                            } else if (i === inputValue.length) {
                                statusClasses = 'caret';
                            }
                            return <span key={i} className={`${statusClasses} transition-colors duration-100`}>{char}</span>;
                        })}
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 w-full max-w-4xl space-y-16 z-50 relative">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatBox label="Velocity" value={stats.wpm} sub="WPM" color="text-primary" />
                            <StatBox label="Precision" value={stats.accuracy} sub="%" color="text-text" />
                            <StatBox label="Entropy" value={stats.errors} sub="ERR" color="text-secondary" />
                            <StatBox label="Mode" value={mode} sub="SYS" color="text-secondary/50" />
                        </div>

                        <AnimatePresence>
                            {saveError && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-center gap-4 bg-rose-500/10 border border-rose-500/20 py-4 px-8 rounded-2xl max-w-md mx-auto"
                                >
                                    <Zap size={16} className="text-rose-500 animate-pulse" />
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Telemetry Sync Blocked</p>
                                        <p className="text-[8px] font-mono text-secondary uppercase tracking-widest opacity-60">Score not saved to cloud infrastructure. Update Firestore Rules.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex justify-center items-center">
                            <button
                                onClick={generateNewWords}
                                title="Restart Game"
                                className="p-4 md:p-6 bg-sub text-secondary hover:text-primary rounded-2xl md:rounded-[2rem] border border-border-sub hover:border-primary/30 transition-all group active:rotate-180 duration-500 shadow-xl"
                            >
                                <KeyIcon size={24} className="md:w-8 md:h-8" />
                            </button>
                        </div>
                    </motion.div>
                )}

                <input
                    ref={inputRef}
                    type="text"
                    className={`absolute inset-0 opacity-0 w-full h-full cursor-text ${isFinished ? 'z-0 invisible' : 'z-30'}`}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    value={inputValue}
                    spellCheck="false"
                    autoComplete="off"
                    inputMode="text"
                />
            </div>

            <div className="flex justify-center items-center gap-16 opacity-30 text-[9px] font-mono text-secondary uppercase tracking-[0.5em] pt-12">
                <span className="flex items-center gap-2"><KeyIcon size={12} /> {settings.quickRestart} restart</span>
                <span className="flex items-center gap-2"><Zap size={10} className="text-primary" /> Signal Active</span>
            </div>
        </div>
    );
};

const StatBox = ({ label, value, sub, color }) => (
    <div className="flex flex-col items-center p-6 md:p-10 bg-sub rounded-3xl md:rounded-[3rem] w-full max-w-[140px] md:max-w-none">
        <span className="text-[8px] md:text-[10px] font-mono text-secondary uppercase tracking-[0.2em] md:tracking-[0.5em] mb-2 md:mb-6 opacity-60 text-center">{label}</span>
        <div className="flex items-baseline gap-1 md:gap-3">
            <span className={`text-5xl md:text-6xl font-black italic tracking-tighter ${color}`}>{value}</span>
            <span className="text-[8px] md:text-[10px] font-mono text-secondary opacity-60 uppercase">{sub}</span>
        </div>
    </div>
);

export default GameEngine;
