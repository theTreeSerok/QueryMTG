var http = require('http');
var url = require('url');
var query = require('querystring');
var fs = require('fs');
var requestHandler = require('request');

// developer sdk found at: https://github.com/MagicTheGathering/mtg-sdk-javascript
const mtg = require('mtgsdk');

// node server ports for running on Heroku or locallly on port 3000
var port = process.env.PORT || process.env.NODE_PORT || 3000;

// client resources
var index = fs.readFileSync(__dirname + '/../client/client.html');
var clientJS = fs.readFileSync(__dirname + '/../client/js/client.js');
var css = fs.readFileSync(__dirname + '/../client/css/style.css');
var bgImg = fs.readFileSync(__dirname + '/../client/img/ArtOfMagic-Zendikar.jpg');
var wLogo = fs.readFileSync(__dirname + '/../client/img/logo-white.png');
var bLogo = fs.readFileSync(__dirname + '/../client/img/logo-black.png');

var responseHeaders = {  
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "Content-Type, accept",
    "access-control-max-age": 10,
    "Content-Type": "application/json"
};

function onRequest(req, res) {
    var parsedUrl = url.parse(req.url);
    var params = query.parse(parsedUrl.query);
    //console.log(parsedUrl);

    // if the url contains mtgSearch, signifying a query, allow that
    if(parsedUrl.pathname === "/mtgSearch") {
        mtgSearch(req, res, params);
    }
    
    // proxy images to be able to serve over https
    else if(parsedUrl.pathname.includes("/multiverseid")) {
        var idQuery = req.url.split('?')[1];
        
        try{
            var imgUrl = "http://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=" + idQuery;

            // make a request to the url and pipe (feed) the returned ajax call to our client response
            // we don't know for sure what image type we'll get back, so let's just use what's given dynamically
            requestHandler.get(imgUrl).on('response', function(mtgResponse) {
                res.writeHead(200, { "Content-type": mtgResponse.headers["content-type"] });
            }).pipe(res);
        }
        catch(exception) {
            console.dir(exception);
            
            // write a 500 error out
            response.writeHead(500, responseHeaders);

            // json error message to respond with
            var responseMessage = {
                message: "Error connecting to server. Check url and arguments for proper formatting"
            }

            // stringify JSON message and write it to response
            response.write(JSON.stringify(responseMessage));

            // send response
            response.end();
        }
    }
	
    // all other requests are probably client resources
    else if(req.url === ("/js/client.js")) {                    // load client side javascript
        res.writeHead(200, { "Content-Type": "text/javascript" });
        res.write(clientJS);
        res.end();
    }
    else if(req.url === ("/css/style.css")) {                   // load css
        res.writeHead(200, { "Content-Type": "text/css" });
        res.write(css);
        res.end();
    }
    else if(req.url === ("/img/ArtOfMagic-Zendikar.jpg")) {     // load background image
        res.writeHead(200, { "Content-Type": "image/jpg" });
        res.write(bgImg);
        res.end();
    }
    else if(req.url === ("/img/logo-white.png")) {              // load the white logo used in header
        res.writeHead(200, { "Content-Type": "image/png" });
        res.write(wLogo);
        res.end();
    }
    else if(req.url === ("/img/logo-black.png")) {              // load the black logo used in favicon
        res.writeHead(200, { "Content-Type": "image/png" });
        res.write(bLogo);
        res.end();
    }
    else {                                                      // load index.html
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(index);
        res.end();
    }
}

var queryFlags = {
    name: "n:",
    set: "s:",
    color: "c:",
    type: "t:",
    artist: "a:",
    rarity: "r:",
    power: "pw:",
    toughness: "tn:"
};

