// This gets enclosed in side #SizeChartOverlay in layout/theme.liquid
$(function() {
  $('.size-chart-close-overlay').click(function() {
    $('#SizeChartOverlay').hide();
  });

  $('.size-chart-show-overlay').click(function() {
    $(window).scrollTop(0);
    ga('send', 'event', 'Engagement', 'Size Chart', 'Open');
    $('#SizeChartOverlay').show();
  });

  $('.size-chart').click(function(e) {
    e.stopPropagation(); // prevent from bubbling up and closing.
  })

  $('#SizeChartOverlay').click(function(e) {
    $('#SizeChartOverlay').hide();
  })
});