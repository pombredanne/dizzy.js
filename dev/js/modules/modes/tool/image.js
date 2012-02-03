/*
 * The image mode opens a filechooser dialog (url or local file) when opened, allowing to add an image to the canvas.
 * As soon as the dialog is closed the mode is switched to the default mode.
 */
define(['sandbox'], function (sandbox) {
  var canvas;
  var ready = false;

  var imageMode = {
    depends: [],
    /*
     * Click on image button
     */
    start: function () {
      // open file-open dialog
      sandbox.publish('ui.dialog.open', {
        filetypes: [],
        readAs: {
          link: true,
          file: 'dataUrl'
        },
        // readAs indicates wether its data-url or link here
        success: function (readAs, data) {
          sandbox.publish('dizzy.presentation.insertImage', {
            ref: data
          });
          sandbox.publish('dizzy.ui.toolbar.clicked.mode.tool-default', {
            button: 'tool-default'
          });
        },
        cancel: function () {
          sandbox.publish('dizzy.ui.toolbar.clicked.mode.tool-default', {
            button: 'tool-default'
          });
        }
      });
      
      // right click does nothing
      $(document).bind('contextmenu', function (e) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	  });
    },
    stop: function () {
		$(document).unbind('contextmenu');
	}
  };

  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
    ready = true;
  });

  /*
   * Inserts image into a new group.
   * @param data: { ref : 'data://...'||'http://...' }
   */
  sandbox.subscribe('dizzy.presentation.insertImage', function (data) {
    var innerCanvas = canvas.getGroup(0);

    var group = canvas.createGroup();
    // only used to get width/height of images
    var image = new Image();
    image.onload = function () {
      var widthHeight = canvas.vectorTranslate({
        x: image.width,
        y: image.height
      }, {
        ignoreCanvas: true
      });
      var img = $(canvas.svg.image(group.dom(), ((canvas.WIDTH - widthHeight.x) / 2).toString(), ((canvas.HEIGHT - widthHeight.y) / 2).toString(), Math.max(image.width, 600) + 'px', Math.max(image.height, 600) + 'px', data.ref));

      image.src = '';
      
      sandbox.publish('dizzy.canvas.group.created.image', {
		  group: group
	  });
    };
    image.src = data.ref;
    
    
  });


  return {
    init: function () {
      sandbox.publish('dizzy.modes.register', {
        name: 'tool-image',
        instance: imageMode
      });
    },
    destroy: function () {}
  };
});
