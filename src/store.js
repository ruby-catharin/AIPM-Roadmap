import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRoadmapStore = create(
  persist(
    (set) => ({
      // Navigation state
      currentWeekId: 1,
      currentSectionId: '1-1',

      // UI state - using arrays instead of Sets for localStorage compatibility
      expandedSections: [],
      selectedDepthLevels: {}, // { sectionId: 'eli5' | 'normal' | 'technical' | 'pm' }
      selectedDepthLevel: 'normal', // Global depth level for resources sidebar

      // Progress tracking
      completedSections: [],
      quizAnswers: {}, // { sectionId: [{ questionIndex, selectedIndex, isCorrect }] }

      // Theme state
      darkMode: typeof window !== 'undefined'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false,

      // Actions
      setCurrentWeek: (weekId) => set({ currentWeekId: weekId }),
      setCurrentSection: (sectionId) => set({ currentSectionId: sectionId }),

      toggleExpandSection: (sectionId) =>
        set((state) => {
          const expanded = state.expandedSections.includes(sectionId)
            ? state.expandedSections.filter(id => id !== sectionId)
            : [...state.expandedSections, sectionId];
          return { expandedSections: expanded };
        }),

      setDepthLevel: (sectionId, level) =>
        set((state) => ({
          selectedDepthLevels: {
            ...state.selectedDepthLevels,
            [sectionId]: level,
          },
        })),

      setDarkMode: (isDark) => set({ darkMode: isDark }),

      setSelectedDepthLevel: (level) => set({ selectedDepthLevel: level }),

      toggleSectionComplete: (sectionId) =>
        set((state) => {
          const completed = state.completedSections.includes(sectionId)
            ? state.completedSections.filter(id => id !== sectionId)
            : [...state.completedSections, sectionId];
          return { completedSections: completed };
        }),

      recordQuizAnswer: (sectionId, questionIndex, selectedIndex, isCorrect) =>
        set((state) => ({
          quizAnswers: {
            ...state.quizAnswers,
            [sectionId]: [
              ...(state.quizAnswers[sectionId] || []),
              { questionIndex, selectedIndex, isCorrect },
            ],
          },
        })),

      // Reset all progress
      resetProgress: () =>
        set({
          currentWeekId: 1,
          currentSectionId: '1-1',
          expandedSections: [],
          selectedDepthLevels: {},
          completedSections: [],
          quizAnswers: {},
          darkMode: typeof window !== 'undefined'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
            : false,
        }),

      // Getters for computed values
      getProgressPercentage: (state) => {
        if (state.completedSections.length === 0) return 0;
        return Math.round((state.completedSections.length / 100) * 100);
      },
    }),
    {
      name: 'roadmap-progress', // localStorage key
    }
  )
);
