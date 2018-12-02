const puppeteer = require('puppeteer')
var mongoose = require('mongoose')
var labelModel = require("./schema.js").getModel();
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
var labelModel = require('./schema.js').getModel()
var http = require('http');
var path = require('path');
var fs = require('fs')
var app = express()
    , dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1/db/knowledge'
    , server = http.createServer(app)
    , port = process.env.PORT ? parseInt(proces.env.PORT) : 27018;
;
var browser;

async function startBrowser() {
    browser = await puppeteer.launch({args:['--no-sandbox']});
    console.log(dbUri);
    mongoose.connect(dbUri, function(err){
        if (err){
            return console.log(err)
        } 
        check()
    })
}




function check() {
    console.log("Starting Process")
    labelModel.find({image:null}, async function(err, labels) {
        if(err) {
            console.log("Found an error")
            console.log(err)
            return
        }
        if(labels.length === 0) {
            console.log("No new links found")
            return
        }
        console.log("Found sites needing scraping, opening browser")
        openBrowser(err, labels)
        setTimeout(check, 1000*3600)
    })
}

async function openBrowser(err, labels){
    const page = await browser.newPage();
    console.log("Opened the browser")
    console.log("Starting for loop")
    for (var i = 0; i < labels.length;) {
        var label = labels[i]
        var url = label.url
        console.log(url)
        label.image = await scrapeImage(browser, page, url);
        label.text = await scrapeText(browser,page,url)
        label.save();
        console.log("Scraped "+ ++i +" site(s)")
    }
  await browser.close()
}

async function scrapeText(browser,page, url) {
  await page.goto(url)
  const result = await page.evaluate(() => {
    return document.querySelector('html').innerHTML
  })
  return result;
}

async function scrapeImage(browser, page, url) {
    await page.goto(url);
    const buffer = await page.screenshot({
        fullPage: true
    });
    return buffer;
}

startBrowser()