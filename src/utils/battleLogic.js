
import { tmdbAPI } from '../api/tmdb'

export async function processBattleData(usersData) {
    // usersData is array of { username, ratings: [...] }
    if (!usersData || usersData.length < 2) return []

    // 1. Map all movies by slug to find intersections
    // movieMap = { 
    //   "the-matrix": { 
    //      title: "The Matrix", 
    //      ratings: { user1: 5, user2: 4 },
    //      count: 2
    //   } 
    // }

    const movieMap = {}
    const totalUsers = usersData.length

    usersData.forEach(userEntry => {
        userEntry.ratings.forEach(movie => {
            if (!movie.slug) return

            if (!movieMap[movie.slug]) {
                movieMap[movie.slug] = {
                    title: movie.title,
                    slug: movie.slug,
                    poster: null, // We'll need to fetch posters later or use what we have
                    ratings: {},
                    count: 0,
                    totalScore: 0
                }
            }

            movieMap[movie.slug].ratings[userEntry.username] = movie.rating
            movieMap[movie.slug].count++
            movieMap[movie.slug].totalScore += movie.rating
        })
    })

    // 2. Filter for Intersection (must be rated by ALL users)
    const commonMovies = Object.values(movieMap).filter(m => m.count === totalUsers)

    // 3. Enrich with basic stats and fetch posters if needed
    // We'll limit poster fetching to avoid rate limits if list is huge
    const BATCH_SIZE = 10
    const enrichedMovies = []

    // Initial basic processing
    const processed = commonMovies.map(m => {
        const average = m.totalScore / totalUsers

        // Calculate max difference (controversy)
        const scores = Object.values(m.ratings)
        const minScore = Math.min(...scores)
        const maxScore = Math.max(...scores)
        const diff = maxScore - minScore

        return {
            ...m,
            average,
            diff: parseFloat(diff.toFixed(1)),
            formattedAvg: average.toFixed(1)
        }
    })

    return processed
}

export async function enrichWithPosters(movies) {
    // This can be called progressively to load images
    // For now, we'll just return the movies and let the UI handle images individually 
    // or rely on what we have. 
    // Since scraping doesn't give good poster URLs usually, we might need TMDB.

    const enriched = await Promise.all(movies.map(async (m) => {
        try {
            const tmdbData = await tmdbAPI.searchMovie(m.title)
            if (tmdbData) {
                return { ...m, poster: tmdbData.poster }
            }
        } catch (e) { console.error(e) }
        return m
    }))
    return enriched
}
