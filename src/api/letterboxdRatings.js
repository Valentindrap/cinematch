
// API to fetch user ratings from Letterboxd
// Scrapes the /films/ page which shows all rated movies

export async function fetchUserRatings(username) {
    const user = username.trim().toLowerCase()
    if (!user) return []

    let ratings = []

    // determine proxy URL base
    const proxy = import.meta.env.PROD
        ? '/api/proxy?url='
        : 'http://localhost:8010/proxy/'

    // We'll fetch up to 50 pages to be safe, but break if we hit 404 or empty
    // Letterboxd films page: https://letterboxd.com/{username}/films/page/{i}/

    for (let i = 1; i <= 50; i++) {
        // Add subtle delay to avoid rate limiting
        if (i > 1) await new Promise(r => setTimeout(r, 1000))

        try {
            const letterboxdUrl = `https://letterboxd.com/${user}/films/page/${i}/`
            const proxyUrl = import.meta.env.PROD
                ? `${proxy}${encodeURIComponent(letterboxdUrl)}`
                : `${proxy}${user}/films/page/${i}/`

            const response = await fetch(proxyUrl)
            if (!response.ok) break

            const html = await response.text()
            const doc = new DOMParser().parseFromString(html, 'text/html')

            // Letterboxd uses .poster-container inside .poster-list
            // The rating is usually in a span class="rating" or data attribute
            // Actually on the /films/ page, the rating is often in the poster-container data attributes
            // specifically data-owner-rating (0-10)

            const items = doc.querySelectorAll('.poster-container')
            if (items.length === 0) break

            items.forEach(item => {
                const img = item.querySelector('img')
                const title = img?.alt || "N/A"
                const filmSlug = item.getAttribute('data-film-slug') // crucial for matching
                const ratingAttr = item.getAttribute('data-owner-rating')

                // Only include if rated
                if (ratingAttr && ratingAttr !== "0") {
                    ratings.push({
                        title: title,
                        slug: filmSlug,
                        rating: parseInt(ratingAttr) / 2, // Convert 0-10 to 0-5
                        year: "N/A" // We might not get year easily, but that's okay for now
                    })
                }
            })

        } catch (e) {
            console.error(`Error fetching page ${i} for ${user}`, e)
            break
        }
    }

    return ratings
}
