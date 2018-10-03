var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/article";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// A GET route for scraping the website
app.get("/scraper", function(req, res) {
  // Grab the body of the html with axios
  axios.get("https://www.minecraftforum.net/news").then(function(response) {
    // Load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    
    $("article").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("div.post-excerpt").children("div.post-excerpt-info").children("div.post-excerpt-content").children("h2.post-excerpt-title").text();
      result.link = $(this).children("div.post-excerpt").children("div.post-excerpt-preview").children("a").attr("href");
      result.summary = $(this).children("div.post-excerpt").children("div.post-excerpt-info").children("div.post-excerpt-content").children("div.post-excerpt-description").text();
      console.log("title: " + result.title)
      console.log("link: " + result.link)
      console.log("summary: " + result.summary)

      if (result.title && result.link && result.summary) {
        db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {;
          console.log(err)
          // If an error occurred, send it to the client
          // return res.json(err);
        });
      }
            // Create a new Article using the `result` object built from scraping
      
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
   res.send("Scrape complete");
  });
});

// Route for getting all Articles from the db
app.get("/article", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/article/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/article/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
