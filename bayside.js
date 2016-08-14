function createApplication(config) {
    const http = require('http'),
    fs = require('fs'),
    port = config.port ? config.port : 3000,
    jsonBody = require("body/json");

    var staticHandler = function (request, response) {
        fs.readFile(config.root + request.url, function (err, file) {
                if (err) {
                    views.page500(request, response, err);
                    return console.log('something bad happened', err);
                }

                var fileType = request.url.split('.').pop();
                switch (fileType) {
                    case "css":
                        response.writeHeader(200, {"Content-Type": "text/css"});
                        break;
                    case "gif":
                        response.writeHeader(200, {"Content-Type": "image/gif"});
                        break;
                    case "jpg":
                        response.writeHeader(200, {"Content-Type": "image/jpeg"});
                        break;
                    case "jpeg":
                        response.writeHeader(200, {"Content-Type": "image/jpeg"});
                        break;
                    case "js":
                        response.writeHeader(200, {"Content-Type": "text/javascript"});
                        break;
                    case "png":
                        response.writeHeader(200, {"Content-Type": "image/png"});
                        break;
                    default:
                        break;                  
                }
                
                response.write(file);
                response.end();
            });
    }

    // any server requests that post data should be sent here
    var parseJson = function (request, response, callback) {
        jsonBody(request, response, function (err, body) {
            if (err) {
                console.log("error with parseJson function " + err);
            }
            
            callback(body);
        });
    }

    // standard json response
    var returnJson = function (response, json) {
        json = JSON.stringify(json);
        response.writeHeader(200, {"Content-Type": "application/json"}); 
        response.write(json);
        response.end();
    }

    var requestHandler = (request, response) => {
        if (request.url.includes("%7Broot%7D")) {
            request.url = request.url.replace("%7Broot%7D/", "");
            return staticHandler(request, response);
        }

        var url = this.urls[request.url];
        if (url) {
            return url(request, response)
        }

        return views.page404(request, response);
    } 

    // views
    this.views = {
        index: function (request, response) {
            fs.readFile('./index.html', function (err, html) {
                if (err) {
                    views.page500(request, response, err);
                    return console.log('something bad happened', err);
                }

                response.writeHeader(200, {"Content-Type": "text/html"});  
                response.write(html);
                response.end();
            });
        },
        page404: function (request, response) {
            response.writeHeader(404, {"Content-Type": "text/html"});  
            response.write("Page Not Found");  
            response.end();
        },
        page500: function (request, response, error) {
            response.writeHeader(500, {"Content-Type": "text/html"});  
            response.write("Server 500: " + error);  
            response.end();
        }
    }

    // urls 
    this.urls = { 
        '/': this.views.index
    }

    const server = http.createServer(requestHandler)

    // error handler
    server.listen(port, (err) => {  
    if (err) {
        views.page500(request, response, err);
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
    })
}

exports = module.exports = createApplication;