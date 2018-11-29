var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
var labelModel = require('./schema.js').getModel()
var http = require('http');
var path = require('path');
var fs = require('fs')

var app = express()
    , dbUri = process.env. MONGODB_RUI || 'mongodb://127.0.0.1/knowledge'
    , server = http.createServer(app)
    , port = process.env.PORT ? parseInt(proces.env.PORT) : 8080;
;

function startServer() {
  app.use(bodyParser.json({
    limit: '16mb'
  }))
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/', (req, res, next) => {
    console.log(req.query)
    var label = new labelModel({
          date: new Date()
        , url: req.query.url
        , label: req.query.label

    });
    label.save()

    res.redirect(req.query.url)
  });


  server.on('listening', () => {

    /* Determining what the server is listening for */
    var addr = server.address(),
      bind = typeof addr === 'string' ?
      'pipe ' + addr :
      'port ' + addr.port;

    /* Outputs to the console that the webserver is ready to start listenting to requests */
    console.log('Listening on ' + bind);
  });

  /* Tells the server to start listening to requests from defined port */
  server.listen(port);
}
startServer()

mongoose.connect(dbUri, function(err){
    if (err){
        return console.log(err)
    }
})
