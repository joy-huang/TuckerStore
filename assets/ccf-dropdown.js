$(function(){
  var options = $( "#filter-options" ).data( "options" );

  $(".ccf-filters.header .filter-title").on('click', function(){
    closeAllTabs();
    $(this).addClass('active');
    var handle = $(this).data('handle');
    $(".ccf-filters.content[handle='"+ handle +"']").addClass("active");
    $(this).closest(".ccf-filters.header").find("span.close").show();
  });

  $(".ccf-filters.header.header-list").on('click', function(e){
    e.stopPropagation();
  });

  $(".ccf-filters.header .list-title").on('click', function(){
    var active = $(this).hasClass('active');
    closeAllTabs();
    if (!active) {
      $(this).addClass('active');
    }
  });

  $(".ccf-filters.header-list .dd-sort li").on('click', function(){
    updateSelectionList($(this));
    var queryParams = parseQueryStringToDictionary(location.search);
    queryParams.sort_by =  $(this).attr("value");
    queryParams.view = "editorial";
    queryParams.page = 1;

    location.search = jQuery.param(queryParams).replace(/\+/g, '%20');
  });

  $(".ccf-filters.header-list .dd-size li").on('click', function(){
    updateSelectionList($(this));
    var tags = getSelectedTags().filter(function(item) {
      return !item.includes("ccf-size");
    });
    tags.push( $(this).attr("value") );
    execFilter(tags);
  });

  $(".ccf-filters.header-list .dd-fabric li").on('click', function(){
    updateSelectionList($(this));
    var tags = getSelectedTags().filter(function(item) {
      return !item.includes("ccf-fabric");
    });
    tags.push( $(this).attr("value") );
    execFilter(tags);
  });

  $(".header-list.size-by .selected-type span.diselect").on("click", function(e) {
    $(this).closest(".selected-type").empty();
    var tags = getSelectedTags().filter(function(item) {
      return !item.includes("ccf-size");
    });

    execFilter(tags);
    return false;
  });

  $(".header-list.sort-by .selected-type span.diselect").on("click", function(e) {
    $(this).closest(".selected-type").empty();
    var queryParams = parseQueryStringToDictionary(location.search)
    queryParams.sort_by = "created-descending";
    queryParams.view = "editorial";

    location.search = jQuery.param(queryParams).replace(/\+/g, '%20');
    return false;
  });

  $("body").on("click", closeAllListTabs);
  $(".ccf-filters.header span.close").on("click", closeAllTabs);

  function closeAllTabs() {
    $(".ccf-filters.header .filter-title").removeClass('active');
    $(".ccf-filters.header .list-title").removeClass('active');
    $(".ccf-filters.content").removeClass('active');
    $(".ccf-filters.header span.close").hide();
  }

  function closeAllListTabs() {
    $(".ccf-filters.header .list-title").removeClass('active');
  }

  function isFilterDragging() {
    return $('.ccf-filters.content').hasClass("is-dragging");
  }

  function getSelectedTags() {
    var tags = location.pathname.split("/");
    if (tags.length > 3) {
      tags = tags[3].split('+').filter(function(item) {
        return item.includes("ccf-");
      });
    } else tags = [];

    return tags;
  }

  function updateSelection(option, type) {
    var selected = $(".ccf-filters .filter-title[type='"+type+"'] .selected-type");
    $(selected).empty();

    $(selected).append($(option).clone());

    $(selected).find("span.diselect").on("click", function(e) {
      $(selected).empty();
      $(".ccf-filters.content[type='"+type+"'] .ccf-option").removeClass("selected");
      performFilter(type);
      return false;
    });
  }

  function updateSelectionList(option) {
    var selection = $(option).closest(".header-list").find(".selected-type");

    $(selection).find("span.selected").empty();
    $(selection).find("span.selected").append($(option).text());
    $(selection).addClass("show-x");
    closeAllTabs();
  }

  function performFilter(type) {
    var options = $(".ccf-filters .filter-title[type='"+type+"'] .ccf-option");

    var tags = getSelectedTags().filter(function(item) {
      return !item.includes("ccf-" + type);
    });

    options.map(function(_,option) {
      tags.push( $(option).data("slug") );
    });

    execFilter(tags);
  }

  function execFilter(tags) {
    var pathArray = location.pathname.split("/").filter(function(item) {
      return !item.includes("ccf-") && item != '';
    });

    if(pathArray.length == 0) {
      pathArray.push("collections");
      pathArray.push("shop-all");
    }
    pathArray.unshift(location.origin);

    tags = tags.join('+');
    pathArray.push(tags);

    var queryParams = parseQueryStringToDictionary(location.search)
    queryParams.sort_by = "created-descending";
    queryParams.view = "editorial";
    queryParams.page = 1;

    var search = "?" + jQuery.param(queryParams).replace(/\+/g, '%20');

    location.href = pathArray.join('/') + search;
  }

  $(".ccf-filters.content").on('click', " .ccf-option", function(){
    if (isFilterDragging() || $(this).hasClass('selected')) {
      return;
    }
    var type = $(this).closest(".ccf-filters.content").attr('type');
    updateSelection( $(this),  type);

    $(".ccf-filters.content .ccf-option").removeClass("selected");
    $(this).addClass('selected');

    performFilter(type);
    closeAllTabs();
  });

  getSelectedTags().map(function(tag){
    var option = $(".ccf-option[data-slug='"+tag+"']");
    var type = $(option).closest(".ccf-filters.content").attr('type');
    if(option && type) {
      updateSelection( $(option),  type);
      $(option).addClass('selected');
    }
  });

  function getParam(name) {
    return (location.search.split(name + '=')[1] || '').split('&')[0];
  }

  function parseQueryStringToDictionary(queryString) {
    var dictionary = {};

    // remove the '?' from the beginning of the
    // if it exists
    if (queryString.indexOf('?') === 0) {
      queryString = queryString.substr(1);
    }

    var parts = queryString.split('&');

    for(var i = 0; i < parts.length; i++) {
      var p = parts[i];

      var keyValuePair = p.split('=');
      if(keyValuePair.length <= 1) continue;

      var key = keyValuePair[0];
      var value = keyValuePair[1];

      // decode URI encoded string
      value = decodeURIComponent(value);
      value = value.replace(/\+/g, ' ');

      dictionary[key] = value;
    }

    return dictionary;
  }

  var sortby = getParam("sort_by");
  if(sortby && sortby.length > 0) {
    var sortOption = $("li[value='"+sortby+"']");
    updateSelectionList(sortOption);
  }

  getSelectedTags().filter(function(item){
  return item.includes("ccf-size");
  }).map(function(tag){
    var option = $("li[value='"+tag+"']");
    if(option && option.length > 0) {
      updateSelectionList(option);
    }
  });

  $('.ccf-filters.content').on('swipe', function(event, slick, direction){
    $(this).addClass("is-dragging");
    setTimeout(function(){$('.ccf-filters.content').removeClass("is-dragging")}, 500);
  });

  $('.ccf-filters.content').slick({
    infinite: false,
    rows: 2,
    speed: 300,
    slidesToShow: 8,
    slidesToScroll: 4,
    variableWidth: true,
    nextArrow: '<button class="slick-next slick-arrow fa fa-chevron-right" aria-label="Next" type="button" style="display: block;" aria-disabled="false"></button>',
    prevArrow: '<button class="slick-prev slick-arrow fa fa-chevron-left" aria-label="Previous" type="button" style="display: block;" aria-disabled="false"></button>',
    responsive: [
      {
        breakpoint: 1600,
        settings: {
          slidesToShow: 7,
          slidesToScroll: 3,
        }
      },
      {
        breakpoint: 1288,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 2,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 2,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
        }
      },
      {
        breakpoint: 380,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      }
    ]
  });
});
