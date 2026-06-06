import * as fs from 'fs';
import * as path from 'path';
import { getProjectByName } from '../storage';
import { discoverAction, DiscoveredModule } from './discover';

const IGNORED = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next']);

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getReadmePurpose(readmePath: string): string | undefined {
  try {
    if (fs.existsSync(readmePath)) {
      const content = fs.readFileSync(readmePath, 'utf8');
      const lines = content.split(/\r?\n/);
      for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#') || line.startsWith('>') || line.startsWith('```') || line.startsWith('-') || line.startsWith('*')) {
          continue;
        }
        return line;
      }
    }
  } catch (e) {
    // Skip read errors
  }
  return undefined;
}

function getModuleFiles(dirPath: string, relativeDir: string = '', files: string[] = []): string[] {
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
      const relPath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        getModuleFiles(fullPath, relPath, files);
      } else if (entry.isFile()) {
        files.push(relPath);
      }
    }
  } catch (error) {
    // Skip read errors
  }
  return files;
}

function determinePurpose(moduleName: string, moduleFullPath: string): string {
  // 1. Try reading README.md in the module folder
  const readmePath = path.join(moduleFullPath, 'README.md');
  const readmePurpose = getReadmePurpose(readmePath);
  if (readmePurpose) {
    return readmePurpose;
  }

  // 2. Fall back to dictionary of common modules
  const lowerName = moduleName.toLowerCase();
  if (lowerName === 'auth' || lowerName === 'authentication' || lowerName === 'authorization') {
    return 'Authentication and authorization';
  }
  if (lowerName === 'employee' || lowerName === 'employees' || lowerName === 'staff') {
    return 'Employee profiles and management';
  }
  if (lowerName === 'leave' || lowerName === 'leaves' || lowerName === 'attendance') {
    return 'Leave requests and approval workflow';
  }
  if (lowerName === 'payroll' || lowerName === 'payrolls' || lowerName === 'salary') {
    return 'Payroll processing and salary slips';
  }

  // 3. Final fallback
  return `${capitalize(moduleName)} management`;
}

export function inspectAction(projectName: string, moduleName: string): void {
  try {
    const project = getProjectByName(projectName);
    if (!project) {
      console.error(`Error: Project "${projectName}" is not registered.`);
      process.exit(1);
    }

    const projectRoot = path.join(__dirname, '../../');
    const discoveryFile = path.join(projectRoot, 'data/discovery', `${project.name.toLowerCase()}.json`);

    // Generate discovery data silently if not present
    if (!fs.existsSync(discoveryFile)) {
      const originalLog = console.log;
      console.log = () => {};
      try {
        discoverAction(projectName);
      } finally {
        console.log = originalLog;
      }
    }

    if (!fs.existsSync(discoveryFile)) {
      console.error('Error: Could not retrieve module discovery data.');
      process.exit(1);
    }

    const dataRaw = fs.readFileSync(discoveryFile, 'utf8');
    const data = JSON.parse(dataRaw) as { modules: DiscoveredModule[] };

    const matchedModule = data.modules.find(m => m.name.toLowerCase() === moduleName.toLowerCase());
    if (!matchedModule) {
      console.error(`Error: Module "${moduleName}" not found in project "${projectName}".`);
      process.exit(1);
    }

    const moduleFullPath = path.join(project.path, matchedModule.path);
    if (!fs.existsSync(moduleFullPath)) {
      console.error(`Error: Module path does not exist: ${moduleFullPath}`);
      process.exit(1);
    }

    const files = getModuleFiles(moduleFullPath).sort();
    const purpose = determinePurpose(matchedModule.name, moduleFullPath);

    console.log(`Module: ${matchedModule.name}\n`);
    console.log('Path:');
    console.log(matchedModule.path);
    console.log('\nFiles:');
    if (files.length === 0) {
      console.log('(No files found)');
    } else {
      for (const file of files) {
        console.log(`- ${file}`);
      }
    }
    console.log('\nPurpose:');
    console.log(purpose);
  } catch (error: any) {
    console.error('Error inspecting module:', error.message);
    process.exit(1);
  }
}
