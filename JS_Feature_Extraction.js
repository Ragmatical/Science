const puppeteer = require('puppeteer')
var mongoose = require('mongoose')
var labelModel = require("./schema.js").getModel();
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
var labelModel = require('./schema.js').getModel()
var http = require('http');
var path = require('path');
var getPixels = require("get-pixels");
var fs = require('fs')

var app = express(),
  dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1/db/knowledge',
  server = http.createServer(app),
  port = process.env.PORT ? parseInt(proces.env.PORT) : 27018;;

mongoose.connect(dbUri, function(err) {
  if (err) {
    return console.log(err)
  }
  labelModel.find({
    image:{'$ne':null}
  }, function(err, labels) {
        if(err) {
     return console.log(err)
  }
    gotPixels(labels, err)
  })
})

function gotPixels(labels, err){
    var label = lables.shift()
    var url = label.url;
    var image = new Buffer(label.image, "binary");
    getPixels(image, 'image/png', function(err, pixels) {
      if (err) {
        console.log("Bad image path")
        return
      }
      console.log("Got pixels", pixels.shape.slice())
    })
    getPixels(labels, err)
}