
$.getJSON("/articles", function(data) {

    for (var i = 0; i < data.length; i++) {

      $("#articles").append("<div>" + "<p>" + "<strong>Title: </strong>" + data[i].title + "<br />" + "<strong>Summary: </strong>" + data[i].summary + "<br />" + "<strong>Link: </strong>" + "<a href='" + data[i].link + "'>" + "Minecraft" + "</a>" + "</p>" + "<button class='saveArticle'" + "data-id='" + data[i]._id + "'>" + "Save Article</button>" + "</div>" + "<br>");
    }
  });
  
  $(document).on("click", "#run-scrape", function() {

      location.href = "/scrape"
  
  });
  
  $(document).on("click", "#show-articles", function() {
    $.getJSON("/articles", function(data) {

      location.href = "/"
      for (var i = 0; i < data.length; i++) {

        $("#articles").append("<p data-id='" + data[i]._id + "'>" + "<strong>Title: </strong>" + data[i].title + "<br />" + "<strong>Summary: </strong>" + data[i].summary + "<br />" + "<strong>Link: </strong>" + "<a href='" + data[i].link + "'>" + "Minecraft" + "</a>" + "</p>");
      };
    });
  });
  
  $(document).on("click", ".articleSave", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "POST",
      url: "/articleSave/" + thisId,
      data: {
          saved: "yes"
      }
    });
  });

  $(document).on("click", "#savenote", function() {

    var thisId = $(this).attr("data-id");
  
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {

        title: $("#titleinput").val(),

        body: $("#bodyinput").val()
      }
    })

      .then(function(data) {

        console.log(data);

        $("#notes").empty();
      });
  
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });