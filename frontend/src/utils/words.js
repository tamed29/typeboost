/**
 * Professional Word Pool for TypeBoost
 * Categorized for different challenge levels.
 */

export const QUOTES = [
    "The only way to do great work is to love what you do.",
    "Innovation distinguishes between a leader and a follower.",
    "Talk is cheap. Show me the code.",
    "Programs must be written for people to read, and only incidentally for machines to execute.",
    "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    "First, solve the problem. Then, write the code.",
    "Simplicity is the soul of efficiency.",
    "Code is like humor. When you have to explain it, it's bad."
];

export const CODING_WORDS = [
    "function", "const", "let", "async", "await", "import", "export", "default",
    "return", "component", "interface", "distributed", "asynchronous", "scalability",
    "architecture", "middleware", "deployment", "authentication", "authorization",
    "repository", "endpoint", "protocol", "synchronization", "encryption", "decryption",
    "concurrency", "optimization", "refactoring", "documentation", "abstraction",
    "inheritance", "polymorphism", "encapsulation", "instantiation", "constructor",
    "destructuring", "callback", "promise", "observable", "singleton", "prototype",
    "immutable", "container", "microservice", "infrastructure", "virtualization",
    "containerization", "orchestration", "performance", "bottleneck", "deadlock"
];

export const SCI_FI_WORDS = [
    "cybernetic", "augmentation", "synthetic", "simulation", "matrix", "neural",
    "interface", "uplink", "downlink", "frequency", "resonance", "quantum",
    "singularity", "mainframe", "terminal", "biosync", "nanotech", "holographic",
    "encryption", "decryption", "override", "protocol", "signal", "bandwidth",
    "latency", "overclock", "firewall", "mainframe", "database", "operative",
    "signature", "genetic", "hologram", "plasma", "warp", "telemetry", "void"
];

export const GENERAL_WORDS = [
    "the", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog",
    "standard", "professional", "accuracy", "velocity", "precision", "focus",
    "mastery", "practice", "consistency", "smoothness", "rhythm", "effort",
    "success", "failure", "progress", "growth", "challenge", "potential",
    "experience", "knowledge", "wisdom", "intelligent", "efficient", "rapid"
];

export const generateWords = (mode = 'words', count = 50, options = {}) => {
    const { includePunctuation, includeNumbers } = options;
    let pool = [...GENERAL_WORDS, ...CODING_WORDS, ...SCI_FI_WORDS];

    const PUNCTUATION = [".", ",", "!", "?", ";", ":", "-", "(", ")", "\"", "'"];
    const NUMBERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    const result = [...Array(count)].map(() => {
        let word = pool[Math.floor(Math.random() * pool.length)];
        if (includeNumbers && Math.random() > 0.8) {
            word += NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
        }
        if (includePunctuation && Math.random() > 0.7) {
            word += PUNCTUATION[Math.floor(Math.random() * PUNCTUATION.length)];
        }
        return word;
    });

    return result;
};
