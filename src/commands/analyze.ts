import * as fs from 'fs';
import * as path from 'path';
import { getProjectByName } from '../storage';

interface AnalysisResult {
  project: string;
  frontend?: string;
  backend?: string;
  language?: string;
  orm?: string;
  bundler?: string;
}

function getDependencies(packageJsonPath: string): Set<string> {
  const depsSet = new Set<string>();
  try {
    if (fs.existsSync(packageJsonPath)) {
      const content = fs.readFileSync(packageJsonPath, 'utf8');
      const pkg = JSON.parse(content);
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies
      };
      for (const key of Object.keys(allDeps)) {
        depsSet.add(key.toLowerCase());
      }
    }
  } catch (error) {
    // Ignore reading/parsing errors for a single package.json
  }
  return depsSet;
}

export function analyzeAction(projectName: string): void {
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

    // Paths to frontend/package.json and backend/package.json
    const frontendPkgPath = path.join(projectPath, 'frontend', 'package.json');
    const backendPkgPath = path.join(projectPath, 'backend', 'package.json');

    const frontendDeps = getDependencies(frontendPkgPath);
    const backendDeps = getDependencies(backendPkgPath);

    // Merge dependencies
    const allDeps = new Set<string>([...frontendDeps, ...backendDeps]);

    // Detect technologies
    let frontend: string | undefined;
    if (allDeps.has('next')) {
      frontend = 'Next.js';
    } else if (allDeps.has('react')) {
      frontend = 'React';
    }

    let backend: string | undefined;
    if (allDeps.has('nestjs')) {
      backend = 'NestJS';
    } else if (allDeps.has('express')) {
      backend = 'Express';
    }

    let language: string | undefined;
    if (allDeps.has('typescript')) {
      language = 'TypeScript';
    }

    let orm: string | undefined;
    if (allDeps.has('prisma')) {
      orm = 'Prisma';
    } else if (allDeps.has('mongoose')) {
      orm = 'MongoDB';
    }

    let bundler: string | undefined;
    if (allDeps.has('vite')) {
      bundler = 'Vite';
    }

    const result: AnalysisResult = {
      project: project.name,
    };

    if (frontend !== undefined) result.frontend = frontend;
    if (backend !== undefined) result.backend = backend;
    if (language !== undefined) result.language = language;
    if (orm !== undefined) result.orm = orm;
    if (bundler !== undefined) result.bundler = bundler;

    // Save output
    const projectRoot = path.join(__dirname, '../../');
    const analysisDir = path.join(projectRoot, 'data/analysis');
    const outputPath = path.join(analysisDir, `${project.name.toLowerCase()}.json`);

    fs.mkdirSync(analysisDir, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');

    console.log(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('Error analyzing project:', error.message);
    process.exit(1);
  }
}
