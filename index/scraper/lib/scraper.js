/**
 * Lib scraper
 */

'use strict';

var request = require('request'),
    iconv = require('iconv-lite'),
    cheerio = require('cheerio'),
    jschardet = require("jschardet"),
    charset = require("charset"),
    encoding = require("encoding"),
    util = require('util'),
    url = require('url'),
    chalk = require('chalk');

//default http headers
var http_headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'cs,en-us;q=0.7,en;q=0.3',
    'Connection': 'keep-alive',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64; rv:24.0) Gecko/20100101 Firefox/30.0'
};



//open Page
module.exports.openPage = function(link, mode, settings, cb) {

    if(!link) {

        if(mode == 'redirect_comments') {
            return cb(null, true);
        }

        console.log(chalk.white.bgRed('Empty URL'));
        var error = new Error("Empty URL");
        return cb(error);

    }

    request({uri: link, gzip:true, encoding: null,headers:http_headers}, function (error, response, body) {

        if(error) {
            console.log(chalk.white.bgRed(error.toString()));
            return cb(error);
        }

        //http status error
        else if (response.statusCode != 200) {
            console.log(chalk.white.bgRed(response.statusCode));
            var error = new Error("Request HTTP status code: " + response.statusCode);
            return cb(error);
        }

        var encode = true, redirect = false;


        /*
        if(0 && mode == 'stories' && settings.length > 1) {
            encode = false;
            redirect = true;
        }
        */

        if(mode == 'stories' || mode == 'categories') {
            encode = false;
            redirect = false;
        }

        //redirect to comments page
        else if(mode == 'redirect_comments' && settings.length > 1) {
            encode = false;
            redirect = true;
            settings.splice(0,1);
        }

        //encode to utf8
        if(encode) {

            var enc = charset(response.headers, body);
            enc = enc || jschardet.detect(body).encoding.toLowerCase();
            if (enc != 'utf-8') {
                body = iconv.decode(body, enc);
            }

        }

        //we want to redirect
        if(redirect) {

            var $ = cheerio.load(body, {decodeEntities: true});

            $(settings[0].selector).each(function(idx, elem) {

                var redirect_url = $(elem).attr('href');

                if (!redirect_url) {
                    console.log(chalk.white.bgRed(mode + ':empty URL'));
                    var error = new Error(mode + ':empty URL');
                    return cb(error);
                }

                var redirect_url_parse = url.parse(redirect_url);

                //relative address
                if(redirect_url_parse.host === null) {
                    redirect_url = url.resolve(link, redirect_url);
                }

                if(mode == 'stories') {
                    settings.splice(0, 1);
                }

                //we want to redirect again
                module.exports.openPage(redirect_url, mode, settings, cb);

            });

        }

        else {
            return cb(null, body);
        }

    });

}


//CHROME scraper settings to own object
module.exports.getScraperSettings = function(event) {

    if (!event || !event.settings || !event.settings.selectors) {
        return new Error("Undefined Scraper settings/selectors");
    }

    var result = {
        categories: '',
        stories: '',
        detail: {},
        comments: {
            links: [],
            container: {},
            detail: {}
        }
    };

    event.settings.selectors.forEach(function (value) {

        //links to details
        if (value.id == 'stories') {
            result.stories = value;
        }

        //categories
        else if (value.id == 'categories') {
            result.categories = value;
        }

        else if (value.id == 'title') {
            result.detail.title = value;
        }

        else if (value.id == 'description') {
            result.detail.description = value;
        }

        else if (value.id == 'image') {
            result.detail.image = value;
        }

        else if (value.id == 'author') {
            result.detail.author = value;
        }

        //commets, comments1 - redirect
        else if (value.id.indexOf('comments') !== -1) {
            result.comments.links.push(value);
        }

        else if (value.id == 'comment') {
            result.comments.container = value;
        }
        else if (value.id == 'comment_id') {
            result.comments.detail.id = value;
        }
        else if (value.id == 'comment_description') {
            result.comments.detail.description = value;
        }
        else if (value.id == 'comment_image') {
            result.comments.detail.image = value;
        }
        else if (value.id == 'comment_author') {
            result.comments.detail.author = value;
        }
        else if (value.id == 'comment_author_image') {
            result.comments.detail.author_image = value;
        }

    });
    return result;

};

//clear text
module.exports.clearText = function(result, text) {

    text = text.replace(/[\r\n|\r]/g, "\n").trim();
    var lines = text.split("\n");

    //console.log(lines)

    if(lines.length) {

        lines.forEach(function(row) {
            row = row.trim();

            if(row.length) {
                result += (result ? "\n" : "") + row;
            }
        });
        return result;
    }
    else {
        return result;
    }
    //console.log(lines);
    //text = text.replace(/\s+$/gm, "").replace(/\s{1,}/g, " ").replace(/[/\n]{2,}/g, "+++").trim();
    //text = text.replace(/\s{1,}/g, " ").replace(/[^\S\r\n]+$/gm, "");

}
