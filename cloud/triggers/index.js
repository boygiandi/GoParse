const fs = require('fs');

let files = fs.readdirSync(__dirname)
files.filter(f => f!='index.js' && f.split('.').pop()==='js').forEach(file => {
	require('./'+file)
})

