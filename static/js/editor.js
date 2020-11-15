$(".instruments p").click(function(){

    if($(this).hasClass("selected")){
        return;
    }

    var ins = $(this).attr("id");


    selectedNoteType = ins;
    playCurrentNote(50);

    $(".instruments p").removeClass("selected");
    $(this).addClass("selected");
});


$(".key").click(function(){
    $(".key").removeClass("selected");
    $(this).addClass("selected");

    var pitch = "C4";
    var octave = $("#octave").val();
    var id = $(this).attr("id");

    if(id === "keyChigh"){
        selectedPitch = "C";
        octave++;
        selectedOctave = octave;
    } else {
        id = id.replace("key","").replace("sharp","#");
        selectedPitch = id;
        selectedOctave = octave;
    }
    playCurrentNote(50);




});



$(".increment").click(function(){

    var id = $(this).attr("id");
    var octave = $("#octave").val();

    if(id == "increase"){
        if (!(octave >= 7)){
            octave++;
        }
    } else {
        if (!(octave <= 1)){
            octave--;
        }
    }
    $("#octave").val(octave);
    $(".currentOctave").html(octave);
    selectedOctave = octave;
    octave++;
    $(".currentOctaveUp").html(octave);
    
    playCurrentNote(50);

});

function playCurrentNote(length){
    var n = Note.fromLatin(selectedPitch+selectedOctave);
    var freq = n.frequency();
    playNote(selectedNoteType,freq,length,selectedPitch+selectedOctave);
}


// Add notes

$(".measures").on("click", ".note", function(){
    if(!isDown){
        var note = selectedPitch+selectedOctave;
        var type = selectedNoteType;
        if(selectedNoteType == "remove"){
            $(this).attr("class","note");
            $(this).html("");
        } else {
            $(this).attr("class","note "+type);
            if(selectedNoteType == "noise"){
                note = "N";
            };
            $(this).html("<div class='fill'><p>"+note+"</p></div>");
            playCurrentNote(50);


            
            var measure = $(this).parent().parent().attr("id").split("-")[1];
            if(measure >= measures-4){
                var diff = measures-measure;
            }
            

            for(var i = 0; i < (4-diff); i++){
                $(".measures").append("<div class='measure' id='measure-"+(measures+1)+"'><p class='measureNumber'>"+(measures+1)+"</p><div class='beat'></div><div class='beat'></div><div class='beat'></div><div class='beat'></div></div>");
                $("#measure-"+(measures+1)+" .beat").html(`<div class='note'><div class='fill'></div></div><div class='note'><div class='fill'></div></div><div class='note'><div class='fill'></div></div><div class='note'><div class='fill'></div></div><div class='note'><div class='fill'></div></div><div class='note'><div class='fill'></div></div>`)
                measures = measures+1;
            }
            
        }
    }

});


function save(){

    var obj = {};
    var layers = 6;

    obj.name = $("#name").val();
    if(obj.name == ""){ obj.name = "Untitled Song"}
    obj.tempo = $("#tempo").val();

    var m = [];
    var measures = $(".measure");

    measures.each(function(e){
        var measure = $(measures[e]);
        var final = {
            index: e,
            beats: {}
        }

        for(var i = 1; i < 5; i++){
            var notes = getNotes(e+1, i);
            final.beats[i] = [];

            notes.each(function(t){
                var pitch = $(notes[t]).find("p").html();

                var note = false;
                var n = $(notes[t]);
                if(n.hasClass("square")){ note = "square"}
                else if(n.hasClass("triangle")){ note = "triangle"}
                else if(n.hasClass("sawtooth")){ note = "sawtooth"}
                else if(n.hasClass("sine")){ note = "sine"}
                else if(n.hasClass("noise")){ note = "noise"}

                if(note != false){
                    final.beats[i].push(note+","+pitch)
                } else {
                    final.beats[i].push("");
                }
            });
        }
        m.push(final);

    });
    obj.measures = m;
    $.ajax({
        type: "POST",
        contentType: "application/json;charset=utf-8",
        url: "/song/submit/",
        traditional: "true",
        data: JSON.stringify(obj).replace("'", '"'),
        dataType: "json",
        success: function(response) {
            window.location.replace("/");
        },
        error: function(error) {
            window.location.replace("/");
        }
    });

    //download(JSON.stringify(obj), obj.name+'.5bit', 'text/plain');



}
$("#save").click(function(){
    save();
});
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

$("#tempo").on("change", function(){
    var t = $("#tempo").val();
    if(!isInt(t)){
        $("#tempo").val(120);
    } else {
        tempo = t;
    }
})


function isInt(str) {
    return !isNaN(str) && Number.isInteger(parseFloat(str));
  }