#!/usr/bin/env node
import { Command } from 'commander';
import { registerAction } from '../commands/register';
import { listAction } from '../commands/list';
import { scanAction } from '../commands/scan';
import { analyzeAction } from '../commands/analyze';
import { discoverAction } from '../commands/discover';
import { askAction } from '../commands/ask';
import { inspectAction } from '../commands/inspect';
import { summaryAction } from '../commands/summary';

const program = new Command();

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
    registerAction(name, path);
  });

program
  .command('list')
  .description('List all registered projects')
  .action(() => {
    listAction();
  });

program
  .command('scan')
  .description('Scan a project directory recursively')
  .argument('<name>', 'project name')
  .action((name) => {
    scanAction(name);
  });

program
  .command('analyze')
  .description('Analyze project dependencies')
  .argument('<name>', 'project name')
  .action((name) => {
    analyzeAction(name);
  });

program
  .command('discover')
  .description('Discover modules in the project')
  .argument('<name>', 'project name')
  .action((name) => {
    discoverAction(name);
  });

program
  .command('ask')
  .description('Ask a question about the project structure')
  .argument('<name>', 'project name')
  .argument('<question>', 'question text')
  .action((name, question) => {
    askAction(name, question);
  });

program
  .command('inspect')
  .description('Inspect a specific module in detail')
  .argument('<name>', 'project name')
  .argument('<module>', 'module name')
  .action((name, moduleArg) => {
    inspectAction(name, moduleArg);
  });

program
  .command('summary')
  .description('Show a summary of the project structure and stack')
  .argument('<name>', 'project name')
  .action((name) => {
    summaryAction(name);
  });

program.parse(process.argv);






