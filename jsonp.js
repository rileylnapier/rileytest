$(document).ready(function(){
                $.ajax({
                    url: 'http://localhost:5000/order/12349',
                    dataType: 'jsonp',
                    success: function(dataWeGotViaJsonp){
                        var text = '';
                        var len = dataWeGotViaJsonp.length;
                        console.log(dataWeGotViaJsonp);
                    }
                });
            })


redis-cli -h angelfish.redistogo.com -p 9807 -a 6dc8306ebc02addc701c1d0a57d4185f

