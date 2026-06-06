"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAction = listAction;
const storage_1 = require("../storage");
function listAction() {
    try {
        const projects = (0, storage_1.getProjects)();
        console.log('Registered Projects\n');
        projects.forEach((proj, idx) => {
            console.log(`${idx + 1}. ${proj.name}`);
        });
    }
    catch (error) {
        console.error('Error listing projects:', error.message);
        process.exit(1);
    }
}
