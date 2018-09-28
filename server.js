var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();

app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/newsScraper", {

});

app.get("/scrape", function(req, res) {

  axios.get("https://www.minecraftforum.net/news").then(function(response) {
 
    var $ = cheerio.load(response.data);

	$("div.post-excerpt-info").each(function(i, element) {

      var result = {};

      result.title = $(this).parent("div.post-excerpt-title").text();
      result.link = $(this).children().attr("href");
      result.summary = $(this).children("div.post-excerpt-description").text();

      db.Article.create(result)
        .then(function(dbArticle) {

          console.log(dbArticle);
        })
        .catch(function(err) {

          return res.json(err);
        });
    });
    event.preventDefault()

  });
});

app.get("/articles", function(req, res) {

  db.Article.find({})
    .then(function(dbArticle) {

      res.json(dbArticle);
    })
    .catch(function(err) {

      res.json(err);
    });
});

app.get("/articles/:id", function(req, res) {

  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {

      res.json(dbArticle);
    })
    .catch(function(err) {

      res.json(err);
    });

});

app.post("/articles/:id", function(req, res) {

  db.Note.create(req.body)
    .then(function(dbNote) {
    
      return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push:{ note: dbNote._id }}, { new: true });
    })
    .then(function(dbUser) {

      res.json(dbUser);
    })
    .catch(function(err) {
 
      res.json(err);
    });
});

app.post("/savedArticles/:id", function(req, res) {
	console.log(req.params.id)
	var ObjectId = 'ObjectId("' + req.params.id + '")';
	console.log(ObjectId)
	db.Article.findOneAndUpdate({ _id: ObjectId }, {$push: { saved: "yes" }}, { new: true });
        
})

app.listen(PORT, function() {
  console.log("App running on port " + PORT);
});