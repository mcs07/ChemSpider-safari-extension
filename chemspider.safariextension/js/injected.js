document.addEventListener("contextmenu", contextMessage, false);
safari.self.addEventListener("message", handleMessage, false);
document.addEventListener("mousedown", dragStart, false)
document.addEventListener("click", handleClick, false)

var dragObj = new Object();					// Global object to hold drag information.
var windowNo = 0;							// To keep track of which window to move/close
var locx;									// For the start position of the window
var locy;									// For the start position of the window
var topZIndex = 10000;						// To move the clicked window to the top

// Called when the user right-clicks on the page
function contextMessage(msgEvent) {

	// Get text selection and remove starting and trailing spaces
    var sel = '';
    sel = window.parent.getSelection()+'';
    sel = sel.replace(/^\s+|\s+$/g,"");
    
    // Set the window position to 10px right and below the right-click
    locx = msgEvent.clientX + window.scrollX + 10;
    locy = msgEvent.clientY + window.scrollY + 10;
    
    // Set the UserInfo to the selection (can be accessed from global)
    safari.self.tab.setContextMenuEventUserInfo(msgEvent, sel);
}

// Called whenever a message is sent from the global page.
function handleMessage(msgEvent) {
    if (msgEvent.name === "searchResults") {
    	openWindow(msgEvent.message);
    }
}

// Open a new compound popup window
function openWindow(message) {

	// Stops popup opening in all the iframes on the page
	if (window !== window.top) 
        return;
	
	// Make unique identifier for window, and make sure it's on top
	windowNo++;
    topZIndex++;
    var idsArray = message[0],
    	query = message[1];
    	
    // Inject the css to style the popup window
    var cssLink = document.createElement("link");
	cssLink.setAttribute("rel", "stylesheet");
	cssLink.setAttribute("href", safari.extension.baseURI + "chemspider.css");
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(cssLink);
    
    // Create container div to hold popup, in the correct location and on top of other popups
    var previewContainer = document.createElement ( "div" );
    previewContainer.setAttribute ( 'style', "left: "+locx+"px !important; top: "+locy+"px !important; z-index: "+topZIndex+" !important;" );
    previewContainer.className = "__previewContainer__";
    previewContainer.id = "__previewContainer-"+windowNo;
    document.body.insertBefore (previewContainer, document.body.firstChild);
    
    // Create the titlebar with a unique identifier, and but it inside the container div
    var titleBar = document.createElement ( "div" );
    titleBar.className = "__titleBar__"
    titleBar.id = "__titleBar-"+windowNo;
    previewContainer.appendChild (titleBar);
    
    // Create the View link and put it inside the titlebar
    var titleLink = document.createElement ( "a" );
    titleLink.className = "__titleLink__";
    if (idsArray.length == 1) {
        titleLink.textContent="View";
        titleLink.href = "http://www.chemspider.com/Chemical-Structure."+idsArray[0]+".html";
    } else if (idsArray.length == 20) {
        titleLink.textContent = "20+ More";
        titleLink.href = "http://www.chemspider.com/Search.aspx?q="+query;
    } else {
        titleLink.textContent = idsArray.length+" More";
        titleLink.href = "http://www.chemspider.com/Search.aspx?q="+query;
    }
    titleLink.setAttribute ('target', '_blank');
    titleBar.appendChild (titleLink);
    
    // Create the close link and put it insode the titlebar
    var closeLink = document.createElement ( "button" );
    closeLink.className = "__closeLink__";
    closeLink.id = "__closeLink-"+windowNo;
    closeLink.textContent="";
    //closeLink.href = "javascript:void(0);";
    titleBar.appendChild (closeLink);

    // If the IDs array is empty, fill the window with an error message
    if (idsArray.length == 0) {
        var noResults = document.createElement ( "p" );
        noResults.className = "__noResults__";
		noResults.textContent="No Results Found";
        previewContainer.appendChild (noResults);
        
        // Turn off the View link
        titleLink.style.visibility = "hidden !important";
        return;
    }
    
    // If there are IDs in the array, create an image of the first one
    var previewImg = document.createElement ( "img" );
    previewImg.className = "__previewImg__";
    previewImg.id = "__previewImg-"+windowNo;
    previewImg.src = "http://www.chemspider.com/ImagesHandler.ashx?id="+idsArray[0];
    previewContainer.appendChild (previewImg);
    
    // Create a bar along the bottom
    var bottomBar = document.createElement ( "div" );
    bottomBar.className = "__bottomBar__";
    bottomBar.id = "__bottomBar-"+windowNo+"-"+idsArray[0];
    previewContainer.appendChild (bottomBar);
     
    // Create 2D link
    var twoDLink = document.createElement ( "button" );
    twoDLink.className = "__bottomLink__";
    twoDLink.id = "__twoDLink-"+windowNo;
    twoDLink.textContent="2D";
    bottomBar.appendChild (twoDLink);
    
	// Create 3D link
    var threeDLink = document.createElement ( "button" );
    threeDLink.className = "__bottomLink__";
    threeDLink.id = "__threeDLink-"+windowNo;
    threeDLink.textContent="3D";
    bottomBar.appendChild (threeDLink);
    
    // Create zoom link
    var zoomLink = document.createElement ( "button" );
    zoomLink.className = "__bottomLink__";
    zoomLink.id = "__zoomLink-"+windowNo;
    zoomLink.textContent="Zoom";
    bottomBar.appendChild (zoomLink);
     
    // Create save link
	var saveLink = document.createElement ( "button" );
    saveLink.className = "__bottomLink__";
    saveLink.id = "__saveLink-"+windowNo;
    saveLink.textContent="Save";
    //saveLink.setAttribute('onclick', "location.href = 'http://www.chemspider.com/FilesHandler.ashx?type=str&id="+idsArray[0]+"'");
    bottomBar.appendChild (saveLink);
}

