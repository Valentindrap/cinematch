import { useState } from 'react'
import { Share2, Twitter, Facebook, Download, Link as LinkIcon, X } from 'lucide-react'
import {
    TwitterShareButton,
    FacebookShareButton,
    WhatsappShareButton,
    WhatsappIcon,
    TwitterIcon,
    FacebookIcon
} from 'react-share'
import { showSuccessToast, showErrorToast } from './AchievementToast'
import './ShareButton.css'

export function ShareButton({ movie, sessionData }) {
    const [isOpen, setIsOpen] = useState(false)
    const shareUrl = 'https://watchliststandoff.vercel.app/'
    const shareText = movie
        ? `¡Vamos a ver "${movie.title}" ${movie.year !== 'N/A' ? `(${movie.year})` : ''}! 🎬 #WatchlistStandoff`
        : '¡Encuentra películas en común con tus amigos en Letterboxd! 🎬 #WatchlistStandoff'

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                showSuccessToast('¡Link copiado!')
                setIsOpen(false)
            })
            .catch(() => showErrorToast('Error al copiar'))
    }

    const createShareImage = async () => {
        if (!movie) return null

        // Create a canvas for the share image
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Set canvas size (Instagram/Twitter optimal: 1200x630)
        canvas.width = 1200
        canvas.height = 630

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, '#0a0e17')
        gradient.addColorStop(1, '#1a1f2e')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Add subtle pattern/texture
        ctx.fillStyle = 'rgba(0, 224, 84, 0.03)'
        for (let i = 0; i < 50; i++) {
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2)
        }

        // Load and draw movie poster if available
        if (movie.poster) {
            try {
                const img = new Image()
                img.crossOrigin = 'anonymous'
                await new Promise((resolve, reject) => {
                    img.onload = resolve
                    img.onerror = reject
                    img.src = movie.poster
                })

                // Draw poster on left side with rounded corners
                const posterWidth = 300
                const posterHeight = 450
                const posterX = 80
                const posterY = (canvas.height - posterHeight) / 2

                // Rounded rectangle for poster
                ctx.save()
                ctx.beginPath()
                ctx.roundRect(posterX, posterY, posterWidth, posterHeight, 20)
                ctx.clip()
                ctx.drawImage(img, posterX, posterY, posterWidth, posterHeight)
                ctx.restore()

                // Add glow effect around poster
                ctx.shadowColor = 'rgba(0, 224, 84, 0.4)'
                ctx.shadowBlur = 30
                ctx.strokeStyle = 'rgba(0, 224, 84, 0.3)'
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.roundRect(posterX, posterY, posterWidth, posterHeight, 20)
                ctx.stroke()
                ctx.shadowBlur = 0
            } catch (e) {
                console.error('Error loading poster:', e)
            }
        }

        // Right side content
        const contentX = 450
        let currentY = 150

        // Movie title
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 56px Inter, sans-serif'
        ctx.textAlign = 'left'

        // Wrap title if too long
        const maxWidth = 650
        const words = movie.title.split(' ')
        let line = ''
        const lines = []

        for (let word of words) {
            const testLine = line + word + ' '
            const metrics = ctx.measureText(testLine)
            if (metrics.width > maxWidth && line !== '') {
                lines.push(line)
                line = word + ' '
            } else {
                line = testLine
            }
        }
        lines.push(line)

        // Draw title lines with gradient
        lines.forEach((line, index) => {
            const titleGradient = ctx.createLinearGradient(contentX, currentY, contentX + 400, currentY)
            titleGradient.addColorStop(0, '#00e054')
            titleGradient.addColorStop(1, '#00a8ff')
            ctx.fillStyle = titleGradient
            ctx.fillText(line.trim(), contentX, currentY)
            currentY += 70
        })

        currentY += 20

        // Year and Rating
        ctx.font = 'bold 32px Inter, sans-serif'
        if (movie.year !== 'N/A') {
            ctx.fillStyle = '#00a8ff'
            ctx.fillText(movie.year, contentX, currentY)
            currentY += 50
        }

        if (movie.rating !== '0.0') {
            ctx.fillStyle = '#ffd700'
            ctx.fillText(`⭐ ${movie.rating}`, contentX, currentY)
            currentY += 60
        }

        // Tagline
        ctx.font = 'italic 28px Inter, sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.fillText('¡Vamos a verla juntos!', contentX, currentY)
        currentY += 80

        // Bottom branding
        const brandingY = canvas.height - 80

        // App name
        ctx.font = 'bold 40px Inter, sans-serif'
        const brandGradient = ctx.createLinearGradient(contentX, brandingY, contentX + 400, brandingY)
        brandGradient.addColorStop(0, '#00e054')
        brandGradient.addColorStop(1, '#00a8ff')
        ctx.fillStyle = brandGradient
        ctx.fillText('Watchlist Standoff', contentX, brandingY)

        // URL
        ctx.font = '24px Inter, sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.fillText('watchliststandoff.vercel.app', contentX, brandingY + 35)

        return canvas
    }

    const handleDownloadImage = async () => {
        if (!movie) return

        try {
            const canvas = await createShareImage()
            if (!canvas) {
                showErrorToast('Error al crear imagen')
                return
            }

            // Download the image
            const link = document.createElement('a')
            link.download = `watchlist-standoff-${movie.title.replace(/\s+/g, '-').toLowerCase()}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()

            showSuccessToast('¡Imagen descargada!')
            setIsOpen(false)
        } catch (e) {
            console.error('Download error:', e)
            showErrorToast('Error al descargar')
        }
    }

    const handleShare = (platform) => {
        // Close modal after a brief delay to allow the share to process
        setTimeout(() => setIsOpen(false), 300)
    }

    return (
        <>
            <button className="share-trigger" onClick={() => setIsOpen(true)}>
                <Share2 size={18} />
                Compartir
            </button>

            {isOpen && (
                <div className="share-modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="share-modal-content glass" onClick={(e) => e.stopPropagation()}>
                        <button className="share-modal-close" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>

                        <h3 className="share-modal-title">Compartir</h3>

                        <div className="share-options-grid">
                            <TwitterShareButton url={shareUrl} title={shareText} onClick={() => handleShare('twitter')}>
                                <div className="share-option">
                                    <TwitterIcon size={40} round />
                                    <span>Twitter</span>
                                </div>
                            </TwitterShareButton>

                            <FacebookShareButton url={shareUrl} quote={shareText} onClick={() => handleShare('facebook')}>
                                <div className="share-option">
                                    <FacebookIcon size={40} round />
                                    <span>Facebook</span>
                                </div>
                            </FacebookShareButton>

                            <WhatsappShareButton url={shareUrl} title={shareText} onClick={() => handleShare('whatsapp')}>
                                <div className="share-option">
                                    <WhatsappIcon size={40} round />
                                    <span>WhatsApp</span>
                                </div>
                            </WhatsappShareButton>

                            <button className="share-option" onClick={handleCopyLink}>
                                <div className="share-icon-circle">
                                    <LinkIcon size={20} />
                                </div>
                                <span>Copiar Link</span>
                            </button>

                            {movie && (
                                <button className="share-option" onClick={handleDownloadImage}>
                                    <div className="share-icon-circle">
                                        <Download size={20} />
                                    </div>
                                    <span>Descargar</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
