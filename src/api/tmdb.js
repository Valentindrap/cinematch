import { cacheManager } from '../utils/cache';

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2OTA4YmY3ZmZmNTIwZTUzNGFjNDUxZjE5ZDNiNzJlNyIsIm5iZiI6MTc3MDkyMzk3Ni4yNDUsInN1YiI6IjY5OGUyN2M4ZGNhZDgwNjFkNjE1NGNmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.bcKVI74AMid0byCmoFWYQIgi2XpSzNFo7L6GubfAE5w";
const BASE_URL = "https://api.themoviedb.org/3";

const tmdbFetch = async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${TMDB_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
    }

    return response.json();
};

export const tmdbAPI = {
    // Search for a movie
    searchMovie: async (query) => {
        const cacheKey = `search_${query.toLowerCase()}`;
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;

        try {
            const data = await tmdbFetch(`/search/movie?query=${encodeURIComponent(query)}&language=es-ES`);
            cacheManager.set(cacheKey, data);
            return data;
        } catch (e) {
            console.error('Search error:', e);
            return { results: [] };
        }
    },

    // Get movie details
    getMovieDetails: async (movieId) => {
        const cacheKey = `details_${movieId}`;
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;

        try {
            const data = await tmdbFetch(`/movie/${movieId}?language=es-ES`);
            cacheManager.set(cacheKey, data);
            return data;
        } catch (e) {
            console.error('Details error:', e);
            return null;
        }
    },

    // Get movie credits (cast and crew)
    getMovieCredits: async (movieId) => {
        const cacheKey = `credits_${movieId}`;
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;

        try {
            const data = await tmdbFetch(`/movie/${movieId}/credits`);
            cacheManager.set(cacheKey, data);
            return data;
        } catch (e) {
            console.error('Credits error:', e);
            return { cast: [], crew: [] };
        }
    },

    // Get movie videos (trailers)
    getMovieVideos: async (movieId) => {
        const cacheKey = `videos_${movieId}`;
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;

        try {
            const data = await tmdbFetch(`/movie/${movieId}/videos?language=es-ES`);
            cacheManager.set(cacheKey, data);
            return data;
        } catch (e) {
            console.error('Videos error:', e);
            return { results: [] };
        }
    },

    // Get similar movies
    getSimilarMovies: async (movieId) => {
        const cacheKey = `similar_${movieId}`;
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;

        try {
            const data = await tmdbFetch(`/movie/${movieId}/similar?language=es-ES`);
            cacheManager.set(cacheKey, data);
            return data;
        } catch (e) {
            console.error('Similar movies error:', e);
            return { results: [] };
        }
    },

    // Get enriched data for one movie (combines search + details + credits + videos)
    getEnrichedMovieData: async (movieTitle) => {
        try {
            // Search movie
            const searchResults = await tmdbAPI.searchMovie(movieTitle);
            if (!searchResults.results || searchResults.results.length === 0) {
                return null;
            }

            const movie = searchResults.results[0];
            const movieId = movie.id;

            // Get additional data in parallel
            const [details, credits, videos] = await Promise.all([
                tmdbAPI.getMovieDetails(movieId),
                tmdbAPI.getMovieCredits(movieId),
                tmdbAPI.getMovieVideos(movieId)
            ]);

            return {
                id: movieId,
                title: movie.title,
                overview: details?.overview || movie.overview,
                year: movie.release_date?.split('-')[0] || 'N/A',
                rating: movie.vote_average ? movie.vote_average.toFixed(1) : '0.0',
                poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
                genres: details?.genres || [],
                runtime: details?.runtime || null,
                director: credits?.crew?.find(person => person.job === 'Director')?.name || 'N/A',
                cast: credits?.cast?.slice(0, 5).map(person => person.name) || [],
                trailer: videos?.results?.find(v => v.type === 'Trailer')?.key || null,
            };
        } catch (e) {
            console.error('Enriched data error:', e);
            return null;
        }
    },

    // Batch get basic data for multiple movies (optimized)
    getBatchMovieData: async (movieTitles) => {
        const results = await Promise.all(
            movieTitles.map(async (title) => {
                try {
                    const searchResults = await tmdbAPI.searchMovie(title);
                    if (searchResults.results && searchResults.results.length > 0) {
                        const movie = searchResults.results[0];
                        return {
                            title: title,
                            year: movie.release_date?.split('-')[0] || 'N/A',
                            rating: movie.vote_average ? movie.vote_average.toFixed(1) : '0.0',
                            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                            genres: movie.genre_ids || [],
                            id: movie.id,
                        };
                    }
                } catch (e) {
                    console.error(`Error fetching ${title}:`, e);
                }
                return { title, year: 'N/A', rating: '0.0', poster: null, genres: [], id: null };
            })
        );
        return results;
    },

    // Get genre list
    getGenres: async () => {
        const cacheKey = 'genres';
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;

        try {
            const data = await tmdbFetch('/genre/movie/list?language=es-ES');
            cacheManager.set(cacheKey, data);
            return data.genres || [];
        } catch (e) {
            console.error('Genres error:', e);
            return [];
        }
    },
};
