/*
 * Does the binding of the items in the main toolbar-menu (save, open, etc...)
 */
define(['sandbox'], function (sandbox) {
  var canvas;
  var toolbar;
  var menuRight;
  /*
   * Subcriptions:
   * 	dizzy.presentation.loaded
   * 	dizzy.ui.toolbar.loaded
   * 	dizzy.ui.toolbar.clicked.menu-button
   */

  /*
   * When Toolbar is loaded, bind the menu items.
   */
  sandbox.subscribe('dizzy.ui.toolbar.loaded', function (tool) {
    toolbar = tool.toolbar; // get the toolbar
    var menu = $('#menu');	// get the (hidden) expandable menu
    var menuRight = menu.find('#menu-right');
    menu.disableTextSelect();
	
	//when the Menu button is clicked:
    sandbox.subscribe('dizzy.ui.toolbar.clicked.menu-button', function () {
      menu.toggleClass('hidden'); // toggle the visibility of the menu
      sandbox.publish('dizzy.ui.canvas.focus', {
        hasFocus: menu.hasClass('hidden')
      });
    });

	// when a menu-option button is clicked:
    menu.delegate('.menu-option', 'click', function (evt) {
      var id = $(this).attr('id'); // get the id

      switch (id) {
		/*  
		case 'menu-open-ok':
			console.log("opening a file..");
			alert($('#menu-open-input').val());
			
			// ask the opening of the dialog box to open file
			sandbox.publish('dizzy.ui.dialog.file.open', {
			  ok: function () {},
			  cancel: function () {}
			});
			break;
		*/  
		case 'menu-save':
			// The SVG prolog, not needed anymore
			//var svgProlog = '<?xml version="1.0" encoding="UTF-8"?>';
			var svgText = canvas.serialize();
			var svgBase64 = 'data:image/svg+xml;charset=utf-8;base64,' + $.base64Encode(svgText);
			window.open(svgBase64);
			break;
			
		case 'menu-download':
			var svgText = canvas.serialize();
			//var svgBase64 = 'data:image/svg+xml;charset=utf-8;base64,' + $.base64Encode(svgText);
			$.post('php/downloadSVG.php', {svg:svgText}, function(url){
			  window.open("php/"+url, 'Download');
			});
			break;
			
		case 'menu-about':
			$("#menu-bugs-extended").addClass('hidden');
			$("#menu-about-extended").toggleClass('hidden');
			break;
		
		case 'menu-bugs':
			$("#menu-about-extended").addClass('hidden');
			$("#menu-bugs-extended").toggleClass('hidden');
			break;
				
      };
    });
    
    menu.delegate('.menu-option', 'hover', function (evt) {
		var p = $(this).attr('data-description');
		if (p) menuRight.text(p);
	});
	
	menu.delegate('#tool-input-color-background', 'change', function(){
		$('svg').first().css('background-color', $(this).val());
	});
    
    $('#menu-open-input').bind('change', function(evt){
      var file = evt.target.files; // FileList object
      if ( file.length >= 1 && file[0].type==='image/svg+xml') {
         var reader = new FileReader();
         var openSVGFile = file[0];
         reader.onload = function(e){
			 console.log("loaded svg: "+e.target.result);
			 
			 sandbox.publish('dizzy.presentation.loadSVG', {
				 svgDoc: e.target.result
				});
         };
         reader.readAsText(openSVGFile);
      }
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
