var querystring = require('querystring'),
    formidable = require('formidable'),
    path = require('path'),
    fs = require('fs'),
    mime = require('./mime').types;

function start(response, request) {
    console.log("Request handler 'start' is called.");

    var body = '<html>'+
        '<head>'+
        '<meta http-equiv="Content-Type" content="text/html; '+'charset=UTF-8" />'+
        '</head>'+
        '<body>'+
        '<form action="/upload" enctype="multipart/form-data" method="post">'+
        '<input type="file" name="upload"/>'+
        '<input type="submit" value="Upload file" />'+
        '</form>'+
        '</body>'+
        '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function upload(response, request) {
    console.log("Request handler 'upload' is called.");

    var form = new formidable.IncomingForm();
    console.log("about to parse");
    form.parse(request, function(error, fields, files) {
        console.log("parsing done");
        fs.renameSync(files.upload.path, "/tmp/test.png");
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write("received image:<br/>");
        response.write("<img src='/show'/>");
        response.end();
    });
}

function show(response, request) {
    console.log("Request handler 'show' was called.");
    fs.readFile("/tmp/test.png", "binary", function(error, file) {
        if (error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            response.writeHead(200, {"Content-Type": "image/png"});
            response.write(file, "binary");
            response.end();
        }
    });
}

function readFile(response, request, pathname) {
    console.log("Request handler 'readFile' was called.");
    var realPath = "assets" + pathname;

    path.exists(realPath, function (exists) {
        if (! exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not found");
            response.end();
        } else {
            fs.readFile(realPath, "binary", function (err, file) {
                if (err) {
                    response.writeHead(500, {"Content-Type": "text/plain"});
                    response.write("500 internal error");
                    response.end();
                } else {
                    var ext = path.extname(realPath);
                    ext = ext ? ext : 'unknown';
                    var contentType = mime[ext] || 'text/plain';
                    response.writeHead(200, {"Content-Type": contentType});
                    response.write(file, "binary");
                    response.end();
                }
            });
        }
    });
}

exports.start = start;
exports.upload = upload;
exports.show = show;
exports.readFile = readFile;
