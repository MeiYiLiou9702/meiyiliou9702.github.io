$(function() {
  $("#info").click(function() {
      $("#sidebar").toggle();
      $("#accordion").accordion("option", { active: 0 });
      updateSize();
  });
  $("#btn-hide").click(function() {
      $("#sidebar").hide();
      updateSize();
  });
  $(window).resize(function() {
      updateSize();
  });  
});

updateSize();

function updateSize(){
  $("#container").css("height", $(window).height() - $("nav").height());
  $("#accordion").accordion({        //jQuery UI 
      heightStyle: "fill",
  });
   map.updateSize();
  $("#accordion").accordion("refresh");   
}
