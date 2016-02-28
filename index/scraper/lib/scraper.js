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
                    redirect_url = url.resolve(module.exports.clearUrlResolve(link), redirect_url);
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
        rss:[],
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


module.exports.clearUrlResolve = function (link) {
    return link.slice(-1) == '/' ?  link.slice(0, -1) : link;
}

//test settings
module.exports.testSettings = function(key) {


    var settings = []

    settings['idnes'] = {
        'settings' : {"regExp":{"comment_author":"comment.author = comment.author.replace(/[0-9]{1,}/g, '')"},"startUrl":"http://zpravy.idnes.cz/archiv.aspx?datum=&idostrova=idnes","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories2","selector":"div.cell h3 a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.opener, div.bbtext > p, h3.tit","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"a.name span","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"img.block","delay":"","downloadImage":false},{"parentSelectors":["stories"],"type":"SelectorLink","multiple":false,"id":"comments","selector":"div.moot-capture a","delay":""},{"parentSelectors":["comments1"],"type":"SelectorElement","multiple":true,"id":"comment","selector":"div.disc-list > div.contribution","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":true,"id":"comment_description","selector":"p","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_author","selector":"h4.name a","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorImage","multiple":false,"id":"comment_author_image","selector":"td.disc-user-foto img","downloadImage":false,"delay":""},{"parentSelectors":["comments"],"type":"SelectorLink","multiple":false,"id":"comments1","selector":"div.moot-line a:nth-of-type(2)","delay":""}],"_id":"idnesfinal"},
        'url': 'http://zpravy.idnes.cz/video-srazka-vlaku-bavorsko-d1m-/zahranicni.aspx?c=A160210_125107_zahranicni_mlb'
    };

    settings['novinky'] = {
        'settings' :  {"startUrl":"http://www.novinky.cz/stalo-se/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"div div div div div div div:nth-of-type(n+2) h3 a, div.item:nth-of-type(n+4) h3.likeInInfo a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"p.perex, div.articleBody p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"p.articleAuthors","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"div.topMediaBox img","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorLink","multiple":false,"id":"comments","selector":"div.related a","delay":""},{"parentSelectors":["comments"],"type":"SelectorElement","multiple":true,"id":"comment","selector":"div.contribution","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_description","selector":"p","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_author","selector":"h4.name span","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorImage","multiple":false,"id":"comment_author_image","selector":"img.icon","downloadImage":false,"delay":""}],"_id":"novinky"},
        'url': 'http://www.novinky.cz/zahranicni/evropa/394508-nato-vyrazi-do-egejskeho-more-proti-paserakum-lidi.htm'
    };
    settings['androidmarket'] = {
        'settings' : {"startUrl":"http://androidmarket.cz/category/novinky/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"h2.title a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1 a","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.entry p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"img.aligncenter","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorElement","multiple":false,"id":"comment","selector":"ul#dsq-comments li.comment","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":true,"id":"comment_description","selector":"div.dsq-comment-message>p","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_author","selector":".dsq-comment-header span","regex":"","delay":""}],"_id":"androidmarket_cz"},
        'url': 'http://androidmarket.cz/mobilni-telefony/huawei-ukazal-novy-y6-propetipalec-stredni-tridy/'
    };
    settings['praktickazena'] = {
        'settings' : {"regExp":{"comment_author":"comment.description = comment.description.replace(/[0-9]{1,}/g, '')"},"_id":"praktickazena_cz","startUrl":"http://praktickazena.cz","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"h3 a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1.title","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.perex p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"div.article-detail img","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorElement","multiple":true,"id":"comment","selector":"div.comment","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":true,"id":"comment_description","selector":"div.text","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_author","selector":"span.name","regex":"","delay":""}]},
    'url':'http://praktickazena.kafe.cz/krasa/kreativni-nocniky/'
    };
    settings['synotloga'] = {
        'settings' :{"_id":"synotligacz","startUrl":"http://www.synotliga.cz/clanky.html","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"h2 a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"description","selector":"article p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"div.image img","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"p.about span:nth-of-type(2)","regex":"","delay":""}]},
        'url':'http://www.synotliga.cz/clanek/11064-sprinter-a-maratonec-triumfy-mezi-bci-m-do-pbrami-a-olku.html'
    };
    settings['panorama_it'] = {
        'settings' :{"_id":"panorama_it","startUrl":"http://www.panorama.it/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"div.col-sm-5 h2 a, div.row.row-wide-launch article.article-entry:nth-of-type(n+2) h2 a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"header.article-header h2, div.entry p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"img.attachment-Foto","downloadImage":false,"delay":""}]},
        'url':'http://www.panorama.it/sport/calcio/india-calciatore-morto-capriole-klose-video/'
    };
    settings['quattroroute_it'] = {
        'settings' :{"_id":"quattroruote_it","startUrl":"http://www.quattroruote.it/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"div.rsSlide:nth-of-type(1) a, div.content_result_fixed:nth-of-type(n+2) article.block > a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"div.article_header h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.article_paragraph:nth-of-type(n+2) p:nth-of-type(1)","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"img.rsImg","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorElement","multiple":true,"id":"comment","selector":"div.commento > div.corpo-commento, div.comment-replies div.parbase:nth-of-type(n+2)","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_description","selector":"div.commento > div.corpo-commento div.testo-commento, div.risposta-commento div.testo-commento","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":true,"id":"comment_author","selector":"div.commento > div.corpo-commento div.autore-commento, div.risposta-commento div.autore-commento","regex":"","delay":""}]},
            'url':'http://www.quattroruote.it/news/mercato/2016/02/24/gruppo_volkswagen_crescita_in_gennaio_grazie_alla_cina.html'
    };
    settings['tuttosport.com'] = {
        'settings' :{"selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"categories","selector":"nav#menu li a","delay":""},{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"article.article.special h1.title a, article#article_8852386.article h1.title a, section.main-section div.main-column h1.title a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"div.main-article-header h1.title","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.main > div > p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"figure img","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"p.author strong","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorElement","multiple":true,"id":"comment","selector":"div.gig-comments-comments > div.gig-comment > div.gig-comment-data","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":false,"id":"comment_description","selector":"div.gig-comments-comments > div.gig-comment > div.gig-comment-data > div.gig-comment-self-data div.gig-comment-body, div.gig-comments-comments > div.gig-comment:nth-of-type(n+4) > div.gig-comment-data > div.gig-comment-replies > div.gig-comment > div.gig-comment-data > div.gig-comment-self-data div.gig-comment-body, div.gig-comments-comments > div.gig-comment:nth-of-type(n+4) > div.gig-comment-data > div.gig-comment-replies > div.gig-comment > div.gig-comment-data > div.gig-comment-replies > div.gig-comment > div.gig-comment-data > div.gig-comment-self-data div.gig-comment-body, div.gig-comment-replies div.gig-comment-replies div.gig-comment-replies div.gig-comment-body","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":true,"id":"comment_author","selector":"div.gig-comments-comments > div.gig-comment > div.gig-comment-data > div.gig-comment-self-data span.gig-comment-username, div.gig-comments-comments > div.gig-comment:nth-of-type(n+4) > div.gig-comment-data > div.gig-comment-replies > div.gig-comment > div.gig-comment-data > div.gig-comment-self-data span.gig-comment-username, div.gig-comments-comments > div.gig-comment:nth-of-type(n+4) > div.gig-comment-data > div.gig-comment-replies > div.gig-comment > div.gig-comment-data > div.gig-comment-replies > div.gig-comment > div.gig-comment-data > div.gig-comment-self-data span.gig-comment-username, div.gig-comment-replies div.gig-comment-replies div.gig-comment-replies span.gig-comment-username","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorImage","multiple":true,"id":"comment_author_image","selector":"div.gig-comments-comments > div.gig-comment > div.gig-comment-photo img.gig-comment-img, div.gig-comments-comments > div.gig-comment:nth-of-type(n+4) > div.gig-comment-data > div.gig-comment-replies > div.gig-comment > div.gig-comment-photo img.gig-comment-img, div.gig-comments-comments > div.gig-comment:nth-of-type(n+4) > div.gig-comment-data > div.gig-comment-replies > div.gig-comment > div.gig-comment-data > div.gig-comment-replies > div.gig-comment > div.gig-comment-photo img.gig-comment-img, div.gig-comment-replies div.gig-comment-replies div.gig-comment-replies img.gig-comment-img","downloadImage":false,"delay":""}],"_id":"tuttosport_org","startUrl":"http://www.tuttosport.com/"},
            'url':'http://www.tuttosport.com/news/calcio/serie-a/juventus/2016/02/25-8852392/bayern_vidal_ci_ricasca_lascia_lalbergo_della_squadra_in_piena_notte/'
    };

    settings['ciot.it'] = {
        'settings' : {"regExp":{"image":"detail.image = 'http://www.cioe.it/' + detail.image"},"_id":"cioe_it","startUrl":"http:\/\/www.cioe.it\/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"categories","selector":"div#navigation a","delay":""},{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"div#contentBlock-1 div.news-list-item:nth-of-type(n+2) h2 a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"div.news-single-item h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.news-single-item > p,div.news-single-item p.bodytext","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"div.main-image img","downloadImage":false,"delay":""}]},
        'url':'http://www.cioe.it/music/articolo/davide-papasidero-torna-con-il-suo-nuovo-singolo/'
    };
    settings['affaritaliani_it'] = {
        'settings' :{"_id":"affaritaliani_it","startUrl":"http:\/\/www.affaritaliani.it\/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"categories","selector":"ul.menu-top a, div.menu-bottom-w a","delay":""},{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"h2.indent a, article.strillo-big h2 a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"h2.sottotitolo, div.contenuto-testo-mpesotto p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"img.contenuto-foto-img","downloadImage":false,"delay":""}]},
        'url':''
    };

    settings['liberoquotidiano_it'] = {
        'settings' : {"_id":"liberoquotidiano_it","startUrl":"http:\/\/www.liberoquotidiano.it\/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"categories","selector":"div.container_menu ul.menu_1 > li > a","delay":""},{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"h2.titolo a","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1.titolo_articolo","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.testo_articolo p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"div.foto_articolo img","downloadImage":false,"delay":""}],"regExp":{"image":"detail.image = 'http:\/\/www.liberoquotidiano.it\/' + detail.image"}},
        'url':'http://www.liberoquotidiano.it/news/politica/11883190/denis-verdini-pizzino-renzi-berlusconi-sinistra-pd-referendum-autunno-maggioranza-senato.html'
    };


    settings['ansa_it'] = {
        'settings' :{"_id":"ansa_it","startUrl":"http://www.ansa.it/sito/ansait_rss.xml","selectors":[]},
        'url':''
    };


    settings['repubblica_it'] = {
        'settings' :{"rss":"http://www.repubblica.it/rss/homepage/rss2.0.xml","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"categories","selector":"nav a","delay":""},{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"article.rullo01 h2 a:nth-of-type(1)","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"div.body-text > span, p.summary","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"a.zoom-foto img","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"p.firma-articolo","regex":"","delay":""},{"parentSelectors":["comment"],"type":"SelectorText","multiple":true,"id":"comment_author","selector":"div.gig-comments-comment span.gig-comments-username, div.gig-comments-comment-child span.gig-comments-username","regex":"","delay":""}],"startUrl":"http://www.ilsecoloxix.it/","_id":"ilsecoloxix_it"},
        'url':'http://www.repubblica.it/economia/2016/02/27/news/il_papa_agli_imprenditori_troppi_giovani_prigionieri_della_precarieta_-134357659/?ref=search'
    };

    settings['leccotoday'] = {
        'settings' :{"_id":"leccotoday","startUrl":"http:\/\/www.leccotoday.it\/","selectors":[{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"categories","selector":"nav.secondary-nav a.link","delay":""},{"parentSelectors":["_root"],"type":"SelectorLink","multiple":true,"id":"stories","selector":"h1.story-heading a.link, h2.story-heading a.link, h3.story-heading a.link","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"title","selector":"h1.entry-title","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":true,"id":"description","selector":"p.summary, div.entry-content-body p","regex":"","delay":""},{"parentSelectors":["stories"],"type":"SelectorImage","multiple":false,"id":"image","selector":"a.fancybox img","downloadImage":false,"delay":""},{"parentSelectors":["stories"],"type":"SelectorText","multiple":false,"id":"author","selector":"span.author-name","regex":"","delay":""}]},
        'url':''
    };


    /*
     settings[''] = {
     'settings' :,
     'url':''
     };
     settings[''] = {
     'settings' :,
     'url':''
     };
    settings[''] = {
        'settings' :,
        'url':''
    };
       */

    if(!isNaN(key)) {
        var n = 0
        for(var i in settings) {
            if(n == key) {
                return settings[i]
            }
            n++
        }
    }
    else if(settings[key] != undefined) {
        return settings[key]
    }


}


