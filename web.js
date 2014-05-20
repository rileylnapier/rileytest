// web.js
var express = require("express");
var logfmt = require("logfmt");
var app = express();
var redis = require('redis-url').connect(process.env.REDISTOGO_URL);

app.use(logfmt.requestLogger());

app.get("/order/:order_id/:email", function(req, res) {

    var order_id = req.params.order_id;
    var email = req.params.email;
    var coupon = "ingressHint";
    var secret_code = 'not_set';

    //use order_id, email and coupon to verify order using symphony API
    if (true) {
    	redis.hmget("USED_CODES", order_id, function(err, value) {
    		//console.log(value);
			if (!value.toString()) {
					redis.lpop('NEW_CODES', function(err2, value2) {
						secret_code = value2;
						redis.hset("USED_CODES", order_id, secret_code);
						res.send(200, {"order_id": order_id, "secret_code": secret_code});
					});
				
			} else {
				secret_code = value;
				res.send(200, {"order_id": order_id, "secret_code": secret_code});
			}
		});

    } else {
    	res.send(200, {"order_id": order_id, "secret_code": 'invalid'});
    }

    
	
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
