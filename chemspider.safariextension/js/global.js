safari.application.addEventListener("command", performCommand, false);
safari.application.addEventListener("validate", validateCommand, false);

// Called when the context menu item is clicked
function performCommand(event) {
    if (event.command !== "chemspider")
		return;

	// Get selection from userInfo, replace spaces with +, construct search url
    var query = event.userInfo;
    query = query.replace(/\s+/g,"+");
    var rUrl = "http://www.chemspider.com/Search.aspx?q="+query;
    
    // Request the search results for the selection
    var req = new XMLHttpRequest();
    req.open('GET', rUrl, true);
    req.onreadystatechange = function (aEvt) {  
        if (req.readyState == 4) {  
            if(req.status == 200) {
            
            	// Once results are returned, parse them into an Array of IDs
                idsArray = parseResults(req.responseText);
                var messageToSend = new Array(idsArray, query);
                // Send the array of IDs and the query back to the injected javascript
                safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("searchResults", messageToSend);
            }
        }  
    };
    req.send(null);
}

// parses the HTML response into an array of IDs from the search results
function parseResults(responseText) {
	
	// Convert to absolute paths to avoid ugly errors (not necessary?)
    responseText = responseText.replace(/src=\"\//g, "src=\"http://www.chemspider.com/")
    
    // Find all images with "ImagesHandler" in the source
	var range = document.createRange();
	range.selectNode(document.body);
	var parsedHTML = range.createContextualFragment(responseText);
	var imageNodes = parsedHTML.querySelectorAll('img[src*="ImagesHandler"]');
    var idsArray = new Array();
    for (var i=0; i<imageNodes.length; i++) {
    
    	// For each image, get the ID from the img source and push it onto an array
        var imgSrc = imageNodes[i].getAttribute('src');
        var queryString = imgSrc.split('?')[1];
        var vars = queryString.split('&');
        for (var j=0;j<vars.length;j++) {
        	var pair = vars[j].split('=');
        	if (pair[0] == 'id') {
        		idsArray.push(pair[1]);
        		break;
    		} 
        }
    }
    return idsArray;
}

// Called whenever context menu is displayed
function validateCommand(event) {

    // Get selection from userInfo
    var contextText = event.userInfo;
    
    // Remove item from context menu if criteria aren't satisfied
    if (event.command !== "chemspider" || contextText===undefined) {
		return;
    }
    if (contextText.length == 0 || !contextText) {
        event.target.disabled = true;
    }
    
    // Truncate context menu item if too long
    if (contextText.length > 25) {
        contextText = contextText.substr(0,25);
        contextText = contextText.replace(/^\s+|\s+$/g,"");
        contextText = contextText + '...'
    }
    event.target.title = 'Search for "'+contextText+'" on ChemSpider'; 
}

function checkVersion() {
    if(safari.extension.settings.version != "1.01")
    {
    	safari.application.openBrowserWindow();
        safari.application.activeBrowserWindow.activeTab.url = "http://www.macosxtips.co.uk/extensions/chemspiderupdate.html";
        safari.extension.settings.version = "1.01";
    }
}
