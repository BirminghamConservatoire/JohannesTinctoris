const DOMParser = require('xmldom').DOMParser;
const mr = require('./mensural-rhythm.js');
const fs = require('fs');

function processFiles(infile, outfile, noHeaders) {
	if(infile){
		var data = fs.readFile(infile, 'utf8', (err, data) => {
			if(err) throw err;
			var doc = new DOMParser().parseFromString(data);
			if(outfile){
				fs.writeFileSync(outfile, mr.makeFeatureSequencesForML({doc:doc}, noHeaders));
			} else {
				console.log(mr.makeFeatureSequencesForML({doc:doc}, noHeaders));
			}
		});
	}
}
if(process.argv[3] && process.argv[3]!=='append'){
	processFiles(process.argv[2] ? process.argv[2] : 'editor.mei', process.argv[3], process.argv[4] ? process.argv[4]==='append' : false);
} else {
	processFiles(process.argv[2] ? process.argv[2] : 'editor.mei', null, process.argv[3]);
}
