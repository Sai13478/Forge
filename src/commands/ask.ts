import * as fs from 'fs';
import * as path from 'path';
import { getProjectByName } from '../storage';
import { discoverAction, DiscoveredModule } from './discover';
import { analyzeAction } from './analyze';

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function askAction(projectName: string, question: string): void {
  try {
    const project = getProjectByName(projectName);
    if (!project) {
      console.error(`Error: Project "${projectName}" is not registered.`);
      process.exit(1);
    }

    const projectRoot = path.join(__dirname, '../../');
    const discoveryFile = path.join(projectRoot, 'data/discovery', `${project.name.toLowerCase()}.json`);

    // If discovery data doesn't exist, generate it silently
    if (!fs.existsSync(discoveryFile)) {
      // Temporarily redirect console.log to avoid printing discovery JSON when running ask
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

    const cleanQuestion = question.toLowerCase();

    // Check if it is a modules list query
    const isModulesListQuery = /\bmodules\b/i.test(cleanQuestion) && !data.modules.some(m => new RegExp(`\\b${m.name.toLowerCase()}\\b`, 'i').test(cleanQuestion));
    if (isModulesListQuery) {
      console.log('Modules:');
      for (const m of data.modules) {
        console.log(`- ${m.name}`);
      }
      return;
    }

    // Check if it is a stack/technology query
    const isStackQuery = /\b(stack|tech(nologies)?|frameworks?|libraries)\b/i.test(cleanQuestion);
    if (isStackQuery) {
      const analysisFile = path.join(projectRoot, 'data/analysis', `${project.name.toLowerCase()}.json`);
      if (!fs.existsSync(analysisFile)) {
        const originalLog = console.log;
        console.log = () => {};
        try {
          analyzeAction(projectName);
        } finally {
          console.log = originalLog;
        }
      }

      if (fs.existsSync(analysisFile)) {
        const analysisRaw = fs.readFileSync(analysisFile, 'utf8');
        const analysis = JSON.parse(analysisRaw);
        console.log('Project Stack\n');
        if (analysis.frontend) console.log(`Frontend: ${analysis.frontend}`);
        if (analysis.backend) console.log(`Backend: ${analysis.backend}`);
        if (analysis.language) console.log(`Language: ${analysis.language}`);
        if (analysis.orm) console.log(`ORM: ${analysis.orm}`);
        if (analysis.bundler) console.log(`Bundler: ${analysis.bundler}`);
        return;
      }
    }

    // Check if it is a database table/model query
    const isTableQuery = /\b(tables?|models?|databases?|db|stores?|saves?)\b/i.test(cleanQuestion);
    if (isTableQuery) {
      const dbData = data as any;
      const models = dbData.models || [];
      const normQuestion = cleanQuestion.replace(/[^a-z0-9]/g, '');
      const sortedModels = [...models].sort((a, b) => b.length - a.length);
      const matchedModel = sortedModels.find(m => {
        const normModel = m.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normQuestion.includes(normModel);
      });

      if (matchedModel) {
        console.log(`${matchedModel} Table`);
        return;
      }
    }
    
    // Look for a module match based on word boundaries in the question
    const matchedModule = data.modules.find(m => {
      const regex = new RegExp(`\\b${m.name.toLowerCase()}\\b`, 'i');
      return regex.test(cleanQuestion);
    });

    if (!matchedModule) {
      console.log(`Could not find a module matching your question: "${question}"`);
      return;
    }

    const isApiQuery = /\b(apis?|routes?|endpoints?)\b/i.test(cleanQuestion);

    if (isApiQuery) {
      console.log(`${capitalize(matchedModule.name)} APIs\n`);
      const routes = matchedModule.routes || [];
      if (routes.length === 0) {
        console.log('(No APIs found)');
      } else {
        for (const route of routes) {
          console.log(`- ${route}`);
        }
      }
      return;
    }

    console.log(`${capitalize(matchedModule.name)} Module\n`);
    console.log('Path:');
    console.log(matchedModule.path);
  } catch (error: any) {
    console.error('Error answering question:', error.message);
    process.exit(1);
  }
}
