var locX, locY;

function contextMessage(e) {
	locX = e.clientX + 10;
    locY = e.clientY + 10;
	var sel = '';
	sel = window.parent.getSelection()+'';
	sel = sel.replace(/^\s+|\s+$/g,'');
	safari.self.tab.setContextMenuEventUserInfo(e, sel);
}

function handleMessage(msg) {
    if (msg.name === 'searchResults') {
    	openWindow(msg.message);
    }
}

function openWindow(id) {
	if (window !== window.top) 
		return;
	if ($('link[href^="safari-extension://com.matt-swain.chemspider"][href$="css/chemspider.css"]').length == 0) {
		$('<link rel="stylesheet" href="'+safari.extension.baseURI+'css/chemspider.css">').appendTo('head');
	}
	var $popupDiv = $('<div/>').appendTo('body');
	if (!id) {
		$('<div>No Results Found</div>').appendTo($popupDiv);
		$popupDiv.dialog({
			position: [locX,locY],
			width: 154,
			height: 190,
			title: 'ChemSpider',
			buttons: [
				{text: 'Close', 'class':'__chemspider-dialog-button', click: function() {
					$(this).dialog('close'); 
				}},
			]
		});
	} else {
		var $img = $('<img src="http://www.chemspider.com/ImagesHandler.ashx?id='+id+'">').appendTo($popupDiv);
		$popupDiv.dialog({
			position: [locX,locY],
			width: 154,
			title: 'ChemSpider',
			buttons: [
				{text: '2D', 'class':'__chemspider-dialog-button', click: function() {
					$popupDiv.html('<img src="http://www.chemspider.com/ImagesHandler.ashx?id='+id+'">');
				}},
				{text: '3D', 'class':'__chemspider-dialog-button', click: function() {
					$popupDiv.html('<applet name="jmol" code="JmolApplet" archive="JmolApplet0.jar" codebase="http://www.chemspider.com/jmol" width="150" height="150" mayscript="true"><param name="progressbar" value="true"><param name="script" value="load http://www.chemspider.com/FilesHandler.ashx?type=str&amp;3d=yes&amp;id=24770180; set displayCellParameters FALSE; set antialiasDisplay ON;"></applet>');
				}},
				{text: 'Save', 'class':'__chemspider-dialog-button', click: function() {
					location.href = 'http://www.chemspider.com/FilesHandler.ashx?type=str&id='+id;
				}},
				{text: 'More', 'class':'__chemspider-dialog-button', click: function() {
					location.href = 'http://www.chemspider.com/Chemical-Structure.'+id+'.html';
				}}
			]
		});
	}
}

document.addEventListener('contextmenu', contextMessage, false);
safari.self.addEventListener('message', handleMessage, false);
