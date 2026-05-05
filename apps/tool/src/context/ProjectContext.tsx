import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { ProjectState, ProjectAction, PixelGridData, PatternColor } from '../types';
import { saveProject, getProjects } from '../services/projectService';
import { useAuth } from './AuthContext';
import { saveProjectToCloud, getCloudProjects } from '../services/cloudSyncService';
import { logger } from '../services/logger';

const ProjectContext = createContext<{
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
  saveCurrentProject: () => void;
  updateProjectData: (grid: any[], history?: any[], palette?: any[]) => void;
  isLoadingProjects: boolean;
} | null>(null);

const projectReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'SYNC_SAVED_PROJECT' as any: {
      const savedProject = (action as any).payload;
      const isExisting = state.projects.some(p => p.id === savedProject.id);
      const updatedProjects = isExisting
        ? state.projects.map(p => p.id === savedProject.id ? savedProject : p)
        : [savedProject, ...state.projects];
      return { ...state, projects: updatedProjects };
    }
    case 'NEW_PROJECT':
    case 'LOAD_PROJECT':
      return { ...state, project: action.payload, history: [action.payload], historyIndex: 0 };
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

      const updatedProject = {
        ...state.project,
        yarnPalette: newPalette,
        activePrimaryColorId: undefined,
        activeSecondaryColorId: undefined
      };
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
  const [state, dispatch] = useReducer(projectReducer, { projects: [], project: null, history: [], historyIndex: 0 });
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const { user, isLoading } = useAuth();

  const projectRef = useRef(state.project);
  const gridRef = useRef(state.project?.data && 'grid' in state.project.data ? state.project.data.grid : []);
  const paletteRef = useRef(state.project?.yarnPalette);
  const historyRef = useRef(state.history);
  const historyIndexRef = useRef(state.historyIndex);
  const userRef = useRef(user);

  // Sync state refs to cleanly capture the absolute latest state
  useEffect(() => {
    projectRef.current = state.project;
    gridRef.current = state.project?.data && 'grid' in state.project.data ? state.project.data.grid : [];
    paletteRef.current = state.project?.yarnPalette;
    historyRef.current = state.history;
    historyIndexRef.current = state.historyIndex;
    userRef.current = user;
  }, [state, user]);

  // Load active project on mount
  useEffect(() => {
    if (isLoading) return; // Wait until auth state resolves

    if (user?.id) {
      setIsLoadingProjects(true);
      getCloudProjects(user.id).then(projects => {
        dispatch({ type: 'SET_PROJECTS', payload: projects });
      }).catch(err => logger.error("HYDRATION ERROR", { err }))
        .finally(() => setIsLoadingProjects(false));
    } else {
      setIsLoadingProjects(false);
    }
  }, [isLoading, user?.id]);

  const saveCurrentProject = useCallback(async () => {
    const activeProject = projectRef.current;
    const currentUser = userRef.current;

    try {
      if (activeProject) {
        // Construct cleanly from absolute current state refs
        const latestProjectState = {
          ...activeProject,
          data: {
            ...(activeProject.data || {}),
            grid: gridRef.current
          },
          yarnPalette: paletteRef.current || activeProject.yarnPalette
        };

        if (currentUser) {
          await saveProjectToCloud(latestProjectState as any, currentUser.id);
          dispatch({ type: 'SYNC_SAVED_PROJECT' as any, payload: latestProjectState });
        } else {
          saveProject(latestProjectState as any);
          dispatch({ type: 'SYNC_SAVED_PROJECT' as any, payload: latestProjectState });
        }
      }
    } catch (e) {
      logger.error('Failed to save project', { error: e });
      alert('Failed to save project. Please check your connection and try again.');
    }
  }, []);

  // DISABLE AUTOSAVE: Rely explicitly on manual UI save
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     saveCurrentProject();
  //   }, 2000);
  //   return () => clearTimeout(timer);
  // }, [state.project, saveCurrentProject]);

  const updateProjectData = useCallback((grid: any[], history?: any[], palette?: any[]) => {
    dispatch({ type: 'UPDATE_PROJECT_DATA', payload: { grid, _replace: false } as any });
    if (palette) {
      dispatch({ type: 'SET_PALETTE', payload: palette });
    }
  }, [dispatch]);

  const value = useMemo(() => ({ state, dispatch, saveCurrentProject, updateProjectData, isLoadingProjects }), [state, dispatch, saveCurrentProject, updateProjectData, isLoadingProjects]);
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};
