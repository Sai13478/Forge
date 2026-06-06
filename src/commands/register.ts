import { registerProject } from '../storage';

export function registerAction(name: string, path: string): void {
  try {
    if (!name || !path) {
      console.error('Error: Project name and path are required.');
      process.exit(1);
    }
    registerProject(name, path);
  } catch (error: any) {
    console.error('Error registering project:', error.message);
    process.exit(1);
  }
}
