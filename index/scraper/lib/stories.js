/**
 * Lib for monitoring stories
*/
'use strict';

var cheerio = require('cheerio'),
    url = require('url'),
    chalk = require('chalk'),
    scraper = require('./scraper'),
    facebook = require('./facebook'),
    async = require('async'),
    array_unique = require('array-unique'),
    feed = require('feed-read');

//links to stories
module.exports.links = function(event, cb) {


    //locale test
    if (process.env.OS == 'Windows_NT') {

        var key = 'idnes';

        key = 'ciot.it'
        //key = 8
        //key = 'liberoquotidiano_it'
        //key = 'ansa_it';
        key = 'repubblica_it'
        //key = 10
        key = 'leccotoday'

        if (scraper.testSettings(key)) {
            var tmp = scraper.testSettings(key);
            event.settings = tmp.settings;
            event.url = tmp.url;
        }

        event.settings ={"startUrl":"http:\/\/www.ilfoglio.it\/home\/index.htm","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"categories","selector":"ul.left a","delay":""},{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"div.article:nth-of-type(n+3) > a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1.titolo","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"p.pre-dettaglio, div.text","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"img.img","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"p.articolo-dettagli a","regex":"","delay":""}],"_id":"ilfoglio_it"}

    }

    //selectors
    var scraper_settings = scraper.getScraperSettings(event);
    var links = [];

    if (scraper_settings instanceof Error) {
        return cb(scraper_settings);
    }

    else if (!event.settings.startUrl) {
        var error = new Error("Undefined startUrl");
        return cb(error);
    }

    else if (!scraper_settings.stories && !event.settings.rss) {
        var error = new Error("Missing Stories/RSS parameters");
        return cb(error);
    }

    else if (!scraper_settings.stories.selector) {
        var error = new Error("Missing Stories selector");
        return cb(error);
    }

    //RSS feed
    if (event.settings.rss && event.settings.rss.trim() != '') {

        feed(event.settings.rss, function(error, articles) {

            if (error) {
                return cb(error);
            }

            if(articles.length) {
                articles.forEach(function(item) {
                    links.push(item.link)
                })
            }

            array_unique(links);

            return cb(null, {links: links});

        });

    }

    //open categories pages
    else if(scraper_settings.categories) {

        if(!scraper_settings.categories.selector) {
            var error = new Error("Missing Categories selector");
            return cb(error);
        }

        scraper.openPage(event.settings.startUrl, 'categories', false, function(error, response) {

            if (error) {
                console.log(chalk.white.bgRed(error.toString()));
                return cb(error);
            }

            var stories = getLinks(response, scraper_settings.categories.selector, event.settings.startUrl)
            //console.log(stories)
            //redirect to other pages from navigation - no one news page
            if (stories.length) {

                async.each(stories, function (file, cb) {

                    scraper.openPage(file, 'stories', false, function (error, response) {

                        if (error) {
                            console.log(chalk.white.bgRed(error.toString()));
                            // pro key = 'affaritaliani_it' nalezne nevalidni URL, co s tim? ignorovat?
                            return cb(null, {links: links});
                        }

                        links = links.concat(getLinks(response, scraper_settings.stories.selector, file))

                        return cb(null, {links: links});

                    })
                },
                    function (err) {

                        // if any of the file processing produced an error, err would equal that error
                        if (err) {
                            // One of the iterations produced an error.
                            // All processing will now stop.
                            var error = new Error("A file failed to process:" + file);
                            return cb(error);

                        } else {
                            console.log('All files have been processed successfully');
                            //array_unique(links);
                            return cb(null, {links: links});
                        }
                    }
                );

            }

            else {
                return cb(null, {links: links});
            }
        })
    }

    //only news page
    else {

        scraper.openPage(event.settings.startUrl, 'stories', false, function (error, response) {

            if (error) {
                console.log(chalk.white.bgRed(error.toString()));
                return cb(error);
            }

            links = getLinks(response, scraper_settings.stories.selector, event.settings.startUrl)

            return cb(null, {links: links});


        });
    }

    //test
    /*
     if (0 && links.length) {
     for (var i = 0; i < 10; i++) {

     facebook.linkInteractions(links[i % links.length], function (error, response) {
     console.log(chalk.green(response));
     })

     }
     }
     */

};

