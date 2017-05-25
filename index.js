'use strict';
var Twitter = require('twitter');
var moment = require('moment-timezone');
var AWS = require('aws-sdk');
var kms = new AWS.KMS();
var fnConfig;

var fnEncryptedConfig = ''; //encrypted blob

var fnConfig;


exports.handler = (event, context, callback) => {

	if (fnConfig) {
        processEvent(event, context, callback);
    } else {
        var encryptedBuf = new Buffer(fnEncryptedConfig, 'base64');
        var cipherText = { CiphertextBlob: encryptedBuf };

        kms.decrypt(cipherText, function (err, data) {
            if (err) {
                console.log("Decrypt error: " + err);
                callback(err);
            } else {
                fnConfig = JSON.parse(data.Plaintext.toString('ascii'));
                processEvent(event, context, callback);
            }
        });
    }

callback(null, 'function executed successfully');
};

var processEvent = function (event, context, callback) {

	console.log("processEvent Function Started");
	console.log("function config " + fnConfig.consumer_key);

    //var consumer_key1 = "'"+fnConfig.consumer_key+"'";
    //var consumer_secret1 = "'"+fnConfig.consumer_secret+"'";
    //var access_token_key1 = "'"+fnConfig.access_token_key+"'";
    //var access_token_secret1 = "'"+fnConfig.access_token_secret+"'";

	
	var client = new Twitter({
	consumer_key: fnConfig.consumer_key,
	consumer_secret: fnConfig.consumer_secret,
	access_token_key: fnConfig.access_token_key,
	access_token_secret: fnConfig.access_token_secret
	});



	console.log("Client Created Successfully" + client.toString());

	var dateandtime = moment().tz("Asia/Kolkata").format('MMMM Do YYYY');
	var day = moment().tz("Asia/Kolkata").format('dddd');

	console.log("Its "+day+", "+dateandtime+" IST, Hello People! Happy tweeting!");

	var demotweet = {status: 'Its '+day+', '+dateandtime+' IST, Hello People! Happy tweeting!'}

	client.post('statuses/update', demotweet,  function(error, tweet, response) {
	if(error) throw error;
	console.log(tweet);  // Tweet body.
	console.log(response);  // Raw response object.
	});


	console.log('tweet send ' + dateandtime);

};
