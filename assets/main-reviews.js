

var reviewsImageAndSharing = {};

$(function () {
  function getURLParamValue(param) {
    var regex = new RegExp(param + '=([^&]+)');
    var match = document.URL.match(regex);
    return (match && match.length > 1) ? match[1] : "";
  }
  $(function (doc, s, id) { //receive facebook sdk data
    reviewsImageAndSharing = function (reviewId) {
      var loadEvents = function (ReviewData) {
        $('.tw-modal-outer').click(function () {
          $('#tw-modal-container').fadeOut(500);
          $('#tw-modal-outer').fadeOut(500);
        });
        $('#filePhoto').on('change', function () {
          var reader = new FileReader();
          reader.onload = function (event) {
            if (event.target.result) {
              $('.uploader img').attr('src', event.target.result);
            }
          };
          reader.readAsDataURL(event.target.files[0]);

          $('.btn-img-upload').removeClass('disable');
          $('.img-icon').removeClass('visible');
        });

        $('#rw-img-modal-container #cancel').on('click', function () {
          openReviewImageModal(false);
          ReviewData.imageToShare = ReviewData.productImage;
          if (FacebookSharingData.length <= 0) {
            logger('error getting facebook data');
            return;
          }
          FacebookSharingData.image = ReviewData.imageToShare;
          openThankYouMessage(true, FacebookSharingData);
        }.bind(this, ReviewData, FacebookSharingData));
        $('#imgReviewUpload').submit(function () {
          event.preventDefault();
          return false;
        });
        $('.btn-img-upload').click(function () {

          var imgBase64 = $('#uploadedImage').attr("src");
          var imgInput = $("input[name='review_image']");
          var imgUpload = imgInput[0].files[0];

          if (!imgUpload) {
            logger('error loading image for review');
            return;
          }

          var requestData = {
            name: imgUpload.name,
            size: imgUpload.size,
            type: imgUpload.type,
            imgBase64: imgBase64
          }

          submitImageReview(requestData, ReviewData);
        }.bind(this, ReviewData));
      };

      var FacebookSharingData = {};

      var loadReview = function (reviewsData) {
        var url = reviewsData.app + 'get-reviews?shop=' + reviewsData.shop + '&reviewID=' + reviewsData.reviewId;
        $.ajax({
          async: false,
          type: "get",
          url: url,
          success: function (responseData, textStatus, jqXHR) {
            FacebookSharingData = {
              description: responseData.title,
              title: responseData.fit,
              link: 'https://' + window.location.hostname + window.location.pathname + '?reviewId=' + reviewsData.reviewId
            };
            openReviewImageModal(true);
          },
          error: function (jqXHR, textStatus, errorThrown) {
            logger('error getting the data of review');
            return;
          }
        });
      };

      var openReviewImageModal = function (show) {
        if (show) {
          $('#rw-img-modal-container').fadeIn(500);
          $('#rw-img-modal-outer').fadeIn(500);
          $("html, body").animate({ scrollTop: 0 }, "slow");
        } else {
          $('#rw-img-modal-container').fadeOut(500);;
          $('#rw-img-modal-outer').fadeOut(500);;
        }
      };

      var openThankYouMessage = function (show, data) {
        if (!data) {data = {}};
        if (show) {
          if (data.length <= 0) {
            logger('data is missing for facebook sharing modal');
            return;
          }

          $('#share > a').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            openFacebookSharingModal(data);
          });

          $('#tw-modal-container').fadeIn(500);
          $('#tw-modal-outer').fadeIn(500);
        } else {
          $('#tw-modal-container').fadeOut(500);
          $('#tw-modal-outer').fadeOut(500);
        }
      };

      var openFacebookSharingModal = function (data) {
        // Open FB share popup
        FB.ui({
          method: 'share_open_graph',
          mobile_iframe: true,
          action_type: 'og.shares',
          action_properties: JSON.stringify({
            object: {
              'og:url': data.link,
              'og:title': data.title,
              'og:description': data.description,
              'og:image': data.image
            }
          })
        },
          function (response) {
            openThankYouMessage(false);
          });
      };

      var submitImageReview = function (requestData, reviewsData) {
        var requestURL = reviewsData.app + 'add-review-image?shop=' + reviewsData.shop + '&reviewId=' + reviewsData.reviewId;

        var formEl = $(this);
        var submitButton = $('.btn-img-upload', formEl);
        $('.uploader *').hide();
        $('#uploadedImage').hide();
        $('#loadingMsj').show();
        $.ajax({
          type: "post",
          url: requestURL,
          data: requestData,
          timeout: 8000,
          success: function (responseData, textStatus, jqXHR) {
            var image = textStatus.imgUrl || responseData.imgUrl;
            if (image) {
              FacebookSharingData.image = image;
              $('.uploader img').attr('src', image);
            } else {
              logger('error getting image url after uploading');
              FacebookSharingData.image = reviewsData.productImage;
              $('.uploader img').attr('src', '');
            }
            openReviewImageModal(false);

            openThankYouMessage(true, FacebookSharingData);
            return true;
          }.bind(this, reviewsData),
          error: function (jqXHR, textStatus, errorThrown) {
            logger('error submiting the image review');
            openReviewImageModal(false);
            FacebookSharingData.image = reviewsData.productImage;
            openThankYouMessage(true, FacebookSharingData);
          },
          complete: function () {
            $('#loadingMsj').hide();
          }

        });
      };

      var init = function (reviewId) {
      var js, fjs = doc.getElementsByTagName(s)[0];

      if (doc.getElementById(id)) {
        logger('failed to load facebook sdk');

      } else {
        js = doc.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_GB/all.js";
        fjs.parentNode.insertBefore(js, fjs);
      }


      var $reviewsContainer = $('#reviews-container');

      if ($reviewsContainer.length <= 0) {
        logger('reviews container doesn\'t exist');
        return;
      }

      var reviewsData = $('#reviews-container').data();

      if (!(reviewsData.app && reviewsData.bodyname && reviewsData.facebookAppId && reviewsData.shop)) {
        logger('missing data: ', reviewsData);
        return;
      }

      window.fbAsyncInit = function () {
        FB.init({
          appId: reviewsData.facebookAppId,
          xfbml: true,
          version: 'v2.12'
        });
      };
      reviewsData.reviewId = reviewId;
      reviewsData.productImage = $('meta[property="og:image"]').attr('content');
      loadEvents(reviewsData);
      loadReview(reviewsData);
    };

    return {
      init: init
    };
  };

    if (!!document.URL.match(/reviewId=/) && !document.URL.match(/fb_action_types=/)) {
      logger('reviewing from email');
      var reviewId = getURLParamValue("reviewId") || $('body').data("reviewId");
      reviewsImageAndSharing().init(reviewId);
    }
  }(document, 'script', 'facebook-jssdk'));
});


