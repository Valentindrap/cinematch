// Achievement definitions and unlock logic

export const ACHIEVEMENTS = {
    GENRE_MARATHON: {
        id: 'genre_marathon',
        name: 'Maratón de Géneros',
        description: 'Ver una película de cada género',
        icon: '🎭',
        requiredGenres: 5,
    },
    TIME_TRAVELER: {
        id: 'time_traveler',
        name: 'Viajero del Tiempo',
        description: 'Ver películas de 5 décadas diferentes',
        icon: '⏰',
        requiredDecades: 5,
    },
    DEMANDING_CRITIC: {
        id: 'demanding_critic',
        name: 'Crítico Exigente',
        description: 'Ver 10 películas con rating >8.0',
        icon: '⭐',
        requiredHighRated: 10,
    },
    SOCIAL_BUTTERFLY: {
        id: 'social_butterfly',
        name: 'Mariposa Social',
        description: 'Crear un grupo de cine',
        icon: '🦋',
    },
    LUCKY_STREAK: {
        id: 'lucky_streak',
        name: 'Racha de Suerte',
        description: 'Ver 5 películas seguidas',
        icon: '🎰',
        requiredStreak: 5,
    },
    BINGE_WATCHER: {
        id: 'binge_watcher',
        name: 'Adicto al Cine',
        description: 'Ver 20 películas en total',
        icon: '📺',
        requiredTotal: 20,
    },
    COMPLETIONIST: {
        id: 'completionist',
        name: 'Completista',
        description: 'Ver todas las películas en común con tus amigos',
        icon: '✅',
    },
    EXPLORER: {
        id: 'explorer',
        name: 'Explorador',
        description: 'Usar todos los modos de juego',
        icon: '🧭',
    },
};

export const checkAchievements = (watchedMovies, groups, modesUsed = []) => {
    const unlocked = [];

    // Genre Marathon
    const uniqueGenres = new Set();
    watchedMovies.forEach(movie => {
        if (movie.genres) {
            movie.genres.forEach(g => uniqueGenres.add(g));
        }
    });
    if (uniqueGenres.size >= ACHIEVEMENTS.GENRE_MARATHON.requiredGenres) {
        unlocked.push(ACHIEVEMENTS.GENRE_MARATHON.id);
    }

    // Time Traveler
    const uniqueDecades = new Set();
    watchedMovies.forEach(movie => {
        const year = parseInt(movie.year);
        if (!isNaN(year)) {
            uniqueDecades.add(Math.floor(year / 10) * 10);
        }
    });
    if (uniqueDecades.size >= ACHIEVEMENTS.TIME_TRAVELER.requiredDecades) {
        unlocked.push(ACHIEVEMENTS.TIME_TRAVELER.id);
    }

    // Demanding Critic
    const highRatedCount = watchedMovies.filter(m => {
        const rating = parseFloat(m.rating);
        return !isNaN(rating) && rating > 8.0;
    }).length;
    if (highRatedCount >= ACHIEVEMENTS.DEMANDING_CRITIC.requiredHighRated) {
        unlocked.push(ACHIEVEMENTS.DEMANDING_CRITIC.id);
    }

    // Social Butterfly
    if (groups.length > 0) {
        unlocked.push(ACHIEVEMENTS.SOCIAL_BUTTERFLY.id);
    }

    // Binge Watcher
    if (watchedMovies.length >= ACHIEVEMENTS.BINGE_WATCHER.requiredTotal) {
        unlocked.push(ACHIEVEMENTS.BINGE_WATCHER.id);
    }

    // Explorer
    const requiredModes = ['match', 'all', 'battle', 'discovery', 'classics'];
    if (requiredModes.every(mode => modesUsed.includes(mode))) {
        unlocked.push(ACHIEVEMENTS.EXPLORER.id);
    }

    return unlocked;
};

// Calculate user score based on activity
export const calculateUserScore = (watchedMovies, achievements) => {
    let score = 0;

    // Points for watched movies
    score += watchedMovies.length * 10;

    // Bonus for high-rated movies
    watchedMovies.forEach(movie => {
        const rating = parseFloat(movie.rating);
        if (!isNaN(rating) && rating >= 8.0) {
            score += 5;
        }
    });

    // Points for achievements
    score += achievements.length * 50;

    return score;
};
