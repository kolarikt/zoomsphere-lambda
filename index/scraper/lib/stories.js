/**
 * Lib for monitoring stories
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

//scrapper settings
var getScraperSettings = function(event) {

    if (!event || !event.settings || !event.settings.selectors) {
        return {};
    }

    var result = {
        stories:[],
        detail:{},
        comments:{
            links:[],
            container:{},
            detail:{}
        }
    };

    event.settings.selectors.forEach(function (value) {

        //stories, stories1...
        if (value.id.indexOf('stories') !== -1) {
            result.stories.push(value);
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

        //commets, comments1
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

//open Page
var openPage = function (link, mode, settings, cb) {


    if(!link) {

        if(mode == 'redirect_comments') {
            return cb(null, true);
        }

        console.log(chalk.white.bgRed('Empty URL'));
        return cb(null, {"error":'Empty URL'});

    }

    request({uri: link, gzip:true, encoding: null,headers:http_headers}, function (error, response, body) {

        if (error || response.statusCode != 200) {
            console.log(chalk.white.bgRed(error ? error.toString() : response.statusCode));
            return cb(null, {"error":error ? error.toString() : response.statusCode});
        }

        var encode = true, redirect = false, selector = false;

        if(mode == 'stories' && settings.length > 1) {
            encode = false;
            redirect = true;
            selector = true;
        }

        //redirect to comments page
        else if(mode == 'redirect_comments' && settings.length > 1) {
            encode = false;
            redirect = true;
            selector = false;
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

        if(redirect) {

            //sadasdassdf


            var $ = cheerio.load(body, {decodeEntities: true});

            //console.log(settings)

            $(settings[0].selector).each(function(idx, elem) {

                var redirect_url = $(elem).attr('href');

                if (!redirect_url) {
                    console.log(chalk.white.bgRed(mode + ':empty URL'));
                    return cb(null, {"error":mode + ':empty URL'});
                }

                var redirect_url_parse = url.parse(redirect_url);

                //relative address
                if(redirect_url_parse.host === null) {
                    redirect_url = url.resolve(link, redirect_url);
                }

                if(mode == 'stories') {
                    settings.splice(0, 1);
                }

                openPage(redirect_url, mode, settings, cb);

            });

        }

        else {
            return cb(null, body);
        }

    });

}

//links to stories
module.exports.links = function(event, cb) {


    //test
    if(process.env.OS == 'Windows_NT') {
        //event.settings = {"startUrl":"http://zpravy.idnes.cz/archiv.aspx?datum=&idostrova=idnes","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories2","selector":"div.cell h3 a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.opener, div.bbtext > p, h3.tit","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"a.name span","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"img.block","delay":"","downloadImage":false},{"parentSelectors":["stories"],"type":"SelectorLink","multiple":false,"id":"comments","selector":"div.moot-capture a","delay":""},{"parentSelectors":["comments1"],"type":"SelectorElement","multiple":true,"id":"comment","selector":"div.disc-list > div.contribution","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":true,"id":"comment_description","selector":"p","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_author","selector":"h4.name a","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorImage","multiple":false,"id":"comment_image","selector":"td.disc-user-foto img","downloadImage":false,"delay":""},{"parentSelectors":["comments"],"type":"SelectorLink","multiple":false,"id":"comments1","selector":"div.moot-line a:nth-of-type(2)","delay":""}],"_id":"idnesfinal"}
        event.settings = {"startUrl":"http://www.novinky.cz/stalo-se/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"div div div div div div div:nth-of-type(n+2) h3 a, div.item:nth-of-type(n+4) h3.likeInInfo a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"p.perex, div.articleBody p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"p.articleAuthors","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"div.topMediaBox img","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorLink","multiple":false,"id":"comments","selector":"div.related a","delay":""},{"parentSelectors":["comments"],"type":"SelectorElement","multiple":true,"id":"comment","selector":"div.contribution","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_description","selector":"p","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_author","selector":"h4.name span","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorImage","multiple":false,"id":"comment_author_image","selector":"img.icon","downloadImage":false,"delay":""}],"_id":"novinky"};
    }

    var scraper_settings = getScraperSettings(event);
    var links = [];

    if(!event || !event.settings) {
        return cb(null, {"error":"Undefined parameters"});
    }

    else if(!event.settings.startUrl) {
        return cb(null, {"error":"Undefined startUrl"});
    }

    else if(!Array.isArray(scraper_settings.stories) || !scraper_settings.stories.length) {
        return cb(null, {"error":"Missing stories parameters"});
    }


    openPage(event.settings.startUrl, 'stories', scraper_settings.stories, function(error, response) {

        if (error) {
            console.log(chalk.white.bgRed(error ? error.toString() : response));
            return cb(null, {"error":error ? error.toString() : response});
        }

        var $ = cheerio.load(response, {decodeEntities: true});

        $(scraper_settings.stories[scraper_settings.stories.length-1].selector).each(function (idx, elem) {

            var link = $(elem).attr('href');

            if(link != undefined) {

                var link_parse = url.parse(link);

                //relative address
                if (link_parse.host === null) {
                    link = url.resolve(event.settings.startUrl, link);
                }

                links.push(link);

            }

        });

        return cb(null, {links:links});

    });

};

//detail of story
module.exports.detail = function(event, cb) {

    //test
    if(process.env.OS == 'Windows_NT') {
        event.settings = {"regExp":{"comment_author":"comment.author = comment.author.replace(/[0-9]{1,}/g, '')"},"startUrl":"http://zpravy.idnes.cz/archiv.aspx?datum=&idostrova=idnes","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories2","selector":"div.cell h3 a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.opener, div.bbtext > p, h3.tit","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"a.name span","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"img.block","delay":"","downloadImage":false},{"parentSelectors":["stories"],"type":"SelectorLink","multiple":false,"id":"comments","selector":"div.moot-capture a","delay":""},{"parentSelectors":["comments1"],"type":"SelectorElement","multiple":true,"id":"comment","selector":"div.disc-list > div.contribution","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":true,"id":"comment_description","selector":"p","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_author","selector":"h4.name a","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorImage","multiple":false,"id":"comment_author_image","selector":"td.disc-user-foto img","downloadImage":false,"delay":""},{"parentSelectors":["comments"],"type":"SelectorLink","multiple":false,"id":"comments1","selector":"div.moot-line a:nth-of-type(2)","delay":""}],"_id":"idnesfinal"};
        event.url = 'http://zpravy.idnes.cz/video-srazka-vlaku-bavorsko-d1m-/zahranicni.aspx?c=A160210_125107_zahranicni_mlb';
        event.url ='http://usti.idnes.cz/divky-okradly-cizince-0u6-/usti-zpravy.aspx?c=A160211_141003_usti-zpravy_hrk';
        //novinky
        //event.settings = {"startUrl":"http://www.novinky.cz/stalo-se/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"div div div div div div div:nth-of-type(n+2) h3 a, div.item:nth-of-type(n+4) h3.likeInInfo a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"p.perex, div.articleBody p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"p.articleAuthors","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"div.topMediaBox img","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorLink","multiple":false,"id":"comments","selector":"div.related a","delay":""},{"parentSelectors":["comments"],"type":"SelectorElement","multiple":true,"id":"comment","selector":"div.contribution","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_description","selector":"p","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_author","selector":"h4.name span","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorImage","multiple":false,"id":"comment_author_image","selector":"img.icon","downloadImage":false,"delay":""}],"_id":"novinky"};

        //event.url = 'http://www.novinky.cz/zahranicni/evropa/394508-nato-vyrazi-do-egejskeho-more-proti-paserakum-lidi.html';

        //android market
        //event.settings = {"startUrl":"http://androidmarket.cz/category/novinky/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"h2.title a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1 a","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.entry p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"img.aligncenter","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorElement","multiple":false,"id":"comment","selector":"ul#dsq-comments li.comment","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":true,"id":"comment_description","selector":"div.dsq-comment-message>p","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_author","selector":".dsq-comment-header span","regex":"","delay":""}],"_id":"androidmarket_cz"}
        //event.url = 'http://androidmarket.cz/mobilni-telefony/huawei-ukazal-novy-y6-propetipalec-stredni-tridy/';

        //prakticka zena
        //event.settings = {"regExp":{"comment_author":"comment.description = comment.description.replace(/[0-9]{1,}/g, '')"},"_id":"praktickazena_cz","startUrl":"http://praktickazena.cz","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"h3 a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1.title","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.perex p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"div.article-detail img","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorElement","multiple":true,"id":"comment","selector":"div.comment","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":true,"id":"comment_description","selector":"div.text","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_author","selector":"span.name","regex":"","delay":""}]};
        //event.url = 'http://praktickazena.kafe.cz/krasa/kreativni-nocniky/';


    }



    var scraper_settings = getScraperSettings(event);

    var result = {
        'url':event.url,
        'title' : '',
        'description': '',
        'author':'',
        'image': ''
    }

    var redirect_comments = false;

    if(!event || !event.url || !scraper_settings.detail) {
        return cb(null, {"error":"Undefined parameters"});
    }

    openPage(event.url, 'detail', scraper_settings.detail, function(error, response) {

        if (error) {
            console.log(chalk.white.bgRed(error ? error.toString() : response));
            return cb(null, {"error":error ? error.toString() : response});
        }

        var $ = cheerio.load(response, {decodeEntities: true});

        //title
        if(scraper_settings.detail.title && scraper_settings.detail.title.selector) {
            result.title = $(scraper_settings.detail.title.selector).text();
        }

        //description
        if(scraper_settings.detail.description && scraper_settings.detail.description.selector) {
            $(scraper_settings.detail.description.selector).each(function (idx, elem) {
                result.description += (result.description ? "\n" : "") + $(elem).text().trim();
            });
        }

        //story image - optional
        if(scraper_settings.detail.image && scraper_settings.detail.image.selector) {
            result.image = $(scraper_settings.detail.image.selector).attr('src');
            if (result.image == undefined) {
                delete result.image;
            }

            else {
                var image_parse = url.parse(result.image);

                //relative address
                if (image_parse.host === null) {
                    result.image = url.resolve(event.url, result.image);
                }
            }
        }

        //story author - optional
        if(scraper_settings.detail.author && scraper_settings.detail.author.selector) {
            result.author = $(scraper_settings.detail.author.selector).text();

            if (result.author == undefined) {
                delete result.author;
            }
        }

        //required parameters
        if (!result.title || !result.description || !result.url) {
            console.log(chalk.white.bgRed(JSON.stringify(result)));
            return cb(null, {"error": result});
        }

        //exists comments
        if(JSON.stringify(scraper_settings.comments.container) !== '{}') {



            //redirect comments
            if(scraper_settings.comments.links && scraper_settings.comments.links.length) {

                redirect_comments = $(scraper_settings.comments.links[0].selector).attr('href');

                if(redirect_comments != undefined) {

                    var redirect_comments_parse = url.parse(redirect_comments);

                    //relative address
                    if (redirect_comments_parse.host === null) {
                        redirect_comments = url.resolve(event.url, redirect_comments);
                    }

                }
            }

            //redirect to comments page
            if(redirect_comments) {

                //console.log(redirect_comments)
                openPage(redirect_comments, 'redirect_comments', scraper_settings.comments.links, function (error, response) {

                    if (error) {
                        console.log(chalk.white.bgRed(error ? error.toString() : response));
                        return cb(null, {"error": error ? error.toString() : response});
                    }

                    result.comments = getComments(response, scraper_settings.comments, redirect_comments, event, cb);

                    return cb(null, result);

                });
            }

            //comments are on the same page
            else {

                result.comments = getComments(response, scraper_settings.comments, event.url, event,  cb);
                return cb(null, result);

            }

        }

        else {
            return cb(null, result);
        }

    });

};

//read comments
var getComments = function(response, settings, redirect_comments, event, cb) {

    //undefined container
    if (!settings.container || !settings.container.selector) {
        return cb(null, {"error":"Undefined comment container"});
    }


    var comments = [];

    var $ = cheerio.load(response, {decodeEntities: true});

    //comments container
    $(settings.container.selector).each(function (idx, elem) {

        var comment = {description:''}, container = $(elem);

        //comment message
        if (settings.detail.description && settings.detail.description.selector) {

            //description
            if(settings.detail.description && settings.detail.description.selector) {
                container.find(settings.detail.description.selector).each(function (idx, elem) {
                    comment.description += (comment.description ? "\n" : "") + $(elem).text().trim();
                });
                //global regexp settings
                if (comment.description && event.settings.regExp && event.settings.regExp.comment_description) {
                    eval(event.settings.regExp.comment_description);
                }
            }

        }

        //comment author - optional
        if (settings.detail.author && settings.detail.author.selector) {
            comment.author = container.find(settings.detail.author.selector).text().trim();

            if (comment.author == undefined) {
                delete comment.author;
            }

            else {

                //global regexp settings
                if (comment.author && event.settings.regExp && event.settings.regExp.comment_author) {
                    eval(event.settings.regExp.comment_author);
                }
            }

        }

        //comment author image - optional
        if (settings.detail.author_image && settings.detail.author_image.selector) {
            comment.author_image = container.find(settings.detail.author_image.selector).attr('src');

            if (comment.author_image != undefined) {
                var author_image_parse = url.parse(comment.author_image);

                //relative address
                if (author_image_parse.host === null) {
                    comment.author_image = url.resolve(redirect_comments, comment.author_image);
                }
            }
        }

        //required parameters - description only
        if (comment.description && comment.description != '') {
            comments.push(comment);
        }


    });

    return comments;


}