$(function () {
  var container = $('#reviews-container');

  if (container.length <= 0) return;

  /**
  params: all required.
    container.data => {
      shop
      bodyname
      pid
      app => server url
      limit => reviews request by page
    }
  */
  var options = container.data();
  options.shop = options.shop.toLowerCase();
  options.url = options.app;

  function daysBetween(startDate, endDate) {
    if (!endDate) {endDate = new Date()};
    var timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
    get reviews with pagination
  */
  var page = 0;
  var ReviewsPagination = {
    reviewsRendered: 0,
    inProgress: false,
    stopAll: false,
    shouldDeny: function () {
      return this.stopAll || this.inProgress;
    },
    start: function () {
      paginateReviews(options);
      return this.inProgress = true;
    },
    performed: function () {
      this.inProgress = false;
      $("body").trigger('ReviewsLoaded');
      $("#loadMoreReviews").show();
    },
    noResults: function () {
      this.stopAll = true;
      $("body").addClass('has-no-reviews');
      $("body").trigger('HasNoReviews');
    },
    end: function () {
      this.stopAll = true;
      $("#loadMoreReviews").hide();
      $("body").addClass('all-reviews-fetched');
      $("body").trigger('AllReviewsFetched');
    }
  }

  function formatDisplay(data) {
    for (var i = data.length - 1; i >= 0; i--) {
      var d = data[i];
      d.lastname = d.lastname || '';
      d.name = d.firstname + " " + d.lastname.charAt(0);
      if (d.height) {
        d.height = d.height.replace(".", "'").replace(' ', "'");
      }
      var days = parseInt(daysBetween(new Date(d.created_at)));
      d.date = days > 0 ? (days + " days ago") : "less than 24 hours ago";
    };
  }

  function renderReviews(data, targetSelector) {
    data.forEach(function (review) {
      if (review && !review.rwImgUrl) {
        review.noReviewImage = "no-review-img";
      }
      var date = new Date(review.created_at),
        locale = "en-us";
      review.formatedDate = date.toLocaleString(locale, { month: "long", day: 'numeric', year: "numeric" });
    });
    formatDisplay(data);
    renderTemplateWithData("#rw-single-template", targetSelector, data);
    // $('.review-image img.lazy').lazyload();
    $('.review-information input').each(function (index, target) {
      if (!$(target).hasClass('slided')) {
        $(target).addClass('slided');
        $(target).bootstrapSlider({ enabled: false });
      }
    });
  }

  function paginateReviews(options) {
    page = (page + 1) || 1;

    var reviewsUrl = options.url
      + 'get-reviews-and-backfills?shop=' + options.shop
      + '&pid=' + options.pid
      + '&bodyName=' + options.bodyname
      + '&limit=' + options.limit
      + '&page=' + page;

    $.ajax({
      url: reviewsUrl,
      method: "GET",
      success: function (data) {
        if (data.reviews.length > 0) {
          renderReviews(data.reviews, "#productReviews");
          $("body").addClass('has-reviews');
          ReviewsPagination.performed();
        }
        ReviewsPagination.reviewsRendered += data.reviews.length;
        if (ReviewsPagination.reviewsRendered == data.reviewsCount && data.reviewsCount >= 5) {
          ReviewsPagination.end();
          return;
        }
        if (data.backfills.length > 0 && data.reviewsCount < 5) {
          renderReviews(data.backfills, "#backfillReviews");

          $("body").addClass('has-backfills');
          ReviewsPagination.performed();
        }

        if (data.reviews.length == 0 && data.reviewsCount >= 5) {
          ReviewsPagination.end();
        }

        if (data.reviews.length == 0 && data.backfills.length == 0) {
          ReviewsPagination.end();
        }

        if (page == 1 && !(data.reviews.length > 0 || data.backfills.length > 0)) {
          ReviewsPagination.noResults();
        }
        var allReviewsCount = data.reviewsCount + data.backfillsCount;
        if ($('.rw-row').length >= allReviewsCount) {
          ReviewsPagination.end();
        }
      }
    });

  }

  ReviewsPagination.start();

  $("#loadMoreReviews").on("click", function () {
    $("#loadMoreReviews").hide();
    if (ReviewsPagination.shouldDeny()) return;

    ReviewsPagination.start();
  });

  /**
    get star-rating and average-fit
  */
  var ratingUrl = options.url
    + 'get-average-data?shop=' + options.shop
    + '&pid=' + options.pid
    + '&bodyName=' + options.bodyname
    + '&overallRating=true';

  $.ajax({
    url: ratingUrl,
    method: "GET",
    success: function (data) {
      if (data.start_rating) {
        var info = {
          rating: (data.start_rating % 1 !== 0 ? (data.start_rating - (data.start_rating % 1)) + ' half specific' : data.start_rating),
          count: data.reviews_count
        };

        var targetQuery = ".reviews-rating-" + data.pid;
        $(targetQuery).each(function (index, target) {
          renderTemplateWithData("#start-rating-template", target, [info]);
        });
        $("body").addClass('has-star-rating');
      }

      if (data.start_rating_general) {
        var info = {
          rating: (data.start_rating_general % 1 !== 0 ? (data.start_rating_general - (data.start_rating_general % 1)) + ' half general' : data.start_rating_general),
          count: data.reviews_count_general
        };

        var targetQuery = ".reviews-rating-" + data.pid;
        $(targetQuery).each(function (index, target) {
          renderTemplateWithData("#start-rating-template", target, [info]);
        });
        $("body").addClass('has-star-rating');
      }

      if (data.body_fit) {
        renderTemplateWithData("#average-fit-template", "#overall-fit-body-rating", [0]);
        $("#overall-fit-body-rating").find('input').bootstrapSlider({ enabled: false, value: data.body_fit });
        $("body").addClass('has-body-fit');
      }
    }
  });
});

$(function () {
  function workWithFitData(data, target) {
    var bodyFit = data.body_fit || 3;
    if (data.start_rating) {
      var info = {
        rating: (data.start_rating % 1 !== 0 ? (data.start_rating - (data.start_rating % 1)) + ' half' : data.start_rating),
        count: data.reviews_count
      };
      renderTemplateWithData("#start-rating-template", "#overall-fit-bodyName", [info]);
    }

    renderTemplateWithData('#average-fit-template', "#overall-fit-bodyName", [bodyFit]);
    target.find('input').bootstrapSlider({ enabled: false, value: bodyFit });
    target.show();
  };

  var container = $('#product-review-page-container');
  var shop = container.data('shop');
  var baseUrl = container.data('app');

  if (!shop || !baseUrl || container.length == 0) {
    return;
  };

  shop = shop.toLowerCase();

  $("#review-filter #rw-filter-by").on('change', function () {

    var filter = this.value;
    var target = $("#overall-fit-bodyName");
    target.empty();

    if (filter == '') {
      return;
    }
    var localData = CustomLocalStorage.load('fitData[' + filter + ']');
    if(!localData)
    {
      var url = baseUrl
      + 'get-average-data?shop=' + shop
      + '&bodyName=' + filter
      + '&overallRating=true';

      $.ajax({
        url: url,
        method: "GET",
        success: function(data) {
          workWithFitData(data, target);
          CustomLocalStorage.save('fitData[' + filter + ']', data, 12); // Expire in 12 hours
        }
      });
    } else {
      workWithFitData(localData, target);
    }
  });

  clearReviewfilters("#review-sorter #rw-sort-by", "rwsortby", baseUrl);
  var template = "#rw-product-page-template";
  var sortOption = reviewsRequestSortOption();
  sortOption = (sortOption && sortOption.length > 1) ? sortOption[1] : "latest";

  var filterOption = reviewsRequestFilterOption();
  filterOption = (filterOption && filterOption.length > 1) ? filterOption[1] : "";

  var bodynameUrl = baseUrl + 'get-bodynames?shop=' + shop;
  var url = baseUrl + 'get-reviews?shop=' + shop + "&rwsortby=" + sortOption + "&rwfilterby=" + filterOption;


  $.ajax({
    url: bodynameUrl,
    method: "GET",
    success: function (data) {
      data = JSON.parse(data);
      var filter = $("#review-filter #rw-filter-by");
      data.map(function (body) {
        var opt = ' <option value="' + body.bodyName + '">' + body.bodyName + '</option>'
        filter.append(opt);
      });
      clearReviewfilters("#review-filter #rw-filter-by", "rwfilterby", baseUrl);
    }
  });

  var runOnScroll = function (evt) {
    // not the most exciting thing, but a thing nonetheless
    if ($(window).scrollTop() >= ($(document).height() - $(window).height()) * 0.85) {
      var page = $('#rw-page').val();
      if (page <= 0) {
        // No more reviews available
        return;
      }

      window.removeEventListener("scroll", runOnScroll);
      var sort = $("#review-sorter #rw-sort-by").val();
      var filter = $("#review-filter #rw-filter-by").val();

      var url = baseUrl + 'get-reviews?shop=' + shop + "&rwsortby=" + sort + "&rwfilterby=" + filter + "&page=" + page;
      queryAndRenderReviews(url, template, false, function (data) {
        data.length > 0 ? $('#rw-page').val(parseInt(page) + 1) : $('#rw-page').val(0);
        window.addEventListener("scroll", runOnScroll);
      });
    }
  };

  queryAndRenderReviews(url, template, false, function (data) {
    if (data.length > 0) {
      window.addEventListener("scroll", runOnScroll);
      $('#rw-page').val(2);
    }
  });
});

function clearReviewfilters(selector, queryParam, baseUrl) {
  var select = $(selector);
  var template = "#rw-product-page-template";
  var container = $('#product-review-page-container');
  var shop = container.data('shop').toLowerCase();

  select.on('change', function () {
    var sort = $("#review-sorter #rw-sort-by").val();
    var filter = $("#review-filter #rw-filter-by").val();
    var url = baseUrl + 'get-reviews?shop=' + shop + "&rwsortby=" + sort + "&rwfilterby=" + filter + "&page=1";
    queryAndRenderReviews(url, template, true);
    // set next page to lookup
    $('#rw-page').val(2);
  });
}

function getQueryParam(param) {
  var found;
  window.location.search.substr(1).split("&").forEach(function (item) {
    if (param == item.split("=")[0]) {
      found = item.split("=")[1];
    }
  });
  return found;
};

function insertParamAndResetPage(key, value) {
  key = encodeURI(key); value = encodeURI(value);
  var kvp = document.location.search.substr(1).split('&');
  var shouldInsert = true;
  var i = kvp.length;
  var x;

  while (i--) {
    x = kvp[i].split('=');

    if (x[0] == key) {
      x[1] = value;
      kvp[i] = x.join('=');
      shouldInsert = false;
    }

    if (x[0] == "page") {
      x[1] = 1;
      kvp[i] = x.join('=');
    }
  }

  if (shouldInsert) { kvp[kvp.length] = [key, value].join('='); }
  return kvp.join('&');
}

function reviewsRequestSortOption() {
  return document.URL.match(/rwsortby=([^&]+)/);
}

function reviewsRequestFilterOption() {
  return document.URL.match(/rwfilterby=([^&]+)/);
}

function queryAndRenderReviews(url, template, reset, callback) {
  $.ajax({
    url: url,
    method: "GET",
    success: function (data) {
      data = JSON.parse(data);
      data = data.map(function (review) {
        review.published = review.published ? "" : "disabled-link";
        if (review && !review.rwImgUrl) {
          review.noReviewImage = "no-review-img";
        }
        return review;
      });
      formatDisplay(data);
      if (reset) {
        $("#product-review-page-container").html('');
      }
      renderTemplateWithData(template, "#product-review-page-container", data);
      $('.rw-row input').each(function (index, target) {
        $(target).bootstrapSlider({ enabled: false });
      });
      $('.disabled-link').on('click', false);

      if (callback) callback(data);
    }
  });

  function formatDisplay(data) {
    for (var i = data.length - 1; i >= 0; i--) {
      var d = data[i];
      d.lastname = d.lastname || '';
      d.name = d.firstname + " " + d.lastname.charAt(0);
      if (d.height) {
        d.height = d.height.replace(".", "'").replace(' ', "'");
      }
      var days = parseInt(daysBetween(d.created_at));
      d.date = days > 0 ? (days + " days ago") : "less than 24 hours ago";
    };
  }

  function treatAsUTC(date) {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
  }

  function daysBetween(startDate, endDate) {
    endDate = endDate || new Date();
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
  }
}

function renderTemplateWithData(templateSelector, target, data) {
  var template = getTemplateById(templateSelector);

  $(target).append(data.map(function (props) {
    return template.map(function (tok, i) {
      return (i % 2) ? props[tok] : tok;
    }).join('');
  }));
}

function getTemplateById(tid) {
  return $(tid).text().split(/\$\{(.+?)\}/g);
}

// review modal
$(function () {
  var reviewId = getURLParamValue("reviewId") || $('body').data("reviewId");
  var $modalContainer = $('#rw-modal-container');
  var $darkOverlay = $('#rw-modal-outer');
  var heightInput = $("input[name='height']");
  var feetInput = $("select#rw-ft");
  var inchestInput = $("select#rw-in");
  var app = $modalContainer.data('app');
  var shop = $modalContainer.data('shop');

  inchestInput.on('change', updateHeight);
  feetInput.on('change', updateHeight);
  $darkOverlay.on('click', function () {
    showReviewModal(false);
  });

  $('#tw-modal-outer').on('click', function () {
    $('#tw-modal-container').fadeOut(500);
    $('#tw-modal-outer').fadeOut(500);
  });

  function onCustomerResquest(customer) {
    if (Object.keys(customer).length <= 0) return;

    var heightValues = customer.height.replace('"', '').split(".");
    var feet = heightValues[0] || 4;
    var inches = heightValues[1] || 0;

    $("input[name='firstname']").val(customer.first_name);
    $("input[name='lastname']").val(customer.last_name.substring(0, 1));
    $("input[name='city']").val(customer.city);
    $("input[name='state']").val(customer.state);
    $("input[name='email']").val(customer.email);
    feetInput.val(feet);
    inchestInput.val(inches);

    var $btnSubmit = $(".form-submit button");
    if ($btnSubmit.html() == "CONTINUE") {
      $btnSubmit.html('SUBMIT');
    }
  }

  $('.custumer-email input[name=email]').on('validation', function (evt, valid) {
    if ($(this).hasClass("token")) {
      $(this).removeClass("token");
      return;
    }

    if (valid) {
      var customerUrl = app + "get-customers?shop=" + shop
        + "&email=" + this.value;

      $.ajax({
        url: customerUrl,
        method: "GET",
        success: onCustomerResquest
      });
    }
  });

  $(".rw-form").submit(function (e) {
    e.preventDefault();
    showReviewModal(false);
    var KVdata = $(this).serializeArray().reduce(function (obj, item) {
      obj[item.name] = item.value;
      return obj;
    }, {});
	var container = $('#product-review-page-container');
  	var shop = container.data('shop');
    var data = $(this).serialize();
    data += "&pUrl=" + location.pathname;
    var url = app + 'new-review?shop=' + shop;
    $.ajax({
      type: "post",
      url: url,
      data: data,
      success: function (responseData, textStatus, jqXHR) {
        if (responseData.review_id) {
          var reviewId = responseData.review_id;
          $('body').data("reviewId", reviewId);
          var baseUrl = $('#reviews-container').data('app');
          reviewsImageAndSharing().init(reviewId);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown);
      }
    })
  });

  if ($(".grid.product-single").length > 0 && shouldShowReviewModal()) {
    showReviewModal(true);

    var token = getURLParamValue("token");
    if (token.length > 0) {
      var customerUrl = app + "get-customers?shop=" + shop
        + "&token=" + token;

      $.ajax({
        url: customerUrl,
        method: "GET",
        success: onCustomerResquest,
      }).done(function () {
        $("input[name='email']").addClass("token");
        $("input[name='email']").validate();
      });
    }

    populateReviewData();
  }

  $.validate({
    lang: 'en'
  });

  function updateHeight() {
    var value = (feetInput.val() == "" ? 0 : feetInput.val()) + "." + inchestInput.val() + '"';
    heightInput.val(value);
  }

  function populateReviewData() {
    //TODO: refactor to be dynamic ;)
    var paramsMap = {
      rate: getURLParamValue("rate"),
      fit: getURLParamValue("fit"),
      size: getURLParamValue("size"),
      title: getURLParamValue("title"),
      rw: getURLParamValue("rw"),
      email: getURLParamValue("email"),
    };

    if (paramsMap.rate.length > 0) {
      $("input[value='" + paramsMap.rate + "'][name='starRating']").attr("checked", true);
    }

    if (paramsMap.fit.length > 0) {
      $("input[name='overallFit']").slider('setValue', paramsMap.fit);
    }

    if (paramsMap.size.length > 0) {
      $("select[name='sizeOrdered']").val(paramsMap.size);
    }

    if (paramsMap.title.length > 0) {
      $('input[name="title"]').val(paramsMap.title.replace(/%20/g, ' '));
    }

    if (paramsMap.rw.length > 0) {
      $('textarea[name="fit"]').val(paramsMap.rw.replace(/%20/g, ' '));
    }

    if (paramsMap.email.length > 0) {
      $('input[name="email"]').val(paramsMap.email).change().focus();
    }
  }
});

function getURLParamValue(param) {
  var regex = new RegExp(param + '=([^&]+)');
  var match = document.URL.match(regex);
  return (match && match.length > 1) ? match[1] : "";
}

function shouldShowReviewModal() {
  return !!document.URL.match(/show-review=true/);
}

function showReviewModal(show) {
  if (show) {
    $('#rw-modal-container').fadeIn(300);
    $('#rw-modal-outer').fadeIn(300);
    $("html, body").animate({ scrollTop: 0 }, "slow");
  } else {
    $('#rw-modal-container').fadeOut(300);
    $('#rw-modal-outer').fadeOut(300);
  }
}

var logger = function (msj) {
  if ($('body').data('debug')) {
    alert(msj);
  } else {
    console.log(msj);
  }
};

var CustomLocalStorage = {
  save : function(key, jsonData, expirationHours){
    if (typeof (Storage) == "undefined") { return false; }
    var expirationMS = expirationHours * 60 * 1000 * 60; // hours in ms
    var record = {value: JSON.stringify(jsonData), timestamp: new Date().getTime() + expirationMS}
    localStorage.setItem(key, JSON.stringify(record));
    return jsonData;
  },
  load : function(key){
    if (typeof (Storage) == "undefined") { return false; }
    var record = JSON.parse(localStorage.getItem(key));
    return (record && new Date().getTime() < record.timestamp && JSON.parse(record.value));
  }
};
