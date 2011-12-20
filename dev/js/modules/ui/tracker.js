/*
 * The tracker module loads the tracker on the right and assigns all event handler to it
 */
define(['sandbox'],  function (sandbox) {
  var canvas;
  var containerId = 'dizzy';
  var tracker;
  
  sandbox.subscribe('dizzy.canvas.group.created',function(d){
	  var g = d.group;
	  //...should fill the list
	  // it could also print the groupList anytime item is added/removed
  });
  

  return {

    init: function () {
      var that = this;

      var body = $('#container');
	  
      var jqxhr = $.get('html/tracker.html').success(function (d) {
        body.prepend(d); //prepend the tracker's html to the body
        tracker = body.find('#tracker'); // get the tracker (jquery object instance)
        
        // publish the tracker.loaded event, passing the tracker object
        sandbox.publish('dizzy.ui.tracker.loaded', {
          tracker: tracker
        });
      }).error(function (e) {
        // TODO
      }).complete(function () {
        that.assignEventHandlers(); //in case of error too?
      });

    },

    assignEventHandlers: function () {
		
		var button = tracker.find('#tracker-expand');
		button.click(function(){
			tracker.find("#tracker-list").slideToggle('fast');
		});
		
	  //tracker.disableTextSelect();
    },

    destroy: function () {
	  // Remove the tracker from the DOM
      $('#tracker').remove();
    }

  };

});
