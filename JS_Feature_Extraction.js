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
  port = process.env.PORT ? parseInt(proces.env.PORT) : 27018;

mongoose.connect(dbUri, function(err) {
    if (err) {
        return console.log(err)
    }
    console.log('finding');
    labelModel.find({
        image:{'$ne':null}
        , colorCount:{'$ne':null}
    }).select('_id').exec(function(err, labels) {
        console.log('found');
        if(err) {
            return console.log(err)
        }
        gotPixels(labels, err)
    })
})


function gotPixels(labels){
    if(!labels.length) return;
    var label = labels.shift();
    labelModel.findById(label._id, function(err, l) {
        var url = l.url;
        var image = new Buffer(l.image, "binary");
        getPixels(image, 'image/png', function(err, pixels) {
            if (err) {
                console.log("Bad image path")
                return
            }
            saveToDatabase(label, pixels, l, function() {
                console.log("Got pixels")
                gotPixels(labels)
            })
        })
    })
}

function saveToDatabase(label, pixelData, url, cb) {
    console.log("Started Saving to DB")
    var pixelShape = pixelData.shape.slice()
    var width = pixelShape[0]
    var height = pixelShape[1]
    var colorMap = {};
    var averageRed = 0
    var averageGreen = 0
    var averageBlue = 0
    for(var i = 0; i < pixelData.data.length; i+=4) {
        var red = parseInt(pixelData.data[i]/32);
        var green = parseInt(pixelData.data[i+1]/32);
        var blue = parseInt(pixelData.data[i+2]/32);
        var alpha = pixelData.data[i+3];
        var color = red + '' + green + '' + blue + '';
        averageRed += red
        averageGreen += green
        averageBlue += blue
        colorMap[color] = colorMap[color] || 0;
        colorMap[color]++;
    }
    colorCount = Object.keys(colorMap).length;
    averageRed /= pixelData.data.length;
    averageGreen /= pixelData.data.length;
    averageBlue /= pixelData.data.length;
    var maxColorCount = -1;
    var mostPopular = Object.keys(colorMap).reduce(function(m, key) {
        var ct = Math.max(colorMap[key], maxColorCount);
        if(ct>maxColorCount) {
            maxColorCount = ct;
            mostPopular = key;
        }
        return mostPopular;
    });
    label.averageRed = averageRed
    label.averageGreen = averageGreen
    label.averageBlue = averageBlue
    label.colorCount = colorCount
    label.mostPopular = mostPopular
    label.save(function(err) {
        console.log(err || "saved to DB")
        console.log(colorCount, mostPopular, maxColorCount)
        cb();
    })
}