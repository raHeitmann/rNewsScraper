$(document).on("click", "#scraperBtn", function() {
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
  .done(function(data) {
    alert("scraped!");
    location.reload();
});
});


//TODO, CHANGE THIS TO SAVED ARTICLES
$(document).on("click", "#newNoteBtn", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");


  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

$(document).on("click", "#saveArticleBtn", function() {

var thisId = $(this).attr("data-id");
$(this).attr("id", "alreadySaved");
$(this).text("Saved!");

$.ajax({
  method: "GET",
  url: "/saveArticle/" + thisId,

})
  // With that done, add the note information to the page
  .done(function(data) {
    console.log(data);


  });
});


$(document).on("click", "#savenote", function() {

  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  $("#titleinput").val("");
  $("#bodyinput").val("");
});
