var app = {};

/*
Contains all data used by the app
Clones the data found in the Last.fm table and adds to it
Used for sorting later
*/
app.data = [];

app.cloneTable = function(){

	var song, album;
	var duration, plays;
	// Loop through each table entry
	$("#libraryList .tbody tr").each(function(i){

		// Pull from HTML 
		song = $(this).find(".subject").text().trim();
		album = $(this).find(".album").text().trim();
		duration = $(this).find(".time").text().trim();
		plays = $(this).find(".playcount").text().trim();

		// Convert duration from x:yz to seconds and turn plays into number
		duration = parseInt(duration.substring(0, ":") * 60) + parseInt(duration.substring(":"));
		plays = parseInt(plays);

		// Add to data
		app["data"].push( [song, album, duration, plays] );

	});
}

app.cloneTable();