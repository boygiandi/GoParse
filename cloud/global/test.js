
let publicFunction = {

}

let cloudFunction = [
	{
		name: 'test:global',
		async run(req) {
		    return {message: `hello world`};
		}
	}
]

module.exports = {
	publicFunction, cloudFunction
}