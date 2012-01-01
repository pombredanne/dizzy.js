/*
 * The toolbar module loads the toolbar on the left and assigns all event handler to it (except for presentation controls).
 */
define(['sandbox'],  function (sandbox) {
  var canvas;
  var containerId = 'dizzy';
  var toolbar;


  // subscribe to own and foreign events (o:
  // when a button of the toolbar is clicked:
  sandbox.subscribe('dizzy.ui.toolbar.clicked', function (d) {
	  if(d.button != 'menu-button'){
		var button = toolbar.find('#' + d.button); // get the button (jquery object instance)
		button.siblings().removeClass('pressed'); // make the siblings appear not pressed
		button.addClass('pressed'); // make it appear pressed
	}
  });


  return {

    init: function () {
      var that = this;

      // create a container for dizzy svg file
      var body = $('#container');
	  
	  /* loads data from 'html/toolbar.html' and calls:
	   * 	- the success( function(d) if the request succeeds
	   * 	- the error(function(e) if the request fails
	   * 	- the complete(function() when the request finishes (after success and error callbacks are executed)
	   * 
	   * 'd' contains the data returned by the ajax call (the toolbar's html)
	   * jqxhr: jQuery XMLHTTPRequest Object
	   */
      var jqxhr = $.get('html/toolbar.html').success(function (d) {
        body.prepend(d); //prepend the toolbar's html to the body
        toolbar = body.find('#toolbar'); // get the toolbar (jquery object instance)
        
        // publish the toolbar.loaded event, passing the toolbar object
        sandbox.publish('dizzy.ui.toolbar.loaded', {
          toolbar: toolbar
        });
      }).error(function (e) {
        // TODO
      }).complete(function () {
        that.assignEventHandlers();
        
        // click default button ??? sometimes the zebra mode hasn't been registered yet when this happens
        // that's why I put this timeout, waiting for a better solution to come :)
        // "how to check if all modes have been registered?"
        setTimeout(function(){var firstButton = $('#toolbar .toolbutton.pressed').click();}, 400);
      });

    },

    /*
     * Assigns event handlers to the toolbar buttons.
     * A click on the button triggers a publish to the above function (that does the 
     */
    assignEventHandlers: function () {
		
	  toolbar.children(":not(#tool-color)").disableTextSelect();
	  
      // event delegation, "this" referrs to .toolbutton that has been clicked
      toolbar.delegate('.toolbutton', 'click', function (e) {
        var $target = $(this);

        // publish a message to the sandbox notifying the editing methods
        var buttonId = $target.attr('id');
        
        console.log('toolbar button '+buttonId+' pressed.');
        /*
         * includes the button id in both message-name and message data. 
         * Since we use namespacing, modules can just subscribe to "dizzy.ui.toolbar.clicked" and get every button click
         */
         
         /* Buttons which represent modes get 'mode.' as a suffix of their namespace to be handled differently */
         var wtp="";
         if($target.hasClass('mode')) wtp += 'mode.';
         
        sandbox.publish('dizzy.ui.toolbar.clicked.' + wtp + buttonId, {
          button: buttonId
        });
      });

    },

    destroy: function () {
	  // Remove the toolbar and the menu objects from the DOM
      $('#toolbar, #menu').remove();
    }

  };

});
