import * as fs from 'fs';
import * as path from 'path';
import { getProjectByName } from '../storage';
import { discoverAction, DiscoveredModule } from './discover';
import { analyzeAction } from './analyze';

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function summaryAction(projectName: string): void {
  try {
    const project = getProjectByName(projectName);
    if (!project) {
      console.error(`Error: Project "${projectName}" is not registered.`);
      process.exit(1);
    }

    const projectRoot = path.join(__dirname, '../../');
    const discoveryFile = path.join(projectRoot, 'data/discovery', `${project.name.toLowerCase()}.json`);
    const analysisFile = path.join(projectRoot, 'data/analysis', `${project.name.toLowerCase()}.json`);

    // Ensure discovery data exists
    if (!fs.existsSync(discoveryFile)) {
      const originalLog = console.log;
      console.log = () => {};
      try {
        discoverAction(projectName);
      } finally {
        console.log = originalLog;
      }
    }

    // Ensure analysis data exists
    if (!fs.existsSync(analysisFile)) {
      const originalLog = console.log;
      console.log = () => {};
      try {
        analyzeAction(projectName);
      } finally {
        console.log = originalLog;
      }
    }

    if (!fs.existsSync(discoveryFile) || !fs.existsSync(analysisFile)) {
      console.error('Error: Could not retrieve project data for summary.');
      process.exit(1);
    }

    const discovery = JSON.parse(fs.readFileSync(discoveryFile, 'utf8')) as { modules: DiscoveredModule[], models?: string[] };
    const analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));

    // Output formatted summary
    console.log(`Project: ${project.name.toUpperCase()}\n`);

    console.log('Stack:');
    if (analysis.frontend) console.log(`- ${analysis.frontend}`);
    if (analysis.backend) console.log(`- ${analysis.backend}`);
    if (analysis.language) console.log(`- ${analysis.language}`);
    if (analysis.orm) console.log(`- ${analysis.orm}`);
    if (analysis.bundler) console.log(`- ${analysis.bundler}`);
    console.log('');

    console.log('Modules:');
    for (const m of discovery.modules) {
      console.log(`- ${capitalize(m.name)}`);
    }

    for (const m of discovery.modules) {
      if (m.routes && m.routes.length > 0) {
        console.log(`\n${capitalize(m.name)} APIs:`);
        for (const route of m.routes) {
          console.log(`- ${route}`);
        }
      }
    }

    console.log('\nDatabase Models:');
    const models = discovery.models || [];
    for (const model of models) {
      console.log(`- ${model}`);
    }
  } catch (error: any) {
    console.error('Error generating summary:', error.message);
    process.exit(1);
  }
}
