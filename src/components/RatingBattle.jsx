
import { useState, useEffect } from 'react'
import { Users, Swords } from 'lucide-react'
import { fetchUserRatings } from '../api/letterboxdRatings'
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

    const addDriver = () => setUsernames([...usernames, ''])

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

            // 1. Fetch ratings for all users
            for (const user of activeUsers) {
                const ratings = await fetchUserRatings(user)
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
                        Analizando historial completo.
                        <b>Nota:</b> Puede tardar unos segundos por página.
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