// Called on mousedown events
function dragStart(event) {

	// Return unless the click is in a titlebar (could be multiple)
    if (event.srcElement.className !== "__titleBar__")
        return;

    // Get the windowNo of the clicked window
    var draggingWindowNo = event.srcElement.id.split('-')[1];

    // Set the thing to be dragged to the container div of the clicked window
    dragObj.elNode = document.querySelector("#__previewContainer-"+draggingWindowNo);
    
    // Get cursor position with respect to the page.
    var x = event.clientX + window.scrollX,
    	y = event.clientY + window.scrollY;

    // Save starting positions of cursor and element.
    dragObj.cursorStartX = x;
    dragObj.cursorStartY = y;
    dragObj.elStartLeft  = parseInt(dragObj.elNode.style.left, 10);
    dragObj.elStartTop   = parseInt(dragObj.elNode.style.top,  10);
    if (isNaN(dragObj.elStartLeft)) dragObj.elStartLeft = 0;
    if (isNaN(dragObj.elStartTop))  dragObj.elStartTop  = 0;
    
    // Bring window to the top, and update the topZIndex
    topZIndex++;
    dragObj.elNode.style.zIndex = topZIndex+" !important";
    
    
    // Capture mousemove and mouseup events on the page.
    document.addEventListener("mousemove", dragGo,   true);
    document.addEventListener("mouseup",   dragStop, true);
    event.preventDefault();
}

// Called when the mouse moves while the mouse is held down over a titlebar
function dragGo(event) {

    // Get cursor position with respect to the page.
    var x = event.clientX + window.scrollX,
    	y = event.clientY + window.scrollY;
    	
    // Move drag element by the same amount the cursor has moved.
    dragObj.elNode.style.left = (dragObj.elStartLeft + x - dragObj.cursorStartX) + "px !important";
    dragObj.elNode.style.top  = (dragObj.elStartTop  + y - dragObj.cursorStartY) + "px !important";
    
    // Stop dragging off edge of screen
    if ((dragObj.elStartLeft + x - dragObj.cursorStartX)<scrollX) {
    	dragObj.elNode.style.left = scrollX + "px !important";
    }
    if ((dragObj.elStartTop  + y - dragObj.cursorStartY)<scrollY) {
    	dragObj.elNode.style.top = scrollY + "px !important";
    }
    if ((dragObj.elStartLeft + x - dragObj.cursorStartX)>(window.innerWidth+window.scrollX-177)) {
    	dragObj.elNode.style.left = (window.innerWidth+window.scrollX-177) + "px !important";
    }
    if ((dragObj.elStartTop  + y - dragObj.cursorStartY)>(window.innerHeight+window.scrollY-202)) {
    	dragObj.elNode.style.top = (window.innerHeight+window.scrollY-202) + "px !important";
    }
    
    event.preventDefault();
}

// Called when the mouse is released from being clicked on a titlebar
function dragStop(event) {

    // Stop capturing mousemove and mouseup events.
    document.removeEventListener("mousemove", dragGo,   true);
    document.removeEventListener("mouseup",   dragStop, true);
}

