/**
 * Lib for monitoring stories
*/
'use strict';

var cheerio = require('cheerio'),
    request = require('request'),
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
        event.settings = {"_id":"nastrencin_sk","startUrl":"http:\/\/nastrencin.sme.sk\/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"categories","selector":"li.level_1 a.js-menu-item","delay":""},{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"div.media h2.media-heading a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1.js-article-title","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"p.perex, article.cf p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"a.fancybox-button img","downloadImage":false,"delay":""}]}
        event.settings = {"_id":"notizie_it","startUrl":"http://www.notizie.it/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"categories","selector":"nav.main-nav ul.menu > li.menu-item > a","delay":""},{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"h3.content-lead-title a, h3.content-grid-title a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1.entry-title","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.entry-content p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"img.attachment-content-single","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"a.fn","regex":"","delay":""}]}
        event.settings = {"_id":"goofynomics_bs","startUrl":"http://goofynomics.blogspot.cz/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"categories","selector":"div.tabs li a","delay":""},{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"h3.post-title a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h3.post-title","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.post-body","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"div.separator img","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"a.g-profile span","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorElement","multiple":true,"id":"comment","selector":"ol > li.comment:nth-of-type(n+2) > div.comment-block","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":true,"id":"comment_description","selector":"ol > li.comment > div.comment-block p.comment-content","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":true,"id":"comment_author","selector":"ol > li.comment > div.comment-block cite.user a","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorImage","multiple":true,"id":"comment_author_image","selector":"ol > li.comment > div.avatar-image-container img","downloadImage":false,"delay":""}]}
        event.settings = {"_id":"ilmessaggero","startUrl":"http://ilmessaggero.it/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"categories","selector":"li.menu-nav > a","delay":""},{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"article.divider a.ml_primary_link, h2.titolo-base a, h2.titolo a.ml_primary_link","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.corpo > span:nth-of-type(1), div.corpo","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"div.contenuto div.foto img","downloadImage":false,"delay":""}]}   
        //event.settings = {"_id":"ziuanews","startUrl":"http:\/\/ziuanews.ro\/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"ul.as-list h2 a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1.title","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"p strong, section.cf section.cf section p:nth-of-type(n+2)","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"a.lightbox img","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorElement","multiple":false,"id":"comment","selector":"div.comment-body","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_description","selector":"section.off p","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_author","selector":"div.info span","regex":"","delay":""}],"rss":"http:\/\/ziuanews.ro\/rss"}
        //event.settings = {"regExp":{"link":"link = link.replace('/categorie/', '/')"},"_id":"bzp_ro","startUrl":"http://www.bzb.ro/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"categories","selector":"ul.box_menu a","delay":""},{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"h3.heading a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1.heading","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"p.a_description, div.txt_articol p:nth-of-type(2)","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"img.article_img","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"p.a_author span","regex":"","delay":""}]}
        //event.settings = {"_id":"criticatac_ro","startUrl":"http:\/\/www.criticatac.ro\/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"div.post:nth-of-type(n+2) h2.entry-title a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1.entry-title","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"p:nth-of-type(1) strong, p:nth-of-type(n+2)","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"img.alignleft","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"span.author a.lros","regex":"","delay":""}],"rss":"http:\/\/www.criticatac.ro\/feed\/"}

        event.settings = {"_id":"laraport","startUrl":"http://laraport.ro/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"h3.catItemTitle a, li > div:nth-of-type(1) a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h2.itemTitle","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.itemIntroText p, p:nth-of-type(3) strong","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"a.modal img","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"span.itemAuthor a","regex":"","delay":""}]}
        //event.url = 'http://laraport.ro/index.php/social-si-justitie/item/2445-primarul-ionel-dragu-din-maldaresti-retinut-pentru-delapidare'
    }
//,"rss":"http:\/\/ziuanews.ro\/rss"
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

            //other solution
            if (error) {
               
                //default http headers
                var http_headers = {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'cs,en-us;q=0.7,en;q=0.3',
                    'Connection': 'keep-alive',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64; rv:24.0) Gecko/20100101 Firefox/30.0'
                };

                request({uri: event.settings.rss, gzip:true,headers:http_headers}, function (error, response, body) {
                    
                    if(error) {
                        console.log(chalk.white.bgRed(error.toString()));    
                        return cb(error);
                    }

                    else if (response.statusCode != 200) {
                        console.log(chalk.white.bgRed(response.statusCode));
                        var error = new Error("Request HTTP status code: " + response.statusCode);
                        return cb(error);

                    }
                    else {

                        var $ = cheerio.load(body, {xmlMode: true});

                        $('channel item link').each(function (idx, elem) {
                            links.push($(elem).text())
                        });

                        return cb(null, {links: links});
                    }

                })
            }

            else {

                if(articles.length) {
                    articles.forEach(function(item) {
                        links.push(item.link)
                    })
                }

                array_unique(links);

                return cb(null, {links: links});
            }

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

                    //console.log(file)

                    scraper.openPage(file, 'stories', false, function (error, response) {

                        if (error) {
                            console.log(chalk.white.bgRed(error.toString()));
                            // pro key = 'affaritaliani_it' nalezne nevalidni URL, co s tim? ignorovat?
                            return cb(null, {links: links});
                        }

                        links = links.concat(getLinks(response, scraper_settings.stories.selector, file))
                        //console.log(file)
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
                            
                            array_unique(links);
                            //return cb(null, {links: links});
                            //global regexp settings
                            if (links.length && event.settings.regExp && event.settings.regExp.link) {
                                var links_tmp = []
                                links.forEach(function(link)  {
                                    eval(event.settings.regExp.link); 
                                    links_tmp.push(link)   
                                })
                                return cb(null, {links: links_tmp});
                            }
                            else {
                                return cb(null, {links: links});
                            }
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

        event.settings = {"_id":"infocube_plastics_production","startUrl":"http://infocube.cz/cs/plastics-production/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"a.list-post-title-link","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"desciption","selector":"div.entry-content","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"img.alignright","downloadImage":false,"delay":""}]}
        event.url = 'http://infocube.cz/cs/strojirenske-forum-jde-do-tretiho-rocniku/?utm_source=rss&utm_medium=rss&utm_campaign=strojirenske-forum-jde-do-tretiho-rocniku';
        event.settings = {"_id":"evz_ro","startUrl":"http:\/\/www.evz.ro\/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"categories","selector":"ul.main-menu a","delay":""},{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"div.article-box h3 a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.content-box > strong, div.content-box > p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"img.kalooga_22658","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"div.article-details a","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorElement","multiple":true,"id":"comment","selector":"div.comment","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":true,"id":"comment_description","selector":"div.comment p","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":true,"id":"comment_author","selector":"div.comment-details","regex":"","delay":""}]}
        event.url = 'http://www.evz.ro/hans-klemm-ambasadorul-sua-la-bucuresti-refugiatii-nu-sunt-o-povara-ci-o-resursa-ati-putea-fi-un-exemplu-de-toleranta-primindu-i.html';
        event.settings = {"startUrl":"http:\/\/www.ziarul21.ro\/new\/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"categories","selector":"a.level1","delay":""},{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"div.leadingarticles h1.title a, div.float-left h1.title a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1.title a","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.article > div:nth-of-type(n+3), div.article > p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"div.article > p img","downloadImage":false,"delay":""}],"_id":"ziarul21"}
        event.url = 'http://www.ziarul21.ro/new/index.php/interviu/57-interviu/18446-nicuor-ignil-vorbete-despre-propria-expoziie-qnuaneq'
        event.settings = {"_id":"laraport","startUrl":"http://laraport.ro/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"h3.catItemTitle a, li > div:nth-of-type(1) a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h2.itemTitle","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.itemIntroText p, p:nth-of-type(3) strong","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"a.modal img","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"span.itemAuthor a","regex":"","delay":""}]}
        event.url = 'http://laraport.ro/index.php/social-si-justitie/item/2457-gigi-matei-acuzat-ca-vrea-sa-confiste-revolta-ramnicenilor-cu-ajutorul-unor-obscuri-tineri-infiltrati-printre-manifestanti'
    
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
        var error = new Error(JSON.stringify(Object.assign({"error":"Undefined Scraper detail URL/selectors"}, scraper_settings)));
        //return cb(null, {"error":"Undefined Scraper detail URL/selectors"});
        return cb(error);
    }

    //detail selectors
    var detail_settings = scraper_settings.detail;

    scraper.openPage(event.url, 'detail', detail_settings, function(error, response) {

        if (error) {
            console.log(chalk.white.bgRed(error.toString()));
            return cb(error);
        }


        var $ = cheerio.load(response, {decodeEntities: true});

        //strip styles,scripts
        $('style,script').remove();

        //title
        if(detail_settings.title && detail_settings.title.selector) {
            detail.title = $(detail_settings.title.selector).text().trim();
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
            //var error = new Error(JSON.stringify(Object.assign({error: "Incomplete Detail result"}, {url:detail.url)));

            var error = new Error("Incomplete " + (!detail.description ? "description" : "title") + " " + detail.url);
            return cb(error);
        }

        var comments_facebook = $("fb\\:comments").attr('href');
        if(comments_facebook == undefined) {
            comments_facebook = $("div.fb-comments").attr('data-href');
        }

        //console.log(comments_facebook)

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

            detail.comments_facebook = 1;
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



