/*
 * The tracker module loads the tracker on the right and assigns all event handler to it
 */
define(['sandbox'],  function (sandbox) {
  var canvas;
  var containerId = 'dizzy';
  var tracker;
  var count=0; //to give groups a different name, just to help the user to distinguish them.
  var list = new Array();
  
  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
    if (tracker == undefined) start();
    else {
		count=0;
		$('#tracker-list').html('<tr><th>Type</th><th>Name</th><th>Path Num</th><th>Go</th></tr>');
		emptyList();
		loadExistingGroups();
	}
    
  });
  
  sandbox.subscribe('dizzy.canvas.group.created',function(d){
	  var g = d.group.dom();
	  var id = g.attr('id');
	  var type = g.children().prop('localName'); //gets the 'type' of the first child of the group created (eg. rect, line, circle, image, g...)
	  list.push({type: type, id: id});
	  tracker.find("#tracker-list").append('<tr><td>'+type+'</td><td><input class="tracker-name" type="text" size="7" value="'+(++count)+'"/></td><td><input class="tracker-path-numbers" type="text" size="7"/></td><td class="tracker-go"><img src="./img/tracker_go.png"/></td><td class="show-transf">Transf</td></tr>');
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
  
  var loadExistingGroups = function () {4
		if(canvas)
		for (var i=0; i<canvas.groupList.length; i++){
			var g = canvas.groupList[i].dom();
			var id = g.attr('id');
			//if (id == 'canvas') continue; when i will remove the canvas, must set the number of indexes correctly
			var name = g.attr('name')? g.attr('name'):(++count); //if the group has already a name will show it in the input
			var type = g.children().prop('localName');
			
			var groupNumberMatch = /group_(\d+)/gi;
			var classes = (g.attr('class'));
			if (classes != undefined) //if the group hasn't any class yet
				classes = classes.match(groupNumberMatch);
			
			var pathNumbers="";
			
			if (classes != null) //if the group has some group_x class
				for (var j=0; j<classes.length; j++){
					pathNumbers += classes[j].substring(classes[j].length-1)+" ";
				}
			
			list.push({type: type, id: id});
			
			tracker.find("#tracker-list").append('<tr><td>'+type+'</td><td><input class="tracker-name" type="text" size="7" value="'+name+'"/></td></td><td><input class="tracker-path-numbers" type="text" size="7" value="'+pathNumbers+'"/></td><td class="tracker-go"><img src="./img/tracker_go.png"/><td class="show-transf">Transf</td></tr>');
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
		
		$('#tracker-list').delegate('.tracker-go','click',function(){
			var index = $(this).parent('tr').prop('rowIndex'); //rowIndex starts from 1
			canvas.visitGroup(list[index-1].id);
		})
		
		$('#tracker-list').delegate('.tracker-name','change',function(){
			var index = $(this).parents('tr').prop('rowIndex'); //rowIndex starts from 1	
			var group = canvas.groupList[index-1];
			
			var newName = $(this).val();
			
			//it writes to the group the name the user gives to it
			group.dom().attr('name', $(this).val()); //'name' serves only to help the user to distinguish groups
		})
		
		$('#tracker-list').delegate('.tracker-path-numbers','change',function(){
			var index = $(this).parents('tr').prop('rowIndex'); //rowIndex starts from 1	
			var group = canvas.groupList[index-1];
			
			var separators = /[ -.,;:+]/;
			var numbers = ($(this).val()).split(separators); //the path numbers now set for the current group
			
			var groupNumberMatch = /group_(\d+)/gi;
			var classes = (group.dom().attr('class')).match(groupNumberMatch);
			
			if (classes != null)
			for (var i=0; i<classes.length; i++){
				canvas.removePathNumber(group, classes[i].substring(classes[i].length-1));
			}
			
			for (i=0; i<numbers.length; i++){
				if(numbers[i]=="") continue;
				canvas.addPathNumber(group, numbers[i]);
			}
			
			/*
			var gruppo1 = "lallalla group_1 puzza";
			alert(gruppo1.match(groupNumberMatch));
			/*
			for (c in classes){
				var num = c.match(groupNumberMatch);
				if (num !== null) alert(num);
				else alert(c);
			}
			*/
			//it writes to the group the name the user gives to it
			//group.dom().removeClass(function(index, oldClass){
				//return oldClass;
			//}); //'name' serves only to help the user to distinguish groups
		});
		
		$('#tracker-list').delegate('.show-transf','click',function(){
			var index = $(this).parents('tr').prop('rowIndex'); //rowIndex starts from 1	
			var group = canvas.groupList[index-1];
			console.log("transf: "+group.transformation());
		});
		
	  //tracker.disableTextSelect();
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
