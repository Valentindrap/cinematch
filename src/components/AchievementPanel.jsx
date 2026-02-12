import { Trophy, Award } from 'lucide-react'
import { ACHIEVEMENTS } from '../utils/achievements'
import './AchievementPanel.css'

export function AchievementPanel({ unlockedAchievements }) {
    const allAchievements = Object.values(ACHIEVEMENTS)
    const unlockedIds = new Set(unlockedAchievements || [])

    return (
        <div className="achievement-panel glass">
            <div className="achievement-header">
                <Trophy size={24} color="#ffd700" />
                <h3>Logros</h3>
                <span className="achievement-count">
                    {unlockedIds.size}/{allAchievements.length}
                </span>
            </div>

            <div className="achievement-grid">
                {allAchievements.map(achievement => {
                    const isUnlocked = unlockedIds.has(achievement.id)
                    return (
                        <div
                            key={achievement.id}
                            className={`achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                            title={achievement.description}
                        >
                            <div className="achievement-item-icon">
                                {isUnlocked ? achievement.icon : '🔒'}
                            </div>
                            <div className="achievement-item-info">
                                <div className="achievement-item-name">
                                    {isUnlocked ? achievement.name : '???'}
                                </div>
                                <div className="achievement-item-desc">
                                    {isUnlocked ? achievement.description : 'Logro bloqueado'}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
