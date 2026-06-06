"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.askAction = askAction;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const storage_1 = require("../storage");
const discover_1 = require("./discover");
const analyze_1 = require("./analyze");
function capitalize(str) {
    if (!str)
        return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function askAction(projectName, question) {
    try {
        const project = (0, storage_1.getProjectByName)(projectName);
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
            console.log = () => { };
            try {
                (0, discover_1.discoverAction)(projectName);
            }
            finally {
                console.log = originalLog;
            }
        }
        if (!fs.existsSync(discoveryFile)) {
            console.error('Error: Could not retrieve module discovery data.');
            process.exit(1);
        }
        const dataRaw = fs.readFileSync(discoveryFile, 'utf8');
        const data = JSON.parse(dataRaw);
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
                console.log = () => { };
                try {
                    (0, analyze_1.analyzeAction)(projectName);
                }
                finally {
                    console.log = originalLog;
                }
            }
            if (fs.existsSync(analysisFile)) {
                const analysisRaw = fs.readFileSync(analysisFile, 'utf8');
                const analysis = JSON.parse(analysisRaw);
                console.log('Project Stack\n');
                if (analysis.frontend)
                    console.log(`Frontend: ${analysis.frontend}`);
                if (analysis.backend)
                    console.log(`Backend: ${analysis.backend}`);
                if (analysis.language)
                    console.log(`Language: ${analysis.language}`);
                if (analysis.orm)
                    console.log(`ORM: ${analysis.orm}`);
                if (analysis.bundler)
                    console.log(`Bundler: ${analysis.bundler}`);
                return;
            }
        }
        // Check if it is a database table/model query
        const isTableQuery = /\b(tables?|models?|databases?|db|stores?|saves?)\b/i.test(cleanQuestion);
        if (isTableQuery) {
            const dbData = data;
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
            }
            else {
                for (const route of routes) {
                    console.log(`- ${route}`);
                }
            }
            return;
        }
        console.log(`${capitalize(matchedModule.name)} Module\n`);
        console.log('Path:');
        console.log(matchedModule.path);
    }
    catch (error) {
        console.error('Error answering question:', error.message);
        process.exit(1);
    }
}
