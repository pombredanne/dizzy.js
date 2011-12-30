/*
 * The tracker module loads the tracker on the right and assigns all event handler to it
 */
define(['sandbox'],  function (sandbox) {
  var canvas;
  var containerId = 'dizzy';
  var tracker;
  var list = new Array();
  
  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
    start();    
  });
  
  sandbox.subscribe('dizzy.canvas.group.created',function(d){
	  var g = d.group.dom();
	  var id = g.attr('id');
	  var type = g.children().prop('localName');
	  list.push({type: type, id: id});
	  tracker.find("#tracker-list").append('<tr><td>'+type+'</td><td>'+id+'</td></tr>');
	  console.log("Group "+id+" tracked");
  });
  
  sandbox.subscribe('dizzy.canvas.group.removed',function(d){
	  var id = d.id;
	  for (var i=0; i<list.length; i++){
		  if (id == list[i].id){
			  list.splice(i, 1);
			  tracker.find("#tracker-list").find('tr:nth-child('+(i+1)+')').remove();
			  break;
		  }
	  }
	  console.log("Group "+id+" removed from tracker");
  });
  
  /*
  var updateList = function () {
		tracker.find("#tracker-list").empty();
		for(var i=0; i<canvas.groupList.length; i++){
			tracker.find("#tracker-list").append("<tr><td>"+canvas.groupList[i].dom().attr('id')+"</td></tr>");
		}
  } */
  
  var loadExistingGroups = function () {
		if(canvas)
		for (var i=0; i<canvas.groupList.length; i++){
			var g = canvas.groupList[i].dom();
			var id = g.attr('id');
			var type = g.children().prop('localName');
			list.push({type: type, id: id});
			tracker.find("#tracker-list").append('<tr><td>'+type+'</td><td>'+id+'</td></tr>');
			console.log("Group "+id+" tracked");
		};		
	}
	
  var start = function () {
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
		  assignEventHandlers();
		  loadExistingGroups(); //in case of error too?
      });
    }
    
  var assignEventHandlers = function () {
		
		var button = tracker.find('#tracker-expand');
		button.toggle(function(){
				tracker.find("#tracker-list").show();
			}, 
			function(){
					tracker.find("#tracker-list").hide()
			});
		
	  //tracker.disableTextSelect();
    }
  
  return {

    init: function () {},

    destroy: function () {
	  // Remove the tracker from the DOM
      $('#tracker').remove();
    }

  };

});
