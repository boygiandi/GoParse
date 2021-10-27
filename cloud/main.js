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

modules.forEach(mdl => {
	fs.readdir(__dirname+'/'+mdl.name, (err, files) => {
		if ( err ) return false;
		files.forEach(file => {
			if ( file.split('.').pop()!='js' ) return;
			let fncs = require(`./${mdl.name}/${file}`)
			fncs.cloudFunction.forEach(fnc => {
				let options = mdl.options || {};
				if ( fnc.fields ) options.fields = fnc.fields;
				Parse.Cloud.define(fnc.name, async function(req) {
					if ( !mdl.validate || await mdl.validate(req, fnc.name) )
						return fnc.run(req)
					else return {error: "invalid_request"}
				}, options)
			})
		});
	})
})

require('./schema')

