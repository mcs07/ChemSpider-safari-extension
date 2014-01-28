function performCommand(e) {
    if (e.command !== 'chemspider') return;
    // Generate id and tell injected script to show a loading dialog with that id
    var id = 'chemspider-safari-extension-' + Date.now();
    app.activeBrowserWindow.activeTab.page.dispatchMessage('showLoading', id);
    // Make request to ChemSpider, then send results to injected script, with same id
    var rUrl = 'http://www.chemspider.com/Search.aspx?q='+e.userInfo.replace(/\s+/g,'+');
    $.get(rUrl, function(data, textStatus, jqXHR) {
        var pUrl = jqXHR.getResponseHeader('x-orig-path'),
            msg = {'id': id, 'results': parseResult(data, pUrl)};
        app.activeBrowserWindow.activeTab.page.dispatchMessage('searchResults', msg);
    });
}

function parseResult(data, url) {
    // Parse the ChemSpider search result HTML for compound details
    var page = $(data);
    if (url == '/Search.aspx') {
        return page.find('.search-id-column').map(function() {
            return {
                name: $(this).next().next().text(),
                cid: $(this).find('a[href^="/Chemical-Structure."]').eq(0).text()
            }
        }).get();
    } else if (url.indexOf('/Chemical-Structure.') !== -1) {
        return [{
            cid: cidpattern.exec(url)[1],
            name: page.find('h1').text(),
            //mf: page.find('.emp-formula').eq(0).html()
        }];
    }
}

function validateCommand(e) {
    var selection = e.userInfo;
    if (e.command !== 'chemspider' || selection === undefined) {
        return;
    }
    // Only show ChemSpider context menu item if there is some selected text
    if (selection.length == 0 || !selection) {
        e.target.disabled = true;
    }
    // Truncate the menu item text if the selection is over 25 characters
    if (selection.length > 25) {
        selection = selection.substr(0, 25).replace(/^\s+|\s+$/g,'') + '...';
    }
    e.target.title = 'Search for "'+selection+'" on ChemSpider'; 
}

const app = safari.application;
var cidpattern = /\/Chemical-Structure\.(\d+)\.html/
app.addEventListener('command', performCommand, false);
app.addEventListener('validate', validateCommand, false);
