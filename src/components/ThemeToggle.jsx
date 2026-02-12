import { Moon, Sun, Palette } from 'lucide-react'
import { useStore } from '../store/useStore'
import './ThemeToggle.css'

const THEMES = [
    { id: 'default', name: 'Default', icon: '🌌' },
    { id: 'dark', name: 'Dark', icon: '🌙' },
    { id: 'retro', name: 'Retro', icon: '📼' },
    { id: 'neon', name: 'Neon', icon: '⚡' },
]

export function ThemeToggle() {
    const { theme, setTheme } = useStore()

    const handleThemeChange = (themeId) => {
        setTheme(themeId)
        document.documentElement.setAttribute('data-theme', themeId)
    }

    return (
        <div className="theme-toggle">
            <Palette size={18} />
            <div className="theme-options">
                {THEMES.map(t => (
                    <button
                        key={t.id}
                        className={`theme-btn ${theme === t.id ? 'active' : ''}`}
                        onClick={() => handleThemeChange(t.id)}
                        title={t.name}
                    >
                        {t.icon}
                    </button>
                ))}
            </div>
        </div>
    )
}