function mtgSearch(req, res, params) {
    var queryName = params.name;
    
    // create an empty object to dynamically add flag-specific properties if applicable
    // will be passed to the API call if it has any properties by the time it's needed
    var query = { };
    
    var flagsUsed = [];

    // add flags in order of appearance to flagsUsed, if applicable
    for(var i = 0; i < queryName.length; i++) {
        // check for most flags by finding characters matching them
        var currentCheck = queryName[i].concat(queryName[i+1]);

        // if appearing to match power or toughness flags (which have 2 letters, then colon)
        // check for colon in the third character
        if (currentCheck == 'pw' || currentCheck == 'tn') {
            if (queryName[i+2] == ':') {
                currentCheck = currentCheck.concat(queryName[i+2])
            }
        }

        // add flag, if found, to flagsUsed
        if(currentCheck == queryFlags.set) {
            flagsUsed.push(queryFlags.set);
        }
        else if(currentCheck == queryFlags.color) {
            flagsUsed.push(queryFlags.color);
        }
        else if(currentCheck == queryFlags.type) {
            flagsUsed.push(queryFlags.type);
        }
        else if(currentCheck == queryFlags.artist) {
            flagsUsed.push(queryFlags.artist);
        }
        else if(currentCheck == queryFlags.rarity) {
            flagsUsed.push(queryFlags.rarity);
        }
        else if(currentCheck == queryFlags.power) {
            flagsUsed.push(queryFlags.power);
        }
        else if(currentCheck == queryFlags.toughness) {
            flagsUsed.push(queryFlags.toughness);
        }
        // this seemed to catch 'tn:' as 'n:' exists within it,
        // so I had to put an extra check in here
        else if (currentCheck == queryFlags.name && queryName[i-1] != 't') {
            flagsUsed.push(queryFlags.name);
        }
    }

    // parse out specific flag-specific queries
    var flagTerms = [];

    if(flagsUsed.length > 0) {
        for(var i = 0; i < flagsUsed.length; i++) {
            // get beginning index of a flag string
            var start = queryName.indexOf(flagsUsed[i]);

            // get end index of the flag string
            var end = null;
            // if the last flag, end will be the end of the entire query
            if (i == flagsUsed.length - 1) {
                end = queryName.length;
            }
            // else, find the beginning of the next flag to use as the cutoff
            else {
                end = queryName.indexOf(flagsUsed[i+1]);
            }

            // slice out just that flag-specific query string
            var subQuery = queryName.slice(start, end);
            
            // add it to the flagTerms array
            flagTerms.push(subQuery);
        }
    }

    // add properties for each query type to the query object
    // that we will eventually pass to the API
    if(flagTerms.length > 0) {
        for(var i = 0; i < flagTerms.length; i++) {
            if(flagTerms[i].includes(queryFlags.name) && !(flagTerms[i].includes(queryFlags.toughness))) {
                var nameQuery = flagTerms[i].replace(queryFlags.name, "").trim()
                query.name = nameQuery;
            }
            else if(flagTerms[i].includes(queryFlags.set)) {
                var setQuery = flagTerms[i].replace(queryFlags.set, "").trim()
                query.setName = setQuery;
            }
            else if(flagTerms[i].includes(queryFlags.color)){
                var colorQuery = flagTerms[i].replace(queryFlags.color, "").trim()
                query.colors = colorQuery;
            }
            else if(flagTerms[i].includes(queryFlags.type)){
                var typeQuery = flagTerms[i].replace(queryFlags.type, "").trim()
                query.type = typeQuery;
            }
            else if(flagTerms[i].includes(queryFlags.artist)){
                var artistQuery = flagTerms[i].replace(queryFlags.artist, "").trim()
                query.artist = artistQuery;
            }
            else if(flagTerms[i].includes(queryFlags.rarity)){
                var rarityQuery = flagTerms[i].replace(queryFlags.rarity, "").trim()
                query.rarity = rarityQuery;
            }
            else if(flagTerms[i].includes(queryFlags.power)){
                var powerQuery = flagTerms[i].replace(queryFlags.power, "").trim()
                query.power = powerQuery;
            }
            else if(flagTerms[i].includes(queryFlags.toughness)){
                var toughnessQuery = flagTerms[i].replace(queryFlags.toughness, "").trim()
                query.toughness = toughnessQuery;
            }
        }
    }
    
    // get how many properties our query object has
    // if none, default to searching by name
    if(Object.keys(query).length == 0) {
        mtg.card.where( { name: queryName } ).then(cards => {
            res.writeHead(200, responseHeaders);
            res.write(JSON.stringify(cards));
            res.end();
        }); 
    }
    // if flags exist, pass in the query object we built from the flags
    else {
        mtg.card.where(query).then(cards => {
            res.writeHead(200, responseHeaders);
            res.write(JSON.stringify(cards));
            res.end();
        }); 
    }
}

http.createServer(onRequest).listen(port);

console.log("Listening on 127.0.0.1:" + port);