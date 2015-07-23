var lastFMStats = {
	// Used to clone data from artist table on each page
	data: [],

	totalTimeListened: 0,

	totalPlays: 0,

	/*
	Return: total # of plays for an artist
	Simply grabs # of plays from HTML
	*/
	getTotalPlays: function(){
		// Grab source HTML tidbit
		var plays = $( $(".thinkGlobal")[0] ).text().trim();

		// Take substring and convert to integer
		plays = parseInt( plays.substring(0, plays.indexOf("p")).replace(",", "") );

		lastFMStats.totalPlays = plays;
	},

	/*
	Return: None
	Goes through Last.fm table and creates entry in the data object for each track
	*/
	gatherData: function(){
		var totalTime = 0,
				duration = 0,
				playCount = 0,
				timeString = "",
				trackName = "",
				albumName = "";

		$("table#libraryList tbody tr").each(function(i){

			// Quit the loop on the last track (indexes of times and other data are not consistent)
			if(i === $(".time").length - 1){
				return false;
			}

			// Get duration of track in string format (x:yz)
			timeString = $( $(this).find(".time") ).text().trim();

			// Get track name
			trackName = $( $(this).find(".subject") ).text().trim();

			// Get album name
			albumName = $( $(this).find(".album") ).text().trim();

			// Get duration in seconds
			duration = (parseInt( timeString.substring( 0, timeString.indexOf(":") ) ) * 60) +  (parseInt( timeString.substring( timeString.indexOf(":") + 1 ) ));

			// Get # of plays
			playCount = parseInt( $(this).find(".playcount").text().trim() );

			if(!parseInt(duration) || !parseInt(playCount)){
				return;
			}

			// Calculate total time listened for each track: (N seconds / play) x Y plays = Total time listened
			totalTime = duration * playCount;

			// Adds a new entry in the data object; TrackName: [Album Name, duration, play count]
			lastFMStats.data[trackName] = [albumName, duration, playCount, totalTime];
		});

	},

	/* 
	Return: None
	Calculates total time listened to an artist in seconds
	*/
	calculateTimeListened: function(){
		var totalTime = 0;
		for(var track in lastFMStats.data){
			totalTime += lastFMStats.data[track][3];
		}
		lastFMStats.totalTimeListened = totalTime;
	},

	/*
	Return: None
	Outputs the number of time listened in an hours:minutes:seconds format.
	*/
	displayData: function(){
		var totalTime = lastFMStats.totalTimeListened;
		var days = 0;
			hours = 0,
			minutes = 0,
			seconds = 0;
		
		// totalSeconds * (1 hour / 3600 seconds) = totalHours
		hours = parseInt(totalTime / 3600);

		// totalSeconds % 3600 = Remaining seconds * (1 minute / 60 seonds) = minutes
		minutes = parseInt( parseInt(totalTime % 3600) / 60 );

		// seconds is whatever is left: Total Seconds - (Total Minutes * (60 seoncds / 1 minute)) - (Total Hours * (3600 hours / 1 minute))
		seconds = totalTime - ((3600 * hours) + (minutes * 60));

		// Output
		$( $("p.thinkGlobal a")[0] ).before(" Time Played: " + hours + ":" + minutes + ":" + seconds + " | ");
	},

	/**
	* Adds the total time listened to each track in a column in the table
	*/
	addTotalTimeListened: function(){
		var hours = 0, minutes = 0, seconds = 0, totalTime;

		// Write table header
		$( $("table#libraryList thead tr")[1] ).append("<th>Total Time Listened</th>");

		// Loop through each table entry to fill in chart
		$("table#libraryList tbody tr").each(function(index){

			// Determines the track name
			track = $( $(".subject .name a")[index] ).text().trim();

			// Skips track if unlisted in the data array (unlisted because of missing info)
			if(lastFMStats.data[track] == undefined){
				return;
			}

			// Calculates percentage based on track
			totalTime = lastFMStats.data[track][3];
			hours = parseInt(totalTime / 3600);
			minutes = parseInt(parseInt(totalTime % 3600) / 60);
			seconds = totalTime - ((hours * 3600) + (minutes * 60));
		
			// Add a 0 in front of single digit values
			hours = (hours.toString().length === 1)? "0" + hours : hours.toString();
			minutes = (minutes.toString().length === 1)? "0" + minutes : minutes.toString();
			seconds = (seconds.toString().length === 1)? "0" + seconds : seconds.toString();
			
			// Create child <td> element to output percentage
			$(this).append("<td class = 'timePercent' style = 'border-left: 1px solid #ccc'>" + hours + ":" + minutes + ":" + seconds + "</td>");
		});
	},

	/*
	Return: None
	Creates a table entry for each track showing it's "time percentage"
	"time percentage" = Total time for track N / Total time for artist A, where N is a track made by A.
	*/
	addTimePercentage: function(){
		var percentage = 0,
			track = "";

		// Write table header
		$( $("table#libraryList thead tr")[1] ).append("<th>Percentage of time</th>");

		// Loop through each table entry to fill in chart
		$("table#libraryList tbody tr").each(function(index){

			// Determines the track name
			track = $( $(".subject .name a")[index] ).text().trim();

			// Skips track if unlisted in the data array (unlisted because of missing info)
			if(lastFMStats.data[track] == undefined){
				return;
			}

			// Calculates percentage based on track
			percentage = Math.round((lastFMStats.data[track][3] / lastFMStats.totalTimeListened) * 10000) / 100;

			// Create child <td> element to output percentage
			$(this).append("<td class = 'timePercent' style = 'border-left: 1px solid #ccc'>" + percentage + "</td>");
		});
	},

	addPlayPercentage: function(){
		var percentage = 0,
			track = "";

		// Write table header
		$( $("table#libraryList thead tr")[1] ).append("<th>Percentage of plays</th>");

		// Loop through each table entry to fill in chart
		$("table#libraryList tbody tr").each(function(index){

			// Determines the track name
			track = $( $(".subject .name a")[index] ).text().trim();
			
			// Skips track if unlisted in the data array (unlisted because of missing info)
			if(lastFMStats.data[track] == undefined){
				return;
			}

			// Calculates percentage based on track
			percentage = Math.round((lastFMStats.data[track][2] / lastFMStats.totalPlays) * 10000) / 100;

			// Create child <td> element to output percentage
			$(this).append("<td class = 'playPercent' style = 'border-left: 1px solid #ccc'>" + percentage + "</td>");
		});
	},

	sortTracks: function(category, order){
		var sortIndex = 0;
		var lastFMData = [];
		var temp = [];
		var outputTable = "";

		// Determine what we're sorting by 
		switch(category){
			case "Duration":
				sortIndex = 3;
				break;
			case "Total Time Listened":
				sortIndex = 5;
				break;
			case "Percentage of time":
				sortIndex = 6;
				break;
		}

		// Copy data from table
		$("table#libraryList tr").each(function(){
			temp = [];
			$(this).children("td").each(function(){
				temp.push($(this).text().trim());
			});
			lastFMData.push(temp);
		});

		// Sort the data
		lastFMData = lastFMData.sort(function(a, b){
			if( order === "l->g" ){
				return a[sortIndex] - b[sortIndex];
			}
			else{
				return b[sortIndex] - a[sortIndex];
			}
		});

		// Add the table headers to the end of the 2D array
		lastFMData.push($("table#libraryList thead").html());

		// Output table
		outputTable += "<table id='libaryList' class='" + $("table#libraryList").attr("class") + "'>";
		outputTable += lastFMData[lastFMData.length - 1];
		for(var row = 0; row < lastFMData.length - 1; row++){
			outputTable += "<tr>";
			for(var col in lastFMData[row]){
				outputTable += "<td>" + lastFMData[row][col] + "</td>";
			}
			outputTable += "</tr>";
		}
		outputTable += "</table>";

		$("table#libraryList").remove();
		$("div#content").append(outputTable);
	}
};

lastFMStats.getTotalPlays();
lastFMStats.gatherData();
lastFMStats.calculateTimeListened();
lastFMStats.displayData();
lastFMStats.addTotalTimeListened();
lastFMStats.addTimePercentage();
lastFMStats.addPlayPercentage();
console.log(lastFMStats.data);
var clicks = 0;
$("table#libraryList thead th").each(function(){
	$(this).click(function(){
		clicks++;
		
		// The list will sort in ascending/descending order in an alternating fashion
		lastFMStats.sortTracks($(this).text().trim(), ((clicks % 2 == 0)? "l->g" : "g->"));
	})
});