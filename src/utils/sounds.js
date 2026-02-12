// Sound effects manager

class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
    }

    loadSound(name, url) {
        this.sounds[name] = new Audio(url);
    }

    play(name) {
        if (!this.enabled || !this.sounds[name]) return;

        const sound = this.sounds[name].cloneNode();
        sound.volume = 0.3;
        sound.play().catch(e => console.log('Sound play failed:', e));
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    // Create simple beeps using Web Audio API
    playBeep(frequency = 440, duration = 200) {
        if (!this.enabled) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (e) {
            console.log('Beep failed:', e);
        }
    }

    // Roulette tick sound
    playTick() {
        this.playBeep(800, 50);
    }

    // Winner sound (ascending notes)
    playWinner() {
        if (!this.enabled) return;

        [262, 330, 392, 523].forEach((freq, i) => {
            setTimeout(() => this.playBeep(freq, 200), i * 150);
        });
    }

    // Achievement unlock sound
    playAchievement() {
        if (!this.enabled) return;

        [523, 659, 784, 1047].forEach((freq, i) => {
            setTimeout(() => this.playBeep(freq, 150), i * 100);
        });
    }

    // Error sound
    playError() {
        this.playBeep(200, 300);
    }
}

export const soundManager = new SoundManager();
