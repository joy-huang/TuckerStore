var accessToken = window.access_token;

var userFeed = new Instafeed({
  get: 'user',
  userId: 'self',
  accessToken: accessToken,
  sortBy: 'most-recent',
  resolution: 'low_resolution',
  limit: 8,
  template: '<a class="instafeed-photo animation large--one-quarter medium--one-quarter small--one-half lazyload" href="{{link}}" data-bg = "{{image}}" style = "background-image:url({{image}}); background-position:center center; background-size:cover;"><div class = "insta-comment-table"><span class="insta-comment"><i class = "icon icon-instagram"></i><br>{{caption}}</span></div></a>',
  after: function() {
    truncateDescriptions();
  }
});
userFeed.run();

function truncateDescriptions(){
$('.insta-comment').each(function() {
    if (!$(this).text().length){
      $(this).html("<i class = 'icon icon-instagram'></i>");
    } else {
    var shortText = $(this).html().substr(0, 120);
    if (shortText.length == 120){
      while (shortText.slice(-1) != ' '){
        shortText = shortText.substring(0, shortText.length - 1);
      }
      shortText = shortText+'...'; 
    }
    $(this).html(shortText);
    }
  });
}