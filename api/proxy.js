// Serverless function para proxy CORS en Vercel
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    // Get the URL to proxy
    const { url } = req.query

    if (!url) {
        return res.status(400).json({ error: 'URL parameter required' })
    }

    try {
        // Fetch the letterboxd page
        const response = await fetch(decodeURIComponent(url), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })

        if (!response.ok) {
            return res.status(response.status).json({
                error: `Letterboxd returned ${response.status}`
            })
        }

        const html = await response.text()
        res.setHeader('Content-Type', 'text/html')
        res.status(200).send(html)
    } catch (error) {
        console.error('Proxy error:', error)
        res.status(500).json({
            error: 'Failed to fetch from Letterboxd',
            message: error.message
        })
    }
}
