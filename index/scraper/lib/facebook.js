"use strict";

var request = require('request'),
    api_url = 'https://graph.facebook.com/v2.5/';

//website URL on facebook (comment/likes/share)
module.exports.linkInteractions = function(link, callback) {

    link = 'https://api.facebook.com/restserver.php?format=json&method=links.getStats&urls=' + link;
    //link = 'http://graph.facebook.com/?ids=' + link;

    //headers:http_headers
    request({uri: link, gzip:true, encoding: null}, function (error, response, body) {

        if (error) {
            console.log(chalk.white.bgRed(error.toString()));
            return callback(error);
        }

        return callback(null, body.toString());

    })
}

//read comments
module.exports.linkComments = function(link, callback) {

    var access_token = module.exports.accessToken(1);

    //facebook url object_id
    request({uri: api_url + '?access_token=' + access_token + '&ids=' + encodeURI(link), gzip:true, encoding: null}, function (error, response, body) {

        if (error) {
            console.log(chalk.white.bgRed(error.toString()));
            return callback(error);
        }

        //http status error
        else if (response.statusCode != 200) {
            console.log(chalk.white.bgRed(response.statusCode));
            var error = new Error("Request HTTP status code: " + response.statusCode);
            return callback(error);
        }

        try {

            var response = JSON.parse(body.toString());

            //console.log(JSON.stringify(facebook_object))
            //comments exists
            if(response[link] && response[link].og_object && response[link].og_object.id && response[link].share && response[link].share.comment_count) {

                //console.log( response[link].og_object.id)
                //console.log(response[link].share.comment_count)
                var facebook_object_id = response[link].og_object.id;
                request({uri: api_url + response[link].og_object.id + '/comments?access_token=' + access_token, gzip:true, encoding: null}, function (error, response, body) {

                    if (error) {
                        console.log(chalk.white.bgRed(error.toString()));
                        return callback(error);
                    }

                    //http status error
                    else if (response.statusCode != 200) {
                        console.log(chalk.white.bgRed(response.statusCode));
                        var error = new Error("Request HTTP status code: " + response.statusCode);
                        return callback(error);
                    }

                    try {

                        var response = JSON.parse(body.toString());
                        var comments = [];

                        //console.log(JSON.stringify( response))

                        //comments exists
                        if(response.data && response.data.length){
                            response.data.forEach(function(comment){
                                comments.push({
                                    'description':comment.message,
                                    'author':comment.from.name,
                                    'author_image': 'https://graph.facebook.com/' + comment.from.id + '/picture'
                                })

                            })

                        }

                        return callback(null, comments)


                    }

                    catch (e) {
                        return callback(e);
                    }

                })

            }
            else {
                return callback(null, {})
            }


        }

        catch (e) {
            return callback(e);
        }

    })

}
//public Apps access tokens
module.exports.accessToken = function(count) {

    var access_token = [
        '183093021860837|qsqS9x1u8sqrtGw-smVkC0JZ0q0',	//Zommsphere_mount_n
        '673378969342926|E7RG570w-3KLxIgbi7K204KPR5M',	//Zommsphere_mount_o
        '504696682937409|hv028x5YbwbR8E2z-AxK8Yv0vCA',	//Zommsphere_mount_p
        '214524822030328|8LJrhFCfopPvFHxOCYNw3KN1yfQ',	//Zommsphere_mount_r
        '170760029759242|iGKksYC6UhgwhDbuyHZzbdOBKeQ',	//Zommsphere.mount G
        '137324816461309|0-SmTvPDJbB3hzQ8Rp7hVHK1iQU',	//Zommsphere.mount H
        '269046093241855|E4y-C0YTNnnV0gBi8_7LFDDiJ2Y',	//Zommsphere.mount I
        '466112006799862|Gpy9WW83G5XNF-lbnlgA6NRoOc4',	//Zommsphere_mount_j
        '169411779893759|FbqCw659ghDF-Orr9mcBTgpC-C8',	//Zommsphere_mount_k
        '157385611115405|uoFCgXQvWbVAnx7dvz-jVM1QIUY',	//Zommsphere_mount_s
        '479247255501719|7BWNvprY9ffl9hxGuQ4k9sIix4g'	//Zommsphere_mount_t]
    ];

    return access_token[0];
}



