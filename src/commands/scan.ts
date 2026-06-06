import * as fs from 'fs';
import * as path from 'path';
import { getProjectByName } from '../storage';

const IGNORED = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next']);

interface ScanResult {
  project: string;
  folders: string[];
  fileCount: number;
  technologies: string[];
}

function countFiles(dirPath: string): number {
  let count = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED.has(entry.name)) {
        continue;
      }
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        count += countFiles(fullPath);
      } else if (entry.isFile()) {
        count++;
      }
    }
  } catch (error) {
    // Skip unreadable directories
  }
  return count;
}

function checkDirTechs(dirPath: string, techs: Set<string>): void {
  try {
    // 1. Check tsconfig.json
    if (fs.existsSync(path.join(dirPath, 'tsconfig.json'))) {
      techs.add('TypeScript');
    }
    
    // 2. Check prisma folder or schema.prisma
    if (fs.existsSync(path.join(dirPath, 'prisma')) || fs.existsSync(path.join(dirPath, 'prisma/schema.prisma'))) {
      techs.add('Prisma');
    }

    // 3. Inspect package.json
    const packageJsonPath = path.join(dirPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };
        
        if (deps['react']) techs.add('React');
        if (deps['next']) {
          techs.add('Next.js');
          techs.add('React');
        }
        if (deps['prisma'] || deps['@prisma/client']) techs.add('Prisma');
        if (deps['typescript']) techs.add('TypeScript');
        if (deps['tailwindcss']) techs.add('TailwindCSS');
      } catch (e) {
        // Ignore parse errors
      }
    }
  } catch (error) {
    // Ignore read errors
  }
}

export function scanAction(projectName: string): void {
  try {
    const project = getProjectByName(projectName);
    if (!project) {
      console.error(`Error: Project "${projectName}" is not registered.`);
      process.exit(1);
    }

    const projectPath = project.path;
    if (!fs.existsSync(projectPath)) {
      console.error(`Error: Project path does not exist: ${projectPath}`);
      process.exit(1);
    }

    // Get top level folders (excluding ignored ones)
    const topLevelContents = fs.readdirSync(projectPath, { withFileTypes: true });
    const folders = topLevelContents
      .filter(dirent => dirent.isDirectory() && !IGNORED.has(dirent.name))
      .map(dirent => dirent.name)
      .sort();

    // Count files recursively (excluding ignored ones)
    const fileCount = countFiles(projectPath);

    // Detect technologies
    const techs = new Set<string>();
    checkDirTechs(projectPath, techs);
    for (const folder of folders) {
      checkDirTechs(path.join(projectPath, folder), techs);
    }

    const result: ScanResult = {
      project: project.name,
      folders,
      fileCount,
      technologies: Array.from(techs).sort()
    };

    console.log(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('Error scanning project:', error.message);
    process.exit(1);
  }
}
