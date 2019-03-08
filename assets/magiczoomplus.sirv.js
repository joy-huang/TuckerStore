var JSONP=(function(){var a=0,c,f,b,d=this;function e(j){var i=document.createElement("script"),h=false;i.src=j;i.async=true;i.onload=i.onreadystatechange=function(){if(!h&&(!this.readyState||this.readyState==="loaded"||this.readyState==="complete")){h=true;i.onload=i.onreadystatechange=null;if(i&&i.parentNode){i.parentNode.removeChild(i)}}};if(!c){c=document.getElementsByTagName("head")[0]}c.appendChild(i)}function g(h,j,k){f="?";j=j||{};for(b in j){if(j.hasOwnProperty(b)){f+=encodeURIComponent(b)+"="+encodeURIComponent(j[b])+"&"}}var i="json"+(++a);d[i]=function(l){k(l);try{delete d[i]}catch(m){}d[i]=null;};e(h+f+"callback="+i);return i}return{get:g}}());

function SirvToggleMT(zoom, spin) {
    if(zoom) {
        setTimeout(function() {
            jQuery('#SirvContainer').hide();
            jQuery('#ImageContainer').show();
        }, 500);
    } else {
        jQuery('#SirvContainer').show();
        jQuery('#ImageContainer').hide();
    }
    return false;
}

function SirvOnDocumentReady() {

    if(typeof(SirvID)=='undefined' || SirvID == '') return;

    var spinURL = document.location.protocol.replace('file:', 'http:')+'//'+SirvID+'.sirv.com/'+SirvSpinsPath.replace(/{product\-id}/g, SirvProductID);

    JSONP.get(spinURL, {}, function(data) {
        jQuery('.MagicZoomPlus').after('<div class="MTGallery"><div id="ImageContainer"><div></div></div><div style="display:none;" id="SirvContainer"></div></div>');
        jQuery('.MagicZoomPlus').appendTo('#ImageContainer div');
        jQuery('#SirvContainer').append('<div class="Sirv" id="sirv-spin" data-src="'+spinURL+'"></div>');
        jQuery('a[rel*="zoom-id"]').each(function() {
            $(this).attr('onclick', 'SirvToggleMT(true, false)');
        });
        jQuery('a[rel*="zoom-id"]:last').after(' <a onclick="return SirvToggleMT(false, true)" href="#"><img id="SirvIcon" style="display:none;" src="'+SirvIconURL+'"/></a>');
        jQuery('a[rel*="zoom-id"]:first img').one('load', function() {
            jQuery('#SirvIcon').attr('height', jQuery(this).height()).show();
        }).each(function() {
            if(this.complete) $(this).load();
        });
        var sirv = document.createElement('script');
        sirv.type = 'text/javascript';
        sirv.async = true;
        sirv.src = document.location.protocol.replace('file:', 'http:') + '//scripts.sirv.com/sirv.js';
        document.getElementsByTagName('script')[0].parentNode.appendChild(sirv);
    });

}

jQuery(function() {  

SirvOnDocumentReady();

if (document.body.innerHTML.replace(/(\r\n|\n|\r)/gm,"").match(/onVariantSelected/gm)) {
	var funcName = document.body.innerHTML.replace(/(\r\n|\n|\r)/gm,"").replace(/.*onVariantSelected *: *(.*?)( |,|}).*/igm,'$1')
    
    if ( funcName!='') {

    	window[funcName+'_old'] = window[funcName];
  		window[funcName] = function(){

  			if (arguments.length && arguments[0]!=null && arguments[0].featured_image!=null) {
    
	    		var largeImage = arguments[0].featured_image.src;
				var isize = Shopify.Image.imageSize(jQuery('a.MagicZoomPlus img').first().attr('src'));
    			var smallImage = Shopify.Image.getSizedImageUrl(arguments[0].featured_image.src, isize); 

    			if (arguments[0].featured_image.product_id!=SirvProductID) return;

    			if (jQuery('.MagicZoomPup').length==0) {
	    			jQuery('a.MagicZoomPlus').attr('href',largeImage)
        			jQuery('a.MagicZoomPlus img').first().attr('src',smallImage);
    			} else {
  					MagicZoomPlus.update(jQuery('a.MagicZoomPlus').attr('id'),largeImage,smallImage);
	    		}

    		}
    		window[funcName+'_old'](arguments[0],arguments[1],arguments[2])
  		}
    }
}

});  
