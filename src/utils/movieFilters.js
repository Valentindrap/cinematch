// Filter utilities for movie data

export const movieFilters = {
    // Filter by genres
    byGenres: (movies, selectedGenreIds) => {
        if (!selectedGenreIds || selectedGenreIds.length === 0) return movies;

        return movies.filter(movie => {
            if (!movie.genres || movie.genres.length === 0) return false;
            // Handle both genre objects {id, name} and plain IDs
            return movie.genres.some(genre => {
                const genreId = typeof genre === 'object' ? genre.id : genre;
                return selectedGenreIds.includes(genreId);
            });
        });
    },

    // Filter by year range
    byYearRange: (movies, yearRange) => {
        const [minYear, maxYear] = yearRange;
        return movies.filter(movie => {
            const year = parseInt(movie.year);
            if (isNaN(year)) return false;
            return year >= minYear && year <= maxYear;
        });
    },

    // Filter by rating range
    byRatingRange: (movies, ratingRange) => {
        const [minRating, maxRating] = ratingRange;
        return movies.filter(movie => {
            const rating = parseFloat(movie.rating);
            if (isNaN(rating)) return false;
            return rating >= minRating && rating <= maxRating;
        });
    },

    // Filter by duration
    byDuration: (movies, durationType) => {
        if (durationType === 'all') return movies;

        return movies.filter(movie => {
            if (!movie.runtime) return false;

            switch (durationType) {
                case 'short':
                    return movie.runtime < 90;
                case 'medium':
                    return movie.runtime >= 90 && movie.runtime <= 150;
                case 'long':
                    return movie.runtime > 150;
                default:
                    return true;
            }
        });
    },

    // Apply all filters
    applyAllFilters: (movies, filters) => {
        let filtered = [...movies];

        if (filters.genres && filters.genres.length > 0) {
            filtered = movieFilters.byGenres(filtered, filters.genres);
        }

        if (filters.yearRange) {
            filtered = movieFilters.byYearRange(filtered, filters.yearRange);
        }

        if (filters.ratingRange) {
            filtered = movieFilters.byRatingRange(filtered, filters.ratingRange);
        }

        if (filters.duration && filters.duration !== 'all') {
            filtered = movieFilters.byDuration(filtered, filters.duration);
        }

        return filtered;
    },

    // Get filter statistics
    getFilterStats: (movies) => {
        const genreCounts = {};
        let totalRuntime = 0;
        let runtimeCount = 0;

        movies.forEach(movie => {
            if (movie.genres) {
                movie.genres.forEach(genre => {
                    // Handle both genre objects {id, name} and plain IDs
                    const genreId = typeof genre === 'object' ? genre.id : genre;
                    genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
                });
            }

            if (movie.runtime) {
                totalRuntime += movie.runtime;
                runtimeCount++;
            }
        });

        return {
            genreCounts,
            averageRuntime: runtimeCount > 0 ? totalRuntime / runtimeCount : 0,
            totalMovies: movies.length,
        };
    },
};

// Game mode utilities
export const gameModes = {
    // Match mode: movies common to all users
    match: (movieMap, activeUsers) => {
        return Object.values(movieMap).filter(
            movie => movie.owners.length === activeUsers.length
        );
    },

    // Single/All mode: all movies from all users
    all: (movieMap) => {
        return Object.values(movieMap);
    },

    // Battle of Tastes: compare average ratings per user
    battleOfTastes: (movieMap, activeUsers) => {
        const userStats = {};

        activeUsers.forEach(user => {
            const userMovies = Object.values(movieMap).filter(m =>
                m.owners.includes(user)
            );

            const totalRating = userMovies.reduce((sum, m) =>
                sum + (parseFloat(m.rating) || 0), 0
            );

            userStats[user] = {
                count: userMovies.length,
                averageRating: userMovies.length > 0 ? totalRating / userMovies.length : 0,
                movies: userMovies,
            };
        });

        return userStats;
    },

    // Discovery: movies unique to each user
    discovery: (movieMap, username) => {
        return Object.values(movieMap).filter(
            movie => movie.owners.length === 1 && movie.owners[0] === username
        );
    },

    // Classics vs Modern: split by year threshold
    classicsVsModern: (movieMap, yearThreshold = 2000) => {
        const movies = Object.values(movieMap);

        return {
            classics: movies.filter(m => {
                const year = parseInt(m.year);
                return !isNaN(year) && year < yearThreshold;
            }),
            modern: movies.filter(m => {
                const year = parseInt(m.year);
                return !isNaN(year) && year >= yearThreshold;
            }),
        };
    },
};
