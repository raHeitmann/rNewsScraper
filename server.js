
// Dependencies
var express = require("express");
var exphbs  = require('express-handlebars');
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

var port = process.env.PORT || 8080;

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_psbm5rk8:a7b6vef5j53n0p0mefskdt3ei6@ds161503.mlab.com:61503/heroku_psbm5rk8");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// ======



app.get('/', function (req, res) {

  var query = Article.find({}).limit(25);
  
  query.exec(function (err, docs) {
    if (err) {
        throw Error;
    }
    res.render('home', {articles: docs});
  });

});

app.get('/noway', function (req, res) {

  var query = Article.find({saved:true});
  
  query.exec(function (err, docs) {
    if (err) {
        throw Error;
    }
    res.render('savedNotes', {articles: docs});
  });

});

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://www.reddit.com/r/news/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $(".title.may-blank.outbound").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).text();
      result.link = $(this).attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

              // First, check for duplicates using $addToSet
              Article.update({_id: entry._id}, {$addToSet:{title: entry.title,link: entry.link}});
              // Now, save that entry to the db
              entry.save(function(err, doc) {
                // Log any errors
                if (err) {
                  console.log(err);
                }
                // Or log the doc
                else {
                  console.log(doc);
                }
              });
    });
  });
  // Tell the browser that we finished scraping the text

  res.end();
});

// SAVES ARTICLES
app.get("/saveArticle/:id", function(req, res) {
  
  Article.findById(req.params.id, function (error, doc) {
    if (error) {
      res.send(error);

} else {
    // Update each attribute with any possible attribute that may 
    // have been submitted in the body of the request

    doc.saved = true;

    // Save the updated document back to the database
    doc.save(function (err, data) {
        if (err) {
            res.status(500).send(err)
        }
        res.send(data);
    });
  }
    // Article.findByIdAndUpdate(req.params.id, {saved: true});
});
});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {

  Article.findById(req.params.id, function(error, doc){})
  .populate("note").exec(function(error, doc){
    if (error) {
      res.send(error);
    }

    else {
      res.send(doc);
    }
  });

});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {

  var newNote = new Note(req.body);
  // save the new note that gets posted to the Notes collection
  newNote.save(function(error, doc) {
  if (error) {
    res.send(error);
  }

  else {
   Article.findByIdAndUpdate(req.params.id, {note: newNote._id});
  }
});

});


app.get("/savedNotes", function(req, res) {
  
    Article.find({saved:true}, function(error, doc) {
      if (error) {
        res.send(error);
      }
      else {
        res.send(doc);
      }
    });
  });


// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  
    Article.find({}, function(error, doc) {
      if (error) {
        res.send(error);
      }
      else {
        res.send(doc);
      }
    });
  });


// Listen on port 3000
app.listen(port, function() {
  console.log("App running on port "+port);
});
