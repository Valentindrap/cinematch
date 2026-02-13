import { useState, useEffect } from 'react'
import { Users, Swords, Upload } from 'lucide-react'
import JSZip from 'jszip'
import { fetchUserRatings, parseCSV } from '../api/letterboxdRatings'
import { processBattleData, enrichWithMetadata, calculateBattleStats } from '../utils/battleLogic'
import { RatingList } from './RatingList'
import './RatingBattle.css'
import { showSuccessToast, showErrorToast } from './AchievementToast'

export function RatingBattle() {
    const [usernames, setUsernames] = useState(['', ''])
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState({ current: 0, total: 0, message: '' })
    const [battleData, setBattleData] = useState(null)
    const [processedMovies, setProcessedMovies] = useState([])
    const [sortMode, setSortMode] = useState('diff-desc')
    const [stats, setStats] = useState(null)
    const [csvData, setCsvData] = useState({})
    const [compatibility, setCompatibility] = useState(0)

    const addDriver = () => setUsernames([...usernames, ''])

    // Helper to extract username from filename
    const extractUsernameFromZip = (filename) => {
        try {
            let name = filename.replace('.zip', '')
            if (name.startsWith('letterboxd-')) name = name.replace('letterboxd-', '')
            const parts = name.split('-')
            return parts.length > 1 ? parts[0] : name
        } catch (e) { return '' }
    }

    // Handle File Upload logic
    const handleFileUpload = async (e, index) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            let csvText = ''
            let extractedUsername = ''

            if (file.name.endsWith('.zip')) {
                const zip = new JSZip()
                const unzip = await zip.loadAsync(file)
                const ratingsFile = unzip.file("ratings.csv") || Object.values(unzip.files).find(f => f.name.endsWith("ratings.csv"))

                if (!ratingsFile) {
                    showErrorToast("No se encontró ratings.csv en el ZIP")
                    return
                }

                csvText = await ratingsFile.async("string")
                extractedUsername = extractUsernameFromZip(file.name)
                showSuccessToast("¡ZIP procesado correctamente!")
            } else {
                csvText = await new Promise((resolve) => {
                    const reader = new FileReader()
                    reader.onload = (event) => resolve(event.target.result)
                    reader.readAsText(file)
                })
            }

            const ratings = parseCSV(csvText)

            if (ratings.length > 0) {
                setCsvData(prev => ({ ...prev, [index]: ratings }))
                if (extractedUsername && !usernames[index]) {
                    const n = [...usernames]
                    n[index] = extractedUsername
                    setUsernames(n)
                }
                showSuccessToast(`Cargados ${ratings.length} ratings`)
            } else {
                showErrorToast("No se encontraron ratings válidos")
            }

        } catch (error) {
            console.error(error)
            showErrorToast("Error al leer el archivo")
        }
    }

    const handleStartBattle = async () => {
        const validUsers = usernames.map((u, i) => ({
            name: u || (csvData[i] ? `Warrior ${i + 1}` : ''),
            index: i
        })).filter(u => u.name !== '')

        if (validUsers.length < 2) {
            showErrorToast("Se necesitan al menos 2 usuarios")
            return
        }

        setLoading(true)
        setBattleData(null)
        setProgress({ current: 0, total: 100, message: 'Iniciando maniobras...' })

        try {
            const allRatings = []

            for (const userObj of validUsers) {
                const { name, index } = userObj
                let ratings = []
                setProgress(prev => ({ ...prev, message: `Reclutando a ${name}...` }))

                if (csvData[index]) {
                    ratings = csvData[index]
                } else {
                    ratings = await fetchUserRatings(name)
                }

                if (ratings.length === 0) {
                    showErrorToast(`No se encontraron ratings para ${name}`)
                    setLoading(false)
                    return
                }
                allRatings.push({ username: name, ratings })
            }

            setProgress({ current: 20, total: 100, message: 'Calculando intersecciones...' })

            // CORRECTLY DESTRUCTURE NEW RETURN FORMAT
            const { movies: common, compatibility } = await processBattleData(allRatings)
            setCompatibility(compatibility)

            if (!common || common.length === 0) {
                showErrorToast("No hay películas en común con rating")
                setLoading(false)
                return
            }

            common.sort((a, b) => b.diff - a.diff)

            const totalDiff = common.reduce((acc, m) => acc + m.diff, 0)
            setStats({
                total: common.length,
                avgDiff: (totalDiff / common.length).toFixed(2)
            })

            // AUTO-START DEEP ANALYSIS
            setProgress({ current: 0, total: common.length, message: `Analizando ${common.length} coincidencias...` })

            const enriched = await enrichWithMetadata(common, (current, total) => {
                setProgress({
                    current,
                    total,
                    message: `Analizando ${current}/${total}: ${common[current - 1]?.title || '...'}`
                })
            })

            // Calculate deep stats passing the usernames
            const deepStats = calculateBattleStats(enriched, validUsers.map(u => u.name))

            setBattleData({
                users: validUsers.map(u => u.name),
                movies: enriched,
                deepStats
            })
            setProcessedMovies(enriched)

            showSuccessToast(`¡${common.length} batallas analizadas con éxito!`)

        } catch (e) {
            console.error(e)
            showErrorToast("Hubo bajas en el campo de batalla")
        } finally {
            setLoading(false)
        }
    }

    // Handle sort changes
    useEffect(() => {
        if (!battleData) return
        let sorted = [...processedMovies]
        switch (sortMode) {
            case 'diff-desc': sorted.sort((a, b) => b.diff - a.diff); break;
            case 'avg-desc': sorted.sort((a, b) => b.average - a.average); break;
            default: break;
        }
        setProcessedMovies(sorted)
    }, [sortMode, battleData])

    // Loading Screen
    if (loading) {
        return (
            <div className="battle-loading-overlay">
                <div className="loading-content">
                    <Users className="animate-pulse" size={48} color="var(--neon-green)" />
                    <h2>{progress.message}</h2>
                    {progress.total > 0 && (
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                        </div>
                    )}
                    <p className="loading-subtext">Consultando los archivos de TMDB...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="battle-container">
            {!battleData && (
                <>
                    <header className="battle-header">
                        <h1 className="battle-title">RATING BATTLE <Swords size={40} /></h1>
                    </header>
                    <div className="battle-setup">
                        <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#888' }}>
                            Sube los archivos <b>.zip</b> exportados de Letterboxd para máxima precisión y funciones avanzadas.
                        </p>
                        {usernames.map((u, i) => (
                            <div key={i} className="input-box glass">
                                <Users size={16} />
                                <input
                                    value={u}
                                    placeholder={`WARRIOR_0${i + 1}`}
                                    onChange={(e) => {
                                        const n = [...usernames]
                                        n[i] = e.target.value
                                        setUsernames(n)
                                    }}
                                />
                                <label className="csv-upload-btn" title="Subir .zip de Letterboxd">
                                    <Upload size={14} color={csvData[i] ? '#00e054' : '#888'} />
                                    <input type="file" accept=".csv,.zip" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, i)} />
                                </label>
                            </div>
                        ))}
                        <button className="add-btn" onClick={addDriver}>+ ADD WARRIOR</button>
                        <button className="battle-start-btn" onClick={handleStartBattle}>INICIAR BATALLA</button>
                    </div>
                </>
            )}

            {battleData && (
                <>
                    <header className="battle-header compact">
                        <div className="battle-stats-row">
                            <div className="stat-pill">⚔️ {stats?.total} BATALLAS</div>
                            <div className="stat-pill" title="Diferencia media de opiniones">🔥 {stats?.avgDiff} DISCORDIA</div>
                            <div className="stat-pill compatibility" style={{
                                borderColor: compatibility > 70 ? 'var(--neon-green)' : compatibility > 40 ? 'var(--neon-yellow)' : 'var(--neon-pink)',
                                color: compatibility > 70 ? 'var(--neon-green)' : compatibility > 40 ? 'var(--neon-yellow)' : 'var(--neon-pink)'
                            }}>
                                {compatibility}% COMPATIBILIDAD
                            </div>
                            <button className="new-battle-btn" onClick={() => setBattleData(null)}>NUEVA</button>
                        </div>
                    </header>

                    {battleData.deepStats && (
                        <div className="deep-stats-container">
                            <h3>ADN DE LA BATALLA</h3>
                            <div className="stats-grid">

                                {/* ACTORS */}
                                <div className="stat-column">
                                    <h4>ACTORES TOP</h4>
                                    <div className="avatars-list">
                                        {battleData.deepStats.topActors.map(a => (
                                            <div key={a.id} className="stat-item" title={a.movies.join(', ')}>
                                                <div className="avatar-wrapper">
                                                    {a.profile ? (
                                                        <img src={`https://image.tmdb.org/t/p/w200${a.profile}`} alt={a.name} />
                                                    ) : <div className="no-avatar">?</div>}
                                                    <span className="count-badge">{a.count}</span>
                                                </div>
                                                <div className="stat-info">
                                                    <span className="name">{a.name}</span>
                                                    <div className="user-ratings-breakdown">
                                                        {Object.entries(a.userRatings).map(([user, rating], i) => (
                                                            <div key={i} className="mini-rating" title={user}>
                                                                <span className="tiny-user" style={{ color: i === 0 ? '#00e054' : '#00c3ff' }}>
                                                                    {user.slice(0, 3)}
                                                                </span>:
                                                                <span className="tiny-val"> {rating}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* DIRECTORS */}
                                <div className="stat-column">
                                    <h4>DIRECTORES</h4>
                                    <div className="avatars-list">
                                        {battleData.deepStats.topDirectors.map(d => (
                                            <div key={d.id} className="stat-item" title={d.movies.join(', ')}>
                                                <div className="avatar-wrapper">
                                                    {d.profile ? (
                                                        <img src={`https://image.tmdb.org/t/p/w200${d.profile}`} alt={d.name} />
                                                    ) : <div className="no-avatar">?</div>}
                                                    <span className="count-badge">{d.count}</span>
                                                </div>
                                                <div className="stat-info">
                                                    <span className="name">{d.name}</span>
                                                    <div className="user-ratings-breakdown">
                                                        {Object.entries(d.userRatings).map(([user, rating], i) => (
                                                            <div key={i} className="mini-rating" title={user}>
                                                                <span className="tiny-user" style={{ color: i === 0 ? '#00e054' : '#00c3ff' }}>
                                                                    {user.slice(0, 3)}
                                                                </span>:
                                                                <span className="tiny-val"> {rating}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* GENRES */}
                                <div className="stat-column">
                                    <h4>GÉNEROS & ÉPOCA</h4>
                                    {battleData.deepStats.topDecade && (
                                        <div className="decade-card">
                                            <span className="label">DÉCADA DE ORO</span>
                                            <span className="value">{battleData.deepStats.topDecade.decade}</span>
                                            <span className="sub">{battleData.deepStats.topDecade.count} películas</span>
                                        </div>
                                    )}
                                    <div className="genres-list" style={{ marginTop: '1rem' }}>
                                        {battleData.deepStats.topGenres.map(g => (
                                            <div key={g.id} className="genre-stat-row">
                                                <span className="name">{g.name}</span>
                                                <div className="bar-container">
                                                    <div className="stat-bar" style={{ width: `${(g.count / battleData.deepStats.totalAnalyzed) * 100}%` }}></div>
                                                </div>
                                                <span className="val">{g.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <RatingList
                        movies={processedMovies}
                        users={battleData.users}
                        sortMode={sortMode}
                        onSortChange={setSortMode}
                    />
                </>
            )}
        </div>
    )
}
