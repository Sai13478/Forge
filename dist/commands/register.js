"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAction = registerAction;
const storage_1 = require("../storage");
function registerAction(name, path) {
    try {
        if (!name || !path) {
            console.error('Error: Project name and path are required.');
            process.exit(1);
        }
        (0, storage_1.registerProject)(name, path);
    }
    catch (error) {
        console.error('Error registering project:', error.message);
        process.exit(1);
    }
}
