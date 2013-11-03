/*
 * The default mode is the mode in which groups can be moved, resized and rotated. (TODO: and deleted)
 * TODO: as soon as the user starts typing it should activate text mode and open the text box with the typed text (similiar to the old version)
 */
define(['sandbox'], function (sandbox) {
  var canvas;

  var ready = false;

  var defaultMode = {
    depends: ['zoom', 'pan', 'zebra', 'resizer'],
    start: function () {
      if (ready) {
		//add the class 'editing' to the svg canvas
        $(canvas.svg.root()).addClass('editing default');
        this.bindMouselistener();
        this.bindKeyboardlistener();
      }
    },

    stop: function () {
      if (ready) {
        $(canvas.svg.root()).removeClass('editing default');
        this.unbindMouselistener();
        this.unbindKeyboardlistener();
      }
    },

    bindMouselistener: function () {
      var svg = canvas.svg.root();
      
      //touchstart: happens every time a finger is placed on the screen
      $(svg).delegate('g.group', 'click.dizzy.default touchstart.dizzy.default', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var g = canvas.findGroup(this);
        sandbox.publish('dizzy.presentation.group.selected', {
          group: g,
          event: e
        });

        return false;
      });
      
      // right click does nothing
      $(document).bind('contextmenu', function (e) {
				e.preventDefault();
				e.stopPropagation();
				return false;
	  });
    },

    unbindMouselistener: function () {
      var svg = canvas.svg.root();
      $(svg).undelegate('g.group', 'click.dizzy.default  touchstart.dizzy.default'); // undelegate everything under .dizzy.default namespace (???)
      $(document).unbind('contextmenu');
    },
    
    //as soon as I can, I'll change this function somehow
    bindKeyboardlistener: function() {
	  //Deletes from the DOM the selected item when pressing 'Del' ???????
	  $(document).bind('keydown.dizzy.default', function (e) {
			var keycode =  e.keyCode ? e.keyCode : e.which;
			if (keycode == 46){
				var sel = canvas.findGroup("g.selected");
				if (sel){
					canvas.removeGroup(sel);
					sandbox.publish('dizzy.presentation.transform'); //just to close zebra and resizer
				}
			}
      });
	},
	
	unbindKeyboardlistener: function() {
		$(document).unbind('keydown.dizzy.default');
	}
  };

  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
    ready = true;
  });
  
  sandbox.subscribe('dizzy.ui.toolbar.color.fill.changed', function(d){
	  var selex = canvas.findGroup("g.selected");
	  if(selex)
	  selex.dom().children().first().attr('fill', d.color);
  });
  
  sandbox.subscribe('dizzy.ui.toolbar.color.stroke.changed', function(d){
	  var selex = canvas.findGroup("g.selected");
	  if (selex)
	  selex.dom().children().first().attr('stroke', d.color);
  });
  
  var selected;
  sandbox.subscribe('dizzy.presentation.group.selected', function (g) {
    if (selected !== undefined) {
      $(selected).removeClass('selected');
    }
    selected = $(g.group.dom());
    selected.addClass('selected');
  });

  sandbox.subscribe('dizzy.presentation.transform', function () {
    if (selected !== undefined) {
      selected.removeClass('selected');
      sandbox.publish('dizzy.presentation.group.unselected');
    }
  });

  return {
    init: function () {
      sandbox.publish('dizzy.modes.register', {
        name: 'tool-default',
        instance: defaultMode
      });

    },
    destroy: function () {}
  };

});
