import * as fs from 'fs';
import * as path from 'path';
import { getProjectByName } from '../storage';

export interface DiscoveredModule {
  name: string;
  path: string;
  routes?: string[];
}

const IGNORED = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next']);
const TARGET_FOLDERS = new Set(['modules', 'features', 'routes', 'controllers']);

function extractRoutesFromDir(dirPath: string, routes: Set<string>): void {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED.has(entry.name)) {
        continue;
      }
      if (entry.name.startsWith('.') || entry.name.endsWith('.metadata.json')) {
        continue;
      }
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        extractRoutesFromDir(fullPath, routes);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.ts', '.js', '.tsx', '.jsx'].includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const regex = /\b(?:router|app|route)\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/gi;
            let match;
            while ((match = regex.exec(content)) !== null) {
              const method = match[1].toUpperCase();
              const routePath = match[2];
              routes.add(`${method} ${routePath}`);
            }
          } catch (e) {
            // Skip unreadable files
          }
        }
      }
    }
  } catch (e) {
    // Skip unreadable directories
  }
}

function getRoutesForModule(moduleFullPath: string): string[] {
  const routesSet = new Set<string>();
  extractRoutesFromDir(moduleFullPath, routesSet);
  return Array.from(routesSet).sort();
}

function findModules(projectPath: string, dirPath: string, modulesMap: Map<string, DiscoveredModule>): void {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }
      if (IGNORED.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      
      const parentName = path.basename(dirPath);
      if (TARGET_FOLDERS.has(entry.name.toLowerCase()) && parentName.toLowerCase() === 'src') {
        try {
          const subEntries = fs.readdirSync(fullPath, { withFileTypes: true });
          for (const subEntry of subEntries) {
            if (subEntry.isDirectory() && !IGNORED.has(subEntry.name)) {
              const modulePath = path.join(fullPath, subEntry.name);
              const relativePath = path.relative(projectPath, modulePath).replace(/\\/g, '/');
              const lowerName = subEntry.name.toLowerCase();
              if (!modulesMap.has(lowerName)) {
                const routes = getRoutesForModule(modulePath);
                modulesMap.set(lowerName, {
                  name: subEntry.name,
                  path: relativePath,
                  routes: routes
                });
              }
            }
          }
        } catch (e) {
          // Skip unreadable subfolders
        }
      }

      // Recursively search this directory
      findModules(projectPath, fullPath, modulesMap);
    }
  } catch (error) {
    // Skip unreadable directories
  }
}

function findPrismaSchemas(dirPath: string, schemaFiles: string[] = []): string[] {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED.has(entry.name)) {
        continue;
      }
      if (entry.name.startsWith('.') || entry.name.endsWith('.metadata.json')) {
        continue;
      }
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        findPrismaSchemas(fullPath, schemaFiles);
      } else if (entry.isFile() && entry.name.toLowerCase() === 'schema.prisma') {
        schemaFiles.push(fullPath);
      }
    }
  } catch (error) {
    // Skip read errors
  }
  return schemaFiles;
}

function extractModelsFromSchemas(schemaFiles: string[]): string[] {
  const models = new Set<string>();
  const regex = /\bmodel\s+([A-Za-z0-9_]+)\s*\{/g;
  for (const file of schemaFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      let match;
      while ((match = regex.exec(content)) !== null) {
        models.add(match[1]);
      }
    } catch (e) {
      // Skip unreadable files
    }
  }
  return Array.from(models).sort();
}

export function discoverAction(projectName: string): void {
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

    const modulesMap = new Map<string, DiscoveredModule>();
    findModules(projectPath, projectPath, modulesMap);

    const sortedKeys = Array.from(modulesMap.keys()).sort();
    const modulesList = sortedKeys.map(k => modulesMap.get(k)!);

    // Extract database models
    const schemaFiles = findPrismaSchemas(projectPath);
    const models = extractModelsFromSchemas(schemaFiles);

    const result = {
      modules: modulesList,
      models: models
    };

    // Save output to data/discovery/<project-name>.json
    const projectRoot = path.join(__dirname, '../../');
    const discoveryDir = path.join(projectRoot, 'data/discovery');
    const outputPath = path.join(discoveryDir, `${project.name.toLowerCase()}.json`);

    fs.mkdirSync(discoveryDir, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');

    console.log(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('Error discovering modules:', error.message);
    process.exit(1);
  }
}
