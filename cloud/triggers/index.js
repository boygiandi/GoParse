const fs = require('fs');

fs.readdir(__dirname, (err, files) => {
	if ( err ) return false;
	files.filter(f => f!='index.js' && f.split('.').pop()==='js').forEach(file => {
		require('./'+file)
	})
})

