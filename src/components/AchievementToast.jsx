import toast from 'react-hot-toast'
import { ACHIEVEMENTS } from '../utils/achievements'
import './AchievementToast.css'

export function showAchievementToast(achievementId) {
    const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === achievementId)
    if (!achievement) return

    toast.custom(
        (t) => (
            <div className={`achievement-toast ${t.visible ? 'show' : 'hide'}`}>
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                    <div className="achievement-title">¡Logro Desbloqueado!</div>
                    <div className="achievement-name">{achievement.name}</div>
                    <div className="achievement-desc">{achievement.description}</div>
                </div>
            </div>
        ),
        { duration: 4000, position: 'top-center' }
    )
}

export function showSuccessToast(message) {
    toast.success(message, {
        style: {
            background: 'rgba(0, 224, 84, 0.9)',
            color: '#0a0e17',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '16px 20px',
        },
        iconTheme: {
            primary: '#0a0e17',
            secondary: '#00e054',
        },
    })
}

export function showErrorToast(message) {
    toast.error(message, {
        style: {
            background: 'rgba(255, 59, 92, 0.9)',
            color: '#fff',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '16px 20px',
        },
    })
}

export function showInfoToast(message) {
    toast(message, {
        style: {
            background: 'rgba(0, 168, 255, 0.9)',
            color: '#fff',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '16px 20px',
        },
        icon: '💡',
    })
}
