
import React from 'react'
import { Star } from 'lucide-react'

export function RatingList({ movies, users, sortMode, onSortChange }) {

    // Calculate grid template based on users count
    // 1fr (movie) + 100px (user 1) + 100px (user 2) ... + 80px (diff)
    const gridTemplate = `minmax(200px, 1fr) repeat(${users.length}, minmax(80px, 120px)) 80px`

    const renderStars = (rating) => {
        return "★".repeat(Math.floor(rating)) + (rating % 1 !== 0 ? "½" : "")
    }

    return (
        <div className="battle-results">
            <div className="battle-controls">
                <span>Ordenado por:</span>
                <div className="sort-controls">
                    <button
                        className={`sort-btn ${sortMode === 'date' ? 'active' : ''}`}
                        onClick={() => onSortChange('date')}
                    >
                        Fecha
                    </button>
                    <button
                        className={`sort-btn ${sortMode === 'diff-desc' ? 'active' : ''}`}
                        onClick={() => onSortChange('diff-desc')}
                    >
                        Mayor Discordia ⚔️
                    </button>
                    <button
                        className={`sort-btn ${sortMode === 'avg-desc' ? 'active' : ''}`}
                        onClick={() => onSortChange('avg-desc')}
                    >
                        Mejor Valoradas 🏆
                    </button>
                </div>
            </div>

            <div className="battle-header-row battle-row" style={{ gridTemplateColumns: gridTemplate, background: 'transparent', border: 'none' }}>
                <div className="col-header">PELÍCULA</div>
                {users.map(u => (
                    <div key={u} className="col-header" style={{ textAlign: 'center' }}>@{u}</div>
                ))}
                <div className="col-header" style={{ textAlign: 'center' }}>DIF</div>
            </div>

            <div className="battle-list">
                {movies.map((movie, idx) => (
                    <div key={movie.slug + idx} className="battle-row" style={{ gridTemplateColumns: gridTemplate }}>
                        <div className="movie-col">
                            {movie.poster ? (
                                <img src={`https://image.tmdb.org/t/p/w92${movie.poster}`} className="movie-poster-thumb" alt="" />
                            ) : (
                                <div className="movie-poster-thumb"></div>
                            )}
                            <div className="movie-title" title={movie.title}>{movie.title}</div>
                        </div>

                        {users.map(u => {
                            const rating = movie.ratings[u] || 0
                            return (
                                <div key={u} className="rating-col">
                                    <span className="rating-val">{rating}</span>
                                    <span className="rating-stars">{renderStars(rating)}</span>
                                </div>
                            )
                        })}

                        <div className={`diff-col ${movie.diff > 2 ? 'diff-high' : 'diff-low'}`}>
                            {movie.diff > 0 ? `+${movie.diff}` : '='}
                        </div>
                    </div>
                ))}
            </div>

            {movies.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    No se encontraron películas en común.
                </div>
            )}
        </div>
    )
}
