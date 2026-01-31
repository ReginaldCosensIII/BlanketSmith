import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { ProjectState, ProjectAction, PixelGridData, PatternColor } from '../types';
import { saveProject, getProjects } from '../services/projectService';

const ProjectContext = createContext<{
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
  saveCurrentProject: () => void;
} | null>(null);

const projectReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
  switch (action.type) {
    case 'NEW_PROJECT':
    case 'LOAD_PROJECT':
      return { project: action.payload, history: [action.payload], historyIndex: 0 };
    case 'UPDATE_PROJECT_DATA': {
      if (!state.project) return state;

      // Check for hard replace flag
      const payload = action.payload as any;
      let newData;

      if (payload._replace) {
        // Hard Replace: construct new data object effectively resetting grid
        // We strip the _replace flag
        const { _replace, ...cleanPayload } = payload;
        newData = cleanPayload;
      } else {
        // Soft Merge (Default)
        newData = { ...state.project.data, ...action.payload };
      }

      const updatedProject = { ...state.project, data: newData };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(updatedProject);
      return { ...state, project: updatedProject, history: newHistory, historyIndex: newHistory.length - 1 };
    }
    case 'UPDATE_PROJECT_NAME': {
      if (!state.project) return state;
      const updatedProject = { ...state.project, name: action.payload };
      return { ...state, project: updatedProject };
    }
    case 'UPDATE_PROJECT_SETTINGS': {
      if (!state.project) return state;
      const updatedProject = { ...state.project, settings: { ...state.project.settings, ...action.payload } };
      return { ...state, project: updatedProject };
    }
    case 'SET_PALETTE': {
      if (!state.project) return state;
      const updatedProject = { ...state.project, yarnPalette: action.payload };
      return { ...state, project: updatedProject };
    }
    case 'SET_PRIMARY_COLOR': {
      if (!state.project) return state;
      const updatedProject = { ...state.project, activePrimaryColorId: action.payload || undefined };
      // Configuration update, no history push
      return { ...state, project: updatedProject };
    }
    case 'SET_SECONDARY_COLOR': {
      if (!state.project) return state;
      const updatedProject = { ...state.project, activeSecondaryColorId: action.payload || undefined };
      // Configuration update, no history push
      return { ...state, project: updatedProject };
    }
    case 'ADD_COLOR_TO_PALETTE': {
      if (!state.project) return state;
      const colorToAdd = action.payload;
      const existingIndex = state.project.yarnPalette.findIndex(c => c.id === colorToAdd.id);

      let newPalette;
      if (existingIndex >= 0) {
        // Color exists. If hidden, unhide it.
        const existingColor = state.project.yarnPalette[existingIndex];
        if (existingColor.hidden) {
          newPalette = [...state.project.yarnPalette];
          newPalette[existingIndex] = { ...existingColor, hidden: false };
        } else {
          // Already visible, do nothing
          return state;
        }
      } else {
        // New color
        newPalette = [...state.project.yarnPalette, colorToAdd];
      }

      const updatedProject = { ...state.project, yarnPalette: newPalette };
      return { ...state, project: updatedProject };
    }
    case 'REMOVE_COLOR_FROM_PALETTE': {
      if (!state.project) return state;
      const colorIdToRemove = action.payload;

      // 1. Check Usage Safely
      let isUsed = false;
      if (state.project.data && 'grid' in state.project.data) {
        const pixelData = state.project.data as PixelGridData;
        isUsed = pixelData.grid.some((c: any) => c.colorId === colorIdToRemove);
      }

      // 2. Immortal Palette Logic
      let newPalette;
      if (isUsed) {
        // Soft Delete: Mark hidden, DO NOT REMOVE pixels
        newPalette = state.project.yarnPalette.map(c =>
          c.id === colorIdToRemove ? { ...c, hidden: true } : c
        );
      } else {
        // Hard Delete: Remove from array
        newPalette = state.project.yarnPalette.filter(c => c.id !== colorIdToRemove);
      }

      const updatedProject = { ...state.project, yarnPalette: newPalette };
      return { ...state, project: updatedProject };
    }
    case 'CLEAR_PALETTE': {
      if (!state.project) return state;

      const checkUsage = (id: string) => {
        if (state.project?.data && 'grid' in state.project.data) {
          const pixelData = state.project.data as PixelGridData;
          return pixelData.grid.some((c: any) => c.colorId === id);
        }
        return false;
      };

      // Keep used ones (hidden), remove unused
      const newPalette = state.project.yarnPalette.reduce<PatternColor[]>((acc, color) => {
        if (checkUsage(color.id)) {
          acc.push({ ...color, hidden: true });
        }
        return acc;
      }, []);

      const updatedProject = { ...state.project, yarnPalette: newPalette };
      return { ...state, project: updatedProject };
    }
    case 'UPDATE_INSTRUCTION_DOC': {
      if (!state.project) return state;
      const updatedProject = { ...state.project, instructionDoc: action.payload };
      return { ...state, project: updatedProject };
    }
    case 'UNDO': {
      if (state.historyIndex > 0) {
        if (!state.project) return state;
        const newIndex = state.historyIndex - 1;
        const snapshot = state.history[newIndex];

        // Merge persistent configuration (Palette) into the snapshot
        const preservedProject = {
          ...snapshot,
          yarnPalette: state.project.yarnPalette,
          activePrimaryColorId: state.project.activePrimaryColorId,
          activeSecondaryColorId: state.project.activeSecondaryColorId
        };

        return { ...state, project: preservedProject, historyIndex: newIndex };
      }
      return state;
    }
    case 'REDO': {
      if (state.historyIndex < state.history.length - 1) {
        if (!state.project) return state;
        const newIndex = state.historyIndex + 1;
        const snapshot = state.history[newIndex];

        // Merge persistent configuration (Palette) into the snapshot
        const preservedProject = {
          ...snapshot,
          yarnPalette: state.project.yarnPalette,
          activePrimaryColorId: state.project.activePrimaryColorId,
          activeSecondaryColorId: state.project.activeSecondaryColorId
        };

        return { ...state, project: preservedProject, historyIndex: newIndex };
      }
      return state;
    }
    default:
      return state;
  }
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, { project: null, history: [], historyIndex: 0 });

  // Load active project on mount
  useEffect(() => {
    const lastActiveId = localStorage.getItem('active_project_id');
    if (lastActiveId && !state.project) {
      const projects = getProjects();
      const found = projects.find(p => p.id === lastActiveId);
      if (found) {
        dispatch({ type: 'LOAD_PROJECT', payload: found });
      }
    }
  }, []);

  // Save active project ID
  useEffect(() => {
    if (state.project) {
      localStorage.setItem('active_project_id', state.project.id);
    }
  }, [state.project?.id]);

  const saveCurrentProject = useCallback(() => {
    if (state.project) {
      saveProject(state.project);
    }
  }, [state.project]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.project) {
        saveProject(state.project);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [state.project]);

  const value = useMemo(() => ({ state, dispatch, saveCurrentProject }), [state, dispatch, saveCurrentProject]);
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};
