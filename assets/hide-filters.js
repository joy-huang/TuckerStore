var available_options = $('#filter-options').data('options').split(',');

$('.ccf-option').each(function(i, option) {
  if (available_options.indexOf($(option).data('name')) == -1) {
    $(option).remove();    
  }
});

$('.filter-and-tabs-header').click(function(e) {
	e.stopPropagation()
});
