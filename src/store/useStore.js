import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
    persist(
        (set, get) => ({
            // User & Session State
            usernames: ['', ''],
            currentGroup: null,
            groups: [],

            // Movie Data
            moviesData: [],
            filteredMovies: [],
            history: [],
            watchedMovies: [],
            vetoedMovies: [],
            favoriteMovies: [],

            // UI State
            mode: 'match',
            theme: 'default',
            soundEnabled: true,
            loading: false,
            winner: null,
            movieDetails: null,

            // Filters
            filters: {
                genres: [],
                yearRange: [1900, 2026],
                ratingRange: [0, 10],
                duration: 'all', // 'all', 'short', 'medium', 'long'
            },

            // Gamification
            achievements: [],
            userStats: {},

            // Settings
            accessibility: {
                highContrast: false,
                reducedMotion: false,
                fontSize: 'medium',
            },

            // Actions
            setUsernames: (usernames) => set({ usernames }),
            setMode: (mode) => set({ mode }),
            setTheme: (theme) => set({ theme }),
            setMoviesData: (moviesData) => set({ moviesData }),
            setFilteredMovies: (filteredMovies) => set({ filteredMovies }),
            setFilters: (filters) => set({ filters }),
            setLoading: (loading) => set({ loading }),
            setWinner: (winner) => set({ winner }),
            setSoundEnabled: (soundEnabled) => set({ soundEnabled }),

            addToHistory: (movie) => set((state) => ({
                history: [movie, ...state.history].slice(0, 20)
            })),

            addWatchedMovie: (movie) => set((state) => ({
                watchedMovies: [...state.watchedMovies, { ...movie, watchedAt: new Date().toISOString() }]
            })),

            toggleVeto: (movieTitle) => set((state) => {
                const isVetoed = state.vetoedMovies.includes(movieTitle)
                if (isVetoed) {
                    return { vetoedMovies: state.vetoedMovies.filter(m => m !== movieTitle) }
                } else if (state.vetoedMovies.length < 3) {
                    return { vetoedMovies: [...state.vetoedMovies, movieTitle] }
                }
                return state
            }),

            toggleFavorite: (movieTitle) => set((state) => {
                const isFavorite = state.favoriteMovies.includes(movieTitle)
                return {
                    favoriteMovies: isFavorite
                        ? state.favoriteMovies.filter(m => m !== movieTitle)
                        : [...state.favoriteMovies, movieTitle]
                }
            }),

            createGroup: (name, members) => set((state) => ({
                groups: [...state.groups, {
                    id: Date.now().toString(),
                    name,
                    members,
                    createdAt: new Date().toISOString(),
                    watchedMovies: []
                }]
            })),

            setCurrentGroup: (groupId) => set({ currentGroup: groupId }),

            unlockAchievement: (achievementId) => set((state) => {
                if (!state.achievements.includes(achievementId)) {
                    return { achievements: [...state.achievements, achievementId] }
                }
                return state
            }),

            updateAccessibility: (settings) => set((state) => ({
                accessibility: { ...state.accessibility, ...settings }
            })),

            reset: () => set({
                moviesData: [],
                filteredMovies: [],
                winner: null,
                vetoedMovies: [],
                loading: false,
            }),
        }),
        {
            name: 'cinematch-storage',
            partialize: (state) => ({
                groups: state.groups,
                theme: state.theme,
                soundEnabled: state.soundEnabled,
                achievements: state.achievements,
                userStats: state.userStats,
                watchedMovies: state.watchedMovies,
                accessibility: state.accessibility,
            })
        }
    )
)
