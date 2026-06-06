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
exports.inspectAction = inspectAction;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const storage_1 = require("../storage");
const discover_1 = require("./discover");
const IGNORED = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next']);
function capitalize(str) {
    if (!str)
        return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function getReadmePurpose(readmePath) {
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
    }
    catch (e) {
        // Skip read errors
    }
    return undefined;
}
function getModuleFiles(dirPath, relativeDir = '', files = []) {
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
            }
            else if (entry.isFile()) {
                files.push(relPath);
            }
        }
    }
    catch (error) {
        // Skip read errors
    }
    return files;
}
function determinePurpose(moduleName, moduleFullPath) {
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
function inspectAction(projectName, moduleName) {
    try {
        const project = (0, storage_1.getProjectByName)(projectName);
        if (!project) {
            console.error(`Error: Project "${projectName}" is not registered.`);
            process.exit(1);
        }
        const projectRoot = path.join(__dirname, '../../');
        const discoveryFile = path.join(projectRoot, 'data/discovery', `${project.name.toLowerCase()}.json`);
        // Generate discovery data silently if not present
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
        if (!fs.existsSync(discoveryFile)) {
            console.error('Error: Could not retrieve module discovery data.');
            process.exit(1);
        }
        const dataRaw = fs.readFileSync(discoveryFile, 'utf8');
        const data = JSON.parse(dataRaw);
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
        }
        else {
            for (const file of files) {
                console.log(`- ${file}`);
            }
        }
        console.log('\nPurpose:');
        console.log(purpose);
    }
    catch (error) {
        console.error('Error inspecting module:', error.message);
        process.exit(1);
    }
}
