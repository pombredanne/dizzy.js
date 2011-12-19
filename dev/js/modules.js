/**
 * List of all modules that should be involved in the build process
 * When adding a new module, add its name to the array below. It will automatically be loaded and included in the build process.
 */
define(
 [
    'modules/canvas', 'modules/modes',
    'modules/io/mouse', 
    'modules/ui/dialog', 'modules/ui/toolbar', 'modules/ui/toolbar.menu', 'modules/ui/toolbar.control',
    'modules/modes/canvas/pan', 'modules/modes/canvas/zoom', 'modules/modes/canvas/zebra',
    'modules/modes/tool/default', 'modules/modes/tool/image', 'modules/modes/tool/path', 'modules/modes/tool/rect', 'modules/modes/tool/text',
    /*'modules/ui/slider', 'modules/ui/slider_filler', */'modules/ui/image_drop',
    'modules/modes/tool/line'
  ], function(){
  return arguments;
});
