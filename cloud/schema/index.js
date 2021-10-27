const fs = require('fs');
const roles = require('./roles');
const helper = require('../helper');

let classRole = {}
fs.readdir(__dirname, (err, files) => {
	if ( err ) return false;
	files.filter(f => f.split('.').shift()==='schema' && f.split('.').pop()==='json').forEach(file => {
		let className = file.split('.')[1]
		classRole[className] = require('./'+file)
	})
})

// protectedFields, indexes ???
// "indexes":{"_id_":{"_id":1},"username_1":{"username":1},"email_1":{"email":1},"case_insensitive_email":{"email":1},"case_insensitive_username":{"username":1}}

let publicFunction = {
	createSchema() {

	},
	createRole() {
		return Promise.all( Object.keys(roles).map(r => {
			let acl = new Parse.ACL();
			acl.setPublicReadAccess(true);

			let role = new Parse.Role(r, acl)
			return role.save(null, { useMasterKey: true })
		}) )
	},
	updateClassLevelPermissions() {
		let promises = [];
		Object.keys(classRole).forEach(className => {
			promises.push( helper.apiRequest({
				method: 'PUT',
				body: {
					classLevelPermissions: classRole[className].classLevelPermissions
				}
			}) );
		})
		return Promise.all(promises)
	}
}

Object.keys(classRole).forEach(className => {
	var actions = Object.keys(classRole[className].accessControlList);

	Parse.Cloud.beforeSave(Parse[className], async function(request) {
		async function getParticipant(name) {
			switch (name) {
				case 'me':
					if ( className=="User" ) return "";
					return request.object.attributes.user ? request.object.attributes.user.id : Parse.User.current();
					break;
				default:
					let query = new Parse.Query(Parse.Role);
					query.equalTo("name", name);
					return query.first({ useMasterKey: true });
					break;
			}
		}

		let acl = new Parse.ACL();
		for ( let act of actions ) {
			let participants = classRole[className][act].split(',').map(name => name.trim())
			for ( let p of participants ) {
				if ( p=="public" ) {
					acl[`setPublic${act}Access`](true)
				} else {
					let participant = await getParticipant(p)
					if ( participant )
						acl[`setRole${act}Access`](participant, true)
				}
			}
		}
		request.object.setACL(acl);
	})
})

module.exports = {
	publicFunction
}
