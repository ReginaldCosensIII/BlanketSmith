import { supabase } from '../lib/supabase';
import { AnyProject } from '../types';
import { logger } from './logger';

export const serializeForDB = (project: AnyProject, userId: string, history: AnyProject[] = [], historyIndex: number = 0) => {
  return {
    id: project.id,
    user_id: userId,
    name: project.name,
    grid: project.data,          // Map structured data exactly to 'grid' JSONB col
    history: history,            // History arrays
    history_index: historyIndex, 
    palette: project.yarnPalette,// Map yarnPalette to 'palette' col
    settings: project.settings || {}, 
    created_at: project.createdAt,
    updated_at: project.updatedAt || new Date().toISOString(),
  };
};

export const deserializeFromDB = (row: any): AnyProject => {
  const safeParse = (data: any) => typeof data === 'string' ? JSON.parse(data) : data;

  return {
    id: row.id,
    name: row.name,
    type: 'pixel', // Basic DB schema fallback
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    settings: safeParse(row.settings) || {},
    data: safeParse(row.grid),             // Rehydrate structured object back to project.data
    yarnPalette: safeParse(row.palette),   // Rehydrate array back to project.yarnPalette
  };
};

/**
 * Persists a project to Supabase.
 * The schema maps the local project fields heavily into JSONB columns.
 */
export const saveProjectToCloud = async (
  project: AnyProject,
  userId: string,
  history: AnyProject[] = [],
  historyIndex: number = 0
): Promise<void> => {
  try {
    const payload = serializeForDB(project, userId, history, historyIndex);

    const { error } = await supabase
      .from('projects')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('❌ Supabase Upsert Error:', error);
      throw error;
    }

    console.log('✅ Successfully saved to Supabase', payload);
  } catch (error) {
    console.error('❌ Failed to save project to cloud', { error, projectId: project.id });
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
