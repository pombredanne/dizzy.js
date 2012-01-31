/*
 * The tracker module loads the tracker on the right and assigns all event handler to it
 */
define(['sandbox'],  function (sandbox) {
  var canvas;
  var containerId = 'dizzy';
  var tracker;
  var trackerList;
  var count=0; //to give groups a different name, just to help the user to distinguish them.
  var list = new Array();
  
  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
    if (tracker == undefined) start();
    else {
		count=0;
		trackerList.html('<tr><th>Type</th><th>Name</th><th>Path Num</th><th>Zoom</th><th>Speed</th><th>Go</th></tr>');
		emptyList();
		loadExistingGroups();
	}
  });
  
  sandbox.subscribe('dizzy.canvas.group.created',function(d){
	  var invisible = '';
	  
	  var g = d.group.dom();
	  var id = g.attr('id');
	  
	  var type = g.children().prop('localName'); //gets the 'type' of the first child of the group created (eg. rect, line, circle, image, g...)
	  var icon = 'img/'+type+'.png';
	  
	  list.push({type: type, id: id});
	  
	  if (type == 'line' || type == 'g' || type == undefined){
		  invisible = 'class="hidden"';
		  icon = '';
	  }
	  trackerList.append('<tr '+invisible+'><td><img src="'+icon+'" /></td><td><input class="tracker-name" type="text" size="7" value="'+(++count)+'"/></td><td><input class="tracker-path-numbers" type="text" size="7"/></td><td><input class="tracker-zoom" type="text" size="2" value="100"/></td><td><input class="tracker-speed" type="text" size="1" value="1"/></td><td class="tracker-go"><img src="./img/tracker_go.png"/></td></tr>');
	  console.log("Group "+id+" tracked");
  });
  
  sandbox.subscribe('dizzy.canvas.group.removed',function(d){
	  //console.log(list.length);
	  var id = d.id;
	  for (var i=0; i<list.length; i++){
		  if (id == list[i].id){
			  trackerList.find('tr:nth-child('+(i+2)+')').remove(); //toCheck (i+2)
			  list.splice(i, 1);
			  break;
		  }
	  }
	  console.log("Group "+id+" removed from tracker");
	  //console.log(list.length);
  });
  
  var loadExistingGroups = function () {
		if(canvas)
		for (var i=0; i<canvas.groupList.length; i++){
			
			var g = canvas.groupList[i].dom();
			var id = g.attr('id');
			var invisible = '';
			//if (id == 'canvas') continue; when i will remove the canvas, must set the number of indexes correctly
			var name = g.attr('name')? g.attr('name'):(++count); //if the group has already a name will show it in the input
			var type = g.children().prop('localName');
			var icon = 'img/'+type+'.png';
			
			if (type == 'line' || type == 'g' || type == undefined){
				invisible = 'class="hidden"';
				icon = '';
			}
			else {
				var image = 'img/'+type+'.png';
				var groupNumberMatch = /group_(\d+)/gi;
				var classes = (g.attr('class'));
				if (classes != undefined) //if the group hasn't any class yet
					classes = classes.match(groupNumberMatch);
				
				var pathNumbers="";
				
				if (classes != null) //if the group has some group_x class
					for (var j=0; j<classes.length; j++){
						pathNumbers += classes[j].substring(6)+" ";
					}
				
				var zoom = g.attr('zoom');
				zoom = zoom ? zoom : 100;
				
				var speed = g.attr('speed');
				speed = speed ? speed : 1;
			}
			list.push({type: type, id: id});
			
			trackerList.append('<tr '+invisible+'><td><img src="'+icon+'" /></td><td><input class="tracker-name" type="text" size="7" value="'+name+'"/></td></td><td><input class="tracker-path-numbers" type="text" size="7" value="'+pathNumbers+'"/></td><td><input class="tracker-zoom" type="text" size="2" value="'+zoom+'"/></td><td><input class="tracker-speed" type="text" size="1" value="'+speed+'"/></td><td class="tracker-go"><img src="./img/tracker_go.png"/></td></tr>');
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
		trackerList = tracker.find("#tracker-list");
		button.toggle(function(){
				trackerList.show();
				sandbox.publish('dizzy.presentation.transform.tracker.open');
			}, 
			function(){
					trackerList.hide()
					sandbox.publish('dizzy.presentation.transform.tracker.open');
		});
		
		tracker.bind('mousewheel', function(e, delta){ // mousewheel support for scrolling in canvas
           e.stopPropagation();
        });
		
		trackerList.delegate('.tracker-go','click',function(){
			sandbox.publish('dizzy.presentation.transform.tracker.go');
			var index = $(this).parent('tr').prop('rowIndex'); //rowIndex starts from 1
			canvas.visitGroup(list[index-1].id);
		})
		
		trackerList.delegate('.tracker-name','change',function(){
			var index = $(this).parents('tr').prop('rowIndex'); //rowIndex starts from 1	
			var group = canvas.groupList[index-1];
			
			var newName = $(this).val();
			
			//it writes to the group the name the user gives to it
			group.dom().attr('name', $(this).val()); //'name' serves only to help the user to distinguish groups
		});
		
		trackerList.delegate('.tracker-zoom', 'change', function(){
			var index = $(this).parents('tr').prop('rowIndex'); //rowIndex starts from 1	
			var group = canvas.groupList[index-1];
			var val = $(this).val();
			if (!isNaN(val) && val<=100 && val > 0)
				group.dom().attr('zoom', $(this).val());
			else
				$(this).val(group.dom().attr('zoom') ? group.dom().attr('zoom') : "");
		});
		
		trackerList.delegate('.tracker-speed', 'change', function(){
			var index = $(this).parents('tr').prop('rowIndex'); //rowIndex starts from 1	
			var group = canvas.groupList[index-1];
			var val = $(this).val();
			if (!isNaN(val) && val<=10 && val >= 0)
				group.dom().attr('speed', $(this).val());
			else
				$(this).val(group.dom().attr('speed') ? group.dom().attr('speed') : "1");
		});
		
		trackerList.delegate('.tracker-path-numbers','change',function(){
			
			var index = $(this).parents('tr').prop('rowIndex'); //rowIndex starts from 1
			var group = canvas.groupList[index-1];
			
			var separators = /[ -.,;:+]/;
			var numbers = ($(this).val()).split(separators); //the path numbers now set for the current group
			
			var groupNumberMatch = /group_(\d+)/gi;
			var classes = (group.dom().attr('class')).match(groupNumberMatch);
			
			//remove the existing pathnumbers
			if (classes != null)
			for (var i=0; i<classes.length; i++){
				canvas.removePathNumber(group, parseInt(classes[i].substring(6)));
			}
			
			//and set the new ones
			for (i=0; i<numbers.length; i++){
				if(numbers[i]=="") continue;
				canvas.addPathNumber(group, numbers[i]);
			}
		});
		
		trackerList.delegate('tr','hover',function(e){
				var index = $(this).prop('rowIndex'); //rowIndex starts from 1 - 0 is the th
				if(index){
					var group = canvas.groupList[index-1];
					group.dom().children().toggleClass('hoveringElem');
				}
		});
		
		
		/*
		trackerList.delegate('.show-transf','click',function(){
			var index = $(this).parents('tr').prop('rowIndex'); //rowIndex starts from 1	
			var group = canvas.groupList[index-1];
			console.log("transf: "+group.transformation());
		});*/
		
	  //tracker.children().disableTextSelect();
    }
    
    var emptyList = function(){
		
		for (var i=0; i<list.length;) list.pop();
		
	}
  
  return {

    init: function () {},

    destroy: function () {
	  // Remove the tracker from the DOM
      $('#tracker').remove();
    }

  };

});
