#!/usr/bin/env node

var path = require('path');
var express = require('express');
var contentDisposition = require('content-disposition');
var pkg = require( path.join(__dirname, 'package.json') );
var os = require('os');

// Parse command line options
var cli = require('commander');

cli.usage('[options] ws://localhost')
    .version(pkg.version)
    .option('-A, --amount <connections>', 'the amount of persistent connections to generate', parseInt, 10000)
    .option('-C, --concurrent <connections>', 'how many concurrent-connections per second', parseInt, 0)
    .option('-P, --protocol <protocol>', 'WebSocket protocol version', parseInt, 13)
    .option('-W, --workers <cpus>', 'workers to be spawned', parseInt, os.cpus().length)
    .option('-M, --message <message>', 'custom message to use')
    .parse(process.argv);

//
// Check if all required arguments are supplied, 
// if we don't have a valid url we should exit
//
if (!cli.args.length) return [
  'Error: You forgot to supply the url.'
].forEach((line) => {
  console.error(line);
});

var cluster = require('cluster')
    , workers = cli.workers || 1
    , ids = Object.create(null)
    , concurrents = Object.create(null)
    , connections = 0
    , received = 0
    , robin = [];

// Setup websocket server to run on localhost
// Ceate a new express app
var app = express();

// Websocket client
// Spawn websocket for each connection