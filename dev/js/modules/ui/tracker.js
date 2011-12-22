/*
 * The tracker module loads the tracker on the right and assigns all event handler to it
 */
define(['sandbox'],  function (sandbox) {
  var canvas;
  var containerId = 'dizzy';
  var tracker;
  
  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
  });
  
  sandbox.subscribe('dizzy.canvas.group.created',function(d){
	  var g = d.group;
	  var id = g.dom().attr('id');
	  //tracker.find("#tracker-list").append("<tr><td>"+id+"</td><td></td></tr>");*/
	  updateList();
	  console.log("Group "+id+" tracked");
	  //...should fill the list
	  // it could also print the groupList anytime item is added/removed
  });
  
  sandbox.subscribe('dizzy.canvas.group.removed',function(d){
	  updateList();
	  var id = d.id;
	  console.log("Group "+id+" removed from tracker");
	  //...should fill the list
	  // it could also print the groupList anytime item is added/removed
  });
  
  var updateList = function () {
		tracker.find("#tracker-list").empty();
		for(var i=0; i<canvas.groupList.length; i++){
			tracker.find("#tracker-list").append("<tr><td>"+canvas.groupList[i].dom().attr('id')+"</td></tr>");
		}
  }
  

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
		button.toggle(function(){
				tracker.find("#tracker-list").show();
			}, 
			function(){
					tracker.find("#tracker-list").hide()
			});
		
	  //tracker.disableTextSelect();
    },

    destroy: function () {
	  // Remove the tracker from the DOM
      $('#tracker').remove();
    }

  };

});
