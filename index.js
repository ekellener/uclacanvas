const util = require('util');
const fs = require('fs');
const args = require('args');
const CanvasMod = require('./lib/Canvas.js');

//Test new structure


// Sandbox
// https://regex101.com/ tester
// Clean up replace ' with " -  %s/\'/\"/g
// add quotes : :%s/^\(\s\)*\(\w\+\)/\1\"\2\"/


let contentJSON;

// set up help and command line instructions process sync because the file is small
args
  .option('file', 'The json formated file to process.')
  .option('prod', 'Flag to perform updates, default is read only')
// Seems to break debugger in Visual Studio Code
const flags = args.parse(process.argv);

if (util.isUndefined(flags.file)) {
  console.log('--file parameter is required.');
  args.showHelp();
  process.exit(1);
} else {
  // Read and process file.
 
  try {
  
    let rawdata = fs.readFileSync(flags.file);
    contentJSON = JSON.parse(rawdata);
  } catch (e) {
    console.log(e);
    args.showHelp();
    process.exit(1);
  }

let Canvas = new CanvasMod();
 // Enable R/W if prod flag is enabled
 if(!util.isUndefined(flags.prod)) 
 Canvas.readonly=false;

// Process entire Json string
Canvas.updateCourseConfig(contentJSON);
}
