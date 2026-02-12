import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Film, Star, Users } from 'lucide-react'
import './StatsDashboard.css'

export function StatsDashboard({ statistics, onClose }) {
    if (!statistics) return null

    // Prepare genre data for pie chart
    const genreData = Object.entries(statistics.genreDistribution || {})
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)

    // Prepare decade data for bar chart
    const decadeData = Object.entries(statistics.decadeDistribution || {})
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => a.name.localeCompare(b.name))

    // Prepare rating data for bar chart
    const ratingData = Object.entries(statistics.ratingDistribution || {})
        .map(([name, value]) => ({ name, value }))

    const COLORS = ['#00e054', '#00a8ff', '#ff3b5c', '#ffd700', '#9c27b0', '#ff9800', '#4caf50', '#f44336']

    return (
        <div className="stats-modal-overlay" onClick={onClose}>
            <div className="stats-modal" onClick={(e) => e.stopPropagation()}>
                <div className="stats-header">
                    <h2>📊 Estadísticas de tu Selección</h2>
                    <button className="stats-close" onClick={onClose}>×</button>
                </div>

                <div className="stats-summary">
                    <div className="stat-card glass">
                        <Film className="stat-icon" />
                        <div className="stat-value">{statistics.totalMovies}</div>
                        <div className="stat-label">Películas</div>
                    </div>
                    <div className="stat-card glass">
                        <Star className="stat-icon" fill="#ffd700" color="#ffd700" />
                        <div className="stat-value">{statistics.averageRating}</div>
                        <div className="stat-label">Rating Promedio</div>
                    </div>
                    {statistics.compatibility > 0 && (
                        <div className="stat-card glass">
                            <Users className="stat-icon" />
                            <div className="stat-value">{statistics.compatibility}%</div>
                            <div className="stat-label">Compatibilidad</div>
                        </div>
                    )}
                </div>

                <div className="stats-charts">
                    {genreData.length > 0 && (
                        <div className="chart-container glass">
                            <h3>Distribución por Género</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={genreData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {genreData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {decadeData.length > 0 && (
                        <div className="chart-container glass">
                            <h3>Películas por Década</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={decadeData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="name" stroke="#fff" />
                                    <YAxis stroke="#fff" />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(0,0,0,0.8)',
                                            border: '1px solid #00e054',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#00e054" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {ratingData.length > 0 && (
                        <div className="chart-container glass">
                            <h3>Distribución de Ratings</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={ratingData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="name" stroke="#fff" />
                                    <YAxis stroke="#fff" />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(0,0,0,0.8)',
                                            border: '1px solid #00a8ff',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#00a8ff" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
