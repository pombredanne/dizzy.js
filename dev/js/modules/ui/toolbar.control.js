/*
 * Does the binding of the buttons in the Present toolbar.
 * 
 */
define(['sandbox'], function (sandbox) {
  var canvas;
  var toolbar;
  /*
   * Subcriptions:
   */
  /*
   * Toolbar is loaded, bind Present items.
   */
   
   
  //when Toolbar is loaded -> get the toolbar
  sandbox.subscribe('dizzy.ui.toolbar.loaded', function (tool) {
    toolbar = tool.toolbar;
  });
  //when Presentation is loaded -> get the canvas
  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
  });

  //when Next button is clicked -> call canvas.next()
  sandbox.subscribe('dizzy.ui.toolbar.clicked.tool-next', function () {
    canvas.next();
  });
  //when Previous button is clicked -> call canvas.previous()
  sandbox.subscribe('dizzy.ui.toolbar.clicked.tool-previous', function () {
    canvas.previous();
  });
  //when Present button is clicked -> toggle all but Menu and Present
  sandbox.subscribe('dizzy.ui.toolbar.clicked.mode.present-toggle-button', function (c) {
	  toolbar.find('#present-toggle-button').removeClass('mode');
    toolbar.find('.toolbutton').not(':first-child, :last-child').toggle();
  });
  
  //when Present button is clicked -> toggle all but Menu and Present
  sandbox.subscribe('dizzy.ui.toolbar.clicked.present-toggle-button', function (c) {
	  toolbar.find('#present-toggle-button').addClass('mode');
    toolbar.find('.toolbutton').not(':first-child, :last-child').toggle();
    
    sandbox.publish('dizzy.ui.toolbar.clicked.mode.tool-default', {button: 'tool-default'});
  });
  
	sandbox.subscribe('dizzy.canvas.group.visited', function(){
		if (toolbar){
			$('#tool-goto-inp').val(canvas.activeGroupNumber);
			console.log('visited group: '+canvas.activeGroupNumber);
		}
   });
   
   sandbox.subscribe('dizzy.ui.toolbar.clicked.tool-goto-go', function () {
	var num = parseInt($('#tool-goto-inp').val());
	if (!isNaN(num) && num>0) canvas.gotoGroup(num);
	else $('#tool-goto-inp').val(canvas.activeGroupNumber);
  });

  return {
    init: function () {},
    destroy: function () {}
  };

});
