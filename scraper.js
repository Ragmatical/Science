const puppeteer = require('puppeteer')
var labelModel = require("./schema.js").getModel();
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
var http = require('http');
var path = require('path');
var fs = require('fs')
var browser;

var app = express(),
  dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1/db/knowledge',
  server = http.createServer(app),
  port = process.env.PORT ? parseInt(proces.env.PORT) : 27018;


async function openBrowser(err, labels) {
  browser = await puppeteer.launch({args:['--no-sandbox']});
  let page = await browser.newPage();
  console.log("Opened the browser")
  console.log("Starting for loop")
  for (var i = 0; i < labels.length;) {
    var label = labels[i]
    var url = label.url
    console.log(url)
    try{
        console.log("Going to url")
        await page.goto(url, { waitUntil: 'load' });
        console.log("Scraping Text")
        label.text = await scrapeText(browser, page, url);
        console.log("Scraping Image")
        label.image = await scrapeImage(browser, page, url);
        console.log("Saving to DB")
        label.save();
    }
    catch(ex){
        console.log('error scraping page', ex);
        try {
            console.log("Closing Browser");
            await browser.close();
        } catch(ex) {
            console.log('error closing browser', ex);
        }
        browser = await puppeteer.launch({args:['--no-sandbox']});
        console.log("Creating new page");
        page = await browser.newPage();
    }
    
    console.log("Scraped " + ++i + " site(s)")

  }
  
}

async function scrapeText(browser, page, url) {
  const result = await page.evaluate(() => {
    return document.querySelector('html').innerHTML
  })
  return result;
}

async function scrapeImage(browser, page, url) {
  const buffer = await page.screenshot({
    fullPage: true
  });
  return buffer;
}



async function startBrowser() {
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


startBrowser()
