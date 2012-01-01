/*
 * Does the binding of the items in the main toolbar-menu (save, open, etc...)
 */
define(['sandbox'], function (sandbox) {
  var canvas;
  var toolbar;
  /*
   * Subcriptions:
   */
  /*
   * Toolbar is loaded, bind menu items.
   */
   
  //when Toolbar is loaded:
  sandbox.subscribe('dizzy.ui.toolbar.loaded', function (tool) {
    toolbar = tool.toolbar; // get the toolbar
    var menu = $('#menu');	// get the (hidden) expandable menu
    
    menu.disableTextSelect();
	
	//when the Menu button is clicked:
    sandbox.subscribe('dizzy.ui.toolbar.clicked.menu-button', function () {
      menu.toggleClass('hidden'); // toggle the visibility of the menu
      sandbox.publish('dizzy.ui.canvas.focus', {
        hasFocus: menu.hasClass('hidden')
      });
    });

	// when a menu-option button is clicked:
    menu.delegate('.menu-option', 'click', function () {
      var id = $(this).attr('id'); // get the id

      switch (id) {
	  // if the id is 'menu-open'..
      case 'menu-open':
		// ask the opening of the dialog box to open file
        sandbox.publish('dizzy.ui.dialog.file.open', {
          ok: function () {},
          cancel: function () {}
        });
        break; // Other cases still not implemented/written but menu-save that's just below
      };
    });

	// Why isn't this in the switch above??								???
	// when the menu-save button is clicked:
    menu.find('#menu-save').bind('click', function (e) {
	  // The SVG prolog, not used??										???
      var svgProlog = '<?xml version="1.0" encoding="UTF-8"?>';
	  
      var svgText = canvas.serialize();
      var svgBase64 = 'data:image/svg+xml;charset=utf-8;base64,' + $.base64Encode(svgText);
      window.open(svgBase64);
    });
    
    menu.find('#menu-download').bind('click', function (e) {
	  // The SVG prolog, not used??										???
      var svgProlog = '<?xml version="1.0" encoding="UTF-8"?>';
	  
      var svgText = canvas.serialize();
      var svgBase64 = 'data:image/svg+xml;charset=utf-8;base64,' + $.base64Encode(svgText);
      
      $.post('php/downloadSVG.php', {svg:svgText}, function(url){
		  //$(this).innerHTML = $('<a id="download-link" href="php/'+url+'"</a>');
		  //$(this).append($link);
		  //$('#download-link').click();
		  window.open("php/"+url, 'Download');
	  });
      
      
    });


  });
  
  //when Presentation is loaded -> get the canvas
  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
  });

  return {
    init: function () {},
    destroy: function () {}

  };

});
