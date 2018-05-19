const util = require('util');
const CanvasMod = require('./lib/Canvas');
const fs = require('fs');
const args = require('args');

//Test new structure


// Sandbox
// https://regex101.com/ tester
// Clean up replace ' with " -  %s/\'/\"/g
// add quotes : :%s/^\(\s\)*\(\w\+\)/\1\"\2\"/


let contentJSON;

// set up help and command line instructions process sync because the file is small
args
  .option('file', 'The json formated file to process.')
const flags = args.parse(process.argv);

if (util.isUndefined(flags.file)) {
  console.log('--file parameter is required.');
  process.exit(1);
} else {
  // Read and process file.
  try {
    let rawdata = fs.readFileSync(flags.file);
    contentJSON = JSON.parse(rawdata);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

let Canvas = new CanvasMod();
// defaults to test mode
//Canvas.readonly=false;

// Process entire Json string
Canvas.updateCourseConfig(contentJSON);