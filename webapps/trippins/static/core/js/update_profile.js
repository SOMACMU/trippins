(function($){
	function floatLabel(){
		$(".float-label").each(function(){
			var input = $(this).find("input, select, textarea");
      var label = $(this).find("label");
			// on focus add cladd active to label
			input.focus(function(){
				input.next().addClass("active");
        console.log("focus");
			});
			//on blur check field and remove class if needed
			input.blur(function(){
				if(input.val() === '' || input.val() === 'blank'){
					label.removeClass();
				}
			});
		});
	}
	// just add a class of "floatLabel to any group you want to have the float label interactivity"
	$(function() {
    floatLabel();
  });
  
})(jQuery);