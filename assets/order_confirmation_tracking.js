(function () {
	
  	// check if user is first time thru checkout
    if (!Cookies.get('HAS_ORDERED')) {
        
    	Cookies.set('HAS_ORDERED', '1');
            
      	if (Cookies.get('INITIATED_CHECKOUT')) {
      		Cookies.remove('INITIATED_CHECKOUT');
		}
     
    }
	
	
	// if currently HAS_ORDERED
	if (Cookies.get(HAS_ORDERED) {
		window.dataLayer.push({ 
 			'HAS_ORDERED': 1
 		}); 		
	}	

	// if user is from FB Prospecting
	if (Cookies.get(FB_LEAD) {
		window.dataLayer.push({ 
 			'FB_LEAD': 1
 		}); 		
	}

	// if user is an email subscriber
	if (Cookies.get(EM_SUB) {
		window.dataLayer.push({ 
 			'EM_SUB': 1
 		}); 		
	}


});
