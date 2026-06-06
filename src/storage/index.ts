import * as fs from 'fs';
import * as path from 'path';

export interface Project {
  name: string;
  path: string;
}

const STORAGE_FILE = path.join(__dirname, '../../projects.json');

export function getProjects(): Project[] {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return [];
    }
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    if (!data.trim()) {
      return [];
    }
    return JSON.parse(data) as Project[];
  } catch (error) {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    const data = JSON.stringify(projects, null, 2);
    fs.writeFileSync(STORAGE_FILE, data, 'utf8');
  } catch (error) {
    console.error('Error writing to projects.json:', error);
  }
}

export function registerProject(name: string, projectPath: string): void {
  const normalizedPath = projectPath.replace(/\\/g, '/');
  const projects = getProjects();
  
  const existingIndex = projects.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
  if (existingIndex !== -1) {
    projects[existingIndex].path = normalizedPath;
    // Keep the case as inputted or update it? Let's update the name in case the case changed.
    projects[existingIndex].name = name;
  } else {
    projects.push({ name, path: normalizedPath });
  }
  
  saveProjects(projects);
}

export function getProjectByName(name: string): Project | undefined {
  const projects = getProjects();
  return projects.find(p => p.name.toLowerCase() === name.toLowerCase());
}

