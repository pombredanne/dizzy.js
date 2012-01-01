define(['dizzy/group', 'dizzy/transformation', 'sandbox'], function (Group, Transformation, sandbox) {

  var Canvas = function (c, opt) {
      this.container = $(c);
      this.groupList = [];
      this.activeGroupNumber = 0;
      this.options = opt || {
        transformDuration: 1000
      };
    };

  Canvas.prototype = {
    WIDTH: 2000,
    HEIGHT: 1500,

    /**
     * Loads file into the container via XmlHttpRequest.
     * @param url URL of SVG file to load.
     * @param options Optional object that holds options and callbacks fileloading. Default options are as follows:
     * {
     *    success : function(){},
     *    failure : function(){}
     * }
     */
    load: function (url, options) {
      var that = this;

      options = options || {};
      
      //it is already in js/modules/canvas.js !!! and doesn't work anyway
      //maybe useless here
      this.container.children().disableTextSelect();
      this.container.empty().removeClass('hasSVG').svg({
        loadURL: url,
        onLoad: (function (svgw) {
          that.svg = that.container.svg('get'); //canvas.svg
          that.canvas = $('g#canvas');
          var groups = that.canvas.find('.group');
          groups.each(function () {
            that.getGroup($(this));
          });

          if (typeof options.success === 'function') { // ???
            options.success();
          }
        })
      });
    },

    /*
     * Converts dom to string representation
     */
    serialize: function () {
      // Fixes Chrome. I really have no clue why chrome leaves that out otherwise...
      $(this.svg.root()).attr('xmlns', 'http://www.w3.org/2000/svg');
      // clean up, remove all empty groups
      $('.group:empty', this.svg.root()).remove();

      return this.svg.toSVG();
    },


    createGroup: function () {
      var canvas = this.getGroup(0);
      var newGroup = $(this.svg.group(canvas.dom())); //add this as a new group, son of canvas

      var newTransform = Transformation.createTransform(canvas.transformation().matrix().inverse()); // ???

      newGroup.addClass('group');

      var newDizzyGroup = new Group(newGroup);
      newDizzyGroup.transformation(newTransform);
      this.groupList.push(newDizzyGroup);
      
      console.log("new group created, id: "+newDizzyGroup.dom().attr('id'));
      
      /*
      sandbox.publish('dizzy.canvas.group.created', {
		  group: newDizzyGroup
	  });
	  console.log("Created new group, list-size: "+this.groupList.length);
	  */
	  
      return newDizzyGroup;
    },

    removeGroup: function (g) {
      /* g.dom().remove(); */
      var removed;
      var idToRemove = g.dom().attr('id');
      for (var i=0; i<this.groupList.length; i++)
		if (this.groupList[i].dom().attr('id') == idToRemove){
			g.dom().remove();
			removed = this.groupList.splice(i,1);
			console.log("Group "+idToRemove+" removed! list-size: "+this.groupList.length);
			
			sandbox.publish('dizzy.canvas.group.removed', {
					id: idToRemove
			});
			
			break;
		}
    },

    /*
     * Finds a group by it's node representation. <g id="..." ...></g>
     * This is done by comparing ids. Every group gets a random (dom-)id when it is created internally.
     */
    findGroup: function (node) {
		
		console.log('called findGroup('+node+')');
      for (var i = 0; i < this.groupList.length; ++i) {
        if (this.groupList[i] && this.groupList[i].dom().attr('id') === $(node).attr('id')) {
          return this.groupList[i];
        }
      }
      var g;
      node = jQuery(node);
      if (node.size() > 0) { // ???
        g = new Group(node[0]);
        this.groupList.push(g);
        console.log('created and pushed group id: '+g.dom().attr('id'));
      }
      return g;
    },
    
    findGroupById : function (id) {
		for (var i = 0; i < this.groupList.length; ++i) {
			if (this.groupList[i] && this.groupList[i].dom().attr('id') === id) {
				return this.groupList[i];
			}
		}
		return undefined;
	},

    /*
     * Returns an instance of Dizzy.Group with all the information about a group.
     * Group 0 is the canvas (the "root element"), groups 1 - Inf are the normal groups
     * @param number the number of the group to get
     */
    getGroup: function (number) {
      // passed in element is already a group, dummy (o:
      if (number.dom && number.transformation) {
		  console.log("called canvas.getGroup for an already group. id: "+number.dom().attr('id'));
        return number;
      }
      console.log('called canvas.getGroup('+number+')');
      var groupNode;
      if (number > 0) {
        groupNode = this.canvas.find('.group_' + number);
      } else if (number === 0) {
        groupNode = this.canvas;
      }
      var g = this.findGroup(groupNode || number); // there should only be one group with that number
      return g;
    },

    /*
     * Set the internal counter to number and transforms the canvas accordingly
     */
    gotoGroup: function (numberOrGroup, options) {
      if (typeof numberOrGroup !== 'number') {
        numberOrGroup = this.getGroup(numberOrGroup);
      }
      this.activeGroupNumber = numberOrGroup;
      this.current(options);
    },

    /*
     * Increments the internal counter by one, going one step further in the path. Returns new active pathnumber
     */
    next: function () {
      return this.step(1);
    },
    /*
     * Opposite of next()
     */
    previous: function () {
      return this.step(-1);
    },

    step: function (dir) {
      this.activeGroupNumber += dir;
      try {
        var cur = this.current();
      } catch (e) {
        this.activeGroupNumber -= dir;
      }
      return this.activeGroupNumber;
    },
	
	/* 
	 * Goes to group specified by id => groupId
	 * doesn't alter the activeGroupNumber and can be used to reach any group with a RECT
	 */ 
	visitGroup: function(groupId, options) {
		var group;
		
		for (var i = 0; i < this.groupList.length; ++i) {
			if (this.groupList[i] && this.groupList[i].dom().attr('id') === groupId) {
			  group = this.groupList[i];
			  break;
			}
		}
		
		this.transformCanvasTo(group);
	},
	
	/* Transfrorm the canvas to the target group with a RECT
	 * show the rect centered and biggest possible to fit the screen area
	 * (the svg document MUST have the attributes --viewBox="0 0 someWidth someHeight"-- and --preserveAspectRatio="xMinYMin"-- )
	 * it would be much better to calibrate it using preserveAspectRatio="xMidYMid", but for some reason this attribute doesn't work properly atm*/
	transformCanvasTo: function(group, options) {
		var canvas = this.getGroup(0);
		
		if (group !== undefined) {
			var groupTransform = group.transformation();
			//in group.transformation for some reason there's already the inverse matrix.
			//sometimes it's not true and these cases generate errors in presenting (all but when the object was in the svg just opened and not yet transformed)
			var inverseTransform = Transformation.createTransform(groupTransform.matrix()); //where is the inversion ??? ???
			
			var mt = inverseTransform.matrix();
			inverseTransform.inverse();
			
			console.log("group transf: "+groupTransform);
			console.log("inver transf: "+inverseTransform);
			
			if(group.dom().attr('id')!='canvas') {
				try {
				//get the rect
				var elem = group.dom().children().first();
				var SVGtype = elem.prop('localName');
				
				if (SVGtype=='rect' || SVGtype=='image'){
				
				//get dimensions and position of the rect
				var ex = elem.attr('x');
				var ey = elem.attr('y');
				var ew = elem.attr('width');
				var eh = elem.attr('height');
				
				if (SVGtype == 'image'){
					ew = ew.substring(0, ew.length-2);
					eh = eh.substring(0, eh.length-2);
				}
				
				//get width and height of document and ViewBox
				var svgWidth = $(document).width();
				var svgHeight = $(document).height();			
				var viewBox = $('svg').attr('viewBox');
				var viewBoxParams = viewBox.split(" ", 4);
				var viewWidth = viewBoxParams[2];
				var viewHeight = viewBoxParams[3];
				
				//Effective width and height (in pixel) of the ViewBox
				//(they don't correspond to viewWidth and viewHeight due to the preserveAspectRatio attribute)
				var wpixels, hpixels; 
				
				var ratio = svgWidth/svgHeight;
				if(ratio >= 4/3) {
					hpixels = viewHeight;
					wpixels = (viewHeight/svgHeight)*svgWidth;
				} else {
					wpixels = viewWidth;
					hpixels = (viewWidth/svgWidth)*svgHeight;
				}
				
				//get the scale value to make the rect fit the viewbox area
				scaleVal = Math.min(wpixels/ew, hpixels/eh);
				
				console.log("valori presi correttamente! "+ex+" "+ey+" "+ew+" "+eh);
				//Translate tha canvas to display the group at the svg point (0,0)
				var mat = inverseTransform.matrix();
				inverseTransform.multiply(mat.inverse()).translate(-ex,-ey).multiply(mat); //IT WORKS!!!!!
				
				//Scale the canvas to display the group big enough to fit the screen dimensions (independant to Screen Dimensions :)
				var mats = inverseTransform.matrix();
				inverseTransform.multiply(mats.inverse()).scale(scaleVal).multiply(mats);
				
				var toTranslateX = (wpixels - ew*scaleVal)/2;
				var toTranslateY = (hpixels - eh*scaleVal)/2;
				
				//Center the group in the screen (independant to Screen Dimensions :)
				var mat2 = inverseTransform.matrix();
				inverseTransform.multiply(mat2.inverse()).translate(toTranslateX,toTranslateY).multiply(mat2);
				
				//console.log('final tranf: '+translatedTransform2);
				
				this.transform(canvas, inverseTransform, options);
				/*
				//Translate tha canvas to display the group at the svg point (0,0)
				var translatedTransform = Transformation.createTransform(inverseTransform.matrix());
				var mat = translatedTransform.matrix();
				translatedTransform = translatedTransform.multiply(mat.inverse()).translate(-ex,-ey).multiply(mat); //IT WORKS!!!!!
				
				//Scale the canvas to display the group big enough to fit the screen dimensions (independant to Screen Dimensions :)
				var scaledTransform = Transformation.createTransform(translatedTransform.matrix());
				var mats = scaledTransform.matrix();
				scaledTransform = translatedTransform.multiply(mats.inverse()).scale(scaleVal).multiply(mats);
				
				var toTranslateX = (wpixels - ew*scaleVal)/2;
				var toTranslateY = (hpixels - eh*scaleVal)/2;
				
				//Center the group in the screen (independant to Screen Dimensions :)
				var translatedTransform2 = Transformation.createTransform(scaledTransform.matrix());
				var mat2 = translatedTransform2.matrix();
				translatedTransform2 = scaledTransform.multiply(mat2.inverse()).translate(toTranslateX,toTranslateY).multiply(mat2);
				
				console.log('final tranf: '+translatedTransform2);
				
				this.transform(canvas, translatedTransform2, options);
				*/
				}
				} catch (e){
					alert("errore: "+e.message);
				}
				
			} else {
				this.transform(canvas, inverseTransform, options);
			}
      } else {
        throw "Ops! This should not have happened! (o:"
      }
		
	},
	
    /*
     * Goes to the group specified by the internal counter (useful, if panning/zooming is allowed).
     * Returns currently active pathnumber.
     */
    current: function (options) {
      var canvas = this.getGroup(0);
      var group = this.getGroup(this.activeGroupNumber);
      
      this.transformCanvasTo(group, options);
      return this.activeGroupNumber;
    },

    /*
     * Set the transformation of the group to the transformation object.
     */
    transform: function (group, transformation, options) {
      options = $.extend({
        complete: function () {},
        duration: this.options.transformDuration
      }, options);
      
      //if no duration is set, the default one will be used (see Canvas consctuctor)
      var duration = options.duration === undefined ? this.options.transformDuration : options.duration;

      group.transform = transformation;

      if (duration <= 10) { // speed optimization here..
        $(group.dom(), this.svg.root()).attr('transform', transformation.toString());
      } else {
        $(group.dom(), this.svg.root()).animate({ // <-- Animation is here
          svgTransform: transformation.toString()
        }, options);
      }
    },

    /*
     * Translates Viewport-Coordinates (Browser coordinates,
     * as returned by many events, like MouseEvent.pageX) to coordinates in the SVG viewbox.
     */
    toViewboxCoordinates: function (xy, reverse) {
      var svgPoint = this.svg.root().createSVGPoint();
      svgPoint.x = xy.x;
      svgPoint.y = xy.y;

      var m1 = this.svg.root().getScreenCTM();
      if (!reverse) {
        m1 = m1.inverse();
      }

      svgPoint = svgPoint.matrixTransform(m1);

      return svgPoint;
    },
    /*
     * Translates Viewport-Coordinates to Coordinates on the Canvas (a subgroup of the viewBox of the svg).
     */
    toCanvasCoordinates: function (xy, reverse) {
      var svgPoint = this.svg.root().createSVGPoint();
      svgPoint.x = xy.x;
      svgPoint.y = xy.y;

      var m1 = this.svg.root().getScreenCTM();
      var m2 = this.getGroup(0).transformation().matrix();

      m1 = m1.multiply(m2);

      if (!reverse) {
        m1 = m1.inverse();
      }

      svgPoint = svgPoint.matrixTransform(m1);

      return svgPoint;
    },

    /*
     * Transforms an XY-vector with the matrix of the canvas.
     * !! mainly deprecated, use toCanvasCoordinates or toViewboxCoordinates when possible. 
     */
    vectorTranslate: function (xy, options) {
      options = options || {};

      options = $.extend({
        ignoreCanvas: false,
        targetNode: undefined,
        inverseMatrix: false
      }, options);

      var svgPoint = this.svg.root().createSVGPoint();
      svgPoint.x = xy.x;
      svgPoint.y = xy.y;

      // matrix that is used for transforming the vector
      var reverseMatrix;

      // transform vector with a given node?
      if (!options.targetNode) {
        // nope, use canvas and/or svg transformation
        var m1 = this.svg.root().getScreenCTM();
        var m2 = this.getGroup(0).transformation().matrix();

        reverseMatrix = m1;
        // reverse canvas transformation
        if (!options.ignoreCanvas) {
          reverseMatrix = reverseMatrix.multiply(m2);
          options.inverseMatrix = true;
        }
        if ( !! options.inverseMatrix) {
          reverseMatrix = reverseMatrix.inverse();
        }
      } else {
        // get matrix of node (probably a group)
        reverseMatrix = options.targetNode.getCTM().inverse();
      }

      svgPoint = svgPoint.matrixTransform(reverseMatrix); // I think this should do the trick.. stupid matrix calculations (o:
      return {
        x: svgPoint.x,
        y: svgPoint.y
      };
    },

    pathCounter: 0, //it's not managed properly
    /**
     * @param g Group object that the path number is assigned to
     * @param n optional. number that is assigned.
     */
    addPathNumber: function (group, n) {
      if (n === undefined) {
        n = ++pathCounter; //maybe ++this.pathCounter
      }
      group.dom().addClass('group_' + n);
      //group.numbers().push(n);
    },

    removePathNumber: function (group, n) {
      if (n === undefined) {
        n = [];
      }
      if (typeof n === 'number') {
        n = [n];
      }
      for (var i = 0; i < n.length; ++i) {
        group.dom().removeClass('group_' + n[i]);
        // delete from internal array.
        /*var numbers = group.numbers();
        var pos = numbers.indexOf(n[i]);
        if (pos >= 0) {
          numbers.splice(pos, 1);
        } */
      }
    },
    
    //Maybe these two function must be moved somewhere else !!!
    getFillColor: function(){
		return $("#tool-input-color-fill").val();
	},
	
	getStrokeColor: function(){
		return $("#tool-input-color-stroke").val();
	}
  };

  return Canvas;
});
