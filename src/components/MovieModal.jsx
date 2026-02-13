import { X, Star, Play, ExternalLink, Calendar, Clock, Users as UsersIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './MovieModal.css'

export function MovieModal({ movie, onClose, onMarkWatched }) {
    if (!movie) return null

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    const openLetterboxd = () => {
        const searchQuery = encodeURIComponent(movie.title)
        window.open(`https://letterboxd.com/search/${searchQuery}/`, '_blank')
    }

    const openTrailer = () => {
        if (movie.trailer) {
            window.open(`https://www.youtube.com/watch?v=${movie.trailer}`, '_blank')
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleBackdropClick}
            >
                <motion.div
                    className="modal-content"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                >
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>

                    {movie.backdrop && (
                        <div className="modal-backdrop">
                            <img src={movie.backdrop} alt={movie.title} />
                            <div className="backdrop-overlay"></div>
                        </div>
                    )}

                    <div className="modal-body">
                        <div className="modal-poster">
                            {movie.poster ? (
                                <img src={movie.poster} alt={movie.title} />
                            ) : (
                                <div className="no-poster">?</div>
                            )}
                        </div>

                        <div className="modal-info">
                            <h2>{movie.title}</h2>

                            <div className="modal-meta">
                                {movie.year !== 'N/A' && (
                                    <span className="meta-item">
                                        <Calendar size={16} />
                                        {movie.year}
                                    </span>
                                )}
                                {movie.rating !== '0.0' && (
                                    <span className="meta-item">
                                        <Star size={16} fill="#ffd700" color="#ffd700" />
                                        {movie.rating}
                                    </span>
                                )}
                                {movie.runtime && (
                                    <span className="meta-item">
                                        <Clock size={16} />
                                        {movie.runtime} min
                                    </span>
                                )}
                            </div>

                            {movie.genres && movie.genres.length > 0 && (
                                <div className="modal-genres">
                                    {movie.genres.map(genre => (
                                        <span key={genre.id || genre} className="genre-tag">
                                            {genre.name || genre}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {movie.director && movie.director !== 'N/A' && (
                                <div className="modal-director">
                                    <strong>Director:</strong> {movie.director}
                                </div>
                            )}

                            {movie.cast && movie.cast.length > 0 && (
                                <div className="modal-cast">
                                    <strong>Reparto:</strong> {movie.cast.join(', ')}
                                </div>
                            )}

                            {movie.overview && (
                                <div className="modal-overview">
                                    <h3>Sinopsis</h3>
                                    <p>{movie.overview}</p>
                                </div>
                            )}

                            {movie.owners && movie.owners.length > 0 && (
                                <div className="modal-owners">
                                    <UsersIcon size={16} />
                                    <span>En la watchlist de:</span>
                                    <div className="owner-chips">
                                        {movie.owners.map(owner => (
                                            <span key={owner} className="owner-chip">@{owner}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions">
                                {movie.trailer && (
                                    <button className="action-btn primary" onClick={openTrailer}>
                                        <Play size={18} />
                                        Ver Trailer
                                    </button>
                                )}
                                <button className="action-btn secondary" onClick={openLetterboxd}>
                                    <ExternalLink size={18} />
                                    Abrir en Letterboxd
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
