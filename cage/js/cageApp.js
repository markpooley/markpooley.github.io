//have divs fade in and out based when scrolled to/away
$(document).scroll(function(){
	$('div').each(function(){
		var y = $(document).scrollTop();
		var t = $(this).parent().offset().top;
		if (y > t) {
			$(this).fadIn();
		} else {
			$this.fadeOut();
		}
	})
})