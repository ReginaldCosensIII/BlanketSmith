import { supabase } from '../lib/supabase';
import { AnyProject } from '../types';
import { logger } from './logger';

/**
 * Robust JSON parser with highly visible error logging for the Architect.
 * Prevents hydration crashes from mangled DB data.
 */
const safeJSONParse = (data: any, fieldName: string, projectId: string) => {
  if (data === undefined || data === null) {
    return fieldName === 'grid' || fieldName === 'palette' ? [] : {};
  }

  try {
    // SMART PARSE: Only parse if the driver returned a string. If the JSONB driver 
    // natively parsed it into an object/array, use it directly to prevent Double Parse crashes.
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return parsed;
  } catch (e) {
    logger.error(`SERIALIZATION ERROR`, { projectId, fieldName, error: e, data });
    return fieldName === 'grid' || fieldName === 'palette' ? [] : {};
  }
};

export const serializeForDB = (project: AnyProject, userId: string) => {
  const data = project.data as any;
  return {
    id: project.id,
    user_id: userId,
    name: project.name,
    project_type: project.type,
    width: data.width || 50,
    height: data.height || 60,
    // STRICT SERIALIZATION: Prevent Postgres string coercion
    grid: JSON.stringify(data.grid || []),
    palette: JSON.stringify(project.yarnPalette || []),
    settings: JSON.stringify(project.settings || {}),
    // DEFUSE HISTORY BLOAT: History is now local-only
    history: [],
    history_index: 0,
    created_at: project.createdAt,
    updated_at: project.updatedAt || new Date().toISOString(),
  };
};

export const deserializeFromDB = (row: any): AnyProject => {
  let gridData = safeJSONParse(row.grid, 'grid', row.id);
  
  if (!Array.isArray(gridData) && gridData?.grid) {
    gridData = gridData.grid;
  }
  if (!Array.isArray(gridData)) {
    gridData = [];
  }

  const paletteData = safeJSONParse(row.palette, 'palette', row.id);
  const settingsData = safeJSONParse(row.settings, 'settings', row.id);

  return {
    id: row.id,
    name: row.name,
    type: row.project_type || 'pixel',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    settings: settingsData || {},
    data: {
      width: row.width || 50,
      height: row.height || 60,
      grid: gridData
    } as any,
    yarnPalette: paletteData || [],
  };
};

/**
 * Persists a project to Supabase.
 * Strictly serializes JSONB columns to avoid Postgres malformed string coercion.
 */
export const saveProjectToCloud = async (
  project: AnyProject,
  userId: string
): Promise<void> => {
  try {
    const payload = serializeForDB(project, userId);

    const { error } = await supabase
      .from('projects')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      logger.error('Supabase Upsert Error', { error });
      throw error;
    }
  } catch (error) {
    logger.error('Failed to save project to cloud', { error, projectId: project.id });
    throw error;
  }
};

/**
 * Retrieves all cloud projects for an authenticated user.
 */
export const getCloudProjects = async (userId: string): Promise<AnyProject[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    // Route through Adapter
    return (data || []).map(deserializeFromDB);
  } catch (error) {
    logger.error('Failed to fetch cloud projects', { error, userId });
    throw error;
  }
};

/**
 * Deletes a project from the cloud.
 */
export const deleteCloudProject = async (projectId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  } catch (error) {
    logger.error('Failed to delete cloud project', { error, projectId });
    throw error;
  }
};
