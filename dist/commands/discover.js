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
exports.discoverAction = discoverAction;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const storage_1 = require("../storage");
const IGNORED = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next']);
const TARGET_FOLDERS = new Set(['modules', 'features', 'routes', 'controllers']);
function extractRoutesFromDir(dirPath, routes) {
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
            }
            else if (entry.isFile()) {
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
                    }
                    catch (e) {
                        // Skip unreadable files
                    }
                }
            }
        }
    }
    catch (e) {
        // Skip unreadable directories
    }
}
function getRoutesForModule(moduleFullPath) {
    const routesSet = new Set();
    extractRoutesFromDir(moduleFullPath, routesSet);
    return Array.from(routesSet).sort();
}
function findModules(projectPath, dirPath, modulesMap) {
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
                }
                catch (e) {
                    // Skip unreadable subfolders
                }
            }
            // Recursively search this directory
            findModules(projectPath, fullPath, modulesMap);
        }
    }
    catch (error) {
        // Skip unreadable directories
    }
}
function findPrismaSchemas(dirPath, schemaFiles = []) {
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
            }
            else if (entry.isFile() && entry.name.toLowerCase() === 'schema.prisma') {
                schemaFiles.push(fullPath);
            }
        }
    }
    catch (error) {
        // Skip read errors
    }
    return schemaFiles;
}
function extractModelsFromSchemas(schemaFiles) {
    const models = new Set();
    const regex = /\bmodel\s+([A-Za-z0-9_]+)\s*\{/g;
    for (const file of schemaFiles) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            let match;
            while ((match = regex.exec(content)) !== null) {
                models.add(match[1]);
            }
        }
        catch (e) {
            // Skip unreadable files
        }
    }
    return Array.from(models).sort();
}
function discoverAction(projectName) {
    try {
        const project = (0, storage_1.getProjectByName)(projectName);
        if (!project) {
            console.error(`Error: Project "${projectName}" is not registered.`);
            process.exit(1);
        }
        const projectPath = project.path;
        if (!fs.existsSync(projectPath)) {
            console.error(`Error: Project path does not exist: ${projectPath}`);
            process.exit(1);
        }
        const modulesMap = new Map();
        findModules(projectPath, projectPath, modulesMap);
        const sortedKeys = Array.from(modulesMap.keys()).sort();
        const modulesList = sortedKeys.map(k => modulesMap.get(k));
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
    }
    catch (error) {
        console.error('Error discovering modules:', error.message);
        process.exit(1);
    }
}
