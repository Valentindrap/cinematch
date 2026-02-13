
// import { tmdbAPI } from '../api/tmdb'

export async function processBattleData(usersData) {
    // usersData is array of { username, ratings: [...] }
    if (!usersData || usersData.length < 2) return []

    // 1. Map all movies by slug to find intersections
    const movieMap = {}
    const totalUsers = usersData.length
    const userNames = usersData.map(u => u.username)

    usersData.forEach(userEntry => {
        userEntry.ratings.forEach(movie => {
            if (!movie.slug) return

            if (!movieMap[movie.slug]) {
                movieMap[movie.slug] = {
                    title: movie.title,
                    slug: movie.slug,
                    poster: null,
                    ratings: {}, // { user1: 4, user2: 5 }
                    year: movie.year,
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

    // 3. Calculate Similarity (Pearson Correlation for first 2 users)
    // Only feasible if we have exactly 2 users or we average pairs. 
    // For now, let's assume 2 users for the main "match" score.
    let similarityScore = 0
    if (totalUsers === 2) {
        const u1 = userNames[0]
        const u2 = userNames[1]

        let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0
        let n = commonMovies.length

        if (n > 0) {
            commonMovies.forEach(m => {
                const r1 = m.ratings[u1]
                const r2 = m.ratings[u2]
                sum1 += r1
                sum2 += r2
                sum1Sq += r1 * r1
                sum2Sq += r2 * r2
                pSum += r1 * r2
            })

            const num = pSum - (sum1 * sum2 / n)
            const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n))

            if (den === 0) similarityScore = 0
            else similarityScore = num / den
        }
    }

    // 4. Process basic stats for list
    const processed = commonMovies.map(m => {
        const average = m.totalScore / totalUsers
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

    // Return extended object, not just array
    return {
        movies: processed,
        similarityScore: (similarityScore * 100).toFixed(0), // -100 to 100 range usually, but here we normalized? Pearson is -1 to 1. 
        // Let's map -1...1 to 0...100% for display
        // Actually, simple Pearson: 1 = 100%, 0 = 50%, -1 = 0% match? 
        // Or just show direct correlation. Let's do: (r + 1) / 2 * 100
        compatibility: Math.max(0, Math.min(100, ((similarityScore + 1) / 2 * 100).toFixed(0)))
    }
}

// ... unchanged enrichWithMetadata ...
export async function enrichWithMetadata(movies, onProgress) {
    const enriched = [...movies]
    const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2OTA4YmY3ZmZmNTIwZTUzNGFjNDUxZjE5ZDNiNzJlNyIsIm5iZiI6MTc3MDkyMzk3Ni4yNDUsInN1YiI6IjY5OGUyN2M4ZGNhZDgwNjFkNjE1NGNmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.bcKVI74AMid0byCmoFWYQIgi2XpSzNFo7L6GubfAE5w";
    const headers = { Authorization: `Bearer ${TMDB_TOKEN}`, 'Content-Type': 'application/json' }
    const BATCH_SIZE = 5

    let processedCount = 0
    if (onProgress) onProgress(0, enriched.length)

    for (let i = 0; i < enriched.length; i += BATCH_SIZE) {
        const batch = enriched.slice(i, i + BATCH_SIZE)
        await Promise.all(batch.map(async (movie) => {
            if (movie.poster) { processedCount++; return }
            try {
                const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movie.title)}&language=es-ES&year=${movie.year !== 'N/A' ? movie.year : ''}`, { headers })
                const searchData = await searchRes.json()
                if (searchData.results && searchData.results.length > 0) {
                    const bestMatch = searchData.results[0]
                    movie.poster = bestMatch.poster_path ? `https://image.tmdb.org/t/p/w200${bestMatch.poster_path}` : null
                    movie.tmdbId = bestMatch.id
                    movie.genres = bestMatch.genre_ids
                    movie.backdrop = bestMatch.backdrop_path ? `https://image.tmdb.org/t/p/w500${bestMatch.backdrop_path}` : null
                    if (movie.tmdbId) {
                        const creditsRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.tmdbId}/credits`, { headers })
                        const creditsData = await creditsRes.json()
                        movie.cast = creditsData.cast ? creditsData.cast.slice(0, 5) : []
                        movie.crew = creditsData.crew ? creditsData.crew.filter(c => c.job === 'Director') : []
                        const detailsRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.tmdbId}?language=es-ES`, { headers })
                        const detailsData = await detailsRes.json()
                        movie.genres = detailsData.genres || []
                    }
                }
            } catch (e) {
                console.error(`Failed to enrich ${movie.title}`, e)
            } finally { processedCount++ }
        }))
        if (onProgress) onProgress(processedCount, enriched.length)
        await new Promise(r => setTimeout(r, 200))
    }
    return enriched
}

export function calculateBattleStats(movies, users) {
    // users: ["UserA", "UserB"]
    const actorCounts = {}
    const directorCounts = {}
    const genreCounts = {}
    const decadeCounts = {}

    let totalMovies = 0

    movies.forEach(m => {
        if (!m.cast) return
        totalMovies++

        // Decade analysis
        const year = parseInt(m.year)
        if (!isNaN(year)) {
            const decade = Math.floor(year / 10) * 10
            if (!decadeCounts[decade]) decadeCounts[decade] = { count: 0, movies: [] }
            decadeCounts[decade].count++
        }

        // Helper to process entity
        const processEntity = (list, type) => {
            list.forEach(item => {
                const dict = type === 'actor' ? actorCounts : directorCounts
                if (!dict[item.id]) {
                    dict[item.id] = {
                        id: item.id,
                        name: item.name,
                        profile: item.profile_path,
                        count: 0,
                        movies: [],
                        userRatings: {} // { UserA: { total: 10, count: 2 }, UserB: ... }
                    }
                    users.forEach(u => dict[item.id].userRatings[u] = { total: 0, count: 0 })
                }

                const entry = dict[item.id]
                entry.count++
                entry.movies.push(m.title)

                // Accumulate stats per user
                users.forEach(u => {
                    if (m.ratings[u]) {
                        entry.userRatings[u].total += m.ratings[u]
                        entry.userRatings[u].count++
                    }
                })
            })
        }

        processEntity(m.cast, 'actor')
        processEntity(m.crew, 'director')

        m.genres.forEach(g => {
            if (!genreCounts[g.id]) genreCounts[g.id] = { id: g.id, name: g.name, count: 0 }
            genreCounts[g.id].count++
        })
    })

    // Process Helpers
    const processStats = (counts) => {
        return Object.values(counts)
            .map(item => {
                const processedUserRatings = {}
                users.forEach(u => {
                    const ur = item.userRatings[u]
                    processedUserRatings[u] = ur.count > 0 ? (ur.total / ur.count).toFixed(1) : '-'
                })

                // Calculate total average for sorting
                let totalSum = 0, totalCount = 0
                users.forEach(u => {
                    totalSum += item.userRatings[u].total
                    totalCount += item.userRatings[u].count
                })

                return {
                    ...item,
                    avgRating: totalCount > 0 ? (totalSum / totalCount).toFixed(1) : '0.0',
                    userRatings: processedUserRatings
                }
            })
            .sort((a, b) => b.count - a.count || b.avgRating - a.avgRating)
            .slice(0, 5)
    }

    const topActors = processStats(actorCounts)
    const topDirectors = processStats(directorCounts)

    // Process decades
    const topDecades = Object.entries(decadeCounts)
        .map(([year, data]) => ({ decade: `${year}s`, count: data.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)

    return {
        topActors,
        topDirectors,
        topGenres: Object.values(genreCounts).sort((a, b) => b.count - a.count).slice(0, 10),
        topDecade: topDecades[0],
        totalAnalyzed: totalMovies
    }
}
