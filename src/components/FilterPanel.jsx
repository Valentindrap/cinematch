import { useState } from 'react'
import { Filter, ChevronDown } from 'lucide-react'
import './FilterPanel.css'

export function FilterPanel({ filters, onFilterChange, genres = [], totalMovies, filteredCount }) {
    const [isOpen, setIsOpen] = useState(false)

    const handleGenreToggle = (genreId) => {
        const newGenres = filters.genres.includes(genreId)
            ? filters.genres.filter(g => g !== genreId)
            : [...filters.genres, genreId]
        onFilterChange({ ...filters, genres: newGenres })
    }

    const handleYearChange = (values) => {
        onFilterChange({ ...filters, yearRange: values })
    }

    const handleRatingChange = (values) => {
        onFilterChange({ ...filters, ratingRange: values })
    }

    const handleDurationChange = (duration) => {
        onFilterChange({ ...filters, duration })
    }

    const resetFilters = () => {
        onFilterChange({
            genres: [],
            yearRange: [1900, 2026],
            ratingRange: [0, 10],
            duration: 'all'
        })
    }

    const activeFilterCount =
        filters.genres.length +
        (filters.duration !== 'all' ? 1 : 0) +
        ((filters.yearRange[0] !== 1900 || filters.yearRange[1] !== 2026) ? 1 : 0) +
        ((filters.ratingRange[0] !== 0 || filters.ratingRange[1] !== 10) ? 1 : 0)

    return (
        <div className="filter-panel">
            <button
                className={`filter-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Filter size={18} />
                Filtros
                {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
                <ChevronDown className={`arrow ${isOpen ? 'up' : ''}`} size={16} />
            </button>

            {isOpen && (
                <div className="filter-content glass">
                    <div className="filter-header">
                        <span>Mostrando {filteredCount} de {totalMovies}</span>
                        {activeFilterCount > 0 && (
                            <button className="reset-filters" onClick={resetFilters}>
                                Limpiar filtros
                            </button>
                        )}
                    </div>

                    {/* Genre Filter */}
                    <div className="filter-section">
                        <h4>Géneros</h4>
                        <div className="genre-grid">
                            {genres.map(genre => (
                                <button
                                    key={genre.id}
                                    className={`genre-chip ${filters.genres.includes(genre.id) ? 'active' : ''}`}
                                    onClick={() => handleGenreToggle(genre.id)}
                                >
                                    {genre.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Year Range */}
                    <div className="filter-section">
                        <h4>Año: {filters.yearRange[0]} - {filters.yearRange[1]}</h4>
                        <div className="range-inputs">
                            <input
                                type="range"
                                min="1900"
                                max="2026"
                                value={filters.yearRange[0]}
                                onChange={(e) => handleYearChange([parseInt(e.target.value), filters.yearRange[1]])}
                            />
                            <input
                                type="range"
                                min="1900"
                                max="2026"
                                value={filters.yearRange[1]}
                                onChange={(e) => handleYearChange([filters.yearRange[0], parseInt(e.target.value)])}
                            />
                        </div>
                    </div>

                    {/* Rating Range */}
                    <div className="filter-section">
                        <h4>Rating: {filters.ratingRange[0]} - {filters.ratingRange[1]}</h4>
                        <div className="range-inputs">
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
                                value={filters.ratingRange[0]}
                                onChange={(e) => handleRatingChange([parseFloat(e.target.value), filters.ratingRange[1]])}
                            />
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
                                value={filters.ratingRange[1]}
                                onChange={(e) => handleRatingChange([filters.ratingRange[0], parseFloat(e.target.value)])}
                            />
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="filter-section">
                        <h4>Duración</h4>
                        <div className="duration-buttons">
                            <button
                                className={filters.duration === 'all' ? 'active' : ''}
                                onClick={() => handleDurationChange('all')}
                            >
                                Todas
                            </button>
                            <button
                                className={filters.duration === 'short' ? 'active' : ''}
                                onClick={() => handleDurationChange('short')}
                            >
                                Cortas (&lt;90min)
                            </button>
                            <button
                                className={filters.duration === 'medium' ? 'active' : ''}
                                onClick={() => handleDurationChange('medium')}
                            >
                                Medianas (90-150min)
                            </button>
                            <button
                                className={filters.duration === 'long' ? 'active' : ''}
                                onClick={() => handleDurationChange('long')}
                            >
                                Largas (&gt;150min)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
