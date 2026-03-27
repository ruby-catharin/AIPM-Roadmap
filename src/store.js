import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRoadmapStore = create(
  persist(
    (set) => ({
      // Navigation state
      currentWeekId: 1,
      currentSectionId: '1-1',

      // UI state
      expandedSections: new Set(),
      selectedDepthLevels: {}, // { sectionId: 'eli5' | 'normal' | 'technical' | 'pm' }

      // Progress tracking
      completedSections: new Set(),
      quizAnswers: {}, // { sectionId: [{ questionIndex, selectedIndex, isCorrect }] }

      // Actions
      setCurrentWeek: (weekId) => set({ currentWeekId: weekId }),
      setCurrentSection: (sectionId) => set({ currentSectionId: sectionId }),

      toggleExpandSection: (sectionId) =>
        set((state) => {
          const expanded = new Set(state.expandedSections);
          if (expanded.has(sectionId)) {
            expanded.delete(sectionId);
          } else {
            expanded.add(sectionId);
          }
          return { expandedSections: expanded };
        }),

      setDepthLevel: (sectionId, level) =>
        set((state) => ({
          selectedDepthLevels: {
            ...state.selectedDepthLevels,
            [sectionId]: level,
          },
        })),

      toggleSectionComplete: (sectionId) =>
        set((state) => {
          const completed = new Set(state.completedSections);
          if (completed.has(sectionId)) {
            completed.delete(sectionId);
          } else {
            completed.add(sectionId);
          }
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
          expandedSections: new Set(),
          selectedDepthLevels: {},
          completedSections: new Set(),
          quizAnswers: {},
        }),

      // Getters for computed values
      getProgressPercentage: (state) => {
        if (state.completedSections.size === 0) return 0;
        // You'll need to calculate total sections from WEEKS data
        return Math.round((state.completedSections.size / 100) * 100); // placeholder
      },
    }),
    {
      name: 'roadmap-progress', // localStorage key
      // Custom serialization for Sets
      partialize: (state) => ({
        ...state,
        expandedSections: Array.from(state.expandedSections),
        completedSections: Array.from(state.completedSections),
      }),
    }
  )
);
