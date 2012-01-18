	this.container = $('svg');
    this.groupList = [];
    this.activeGroupNumber = 0;
    this.options = {
       transformDuration: 1000
    };
    this.WIDTH= 2000;
    this.HEIGHT= 1500;
    this.canvas;
    this.$svg;
    
	load();
	printGroupList();

	$(document).bind('keydown.presentation.navigation', function(e){ 
		if( e.which === 32 || e.which === 39 ){
			console.log("premuta freccia avanti");
         next();
      }else if( e.which === 37 ){
		  console.log("premuta freccia indietro");
        previous();
      } 
    });
    
    
    
    function load(options) {
		var that = this;
		options = options || {};
		this.canvas = $('#canvas'); //OK
		var groups = this.canvas.find('g');
		//alert(groups.length);
		groups.each(function () {
			that.getGroup($(this));
		});
		
		console.log('caricati i gruppi esistenti');
		
		$(window).bind('resize', function () {
            this.$svg = $('svg');
            this.$svg.attr({
				'width': window.innerWidth,
				'height': window.innerHeight
			});
            this.$svg.attr('style','width="'+window.innerWidth+'" height="'+window.innerHeight+'"');
          });
          $(window).resize();
          
          console.log('impostate le corrette dimensioni dello schermo');
    }
    
    function printGroupList(){
		console.log(this.groupList);
	}

    function createGroup() {
      var canvas = this.getGroup(0);
      var newGroup = $(this.svg.group(canvas.dom())); //add this as a new group, son of canvas

      var newTransform = Transformation.createTransform(canvas.transformation().matrix().inverse()); // ???

      newGroup.addClass('group');

      var newDizzyGroup = new Group(newGroup);
      newDizzyGroup.transformation(newTransform);
      this.groupList.push(newDizzyGroup);
	  
      return newDizzyGroup;
    }

    function removeGroup(g) {
      var removed;
      var idToRemove = g.dom().attr('id');
      for (var i=0; i<this.groupList.length; i++)
		if (this.groupList[i].dom().attr('id') == idToRemove){
			g.dom().remove();
			removed = this.groupList.splice(i,1);
			console.log("Group "+idToRemove+" removed!");
			
			break;
		}
    }

    /*
     * Finds a group by it's node representation. <g id="..." ...></g>
     * This is done by comparing ids. Every group gets a random (dom-)id when it is created internally.
     */
    function findGroup(node) {
		console.log('sono in findGroup');
      for (var i = 0; i < this.groupList.length; ++i) {
        if (this.groupList[i] && this.groupList[i].dom().attr('id') === $(node).attr('id')) {
			console.log("fondgroup trovato al "+i+" posto della lista");
          return this.groupList[i];
        }
      }
      var g;
      node = jQuery(node);
      if (node.size() > 0) {
        g = new Group(node[0]);
        this.groupList.push(g);
      }
      console.log('esco da findGroup');
      return g;
    }
    
    function findGroupById(id) {
		for (var i = 0; i < this.groupList.length; ++i) {
			if (this.groupList[i] && this.groupList[i].dom().attr('id') === id) {
				return this.groupList[i];
			}
		}
		return undefined;
	}

    /*
     * Returns an instance of Dizzy.Group with all the information about a group.
     * Group 0 is the canvas (the "root element"), groups 1 - Inf are the normal groups
     * @param number the number of the group to get
     */
    function getGroup(number) {
		console.log('sono in getGroup');
      // passed in element is already a group, dummy (o:
      if (number.dom && number.transformation) {
		  console.log('esco da getGroup: è già un gruppo!');
        return number;
      }
      var groupNode;
      if (number > 0) {
        groupNode = this.canvas.find('.group_' + number);
        console.log("cercando per .group_ ho trovato:");
        console.log(groupNode);
      } else if (number === 0) {
        groupNode = this.canvas;
      }
      var g = this.findGroup(groupNode || number); // there should only be one group with that number
      console.log('esco da getGroup');
      return g;
    }

    /*
     * Set the internal counter to number and transforms the canvas accordingly
     */
    function gotoGroup(numberOrGroup, options) {
      if (typeof numberOrGroup !== 'number') {
        numberOrGroup = this.getGroup(numberOrGroup);
      }
      this.activeGroupNumber = numberOrGroup;
      this.current(options);
    }

    /*
     * Increments the internal counter by one, going one step further in the path. Returns new active pathnumber
     */
    function next() {
		//console.log('sono in next');
      //return this.step(1);
      this.step(1);
    }
    /*
     * Opposite of next()
     */
    function previous() {
		//console.log('sono in previous');
      //return this.step(-1);
      if(this.activeGroupNumber == 0) return;
      this.step(-1);
    }

    function step(dir) {
		//console.log('sono in step con dir: '+dir);
		//console.log("pre aGN :"+this.activeGroupNumber);
      this.activeGroupNumber += dir;
      try {
        var cur = this.current();
      } catch (e) {
        this.activeGroupNumber -= dir;
      }
      
      //console.log("post aGN :"+this.activeGroupNumber);
      //return this.activeGroupNumber;
    }
	
	/* 
	 * Goes to group specified by id => groupId
	 * doesn't alter the activeGroupNumber and can be used to reach any group with a RECT
	 */ 
	function visitGroup(groupId, options) {
		var group;
		
		for (var i = 0; i < this.groupList.length; ++i) {
			if (this.groupList[i] && this.groupList[i].dom().attr('id') === groupId) {
			  group = this.groupList[i];
			  break;
			}
		}
		
		this.transformCanvasTo(group);
	}
	
	/* Transfrorm the canvas to the target group with a RECT
	 * show the rect centered and biggest possible to fit the screen area
	 * (the svg document MUST have the attributes --viewBox="0 0 someWidth someHeight"-- and --preserveAspectRatio="xMinYMin"-- )
	 * it would be much better to calibrate it using preserveAspectRatio="xMidYMid", but for some reason this attribute doesn't work properly atm*/
	function transformCanvasTo(group, options) {
		console.log('sono in transformCanvasTo, il canvas è:');
		var canvas = this.getGroup(0);
		console.log(canvas);
		
		if (group !== undefined) {
			try {
			console.log("il gruppo scelto è definito");
			//var groupTransform = group.transformation();
			var groupTransform = group.transform;
			console.log("La trasformazione del gruppo:");
			if(groupTransform == undefined) console.log("è undefined");
			console.log(groupTransform);
			var inverseTransform = Transformation.createTransform(groupTransform.matrix());
			console.log("la trasformazione equivalente a quella del gruppo:");
			console.log(inverseTransform);
			
			//var mt = inverseTransform.matrix();
			inverseTransform.inverse(); //inversion is here
			
			console.log("group transf: "+groupTransform);
			console.log("inver transf: "+inverseTransform);
			
			if(group.dom().attr('id')!='canvas') {
				console.log("il gruppo scelto non è il canvas");
				//get the rect
				var elem = group.dom().children().first();
				var SVGtype = elem.prop('localName');
				
				if (SVGtype=='rect' || SVGtype=='image' || SVGtype=='ellipse' || SVGtype == 'line' || SVGtype == 'text'){
					var ex, ey, ew, eh;
					
					switch (SVGtype){ //get dimensions and position of the element
						case 'rect':
							ex = elem.attr('x');
							ey = elem.attr('y');
							ew = elem.attr('width');
							eh = elem.attr('height');
							break;
							
						case 'image':
							ex = elem.attr('x');
							ey = elem.attr('y');
							ew = elem.attr('width');
							eh = elem.attr('height');
							ew = ew.substring(0, ew.length-2);
							eh = eh.substring(0, eh.length-2);
							break;
							
						case 'ellipse':
							ex = elem.attr('cx')-elem.attr('rx');
							ey = elem.attr('cy')-elem.attr('ry');
							ew = elem.attr('rx')*2;
							eh = elem.attr('ry')*2;
							break;
						
						case 'line':
							ex = elem.attr('x1');
							ey = elem.attr('y1');
							ew = Math.abs(ex-elem.attr('x2'));
							eh = Math.abs(ey-elem.attr('y2'));
							break;
							
						case 'text':
							//elem.attr('id', 'tempTextId');
							//var ele = document.getElementById('tempTextId'); //this method is not avaiable for the jquery object
							var ele = elem[0];
							var bbox = ele.getBBox();
							//elem.removeAttr('id');
							ex = bbox.x;
							ey = bbox.y;
							ew = bbox.width;
							eh = bbox.height;
							break;
					}
							
				//get width and height of document and ViewBox
				var svgWidth = window.innerWidth;//$(document).width();
				var svgHeight = window.innerHeight;//$(document).height();			
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
				
				var elemZoom = elem.parent().attr('zoom');
				var zoomPercentage = elemZoom ? elemZoom : 100;
				zoomPercentage /= 100;
				//get the scale value to make the rect fit the viewbox area
				var scaleVal = Math.min(wpixels*zoomPercentage/ew, hpixels*zoomPercentage/eh);
				
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
				console.log("final transform: "+inverseTransform);
				
				var speed = elem.parent().attr('speed');
				speed = speed ? speed : 1;
				options = $.extend({
					duration: parseInt(speed*1000)
				}, options);
				
				this.transform(canvas, inverseTransform, options);
				console.log("trasformazione e animazione effettuate");
				}
				
				
			} else {
				console.log('il gruppo scelto è il canvas!');
				this.transform(canvas, inverseTransform, options);
			}
			} catch (e){
					console.log("errore tranformCanvasTo: "+e.message);
			}
      } else {
		  console.log("group is undefined D:");
        throw "Ops! This should not have happened! (o:"
      }
		
	}
	
    /*
     * Goes to the group specified by the internal counter (useful, if panning/zooming is allowed).
     * Returns currently active pathnumber.
     */
    function current(options) {
		console.log('sono in current');
      var canvas = this.getGroup(0);
      console.log("Canvas:");
      console.log(canvas);
      var group = this.getGroup(this.activeGroupNumber);
      console.log("Gruppo trovato:");
      console.log(group);
      
      this.transformCanvasTo(group, options);
      console.log('ho trasformato il canvas');
      //return this.activeGroupNumber;
    }

    /*
     * Set the transformation of the group to the transformation object.
     */
    function transform(group, transformation, options) {
      try {
      options = $.extend({
        complete: function () {},
        duration: this.options.transformDuration
      }, options);
      
      //if no duration is set, the default one will be used (see Canvas consctuctor)
      var duration = options.duration === undefined ? this.options.transformDuration : options.duration;

      group.transform = transformation;
      if (duration <= 10) { // speed optimization here..
        $(group.dom(), this.$svg).attr('transform', transformation.toString());
      } else {
		  $(group.dom(), this.$svg).animate({ // <-- Animation is here
          svgTransform: transformation.toString()
        }, options);
		  /*
        $(group.dom(), this.$svg).animate({ // <-- Animation is here
          svgTransform: transformation.toString()
        }, options);
        */
        
      }
      console.log("animazione effettuata");
		} catch(e){
			console.log("errore transform: "+e.message);
		}	
    }

    /*
     * Translates Viewport-Coordinates (Browser coordinates,
     * as returned by many events, like MouseEvent.pageX) to coordinates in the SVG viewbox.
     */
    function toViewboxCoordinates(xy, reverse) {
      var svgPoint = this.svg.root().createSVGPoint();
      svgPoint.x = xy.x;
      svgPoint.y = xy.y;

      var m1 = this.svg.root().getScreenCTM();
      if (!reverse) {
        m1 = m1.inverse();
      }

      svgPoint = svgPoint.matrixTransform(m1);

      return svgPoint;
    }
    
    /*
     * Translates Viewport-Coordinates to Coordinates on the Canvas (a subgroup of the viewBox of the svg).
     */
    function toCanvasCoordinates(xy, reverse) {
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
    }

    /*
     * Transforms an XY-vector with the matrix of the canvas.
     * !! mainly deprecated, use toCanvasCoordinates or toViewboxCoordinates when possible. 
     */
    function vectorTranslate(xy, options) {
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
    }


	//GROUP
	

	function Group(nodeOrTransform, optionalNumbers) {
		
		this.dom = function(optionalDom) {
			//console.log('sono in group.dom()');
			if (optionalDom === undefined) { //if the parameter is not set (getter)
				//console.log('esco da group.dom() restituendo: ');
				//console.log(this.domContent);
				return this.domContent;
			  } else { //(setter)
				this.domContent = $(optionalDom);
				//console.log('ho impostato un nuovo dom:');
				//console.log(this.domContent);
				return this;
			  }
		}
		
		this.numbers = function() {
		  return this.numbers;
		}
		
		this.transformation = function(setTransform) {
			console.log("sono in group.transformation, la trasf da settare è:");
			console.log(setTransform);
		  if (setTransform === undefined) { //if the parameter is not set (getter)
			console.log('la trasformazione da settare è undefined, quindi restituisco la corrente, che è:');
			console.log(this.transform);
			return this.transform;
		  } else { //(setter)
			this.transform = setTransform;
			$(this.dom()).attr('transform', setTransform.toString());
			return this;
		  }
		}
		
		var that = this;
		var groupNumberMatch = /group_(\d+)/g; //reg.ex. /g = repeat substitution
		
		if (nodeOrTransform.inverse && nodeOrTransform.multiply) { // passed argument is transform
		  // set transform
		  this.transformation(nodeOrTransform);
		  if (optionalNumbers !== undefined) {
			this.numbers = optionalNumbers;
		  }
		  this.dom($('<g class="group" transform="' + this.transformation() + '" />'));

		} else { // passed argument is a node
		  var node = nodeOrTransform[0] || nodeOrTransform; // in case argument was jQuery object
		  var $node = $(node);
		  this.numbers = optionalNumbers || [];
		  var classes = $node.attr('class');
		  // match list of classNumbers with regex above. Gets the numbers only (???).
		  var groupNumber;
		  while ((groupNumber = groupNumberMatch.exec(classes)) !== null) {
			this.numbers.push(parseInt(groupNumber[1])); // !!!
		  }
		  // get transformation matrix
		  var transformMatrix = node.parentNode.getTransformToElement(node);
		  this.dom(node);
		  this.transform = new Transformation(transformMatrix);
		  this.transform.inverse(); //this gives the group its not inverted matrix :)
		}
		
		if (this.dom().attr('id') === undefined) {
		  this.dom().attr('id', 'g' + Math.random());
		}
		
	}
    /*
    Group.prototype.dom = function(optionalDom){
		if (optionalDom === undefined) { //if the parameter is not set (getter)
				return this.domContent;
			  } else { //(setter)
				this.domContent = $(optionalDom);
				return this;
			  }
	}*/


	//TRANSFORMATION
	function Transformation (matrix) {
		this.transformationMatrix = matrix;
		
		this.matrix = function (optionalMatrix) {
		  if (optionalMatrix !== undefined) { //setter
			this.transformationMatrix = optionalMatrix;
		  } else { //getter
			return this.transformationMatrix;
		  }
		}
		
		 this.rotate = function(d, x, y) {
		  if (arguments.length < 3) { // no rotation point specified
			x = 0;
			y = 0;
		  }
		  this.matrix(this.matrix().translate(x, y).rotate(d).translate(-x, -y));

		  return this;
		}
		
		this.scale = function(d) {
		  this.matrix(this.matrix().scale(d));
		  return this;
		}
		
		this.translate = function(x, y) {
		  this.matrix(this.matrix().translate(x, y));
		  return this;
		}

		this.inverse = function() {
		  this.matrix(this.matrix().inverse());
		  return this;
		}

		this.multiply = function(m) {
		  m = m.transformationMatrix || m; // Dizzy.Transformation or CTM (current trans. matrix)?
		  this.matrix(this.matrix().multiply(m));
		  return this;
		}
		
		this.toString = function() {
		  var m = 'matrix';
		  var values = this.toArray().join(', ');

		  return m + '(' + values + ')';
		}

		this.toArray = function() {
		  var matrix = this.matrix();
		  return [matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f];
		}
	};
	
	Transformation.createTransform = function(obj) {
	  
			// obj is Dizzy.Group ?
			if (obj.dom && obj.transformation) {
			  obj = obj.transformation();
			}
			
			// obj is Dizzy.Transformation ?
			if (obj.transformationMatrix) {
			  obj = obj.transformationMatrix;
			}

			// obj is SVG-Element ?
			if (obj.getCTM) {
			  obj = obj.getCTM();
			}

			// obj is an SVGMatrix ?
			if (obj.toString().indexOf('SVGMatrix') >= 0) {
			  return new Transformation(obj);
			}

		};
