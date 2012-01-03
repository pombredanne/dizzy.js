/**
 * Loads up all modules and kicks off the application.
 */
define(['./libs/jquery.js', './libs/util.js', './libs/jscolor.js','application', 'moduleLoader'], function(jq, util, color, application, modules){ // NOTE: jq and util will undefined. 
  $(function(){
    application.startAll();
  });
});
