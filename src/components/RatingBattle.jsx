
import { useState, useEffect } from 'react'
import { Users, Swords, Upload } from 'lucide-react'
import { fetchUserRatings, parseCSV } from '../api/letterboxdRatings'
import { processBattleData, enrichWithPosters } from '../utils/battleLogic'
import { RatingList } from './RatingList'
import './RatingBattle.css'
import { showSuccessToast, showErrorToast } from './AchievementToast'

export function RatingBattle() {
    const [usernames, setUsernames] = useState(['', ''])
    const [loading, setLoading] = useState(false)
    const [battleData, setBattleData] = useState(null) // null = setup mode
    const [processedMovies, setProcessedMovies] = useState([])
    const [sortMode, setSortMode] = useState('diff-desc') // 'diff-desc', 'avg-desc'
    const [stats, setStats] = useState(null)
    const [csvData, setCsvData] = useState({}) // { username: ratings[] }

    const addDriver = () => setUsernames([...usernames, ''])

    // Handle CSV Upload
    const handleFileUpload = (e, index) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target.result
            const ratings = parseCSV(text)

            if (ratings.length > 0) {
                // Determine username from filename if possible, else prompt or use placeholder
                // But here we are attaching it to a specific input index
                const name = usernames[index] || "CSV_USER"

                setCsvData(prev => ({
                    ...prev,
                    [index]: ratings
                }))

                showSuccessToast(`Cargados ${ratings.length} ratings del archivo`)
            } else {
                showErrorToast("No se encontraron ratings en el CSV")
            }
        }
        reader.readAsText(file)
    }

    const handleStartBattle = async () => {
        const activeUsers = usernames.filter(u => u.trim() !== '')
        if (activeUsers.length < 2) {
            showErrorToast("Se necesitan al menos 2 usuarios")
            return
        }

        setLoading(true)
        setBattleData(null)

        try {
            const allRatings = []

            // 1. Fetch ratings for all users (or use CSV)
            for (let i = 0; i < activeUsers.length; i++) {
                const user = activeUsers[i]

                // Get original index to find CSV data
                const originalIndex = usernames.indexOf(user)

                let ratings = []

                if (csvData[originalIndex]) {
                    console.log(`Using CSV data for ${user}`)
                    ratings = csvData[originalIndex]
                } else {
                    ratings = await fetchUserRatings(user)
                }

                if (ratings.length === 0) {
                    showErrorToast(`No se encontraron ratings para @${user}`)
                    setLoading(false)
                    return
                }
                allRatings.push({ username: user, ratings })
            }

            // 2. Process intersection
            let common = await processBattleData(allRatings)

            if (common.length === 0) {
                showErrorToast("No hay películas en común con rating")
                setLoading(false)
                return
            }

            // 3. Sort initially (by difference)
            common.sort((a, b) => b.diff - a.diff)

            setBattleData({ users: activeUsers, movies: common })
            setProcessedMovies(common)

            // 4. Calculate stats
            const totalDiff = common.reduce((acc, m) => acc + m.diff, 0)
            setStats({
                total: common.length,
                avgDiff: (totalDiff / common.length).toFixed(2)
            })

            showSuccessToast(`¡${common.length} coincidencias encontradas!`)

            // 5. Background fetch images
            enrichWithPosters(common).then(enriched => {
                setProcessedMovies(prev => {
                    // Update only if we are still in battle mode
                    return [...enriched]
                })
            })

        } catch (e) {
            console.error(e)
            showErrorToast("Error en la batalla")
        } finally {
            setLoading(false)
        }
    }

    // Handle sort changes
    useEffect(() => {
        if (!battleData) return

        let sorted = [...processedMovies]
        switch (sortMode) {
            case 'diff-desc':
                sorted.sort((a, b) => b.diff - a.diff)
                break
            case 'avg-desc':
                sorted.sort((a, b) => b.average - a.average)
                break
            default:
                // Keep original order
                break
        }
        setProcessedMovies(sorted)
    }, [sortMode, battleData]) // removed processedMovies from dep to avoid loop, it's fine

    return (
        <div className="battle-container">
            <header className="battle-header">
                <h1 className="battle-title">RATING BATTLE <Swords size={40} /></h1>
            </header>

            {!battleData && !loading && (
                <div className="battle-setup">
                    <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#888' }}>
                        Usa tu usuario de Letterboxd o sube tu <b>ratings.csv</b> para mayor precisión.
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

                            <label className="csv-upload-btn" title="Subir ratings.csv (Export de Letterboxd)">
                                <Upload size={14} color={csvData[i] ? '#00e054' : '#888'} />
                                <input
                                    type="file"
                                    accept=".csv"
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleFileUpload(e, i)}
                                />
                            </label>
                        </div>
                    ))}

                    <button className="add-btn" onClick={addDriver}>
                        + ADD WARRIOR
                    </button>

                    <button className="battle-start-btn" onClick={handleStartBattle}>
                        INICIAR BATALLA
                    </button>
                </div>
            )}

            {loading && (
                <div className="loading-battle">
                    <h2>ANALIZANDO EL CAMPO DE BATALLA...</h2>
                </div>
            )}

            {battleData && !loading && (
                <>
                    <div className="battle-stats">
                        <div className="stat-card">
                            <div className="stat-val">{stats?.total}</div>
                            <div className="stat-label">Batallas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-val">{stats?.avgDiff}</div>
                            <div className="stat-label">Discordia Media</div>
                        </div>
                    </div>

                    <RatingList
                        movies={processedMovies}
                        users={battleData.users}
                        sortMode={sortMode}
                        onSortChange={setSortMode}
                    />

                    <button
                        className="battle-start-btn"
                        style={{ marginTop: '2rem', background: 'transparent', border: '1px solid #333' }}
                        onClick={() => setBattleData(null)}
                    >
                        NUEVA BATALLA
                    </button>
                </>
            )}
        </div>
    )
}
