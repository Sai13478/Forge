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
exports.scanAction = scanAction;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const storage_1 = require("../storage");
const IGNORED = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next']);
function countFiles(dirPath) {
    let count = 0;
    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            if (IGNORED.has(entry.name)) {
                continue;
            }
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                count += countFiles(fullPath);
            }
            else if (entry.isFile()) {
                count++;
            }
        }
    }
    catch (error) {
        // Skip unreadable directories
    }
    return count;
}
function checkDirTechs(dirPath, techs) {
    try {
        // 1. Check tsconfig.json
        if (fs.existsSync(path.join(dirPath, 'tsconfig.json'))) {
            techs.add('TypeScript');
        }
        // 2. Check prisma folder or schema.prisma
        if (fs.existsSync(path.join(dirPath, 'prisma')) || fs.existsSync(path.join(dirPath, 'prisma/schema.prisma'))) {
            techs.add('Prisma');
        }
        // 3. Inspect package.json
        const packageJsonPath = path.join(dirPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                const deps = {
                    ...packageJson.dependencies,
                    ...packageJson.devDependencies
                };
                if (deps['react'])
                    techs.add('React');
                if (deps['next']) {
                    techs.add('Next.js');
                    techs.add('React');
                }
                if (deps['prisma'] || deps['@prisma/client'])
                    techs.add('Prisma');
                if (deps['typescript'])
                    techs.add('TypeScript');
                if (deps['tailwindcss'])
                    techs.add('TailwindCSS');
            }
            catch (e) {
                // Ignore parse errors
            }
        }
    }
    catch (error) {
        // Ignore read errors
    }
}
function scanAction(projectName) {
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
        // Get top level folders (excluding ignored ones)
        const topLevelContents = fs.readdirSync(projectPath, { withFileTypes: true });
        const folders = topLevelContents
            .filter(dirent => dirent.isDirectory() && !IGNORED.has(dirent.name))
            .map(dirent => dirent.name)
            .sort();
        // Count files recursively (excluding ignored ones)
        const fileCount = countFiles(projectPath);
        // Detect technologies
        const techs = new Set();
        checkDirTechs(projectPath, techs);
        for (const folder of folders) {
            checkDirTechs(path.join(projectPath, folder), techs);
        }
        const result = {
            project: project.name,
            folders,
            fileCount,
            technologies: Array.from(techs).sort()
        };
        console.log(JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.error('Error scanning project:', error.message);
        process.exit(1);
    }
}
