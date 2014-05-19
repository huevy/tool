#!/usr/bin/env node

var commands = require('./commands');
var argv = require('optimist').argv;

var cmdName = argv._[0];

if (!commands.hasOwnProperty(cmdName)) {
  console.error('no such command');
  process.exit(1);
}

commands[cmdName](argv);