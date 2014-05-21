// web.js
var express = require("express");
var logfmt = require("logfmt");
var request = require("request");
var app = express();
var redis = require('redis-url').connect(process.env.REDISTOGO_URL);
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.use(allowCrossDomain);
app.use(logfmt.requestLogger());

app.get("/order/:order_id/:email", function(req, res) {

    var orderId_param = req.params.order_id;
    var email_param = req.params.email;

    var couponCode = "INGRESSHINT";
    var secret_code = 'not_set';

    var api_key = "apiKeyDrinkHint";
	var url = "https://manage.symphonycommerce.com/api/v2/order/" + orderId_param + "?api_key=" + api_key;

	request({
		uri: url,
		method: "GET",
		timeout: 10000,
		followRedirect: true,
		maxRedirects: 10
	}, 	
	function(error, response, body) {
		try {
			var order = JSON.parse(body);
			
			var email_fromAPI = order.email;
			var couponCode_fromAPI = order.couponCode.code.toString();

			//validate order
	    	if (couponCode == couponCode_fromAPI) {
	    		if (email_param == email_fromAPI) {
		    		redis.hmget("USED_CODES", orderId_param, function(err, value) {

		    			//grab a new value for orderId
						if (!value.toString()) {
								redis.lpop('NEW_CODES', function(err2, value2) {
									secret_code = value2.toString();
									redis.hset("USED_CODES", orderId_param, secret_code);
									res.send(200, {"order_id": orderId_param, "secret_code": secret_code});
								});
							
						}

						//orderId already exists in system 
						else {
							secret_code = value.toString();
							res.send(200, {"order_id": orderId_param, "secret_code": secret_code});
						}
					});
				} 

				//email doesn't match orderId
				else {
					res.send(200, {"order_id": orderId_param, "secret_code": 'wrong_email'});
				}
			} 

			//orderId doesn't have the right couponCode
			else {
	    		res.send(200, {"order_id": orderId_param, "secret_code": 'wrong_couponCode'});
	    	}
	    } 

	    //orderId is invalid
	    catch (e) {
       		res.send(200, {"order_id": orderId_param, "secret_code": 'invalid_orderId'});
    	}
	});
});



var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
