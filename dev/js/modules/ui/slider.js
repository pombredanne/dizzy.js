/*
 * The  module loads a slider div upon the canvas
 */
define(['sandbox'],  function (sandbox) {
  var canvas;
  var containerId = 'dizzy';
  var slider;

  sandbox.subscribe('dizzy.ui.slider.closed', function () {
    reopen.show("slow");
  });

  return {

    init: function () {
      var that = this;

      // create a container for dizzy svg file
      var body = $('#container');
      
      var jqxhr = $.get('html/slider.html').success(function (d) {
        body.prepend(d);
        slider = body.find('#anteprime');
        reopen = body.find('#apriAnteprime');
        
        sandbox.publish('dizzy.ui.slider.loaded', {
          slider: slider
        });
      }).error(function (e) {
        // TODO
      }).complete(function () {
        that.assignEventHandlers();
        console.log('slider loaded.');
      });

    },

    assignEventHandlers: function () {
		
      slider.delegate('#x', 'click', function (e) {
        slider.hide("slow");
        console.log('slider closed.');
        sandbox.publish('dizzy.ui.slider.closed.', {
          slider: slider
        });
      });
      
      reopen.bind('click', function(e){
		  slider.show("slow");
		  reopen.hide("slow");
		  console.log('slider opened');
		  sandbox.publish('dizzy.ui.slider.opened.', {
			  slider: slider
		  });
	  });
    },

    destroy: function () {
      $('#slider').remove();
    }

  };

});
