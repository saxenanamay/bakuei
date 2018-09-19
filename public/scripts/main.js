$("#comment-edit").on("click",function(){
    $(".edit-area").css('display','none');
    $(".edit-area-alt").css('display','block');
});
$("#alt-edit").on("click",function(){
    $(".edit-area-alt").css('display','none');
    $(".edit-area").css('display','block');
});