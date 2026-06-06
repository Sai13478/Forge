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
exports.analyzeAction = analyzeAction;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const storage_1 = require("../storage");
function getDependencies(packageJsonPath) {
    const depsSet = new Set();
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
    }
    catch (error) {
        // Ignore reading/parsing errors for a single package.json
    }
    return depsSet;
}
function analyzeAction(projectName) {
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
        // Paths to frontend/package.json and backend/package.json
        const frontendPkgPath = path.join(projectPath, 'frontend', 'package.json');
        const backendPkgPath = path.join(projectPath, 'backend', 'package.json');
        const frontendDeps = getDependencies(frontendPkgPath);
        const backendDeps = getDependencies(backendPkgPath);
        // Merge dependencies
        const allDeps = new Set([...frontendDeps, ...backendDeps]);
        // Detect technologies
        let frontend;
        if (allDeps.has('next')) {
            frontend = 'Next.js';
        }
        else if (allDeps.has('react')) {
            frontend = 'React';
        }
        let backend;
        if (allDeps.has('nestjs')) {
            backend = 'NestJS';
        }
        else if (allDeps.has('express')) {
            backend = 'Express';
        }
        let language;
        if (allDeps.has('typescript')) {
            language = 'TypeScript';
        }
        let orm;
        if (allDeps.has('prisma')) {
            orm = 'Prisma';
        }
        else if (allDeps.has('mongoose')) {
            orm = 'MongoDB';
        }
        let bundler;
        if (allDeps.has('vite')) {
            bundler = 'Vite';
        }
        const result = {
            project: project.name,
        };
        if (frontend !== undefined)
            result.frontend = frontend;
        if (backend !== undefined)
            result.backend = backend;
        if (language !== undefined)
            result.language = language;
        if (orm !== undefined)
            result.orm = orm;
        if (bundler !== undefined)
            result.bundler = bundler;
        // Save output
        const projectRoot = path.join(__dirname, '../../');
        const analysisDir = path.join(projectRoot, 'data/analysis');
        const outputPath = path.join(analysisDir, `${project.name.toLowerCase()}.json`);
        fs.mkdirSync(analysisDir, { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
        console.log(JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.error('Error analyzing project:', error.message);
        process.exit(1);
    }
}
