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
exports.getProjects = getProjects;
exports.saveProjects = saveProjects;
exports.registerProject = registerProject;
exports.getProjectByName = getProjectByName;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const STORAGE_FILE = path.join(__dirname, '../../projects.json');
function getProjects() {
    try {
        if (!fs.existsSync(STORAGE_FILE)) {
            return [];
        }
        const data = fs.readFileSync(STORAGE_FILE, 'utf8');
        if (!data.trim()) {
            return [];
        }
        return JSON.parse(data);
    }
    catch (error) {
        return [];
    }
}
function saveProjects(projects) {
    try {
        const data = JSON.stringify(projects, null, 2);
        fs.writeFileSync(STORAGE_FILE, data, 'utf8');
    }
    catch (error) {
        console.error('Error writing to projects.json:', error);
    }
}
function registerProject(name, projectPath) {
    const normalizedPath = projectPath.replace(/\\/g, '/');
    const projects = getProjects();
    const existingIndex = projects.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
    if (existingIndex !== -1) {
        projects[existingIndex].path = normalizedPath;
        // Keep the case as inputted or update it? Let's update the name in case the case changed.
        projects[existingIndex].name = name;
    }
    else {
        projects.push({ name, path: normalizedPath });
    }
    saveProjects(projects);
}
function getProjectByName(name) {
    const projects = getProjects();
    return projects.find(p => p.name.toLowerCase() === name.toLowerCase());
}
