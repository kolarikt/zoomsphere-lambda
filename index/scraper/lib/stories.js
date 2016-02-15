/**
 * Lib for monitoring stories
*/
'use strict';

var cheerio = require('cheerio'),
    url = require('url'),
    chalk = require('chalk'),
    scraper = require('./scraper.js');

//links to stories
module.exports.links = function(event, cb) {

    //locale test
    if(process.env.OS == 'Windows_NT') {

        event.settings = {"startUrl":"http://zpravy.idnes.cz/archiv.aspx?datum=&idostrova=idnes","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories2","selector":"div.cell h3 a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.opener, div.bbtext > p, h3.tit","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"a.name span","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"img.block","delay":"","downloadImage":false},{"parentSelectors":["stories"],"type":"SelectorLink","multiple":false,"id":"comments","selector":"div.moot-capture a","delay":""},{"parentSelectors":["comments1"],"type":"SelectorElement","multiple":true,"id":"comment","selector":"div.disc-list > div.contribution","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":true,"id":"comment_description","selector":"p","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_author","selector":"h4.name a","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorImage","multiple":false,"id":"comment_image","selector":"td.disc-user-foto img","downloadImage":false,"delay":""},{"parentSelectors":["comments"],"type":"SelectorLink","multiple":false,"id":"comments1","selector":"div.moot-line a:nth-of-type(2)","delay":""}],"_id":"idnesfinal"}
        //event.settings = {"startUrl":"http://www.novinky.cz/stalo-se/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"div div div div div div div:nth-of-type(n+2) h3 a, div.item:nth-of-type(n+4) h3.likeInInfo a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"p.perex, div.articleBody p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"p.articleAuthors","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"div.topMediaBox img","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorLink","multiple":false,"id":"comments","selector":"div.related a","delay":""},{"parentSelectors":["comments"],"type":"SelectorElement","multiple":true,"id":"comment","selector":"div.contribution","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_description","selector":"p","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_author","selector":"h4.name span","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorImage","multiple":false,"id":"comment_author_image","selector":"img.icon","downloadImage":false,"delay":""}],"_id":"novinky"};
        //event.settings.startUrl = ''

    }

    //selectors
    var scraper_settings = scraper.getScraperSettings(event);
    var links = [];

    if ( scraper_settings instanceof Error ) {
        return cb(scraper_settings);
    }

    else if(!event.settings.startUrl) {
        var error = new Error("Undefined startUrl");
        return cb(error);
    }

    else if(!Array.isArray(scraper_settings.stories) || !scraper_settings.stories.length) {
        var error = new Error("Missing Stories parameters");
        return cb(error);
    }

    var stories = scraper_settings.stories;

    scraper.openPage(event.settings.startUrl, 'stories', stories, function(error, response) {

        if (error) {
            console.log(chalk.white.bgRed(error.toString()));
            return cb(error);
        }

        var $ = cheerio.load(response, {decodeEntities: true});

        $(stories[stories.length-1].selector).each(function (idx, elem) {

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

        //idnes
        event.settings = {"regExp":{"comment_author":"comment.author = comment.author.replace(/[0-9]{1,}/g, '')"},"startUrl":"http://zpravy.idnes.cz/archiv.aspx?datum=&idostrova=idnes","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories2","selector":"div.cell h3 a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.opener, div.bbtext > p, h3.tit","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"a.name span","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"img.block","delay":"","downloadImage":false},{"parentSelectors":["stories"],"type":"SelectorLink","multiple":false,"id":"comments","selector":"div.moot-capture a","delay":""},{"parentSelectors":["comments1"],"type":"SelectorElement","multiple":true,"id":"comment","selector":"div.disc-list > div.contribution","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":true,"id":"comment_description","selector":"p","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_author","selector":"h4.name a","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorImage","multiple":false,"id":"comment_author_image","selector":"td.disc-user-foto img","downloadImage":false,"delay":""},{"parentSelectors":["comments"],"type":"SelectorLink","multiple":false,"id":"comments1","selector":"div.moot-line a:nth-of-type(2)","delay":""}],"_id":"idnesfinal"};
        //event.url = 'http://zpravy.idnes.cz/video-srazka-vlaku-bavorsko-d1m-/zahranicni.aspx?c=A160210_125107_zahranicni_mlb';
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

    var result = {
        'url':event.url,
        'title' : '',
        'description': '',
        'author':'',
        'image': ''
    }

    var redirect_comments = false;

    //scraper selectors
    var scraper_settings = scraper.getScraperSettings(event);

    if ( scraper_settings instanceof Error ) {
        return cb(scraper_settings);
    }

    else if(!event.url || !scraper_settings.detail) {
        return cb(null, {"error":"Undefined Scraper detail URL/selectors"});
    }

    //detail selectors
    var detail = scraper_settings.detail;

    scraper.openPage(event.url, 'detail', detail, function(error, response) {

        if (error) {
            console.log(chalk.white.bgRed(error.toString()));
            return cb(error);
        }

        var $ = cheerio.load(response, {decodeEntities: true});

        //title
        if(detail.title && detail.title.selector) {
            result.title = $(detail.title.selector).text();
        }

        //description
        if(detail.description && detail.description.selector) {
            $(detail.description.selector).each(function (idx, elem) {
                result.description += (result.description ? "\n" : "") + $(elem).text().trim();
            });
        }

        //story image - optional
        if(detail.image && detail.image.selector) {
            result.image = $(detail.image.selector).attr('src');
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
        if(detail.author && detail.author.selector) {
            result.author = $(detail.author.selector).text();

            if (result.author == undefined) {
                delete result.author;
            }
        }

        //required parameters
        if (!result.title || !result.description || !result.url) {
            console.log(chalk.white.bgRed(JSON.stringify(result)));
            var error = new Error("Incomplete Detail result" + JSON.stringify(result));
            return cb(error);
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
                scraper.openPage(redirect_comments, 'redirect_comments', scraper_settings.comments.links, function (error, response) {

                    if (error) {
                        console.log(chalk.white.bgRed(error.toString()));
                        return cb(error);
                    }

                    //read comments
                    getComments(response, scraper_settings.comments, redirect_comments, event, function (error, response) {

                        if (error) {
                            console.log(chalk.white.bgRed(error.toString()));
                            return cb(error);
                        }
                        result.comments = response;

                        return cb(null, result);
                    });

                });
            }

            //comments are on the same page
            else {

                getComments(response, scraper_settings.comments, event.url, event, function (error, response) {
                    if (error) {
                        console.log(chalk.white.bgRed(error.toString()));
                        return cb(error);
                    }
                    result.comments = response;

                    return cb(null, result);
                });
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
        var error = new Error("Undefined comment container");
        return cb(error);
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

    return cb(null, comments);


}
