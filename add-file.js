const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});
const generator = require('generate-password');
const fs = require('fs');
let files = [];
try {
	files = require('./files.json');
} catch (e) {
	console.log('No files.json found, starting from []');
}

console.log('Adding a file to files.json\n')

const nextId = String(files.length === 0 ? 0 : Math.max(...files.map(f => Number(f.id))) + 1);
const password = generator.generate({
	length: 15,
	numbers: true,
	symbols: true,
	strict: true
});

readline.question('Title of the file? ', title => {
	readline.question('File name in files folder? ', filename => {

		files.push({
			id: nextId,
			title,
			name: filename,
			password
		});

		const newContent = JSON.stringify(files, null, 2);

		console.log('\nNew files.json content will be:');
		console.log(newContent);

		readline.question('Confirm? [Y/n] ', yn => {
			if (['', 'Y', 'y', 'yes', 'YES', 'Yes'].includes(yn)) {
				fs.writeFile('files.json', newContent + '\n', err => {
					if (err) {
						console.error('Impossible to write files.json:', err);
					} else {
						console.log('\nfiles.json updated!');
					}
				});
			}

			readline.close();
		});
	});
});