// Called when the page is clicked on
function handleClick(event) {
	
	// Get the button type, windowNo and compound Id
    var clickedWindowType = event.srcElement.id.split('-')[0],
    	clickedWindowNo = event.srcElement.id.split('-')[1],
    	id = event.srcElement.parentElement.id.split('-')[2];
	
    if (event.srcElement.className == "__closeLink__") {
    	previewClose(clickedWindowNo);
    }

    if (!id)
    	return;
    	
    if (clickedWindowType == "__twoDLink") {
    	
    	// Remove object with "__previewImg-"+windowNo id
    	var previewContainer = document.getElementById("__previewImg-"+clickedWindowNo).parentNode;
    	previewContainer.removeChild(document.getElementById("__previewImg-"+clickedWindowNo));
    	
    	// Replace with image
    	var previewImg = document.createElement ( "img" );
    	previewImg.className = "__previewImg__";
    	previewImg.id = "__previewImg-"+clickedWindowNo;
    	previewImg.src = "http://www.chemspider.com/ImagesHandler.ashx?id="+id;
    	previewContainer.insertBefore(previewImg, event.srcElement.parentElement);
    	
    } else if (clickedWindowType == "__threeDLink") {
    	// Remove object with "__previewImg-"+windowNo id
    	var previewContainer = document.getElementById("__previewImg-"+clickedWindowNo).parentNode;
    	previewContainer.removeChild(document.getElementById("__previewImg-"+clickedWindowNo));
    	
    	// Replace with embeded java applet
    	var appletContainer = document.createElement ( "div" );
    	appletContainer.className = "__previewImg__";
    	appletContainer.id = "__previewImg-"+clickedWindowNo;
    	var applet = document.createElement ( "applet" );
    	applet.setAttribute("name", "jmol");
    	applet.setAttribute("code", "JmolApplet");
    	applet.setAttribute("archive", "JmolApplet0.jar");
    	applet.setAttribute("codebase", "http://www.chemspider.com/jmol");
    	applet.setAttribute("width", "150");
    	applet.setAttribute("height", "150");
    	applet.setAttribute("mayscript", "true");
    	appletContainer.appendChild (applet);
    	var progressParam = document.createElement ( "param" );
    	progressParam.setAttribute("name", "progressbar");
    	progressParam.setAttribute("value", "true");
    	applet.appendChild(progressParam);
    	var scriptParam = document.createElement ( "param" );
    	scriptParam.setAttribute("name", "script");
    	scriptParam.setAttribute("value", "load http://www.chemspider.com/FilesHandler.ashx?type=str&3d=yes&id="+id+"; set displayCellParameters FALSE; set antialiasDisplay ON;");
    	applet.appendChild(scriptParam);
    	previewContainer.insertBefore(appletContainer, event.srcElement.parentElement);
    } else if (clickedWindowType == "__zoomLink") {

    	// Open another modal
    	var dimmer = document.createElement ( "div" );
        dimmer.id = "__dimmer__";
        dimmer.style.zIndex = (topZIndex+1)+" !important";
        dimmer.onclick = dimmerClose;
        document.body.insertBefore (dimmer, document.body.firstChild);
    
        var previewContainer = document.createElement ( "div" );
        previewContainer.id = "__previewContainer__";
        previewContainer.style.zIndex = (topZIndex+2)+" !important";
        document.body.insertBefore (previewContainer, document.body.firstChild);
	
        var iframe = document.createElement ( "iframe" );
        iframe.id = "__iframe__"
        iframe.src = "http://www.chemspider.com/ImageView.aspx?mode=2d&id="+id;
        iframe.setAttribute ( 'scrolling', "no");
        previewContainer.appendChild ( iframe );
    	
    } else if (clickedWindowType == "__saveLink") {
    	location.href = "http://www.chemspider.com/FilesHandler.ashx?type=str&id="+id;
    }
}

// Closes the window with the given windowNo
function previewClose(id) {
    document.getElementById("__previewContainer-"+id).parentNode.removeChild(document.getElementById("__previewContainer-"+id));return false;
}

dimmerClose = function () {
    document.getElementById('__previewContainer__').parentNode.removeChild(document.getElementById('__previewContainer__'));
    document.getElementById('__dimmer__').parentNode.removeChild(document.getElementById('__dimmer__'));
    return false;
}