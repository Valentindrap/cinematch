import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { Loader2, Users, RotateCw, Info, BarChart3, Volume2, VolumeX, Keyboard } from 'lucide-react'

// Import components
import { FilterPanel } from './components/FilterPanel'
import { MovieModal } from './components/MovieModal'
import { StatsDashboard } from './components/StatsDashboard'
import { ConfettiEffect } from './components/ConfettiEffect'
import { ThemeToggle } from './components/ThemeToggle'
import { ShareButton } from './components/ShareButton'
import { AchievementPanel } from './components/AchievementPanel'
import { showAchievementToast, showSuccessToast, showErrorToast } from './components/AchievementToast'

// Import utilities and APIs
import { useStore } from './store/useStore'
import { tmdbAPI } from './api/tmdb'
import { movieFilters, gameModes } from './utils/movieFilters'
import { soundManager } from './utils/sounds'
import { calculateStatistics } from './utils/statistics'
import { checkAchievements } from './utils/achievements'
import { Analytics } from "@vercel/analytics/next"


import './App.css'



function App() {
  const {
    usernames, setUsernames,
    mode, setMode,
    moviesData, setMoviesData,
    filteredMovies, setFilteredMovies,
    filters, setFilters,
    history, addToHistory,
    watchedMovies, addWatchedMovie,
    vetoedMovies, toggleVeto,
    favoriteMovies, toggleFavorite,
    winner, setWinner,
    loading, setLoading,
    soundEnabled, setSoundEnabled,
    achievements, unlockAchievement,
  } = useStore()

  const [isSpinning, setIsSpinning] = useState(false)
  const [rouletteTitle, setRouletteTitle] = useState('')
  const [scanStatus, setScanStatus] = useState({ user: '', page: 0, total: 0 })
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [showStats, setShowStats] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [genres, setGenres] = useState([
    // Fallback genres in case API fails
    { id: 28, name: 'Acción' },
    { id: 12, name: 'Aventura' },
    { id: 16, name: 'Animación' },
    { id: 35, name: 'Comedia' },
    { id: 80, name: 'Crimen' },
    { id: 99, name: 'Documental' },
    { id: 18, name: 'Drama' },
    { id: 14, name: 'Fantasía' },
    { id: 27, name: 'Terror' },
    { id: 10402, name: 'Música' },
    { id: 9648, name: 'Misterio' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Ciencia ficción' },
    { id: 53, name: 'Suspense' },
  ])
  const [statistics, setStatistics] = useState(null)

  // Load genres on mount
  useEffect(() => {
    tmdbAPI.getGenres().then(fetchedGenres => {
      if (fetchedGenres && fetchedGenres.length > 0) {
        setGenres(fetchedGenres)
      }
    }).catch(err => {
      console.error('Error loading genres:', err)
      // Keep fallback genres
    })
  }, [])

  // Initialize theme
  useEffect(() => {
    const theme = useStore.getState().theme
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault()
          if (filteredMovies.length > 0 && !isSpinning) spin()
          break
        case 'r':
          if (moviesData.length > 0) resetApp()
          break
        case 's':
          if (moviesData.length > 0) setShowStats(true)
          break
        case 'a':
          setShowAchievements(!showAchievements)
          break
        case 'm':
          setSoundEnabled(!soundEnabled)
          break
        case 'escape':
          setSelectedMovie(null)
          setShowStats(false)
          setShowAchievements(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [filteredMovies, isSpinning, moviesData, showAchievements, soundEnabled])

  // Update sound manager
  useEffect(() => {
    soundManager.setEnabled(soundEnabled)
  }, [soundEnabled])

  const fetchWatchlistData = async (username) => {
    const user = username.trim().toLowerCase()
    if (!user) return []
    let titles = []

    // Use local proxy in development, Vercel serverless in production
    const proxy = import.meta.env.PROD
      ? '/api/proxy?url='
      : 'http://localhost:8010/proxy/'

    for (let i = 1; i <= 30; i++) {
      setScanStatus({ user: username, page: i, total: 0 })
      try {
        const letterboxdUrl = `https://letterboxd.com/${user}/watchlist/page/${i}/`
        const proxyUrl = import.meta.env.PROD
          ? `${proxy}${encodeURIComponent(letterboxdUrl)}`
          : `${proxy}${user}/watchlist/page/${i}/`

        const response = await fetch(proxyUrl)
        if (!response.ok) break
        const html = await response.text()
        const doc = new DOMParser().parseFromString(html, 'text/html')
        const items = doc.querySelectorAll('.poster-container, .film-poster')

        if (items.length === 0) break

        items.forEach(item => {
          const img = item.querySelector('img')
          const title = img?.alt || item.getAttribute('data-film-slug') || "N/A"

          titles.push({
            title: title.replace(/-/g, ' '),
            rating: "0.0",
            year: "N/A"
          })
        })
      } catch (e) { break }
    }
    return titles
  }

  const runAnalysis = async () => {
    setLoading(true)
    setMoviesData([])
    setWinner(null)

    try {
      const activeUsers = usernames.filter(u => u.trim() !== '')
      if (activeUsers.length === 0) {
        showErrorToast('Agrega al menos un usuario')
        setLoading(false)
        return
      }

      const results = []

      // Fetch watchlists
      for (const user of activeUsers) {
        const list = await fetchWatchlistData(user)
        results.push({ user, list })
      }

      // Combine movies
      const movieMap = {}
      results.forEach(({ user, list }) => {
        list.forEach(item => {
          const key = item.title.toLowerCase().trim()
          if (!movieMap[key]) movieMap[key] = { ...item, owners: [] }
          if (!movieMap[key].owners.includes(user)) movieMap[key].owners.push(user)
        })
      })

      // Apply game mode
      let filtered
      if (mode === 'match') {
        filtered = gameModes.match(movieMap, activeUsers)
      } else {
        filtered = gameModes.all(movieMap)
      }

      // Enrich with TMDB data in batches to avoid rate limiting
      const BATCH_SIZE = 50 // Process 50 at a time
      const enrichedMovies = []

      for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
        const batch = filtered.slice(i, i + BATCH_SIZE)
        const batchResults = await Promise.all(
          batch.map(async (movie) => {
            const enriched = await tmdbAPI.getEnrichedMovieData(movie.title)
            return {
              ...movie,
              ...enriched,
              owners: movie.owners
            }
          })
        )
        enrichedMovies.push(...batchResults)

        // Update progress for user feedback
        setScanStatus({
          user: 'Enriqueciendo datos',
          page: Math.min(i + BATCH_SIZE, filtered.length),
          total: filtered.length
        })
      }

      setMoviesData(enrichedMovies)
      setFilteredMovies(enrichedMovies)

      // Calculate statistics
      const stats = calculateStatistics(enrichedMovies, activeUsers)
      setStatistics(stats)

      showSuccessToast(`${enrichedMovies.length} películas encontradas!`)
    } catch (e) {
      console.error(e)
      showErrorToast('Error al analizar watchlists')
    } finally {
      setLoading(false)
    }
  }

  const spin = async () => {
    if (filteredMovies.length === 0) return

    // Exclude vetoed movies
    const availableMovies = filteredMovies.filter(m => !vetoedMovies.includes(m.title))
    if (availableMovies.length === 0) {
      showErrorToast('Todas las películas han sido vetadas!')
      return
    }

    setIsSpinning(true)
    setWinner(null)
    soundManager.playTick()

    let count = 0
    const interval = setInterval(() => {
      setRouletteTitle(availableMovies[Math.floor(Math.random() * availableMovies.length)].title)
      if (count++ % 3 === 0) soundManager.playTick()

      if (count > 25) {
        clearInterval(interval)
        const selected = availableMovies[Math.floor(Math.random() * availableMovies.length)]

        setWinner(selected)
        setIsSpinning(false)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)

        soundManager.playWinner()
        addToHistory(selected)

        showSuccessToast(`¡${selected.title}!`)
      }
    }, 70)
  }

  const handleMarkWatched = (movie) => {
    addWatchedMovie(movie)
    showSuccessToast('¡Película marcada como vista!')

    // Check for new achievements
    const newAchievements = checkAchievements(
      [...watchedMovies, movie],
      useStore.getState().groups
    )

    newAchievements.forEach(achId => {
      if (!achievements.includes(achId)) {
        unlockAchievement(achId)
        setTimeout(() => showAchievementToast(achId), 500)
        soundManager.playAchievement()
      }
    })
  }

  const resetApp = () => {
    useStore.getState().reset()
    setShowStats(false)
    setStatistics(null)
  }

  // Apply filters whenever they change
  useEffect(() => {
    if (moviesData.length > 0) {
      const filtered = movieFilters.applyAllFilters(moviesData, filters)
      setFilteredMovies(filtered)
    }
  }, [filters, moviesData, setFilteredMovies])

  return (
    <div className="app-shell">
      <Toaster position="top-center" />
      <ConfettiEffect trigger={showConfetti} />

      <header className="navbar">
        <div className="logo-container">
          <img src="/logo.png" alt="Watchlist Standoff" className="logo-img" />
        </div>

        <div className="navbar-controls">
          <ThemeToggle />

          <button
            className={`sound-toggle ${soundEnabled ? 'active' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            className="achievements-toggle"
            onClick={() => setShowAchievements(!showAchievements)}
            title="Achievements (A)"
          >
            🏆 {achievements.length}
          </button>
        </div>

        <div className="status">● Online</div>
      </header>

      <main className="viewport">
        {/* Setup Screen */}
        {!loading && moviesData.length === 0 && (
          <div className="setup-card glass">
            <h2>Configura la búsqueda</h2>

            <div className="tabs">
              <button
                className={mode === 'match' ? 'active' : ''}
                onClick={() => setMode('match')}
              >
                Match
              </button>
              <button
                className={mode === 'single' ? 'active' : ''}
                onClick={() => setMode('single')}
              >
                Todo
              </button>
            </div>

            {usernames.map((u, i) => (
              <div key={i} className="input-box glass">
                <Users size={16} />
                <input
                  value={u}
                  placeholder="Usuario de Letterboxd"
                  onChange={(e) => {
                    const n = [...usernames]
                    n[i] = e.target.value
                    setUsernames(n)
                  }}
                />
              </div>
            ))}

            <button
              className="add-btn"
              onClick={() => setUsernames([...usernames, ''])}
            >
              + Amigo
            </button>

            <button className="start-btn" onClick={runAnalysis}>
              ANALIZAR
            </button>

            <div className="keyboard-hints">
              <Keyboard size={14} />
              <span>Atajos: Space=Girar | R=Reset | S=Stats | A=Logros | M=Sonido</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Loader2 className="spinner" size={60} />
            <h2>
              {scanStatus.user === 'Enriqueciendo datos'
                ? 'Obteniendo detalles de películas...'
                : 'Escaneando Watchlists...'}
            </h2>
            <p>
              {scanStatus.user === 'Enriqueciendo datos'
                ? <>Procesando <b>{scanStatus.page}</b> de <b>{scanStatus.total}</b> películas</>
                : <>Leyendo a <b>@{scanStatus.user}</b> (Página {scanStatus.page})</>}
            </p>
            <div className="progress-bar-bg">
              <div
                className="progress-fill"
                style={{
                  width: scanStatus.total
                    ? `${(scanStatus.page / scanStatus.total) * 100}%`
                    : `${(scanStatus.page / 30) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Main Game View */}
        {moviesData.length > 0 && !loading && (
          <>
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              genres={genres}
              totalMovies={moviesData.length}
              filteredCount={filteredMovies.length}
            />

            <div className="game-grid">
              {/* Left Panel */}
              <aside className="side-panel left">
                <div className="stat-bubble glass">
                  <Info size={16} color="#00e054" />
                  <span>{filteredMovies.length} películas</span>
                </div>

                <button
                  className="stats-btn glass"
                  onClick={() => setShowStats(true)}
                  title="Ver Estadísticas (S)"
                >
                  <BarChart3 size={20} />
                  Estadísticas
                </button>
              </aside>

              {/* Center Stage */}
              <section className="main-stage">
                <AnimatePresence mode="wait">
                  {!winner && !isSpinning && (
                    <button className="giant-spin" onClick={spin}>
                      GIRAR
                    </button>
                  )}

                  {isSpinning && (
                    <h2 className="rolling-text">{rouletteTitle}</h2>
                  )}

                  {winner && (
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="win-card glass"
                      onClick={() => setSelectedMovie(winner)}
                    >
                      <div className="poster">
                        {winner.poster ? (
                          <img src={winner.poster} alt={winner.title} />
                        ) : (
                          <div className="no-img">?</div>
                        )}
                      </div>

                      <div className="details">
                        <div className="meta-pills">
                          <span className="pill year">{winner.year}</span>
                          <span className="pill rating">⭐ {winner.rating}</span>
                        </div>

                        <h2 className="title">{winner.title}</h2>

                        {winner.overview && (
                          <p className="overview">{winner.overview.slice(0, 150)}...</p>
                        )}

                        <div className="owners">
                          <p>Encontrada en:</p>
                          <div className="chips">
                            {winner.owners.map(o => (
                              <span key={o} className="user-chip">@{o}</span>
                            ))}
                          </div>
                        </div>

                        <div className="win-btns" onClick={(e) => e.stopPropagation()}>
                          <button className="start-btn" onClick={spin}>
                            <RotateCw size={18} /> Repetir
                          </button>
                          <button className="reset-btn" onClick={resetApp}>
                            Nueva búsqueda
                          </button>
                          <ShareButton movie={winner} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Right Panel - History */}
              <aside className="side-panel right">
                <h3>HISTORIAL</h3>
                <div className="history-list">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className="h-card glass"
                      onClick={() => setSelectedMovie(h)}
                    >
                      {h.poster ? (
                        <img src={h.poster} alt={h.title} />
                      ) : (
                        <div className="h-no-img">?</div>
                      )}
                      <div className="h-info">
                        <p>{h.title}</p>
                        <span>{h.year} • ⭐{h.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>

            {/* Achievements Panel */}
            {showAchievements && (
              <AchievementPanel unlockedAchievements={achievements} />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onMarkWatched={handleMarkWatched}
        />
      )}

      {showStats && statistics && (
        <StatsDashboard
          statistics={statistics}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  )
}

export default App