
module.exports = {
	validateEmail(email) {
	    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(String(email).toLowerCase());
	},
	apiRequest(options) {
		return Parse.Cloud.httpRequest({
			url: 'https://parseapi.back4app.com/schemas/'+className,
			headers: {
				'X-Parse-Application-Id': '',
				'X-Parse-Master-Key': '',
				'Content-Type': 'application/json'
			},
			...options
		})
	}
}