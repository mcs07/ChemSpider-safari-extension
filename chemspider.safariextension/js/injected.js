var locX, locY, z_idx = 0;

function handleContextMenu(e) {
    // Get mouse position, but limit to page size constraints
    locX = Math.min(e.pageX + 10, $(document).width() - 200);
    locY = Math.min(e.pageY + 10, $(document).height() - 300);
    // Get selection and set as userInfo for global page
    var sel = '';
    sel = window.parent.getSelection()+'';
    sel = sel.replace(/^\s+|\s+$/g,'');
    safari.self.tab.setContextMenuEventUserInfo(e, sel);
}

function handleMessage(msg) {
    if (window !== window.top) 
        return
    if (msg.name === 'showLoading') {
        showLoading(msg.message);
    } else if (msg.name === 'searchResults') {
        displayResult(msg.message);
    }
}

function showLoading(id) {
    if ($('link[href^="safari-extension://com.matt-swain.chemspider"][href$="css/chemspider.css"]').length == 0) {
        $('<link rel="stylesheet" href="'+safari.extension.baseURI+'css/chemspider.css">').appendTo('head');
	}
    var dialog = $('<div class="chemspider-safari-extension" />').attr('id', id),
        title = $('<div class="cssse-title">ChemSpider</div>')
        spinner = $('<div class="cssse-spinner" />'),
        close = $('<button type="button" class="cssse-close">×</button>')
    close.click(function() { $(this).parent().fadeOut(); });
    title.css({backgroundImage: 'url('+safari.extension.baseURI+'img/icon-small.png)'});
    dialog.append(close).append(title).append(spinner);
    dialog.css({top: locY, left: locX, display: 'none'});
    dialog.drags({handle: '.cssse-title'})
    dialog.appendTo('body').fadeIn();
}

function displayResult(msg) {
    var dialog = $('#'+msg.id);
    $('div.cssse-spinner', dialog).fadeOut(function() {
        if (msg.results.length < 1) {
            $('<div class="cssse-noresults">No Results Found</div>').appendTo(dialog);
        } else {
            if (msg.results.length > 1) {
		        $('<button type="button" class="cssse-prev cssse-arrow">⟨</button>').click(function() {
		            $('.cssse-slider', $(this).parent()).scrollTo({top:0, left:'-=175'}, 400);
		        }).appendTo(dialog);
		    }
            //$('.title', dialog).eq(0).html('CID <span class="cid">'+msg.results[0].cid+'</span>');
            var slider = $('<div class="cssse-slider" />');
            $.each(msg.results, function(i, result) {
                var img = $('<img src="http://www.chemspider.com/ImagesHandler.ashx?id='+result.cid+'&w=175&h=175" title="CID'+result.cid+' - '+result.name+'">'),
                    save = $('<button type="button" title="Save MOL file for CID'+result.cid+'" class="cssse-save">Save</button>'),
                    view = $('<button type="button" title="View CID'+result.cid+' on ChemSpider" class="cssse-view">View</button>'),
                    cap = $('<div class="cssse-caption">CID <span class="cssse-cid">'+result.cid+'</span></div>');
                save.click(function() {
                    location.href = 'http://www.chemspider.com/FilesHandler.ashx?type=str&id='+result.cid;
                });
                view.click(function() {
                    location.href = 'http://www.chemspider.com/Chemical-Structure.'+result.cid+'.html';
                }); 
			    $('<div class="cssse-mol" />').append(img).append(save).append(view).append(cap).appendTo(slider);
		    });
		    slider.hide().appendTo(dialog);
		    dialog.animate({height: slider.height()+36}, 500, function () {
		        slider.fadeIn(500);
            });
		    if (msg.results.length > 1) {
		        $('<button type="button" class="cssse-next cssse-arrow">⟩</button>').click(function() {
		            $('.cssse-slider', $(this).parent()).scrollTo({top:0, left:'+=175'}, 400);
		        }).appendTo(dialog);
		    }
		    
        }
    });
}

// Draggable code
(function($) {
    $.fn.drags = function(opt) {
        opt = $.extend({cursor:'move'}, opt);
        var $el = this.find(opt.handle);
        return $el.css('cursor', opt.cursor).on('mousedown', function(e) {
            var $drag = $(this).addClass('cssse-active-handle').parent().addClass('cssse-draggable');
            z_idx = Math.max(5001, z_idx+1);
            var drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', z_idx).parents().on('mousemove', function(e) {
                $('.cssse-draggable').offset({
                    top:e.pageY + pos_y - drg_h,
                    left:e.pageX + pos_x - drg_w
                }).on('mouseup', function() {
                    $(this).removeClass('cssse-draggable');
                });
            });
            e.preventDefault(); // disable selection
        }).on('mouseup', function() {
            $(this).removeClass('cssse-active-handle').parent().removeClass('cssse-draggable');
        });
    }
})(jQuery);


document.addEventListener('contextmenu', handleContextMenu, false);
safari.self.addEventListener('message', handleMessage, false);
