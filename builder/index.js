class Tag {
	constructor(name) {
		this.name = name;
		this.description = '';
		this.size = '';
		this.requires = [];
		this.requiresText = '';
	}
}

class Line {
	constructor() {
		this.text = '';
		this.comment = '';
		this.tags = [];
	}
}

const readline = require('readline');
const request = require('request');
const uglifyjs = require('uglify-es');
const fs = require('fs');
const columnify = require('columnify');

const API = 'https://lakuna.pw/api/umbra/umbra.json';

// Get Umbra distribution.
request(API, (err, res, body) => {
	const api = JSON.parse(body);
	const release = api.releases.find((release) => release.version == api.latest);

	request(release.url, (err, res, body) => {
		const allTags = [];
		const currentTags = [];
		let inMultilineComment = false;
		const lines = [];
		body.split(/[\r\n]+/).forEach((line) => {
			// Build Line object.
			const parsedLine = new Line();
			let inComment = false;
			line.split(/ +/).forEach((segment) => {
				segment = segment.trim();
				if (segment.startsWith('//')) { inComment = true; segment = segment.substring(2); }
				if (segment.startsWith('/*')) { inMultilineComment = true; segment = segment.substring(2); }
				if (segment.startsWith('*/')) { inMultilineComment = false; segment = segment.substring(2); }
				if (!(segment.length > 0)) { return; } // Skip empty lines.
				if (inComment || inMultilineComment) { parsedLine.comment += segment + ' '; } else { parsedLine.text += segment + ' '; }
			});
			parsedLine.text = parsedLine.text.trim();
			parsedLine.comment = parsedLine.comment.trim();

			// Build tags from line.
			const comment = parsedLine.comment.split(/ +/);
			if (comment[0] == 'UTAGDEF') {
				let tag = allTags.find((tag) => tag.name == comment[2]);
				if (!tag) {
					tag = new Tag(comment[2]);
					allTags.push(tag);
				}

				const commentBody = comment.slice(3).join(' ');

				// Assign tag meta.
				if (comment[1] == 'DESC') {
					tag.description = commentBody;
				} else if (comment[1] == 'SIZE') {
					tag.size = commentBody;
				} else if (comment[1] == 'REQU') {
					tag.requires.push(allTags.find((tag) => tag.name == commentBody));
				} else {
					console.log(`Unknown tag meta '${comment[1]}'.`);
				}
			}

			// Assign tags to lines.
			else if (comment[0] == 'UTAGSET') {
				const tag = allTags.find((tag) => tag.name == comment[2]);
				if (!tag) { console.log(`Undefined tag '${comment[2]}'.`); }
				if (comment[1] == 'START') {
					currentTags.push(tag);
				} else if (comment[1] == 'END') {
					currentTags.splice(currentTags.indexOf(tag), 1);
				} else if (comment[1] == 'LINE') {
					parsedLine.tags.push(tag);
				} else {
					console.log(`Unknown tag set '${comment[1]}'.`);
				}
			}
			currentTags.forEach((tag) => parsedLine.tags.push(tag));

			// Add line to all lines.
			lines.push(parsedLine);
		});

		// Make requiresText line for pretty-printing tag requirements.
		for (let i = 0; i < allTags.length; i++) {
			const tag = allTags[i];
			let requiresText = '[';
			tag.requires.forEach((tag) => requiresText += tag.name + ', ');
			requiresText = requiresText.substring(0, requiresText.length - 2) + ']';
			if (requiresText == ']') { requiresText = ''; }
			tag.requiresText = requiresText;
		}
		console.log(columnify(allTags, { columns: ['name', 'description', 'size', 'requiresText'] }));
		console.log('\nThe REQUIRED tag is automatically included. Tag dependencies are automatically included.');

		// List of tags to include in output.
		const includedTags = [];

		// Add REQUIRED tag.
		const requiredTag = allTags.find((tag) => tag.name == 'REQUIRED');
		if (!requiredTag) { console.log('REQUIRED tag is missing!'); } else { includedTags.push(requiredTag); }

		// Add other tags based on user input.
		const addRequirements = (tag, array) => { // For recursively adding requirements.
			array.push(tag);
			tag.requires.forEach((tag) => addRequirements(tag, array));
		}
		const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
		rl.question('Included tags (space-separated, CASE SENSITIVE): ', (input) => {
			const tagNames = input.split(/ +/);
			tagNames.forEach((tagName) => {
				const tag = allTags.find((tag) => tag.name == tagName);
				if (!tag) {
					if (tagName != '') { console.log(`Unknown tag '${tagName}'.`); }
				} else { addRequirements(tag, includedTags); } // Recursively add requirements.
			});

			rl.close();

			// Build new text file.
			let output = '';
			lines.forEach((line) => {
				if (line.tags.some((tag) => includedTags.includes(tag))) { output += line.text + '\n'; }
			});
			const minified = uglifyjs.minify(output);

			// Check uglify errors.
			if (minified.error) { console.log(`Error when uglifying: ${minified.error}`); } else { output = minified.code; }

			// Output to new file.
			fs.writeFile('umbra.js', output, (err) => {
				if (err) { console.log(`Error with output: ${err}`); }
			});
		});
	});
});