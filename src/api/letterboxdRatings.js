
// API to fetch user ratings from Letterboxd
// Uses RSS feed to avoid robust anti-scraping blocks on the /films/ pages
// Limitation: helper returns only the last ~50 items of activity

export async function fetchUserRatings(username) {
    const user = username.trim().toLowerCase()
    if (!user) return []

    let ratings = []

    // RSS Feed URL
    const rssUrl = `https://letterboxd.com/${user}/rss/`

    // Proxy logic: Try Vercel proxy first, corsproxy.io as backup
    const proxy = import.meta.env.PROD
        ? '/api/proxy?url='
        : 'https://corsproxy.io/?'

    // Encode the URL for the proxy
    const targetUrl = import.meta.env.PROD
        ? `${proxy}${encodeURIComponent(rssUrl)}`
        : `${proxy}${encodeURIComponent(rssUrl)}`

    try {
        console.log(`Fetching RSS for ${user} via ${targetUrl}`)
        const response = await fetch(targetUrl)
        if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`)

        const xmlText = await response.text()
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, "text/xml")

        const items = xmlDoc.querySelectorAll("item")

        items.forEach(item => {
            // Namespace handling can be tricky in DOMParser, usually tag names include prefix or not
            // We check both just in case
            const title =
                item.getElementsByTagName("letterboxd:filmTitle")[0]?.textContent ||
                item.getElementsByTagName("filmTitle")[0]?.textContent

            const ratingEl =
                item.getElementsByTagName("letterboxd:memberRating")[0] ||
                item.getElementsByTagName("memberRating")[0]

            const year =
                item.getElementsByTagName("letterboxd:filmYear")[0]?.textContent ||
                item.getElementsByTagName("filmYear")[0]?.textContent

            // Only add if it's a rated film
            if (title && ratingEl) {
                const rating = parseFloat(ratingEl.textContent)

                // Avoid duplicates
                if (!ratings.some(r => r.title === title)) {
                    ratings.push({
                        title: title,
                        slug: title.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
                        rating: rating,
                        year: year || "N/A"
                    })
                }
            }
        })

        console.log(`Parsed ${ratings.length} ratings for ${user}`)

    } catch (e) {
        console.error(`Error fetching RSS for ${user}`, e)
    }

    return ratings
}
