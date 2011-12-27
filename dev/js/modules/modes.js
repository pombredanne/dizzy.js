/*
 * Switches between different modes, making sure there is only one active mode. 
 */
define(['sandbox'], function (sandbox) {
  var modes = {};


  var obj = {
    init: function () {},
    destroy: function () {}
  };

  function startMode(name) {
    var mod = modes[name];
    if (mod === undefined) {
      console.log("Mode " + name + " called but not defined"); //when trying to start a mode not "registered"
    } else {
      console.log("Starting mode: " + name);
      var dependencies = mod.depends || [];
      for (var i = 0; i < dependencies.length; ++i) {
        startMode(dependencies[i]);
      }
      mod.start();
    }
  }

  function stopModes() {
    for (var m in modes) {
      if( modes[m] && typeof modes[m].stop === 'function' ){
        modes[m].stop();
      }
    }
  }
  
  //Chagnged to handle modes and other buttons differently
  sandbox.subscribe('dizzy.ui.toolbar.clicked.mode', function (data, name) { //what's name for???
    stopModes();
    startMode(data.button); // data.button contains the button id (from toolbar.js) that should correspond to the mode name
  });

  sandbox.subscribe('dizzy.modes.register', function (data, name) {
	  //data is usually { name: ...., instance: modenameMode }
    var mod = modes[data.name];
    if (mod === undefined) {
      console.log("Registering mode: " + data.name);
      modes[data.name] = data.instance;
    } else {
      console.log("Mode " + data.name + " already defined");
    }
  });

  return obj;

});
