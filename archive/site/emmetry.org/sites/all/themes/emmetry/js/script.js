jQuery(document).ready(function(){
	jQuery('.view-generations .item-list').hover(function(){
		jQuery(this).addClass('visible');
	},
	function() {
		jQuery(this).removeClass('visible');
	});
});