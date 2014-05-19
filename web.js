// web.js
var express = require("express");
var logfmt = require("logfmt");
var app = express();
var redis = require('redis-url').connect(process.env.REDISTOGO_URL);

redis.set('foo', 'bar');

redis.get('foo', function(err, value) {
  console.log('foo is: ' + value);
});


app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send('Hello World!');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
