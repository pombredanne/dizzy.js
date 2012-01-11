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
	  if(d.button != 'menu-button' && d.button != 'tool-color'){
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
        that.setColorPickers();
        
        // click default button ??? sometimes the zebra mode hasn't been registered yet when this happens
        // that's why I put this timeout, waiting for a better solution to come :)
        // "how to check if all modes have been registered?"
        setTimeout(function(){var firstButton = $('#toolbar .toolbutton.pressed').click();}, 400);
      });

    },
    
    setColorPickers: function() {
		
	  function CPicker(inputId){
			
			this.selector = new jscolor.color(inputId, {});
			this.selector.pickerOnfocus = false;
			this.selector.pickerFace = 2;
			this.selector.hash = true;
			this.selector.fromString('#000000');
			
			
			this.opened = false;
			
			this.open = function(){
				this.opened = true;
				this.selector.showPicker();
			}
			
			this.close = function(){
				this.opened = false;
				this.selector.hidePicker();
			}
	  }
	  
	  var inputFill = document.getElementById('tool-input-color-fill');
	  var colorFill = new CPicker(inputFill);
	  
	  var inputStroke = document.getElementById('tool-input-color-stroke');
	  var colorStroke = new CPicker(inputStroke);
	  
	  sandbox.subscribe('dizzy.presentation.transform', function(){
		  colorFill.close();
		  colorStroke.close();  
	  });
	  
	  $(inputFill).click(function(){
		  if(colorFill.opened)
			  colorFill.close();
		  else {
			  colorStroke.close();
			  colorFill.open();
		  }
	  });
	  
	  $(inputStroke).click(function(){
		  if(colorStroke.opened)
			  colorStroke.close();
		  else {
			  colorFill.close();
			  colorStroke.open();
		  }
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
      
      toolbar.delegate('#tool-input-color-fill', 'change', function(){
		  sandbox.publish('dizzy.ui.toolbar.color.fill.changed', {
			 color: $(this).val()
		  }); 
	  });
	  
	  toolbar.delegate('#tool-input-color-stroke', 'change', function(){
		  sandbox.publish('dizzy.ui.toolbar.color.stroke.changed', {
			 color: $(this).val()
		  }); 
	  });

    },

    destroy: function () {
	  // Remove the toolbar and the menu objects from the DOM
      $('#toolbar, #menu').remove();
    }

  };

});
