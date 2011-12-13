/*
 * The image_drop module makes the canvas droppable and add the image dropped to the svg
 */
define(['sandbox'], function (sandbox) {
  var canvas;
  var enabled = false;
  
  var canvasDrop = {
    start: function () {
      enabled = true;
    },

    stop: function () {
      enabled = false;
    }
  };
  
  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    //canvas = c.canvas;
    setDroppable("Text");
    console.log("Canvas made droppable");
      
	setDraggable("Text");
	//console.log("Images made draggable (transfering source)");
  });
  
  //set the canvas droppable, and insert the image in the svg when dropped
  var setDroppable = function(dataToGet){
		var cnvs=$("#dizzy");
		//Indica al browser su quali elementi puoi trascinare gli oggetti (punto 3)
		cnvs
		//dragenter dragleave dragover di solito sono usati per cambiare l'aspetto grafico
		.bind("dragenter", function (ev){
			//$(this).css("background-color", "#CCFFFF")
			return false;
		})
		.bind("dragleave", function (ev){
			$(this).css("background-color", "white");
			return false;
		})
		.bind("dragover", function (ev){
			$(this).css("background-color", "#CCFFFF");
			return false;
		})
		//Indica cosa fare una volta avvenuto il drop (punto 4)
		.bind("drop", function (ev){
			$(this).css("background-color", "white");
			//Impedisce al browser di selezionare il testo invece di trascinare gli elementi(per internet explorer 9)
			if (ev.preventDefault) {
				ev.preventDefault();
			}
			//recupero i dati salvati in precedenza e li uso per modificare il contenuto del target
			var tmp = ev.originalEvent.dataTransfer.getData(dataToGet);
			//this.innerHTML = tmp;
		
		// Uses the image insertion of the image_tool :] ???
		// Must insert the image at the EXACT point of the drop
        sandbox.publish('dizzy.presentation.insertImage', {
            ref: tmp
          });
			
			//canv.image(75, 75, 50, 50, tmp);
			//alert("Img: "+tmp);
			return false;
		});
  }
  
  
  //set all the images of the page as draggable and set the source as the to-transfer property
  // (not needed in Firefox)
  var setDraggable = function (dataToSet) {
	  //Indica al browser gli elementi trascinabili e cose fare dei dati di questi elementi (punto 1 e 2)
	  //$(document).delegate("*:not(img)", "dragstart", function(ev){});
	  $(document).delegate("img", "dragstart", function(ev){
			//con queste due righe di codice si salva una parte dei dati
			var dt = ev.originalEvent.dataTransfer;
			dt.setData(dataToSet, $(this).attr("src"));
			//dataToSet è solo una stringa di riferimento che dovrà essere uguale nel droppable
			//per trasferire e recuperare i dati giusti (qui trasferisco la descrizione alternativa dell'immagine)
			return true;
			//ev.stopPropagation(); //to prevent strange div-drag event xD
	  });
  }
	
  return {
    init: function () {},
    destroy: function () {}
  };
});
