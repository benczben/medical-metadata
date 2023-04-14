const fs = require('fs')
const readline = require('readline')

async function getFirstLine(pathToFile) {
	// source: https://stackoverflow.com/questions/28747719/what-is-the-most-efficient-way-to-read-only-the-first-line-of-a-file-in-node-js
	const readable = fs.createReadStream(pathToFile)
	const reader = readline.createInterface({ input: readable })
	const line = await new Promise((resolve) => {
	reader.on('line', (line) => {
		reader.close()
		resolve(line)
		})
	})
	readable.close()
	return line
}

module.exports = {
	getFirstLine
}