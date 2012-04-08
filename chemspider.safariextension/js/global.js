function performCommand(e) {
	if (e.command !== 'chemspider')
		return;
	var query = e.userInfo;
	query = query.replace(/\s+/g,'+');
	var rUrl = 'http://www.chemspider.com/Search.aspx?q='+query;
	$.get(rUrl, function(data) {
		app.activeBrowserWindow.activeTab.page.dispatchMessage('searchResults', parseResults(data));
	});
}

function parseResults(data) {
	var img = $(data).find('img[src*="ImagesHandler"]').get(0);
	if (img) {
		querystring = $(img).attr('src').split('?')[1];
		var params = querystring.split('&');
		for (var j=0;j<params.length;j++) {
			var pair = params[j].split('=');
			if (pair[0] == 'id') {
				return pair[1];
			} 
		}
	}
}

function validateCommand(e) {
	var selection = e.userInfo;
	if (e.command !== 'chemspider' || selection===undefined) {
		return;
	}
	if (selection.length == 0 || !selection) {
		e.target.disabled = true;
	}
	if (selection.length > 25) {
		selection = selection.substr(0,25);
		selection = selection.replace(/^\s+|\s+$/g,'');
		selection = selection + '...'
	}
	e.target.title = 'Search for "'+selection+'" on ChemSpider'; 
}

const app = safari.application;
app.addEventListener('command', performCommand, false);
app.addEventListener('validate', validateCommand, false);
