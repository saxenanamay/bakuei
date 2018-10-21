
$(".list-group-item").on("click",function(){
    $(".list-group-item").removeClass("active");
    $(this).addClass("active");
})
$(".list-group-item-info").on("click",function(){
    $(".map").removeClass("front").addClass("back");
    $(".info").removeClass("back").addClass("front");
})
$(".list-group-item-map").on("click",function(){
    $(".info").removeClass("front").addClass("back");
    $(".map").removeClass("back").addClass("front");
})

  