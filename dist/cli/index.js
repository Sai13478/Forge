#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const register_1 = require("../commands/register");
const list_1 = require("../commands/list");
const scan_1 = require("../commands/scan");
const analyze_1 = require("../commands/analyze");
const discover_1 = require("../commands/discover");
const ask_1 = require("../commands/ask");
const inspect_1 = require("../commands/inspect");
const summary_1 = require("../commands/summary");
const program = new commander_1.Command();
program
    .name('forge')
    .description('Forge CLI')
    .version('1.0.0');
program
    .command('register')
    .description('Register a new project')
    .argument('<name>', 'project name')
    .argument('<path>', 'project path')
    .action((name, path) => {
    (0, register_1.registerAction)(name, path);
});
program
    .command('list')
    .description('List all registered projects')
    .action(() => {
    (0, list_1.listAction)();
});
program
    .command('scan')
    .description('Scan a project directory recursively')
    .argument('<name>', 'project name')
    .action((name) => {
    (0, scan_1.scanAction)(name);
});
program
    .command('analyze')
    .description('Analyze project dependencies')
    .argument('<name>', 'project name')
    .action((name) => {
    (0, analyze_1.analyzeAction)(name);
});
program
    .command('discover')
    .description('Discover modules in the project')
    .argument('<name>', 'project name')
    .action((name) => {
    (0, discover_1.discoverAction)(name);
});
program
    .command('ask')
    .description('Ask a question about the project structure')
    .argument('<name>', 'project name')
    .argument('<question>', 'question text')
    .action((name, question) => {
    (0, ask_1.askAction)(name, question);
});
program
    .command('inspect')
    .description('Inspect a specific module in detail')
    .argument('<name>', 'project name')
    .argument('<module>', 'module name')
    .action((name, moduleArg) => {
    (0, inspect_1.inspectAction)(name, moduleArg);
});
program
    .command('summary')
    .description('Show a summary of the project structure and stack')
    .argument('<name>', 'project name')
    .action((name) => {
    (0, summary_1.summaryAction)(name);
});
program.parse(process.argv);
