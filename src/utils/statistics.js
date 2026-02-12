// Statistics calculation utilities

export const calculateStatistics = (movies, users) => {
    // Genre distribution
    const genreMap = {};
    const genreNames = {
        28: 'Acción', 12: 'Aventura', 16: 'Animación', 35: 'Comedia',
        80: 'Crimen', 99: 'Documental', 18: 'Drama', 10751: 'Familia',
        14: 'Fantasía', 36: 'Historia', 27: 'Terror', 10402: 'Música',
        9648: 'Misterio', 10749: 'Romance', 878: 'Ciencia ficción',
        10770: 'Película de TV', 53: 'Suspense', 10752: 'Bélica', 37: 'Western'
    };

    movies.forEach(movie => {
        if (movie.genres && Array.isArray(movie.genres)) {
            movie.genres.forEach(genre => {
                // Handle both genre objects {id, name} and plain genre IDs
                let name;
                if (typeof genre === 'object' && genre.name) {
                    name = genre.name; // Use the name from TMDB directly
                } else {
                    const genreId = typeof genre === 'object' ? genre.id : genre;
                    name = genreNames[genreId] || `Género ${genreId}`;
                }
                genreMap[name] = (genreMap[name] || 0) + 1;
            });
        }
    });

    // Decade distribution
    const decadeMap = {};
    movies.forEach(movie => {
        const year = parseInt(movie.year);
        if (!isNaN(year)) {
            const decade = Math.floor(year / 10) * 10;
            decadeMap[`${decade}s`] = (decadeMap[`${decade}s`] || 0) + 1;
        }
    });

    // Rating distribution
    const ratingBuckets = {
        '0-2': 0, '2-4': 0, '4-6': 0, '6-8': 0, '8-10': 0
    };

    movies.forEach(movie => {
        const rating = parseFloat(movie.rating);
        if (!isNaN(rating)) {
            if (rating < 2) ratingBuckets['0-2']++;
            else if (rating < 4) ratingBuckets['2-4']++;
            else if (rating < 6) ratingBuckets['4-6']++;
            else if (rating < 8) ratingBuckets['6-8']++;
            else ratingBuckets['8-10']++;
        }
    });

    // User compatibility (for 2 users)
    let compatibility = 0;
    if (users.length === 2) {
        const [user1, user2] = users;
        const user1Movies = movies.filter(m => m.owners.includes(user1));
        const user2Movies = movies.filter(m => m.owners.includes(user2));
        const commonMovies = movies.filter(m =>
            m.owners.includes(user1) && m.owners.includes(user2)
        );

        const totalUnique = user1Movies.length + user2Movies.length - commonMovies.length;
        compatibility = totalUnique > 0 ? (commonMovies.length / totalUnique) * 100 : 0;
    }

    // Average rating
    const totalRating = movies.reduce((sum, m) => sum + (parseFloat(m.rating) || 0), 0);
    const averageRating = movies.length > 0 ? totalRating / movies.length : 0;

    return {
        genreDistribution: genreMap,
        decadeDistribution: decadeMap,
        ratingDistribution: ratingBuckets,
        compatibility: compatibility.toFixed(1),
        averageRating: averageRating.toFixed(1),
        totalMovies: movies.length,
    };
};

// Generate word cloud data from movie titles
export const generateWordCloudData = (movies) => {
    const wordMap = {};
    const commonWords = new Set([
        'el', 'la', 'los', 'las', 'de', 'del', 'a', 'en', 'y', 'un', 'una',
        'the', 'a', 'an', 'of', 'and', 'to', 'in', 'for'
    ]);

    movies.forEach(movie => {
        const words = movie.title.toLowerCase().split(/\s+/);
        words.forEach(word => {
            const cleaned = word.replace(/[^\w]/g, '');
            if (cleaned.length > 3 && !commonWords.has(cleaned)) {
                wordMap[cleaned] = (wordMap[cleaned] || 0) + 1;
            }
        });
    });

    return Object.entries(wordMap)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50);
};
