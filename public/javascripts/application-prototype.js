// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
document.observe("dom:loaded", function() {
  $$('input').each(function(e){
  	if (e.readAttribute('data-observe') != null) {
  		/*e.observe('change', function() {
  			new Ajax.Request(e.readAttribute('data-observe'), {asynchronous:true, evalScripts:true, method:'get', parameters:'search='+e.value });
   		});*/
   		new Form.Element.Observer(e, 0.25, function(element, value) {
   			new Ajax.Request(e.readAttribute('data-observe'), { method:'get', parameters:'search='+e.value });
   		});
  	}
  });
});
