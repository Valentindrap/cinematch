
// API to fetch user ratings from Letterboxd
// Strategy: Scraping with Proxy Rotation to bypass 403s
// RSS was too limited (only 20-50 items). We need full history.

export async function fetchUserRatings(username) {
    const user = username.trim().toLowerCase()
    if (!user) return []

    let ratings = []

    // List of proxies to try
    // 1. Vercel internal proxy (might be blocked)
    // 2. corsproxy.io (reliable)
    // 3. allorigins.win (fallback)

    const proxies = [
        {
            name: 'vercel',
            url: (target) => import.meta.env.PROD
                ? `/api/proxy?url=${encodeURIComponent(target)}`
                : `http://localhost:8010/proxy/${target.replace('https://letterboxd.com/', '')}`
        },
        {
            name: 'corsproxy',
            url: (target) => `https://corsproxy.io/?${encodeURIComponent(target)}`
        },
        {
            name: 'allorigins',
            url: (target) => `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`
        }
    ]

    // Determine which proxy works correctly for the first page
    let activeProxy = null

    // Helper to fetch text content
    const fetchText = async (url, proxyObj) => {
        try {
            const res = await fetch(proxyObj.url(url))
            if (!res.ok) throw new Error(`Status ${res.status}`)

            // allorigins returns JSON with contents
            if (proxyObj.name === 'allorigins') {
                const data = await res.json()
                return data.contents
            }
            return await res.text()
        } catch (e) {
            console.warn(`Proxy ${proxyObj.name} failed:`, e)
            return null
        }
    }

    // Try to find a working proxy on page 1
    for (const p of proxies) {
        // Skip vercel proxy on local if we know it fails for scraping, but keeping it for now
        // Modify this based on your local setup

        console.log(`Testing proxy: ${p.name}`)
        const testUrl = `https://letterboxd.com/${user}/films/page/1/`
        const html = await fetchText(testUrl, p)

        if (html && (html.includes('poster-container') || html.includes('film-poster'))) {
            console.log(`Proxy ${p.name} works!`)
            activeProxy = p
            // Parse first page immediately
            parseRatings(html, ratings)
            break
        }
    }

    if (!activeProxy) {
        console.error("All proxies failed or user not found")
        // Check if maybe it's just empty (no ratings)
        return []
    }

    // Continue scraping pages 2...N
    // Limit to 50 pages (approx 3600 films) to be safe
    for (let i = 2; i <= 50; i++) {
        // Delay to be nice
        await new Promise(r => setTimeout(r, 1500))

        const url = `https://letterboxd.com/${user}/films/page/${i}/`
        const html = await fetchText(url, activeProxy)

        if (!html) break // Stop on error

        const foundNew = parseRatings(html, ratings)
        if (!foundNew) break // Stop if no ratings found on page
    }

    return ratings
}

function parseRatings(html, ratingsArray) {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const items = doc.querySelectorAll('.poster-container')

    if (items.length === 0) return false

    let addedCount = 0
    items.forEach(item => {
        const img = item.querySelector('img')
        const title = img?.alt || "N/A"
        const filmSlug = item.getAttribute('data-film-slug')
        const ratingAttr = item.getAttribute('data-owner-rating') // 0-10

        if (ratingAttr && ratingAttr !== "0") {
            // Check duplicates
            if (!ratingsArray.some(r => r.slug === filmSlug)) {
                ratingsArray.push({
                    title: title,
                    slug: filmSlug,
                    rating: parseInt(ratingAttr) / 2,
                    year: "N/A" // Difficult to get year from grid view easily without more parsing
                })
                addedCount++
            }
        }
    })

    return addedCount > 0
}

export function parseCSV(csvText) {
    const lines = csvText.split('\n')
    const ratings = []

    // Header usually: Date,Name,Year,Letterboxd URI,Rating
    // We need to identify columns
    const headers = lines[0].toLowerCase().split(',')
    const nameIdx = headers.findIndex(h => h.includes('name'))
    const ratingIdx = headers.findIndex(h => h.includes('rating'))
    const yearIdx = headers.findIndex(h => h.includes('year'))

    if (nameIdx === -1 || ratingIdx === -1) return []

    for (let i = 1; i < lines.length; i++) {
        // Simple regex split to handle commmas inside quotes? 
        // For simplicity, assuming standard generic CSV. Letterboxd usually quotes names with commas.
        // A robust parser is better, but simple split might work for most

        // Match CSV robustly:
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',')

        // Clean up quotes
        const clean = (val) => val ? val.replace(/^"|"$/g, '').trim() : ''

        if (lines[i].trim() === '') continue

        // Basic split if regex failed or simple row
        const cols = lines[i].includes('"')
            ? lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
            : lines[i].split(',')

        if (!cols || cols.length < ratingIdx) continue

        const title = clean(cols[nameIdx])
        const rating = parseFloat(clean(cols[ratingIdx]))
        const year = clean(cols[yearIdx])

        if (title && !isNaN(rating)) {
            ratings.push({
                title: title,
                slug: title.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
                rating: rating,
                year: year || "N/A"
            })
        }
    }

    return ratings
}
