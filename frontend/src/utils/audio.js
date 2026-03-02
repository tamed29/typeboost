/**
 * Web Audio API utility for generating terminal-style beeps.
 */

let audioCtx = null;

const getAudioCtx = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
};

export const playBeep = (frequency = 440, duration = 100, volume = 0.1, type = 'sine') => {
    try {
        const ctx = getAudioCtx();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
        console.warn("Audio Context failed to initialize", e);
    }
};

export const playCountdownBeep = () => {
    playBeep(800, 100, 0.05, 'sine');
};

export const playFinishBeep = () => {
    // Play a short triumphant chord or a higher beep
    playBeep(1200, 300, 0.1, 'sine');
};
