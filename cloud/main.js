const fs = require('fs');
const path = require('path');

let modules = [
	{
		name: 'global',
		async validate(req, functionName) {
			return true
		}
	},
	{
		name: 'authenticated',
		async validate(req, functionName) {
			return true
		},
		options: {
			requireUser: true
		}
	},
	{
		name: 'admin',
		async validate(req, functionName) {
			let userQuery = new Parse.Query(Parse.User)
			let user = await userQuery.get(req.user.id, { useMasterKey: true })
			return user.get("username")=='viennt@gostream.vn';
		},
		options: {
			requireUser: true
		}
	}
];

for ( let mdl of modules ) {
	fs.readdir(__dirname+'/'+mdl.name, (err, files) => {
		if ( err ) return false;
		for ( let file of files ) {
			if ( file.split('.').pop()!='js' ) return;
			let fncs = require(`./${mdl.name}/${file}`)
			for ( let fnc of fncs.cloudFunction ) {
				let options = Object.assign({}, mdl.options);
				if ( fnc.fields ) options.fields = fnc.fields;
				Parse.Cloud.define(fnc.name, async function(req) {
					if ( !mdl.validate || await mdl.validate(req, fnc.name) )
						return fnc.run(req)
					else return {error: "invalid_request"}
				}, options)
			}
		};
	})
}

Parse.Cloud.triggers = {
	triggers: {},
	add(name, className, action) {
		let key = `${name}-${className}`
		if ( !this.triggers[key] ) this.triggers[key] = [];
		this.triggers[key].push(action)
	}
}
require('./schema')
require('./triggers')
