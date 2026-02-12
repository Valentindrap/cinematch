import { Share2, Twitter, Facebook, Download, Link as LinkIcon } from 'lucide-react'
import {
    TwitterShareButton,
    FacebookShareButton,
    WhatsappShareButton,
    WhatsappIcon,
    TwitterIcon,
    FacebookIcon
} from 'react-share'
import html2canvas from 'html2canvas'
import { showSuccessToast, showErrorToast } from './AchievementToast'
import './ShareButton.css'

export function ShareButton({ movie, sessionData }) {
    const shareUrl = window.location.href
    const shareText = movie
        ? `¡Vamos a ver "${movie.title}" ${movie.year !== 'N/A' ? `(${movie.year})` : ''}! 🎬 #Cinematch`
        : '¡Encuentra películas en común con tus amigos! 🎬 #Cinematch'

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl)
            .then(() => showSuccessToast('¡Link copiado!'))
            .catch(() => showErrorToast('Error al copiar'))
    }

    const handleDownloadImage = async () => {
        if (!movie) return

        try {
            // Create a canvas from the winner card
            const winnerCard = document.querySelector('.win-card')
            if (!winnerCard) return

            const canvas = await html2canvas(winnerCard, {
                backgroundColor: '#0a0e17',
                scale: 2,
            })

            // Download the image
            const link = document.createElement('a')
            link.download = `cinematch-${movie.title.replace(/\s+/g, '-')}.png`
            link.href = canvas.toDataURL()
            link.click()

            showSuccessToast('¡Imagen descargada!')
        } catch (e) {
            console.error('Download error:', e)
            showErrorToast('Error al descargar')
        }
    }

    return (
        <div className="share-menu">
            <div className="share-trigger">
                <Share2 size={18} />
                Compartir
            </div>
            <div className="share-dropdown glass">
                <TwitterShareButton url={shareUrl} title={shareText}>
                    <button className="share-option">
                        <TwitterIcon size={32} round />
                        Twitter
                    </button>
                </TwitterShareButton>

                <FacebookShareButton url={shareUrl} quote={shareText}>
                    <button className="share-option">
                        <FacebookIcon size={32} round />
                        Facebook
                    </button>
                </FacebookShareButton>

                <WhatsappShareButton url={shareUrl} title={shareText}>
                    <button className="share-option">
                        <WhatsappIcon size={32} round />
                        WhatsApp
                    </button>
                </WhatsappShareButton>

                <button className="share-option" onClick={handleCopyLink}>
                    <LinkIcon size={20} />
                    Copiar Link
                </button>

                {movie && (
                    <button className="share-option" onClick={handleDownloadImage}>
                        <Download size={20} />
                        Descargar Imagen
                    </button>
                )}
            </div>
        </div>
    )
}