//detail of story
module.exports.detail = function(event, cb) {

    //test
    if(process.env.OS == 'Windows_NT') {

        var key = 'idnes';

        key = 'ciot.it'
        key = 8
        key = 'repubblica_it'

        if(scraper.testSettings(key)) {
            var tmp = scraper.testSettings(key);
            event.settings = tmp.settings;
            event.url = tmp.url;
        }

    }

    var detail = {
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
    var detail_settings = scraper_settings.detail;

    scraper.openPage(event.url, 'detail', detail_settings, function(error, response) {

        if (error) {
            console.log(chalk.white.bgRed(error.toString()));
            return cb(error);
        }

        var $ = cheerio.load(response, {decodeEntities: true});

        $('style,script').remove();

        //title
        if(detail_settings.title && detail_settings.title.selector) {
            detail.title = $(detail_settings.title.selector).text();
        }

        //description
        if(detail_settings.description && detail_settings.description.selector) {
            $(detail_settings.description.selector).each(function (idx, elem) {
                detail.description = scraper.clearText(detail.description, $(elem).text());
            });
        }

        //story image - optional
        if(detail_settings.image && detail_settings.image.selector) {
            detail.image = $(detail_settings.image.selector).attr('src');
            if (detail.image == undefined) {
                delete detail.image;
            }

            else {

                //global regexp settings
                if (event.settings.regExp && event.settings.regExp.image) {
                    eval(event.settings.regExp.image);
                }

                var image_parse = url.parse(detail.image);

                //relative address
                if (image_parse.host === null) {
                    detail.image = url.resolve(scraper.clearUrlResolve(event.url), detail.image);
                }
            }
        }

        //story author - optional
        if(detail_settings.author && detail_settings.author.selector) {
            detail.author = $(detail_settings.author.selector).text().trim();

            if (detail.author == undefined) {
                delete detail.author;
            }
        }

        //required parameters
        if (!detail.title || !detail.description || !detail.url) {
            console.log(chalk.white.bgRed(JSON.stringify(detail)));
            var error = new Error("Incomplete Detail result" + JSON.stringify(detail));
            return cb(error);
        }

        var comments_facebook = $("fb\\:comments").attr('href');

        //FB comments exists
        if(comments_facebook != undefined) {

            //read comments
            facebook.linkComments(comments_facebook, function (error, response) {

                if (error) {
                    console.log(chalk.white.bgRed(error.toString()));
                    return cb(error);
                }

                detail.comments = response;

                return cb(null, detail);
            });
        }

        //exists comments
        else if(JSON.stringify(scraper_settings.comments.container) !== '{}') {

            //redirect comments
            if(scraper_settings.comments.links && scraper_settings.comments.links.length) {

                redirect_comments = $(scraper_settings.comments.links[0].selector).attr('href');

                if(redirect_comments != undefined) {

                    var redirect_comments_parse = url.parse(redirect_comments);

                    //relative address
                    if (redirect_comments_parse.host === null) {
                        redirect_comments = url.resolve(scraper.clearUrlResolve(event.url), redirect_comments);
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
                        detail.comments = response;

                        return cb(null, detail);
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
                    detail.comments = response;

                    return cb(null, detail);
                });
            }

        }

        else {
            return cb(null, detail);
        }

    });

};

//get links
var getLinks = function(response, selector, orig_url) {

    var links = []
    var $ = cheerio.load(response, {decodeEntities: true});

    $(selector).each(function (idx, elem) {

        var link = $(elem).attr('href');

        if (link != undefined) {

            var link_parse = url.parse(link);

            //relative address
            if (link_parse.host === null) {
                link = url.resolve(scraper.clearUrlResolve(orig_url), link);
            }

            links.push(link);

        }

    });

    return array_unique(links);

}

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
                    //comment.description += (comment.description ? "\n" : "") + $(elem).text().trim();
                    comment.description = scraper.clearText(comment.description, $(elem).text());
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
                    comment.author_image = url.resolve(scraper.clearUrlResolve(redirect_comments), comment.author_image);
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



