import { getProjects } from '../storage';

export function listAction(): void {
  try {
    const projects = getProjects();
    console.log('Registered Projects\n');
    projects.forEach((proj, idx) => {
      console.log(`${idx + 1}. ${proj.name}`);
    });
  } catch (error: any) {
    console.error('Error listing projects:', error.message);
    process.exit(1);
  }
}
