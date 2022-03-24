
Parse.Cloud.triggers.add("afterSave", "BlogPost", async function(request) {
	var newObj = request.object;
  	var oldObj = request.original;
  	if ( oldObj ) return true; // ignore when update
})
