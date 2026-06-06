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
exports.summaryAction = summaryAction;
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
function summaryAction(projectName) {
    try {
        const project = (0, storage_1.getProjectByName)(projectName);
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
            console.log = () => { };
            try {
                (0, discover_1.discoverAction)(projectName);
            }
            finally {
                console.log = originalLog;
            }
        }
        // Ensure analysis data exists
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
        if (!fs.existsSync(discoveryFile) || !fs.existsSync(analysisFile)) {
            console.error('Error: Could not retrieve project data for summary.');
            process.exit(1);
        }
        const discovery = JSON.parse(fs.readFileSync(discoveryFile, 'utf8'));
        const analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
        // Output formatted summary
        console.log(`Project: ${project.name.toUpperCase()}\n`);
        console.log('Stack:');
        if (analysis.frontend)
            console.log(`- ${analysis.frontend}`);
        if (analysis.backend)
            console.log(`- ${analysis.backend}`);
        if (analysis.language)
            console.log(`- ${analysis.language}`);
        if (analysis.orm)
            console.log(`- ${analysis.orm}`);
        if (analysis.bundler)
            console.log(`- ${analysis.bundler}`);
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
    }
    catch (error) {
        console.error('Error generating summary:', error.message);
        process.exit(1);
    }
}
