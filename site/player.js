    // create web audio api context
    var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    var selectedNoteType = "square";
    var selectedPitch = "F";
    var selectedOctave = 4;
    
    var layers = 6;
    var measures = 20;


    let isDown = false;
    let startX;
    let scrollLeft;
    
    function initialize(){
        var measureString = "";
        for(var i =0; i < layers; i++){
            $(".layers").append(`
            <div class="layer" id="layer-`+i+`">
                <p>Layer `+i+`</p><p class="mute">Mute</p>
            </div>`);
            measureString = measureString + `<div class="note"></div>`
        }
        $(".layers").append('<div class="measures noselect"> <div class="playMarker"></div> </div>');
        for(var i = 0; i < measures; i++){
            
            $(".layers .measures").append(`
                <div class="measure" id='measure-`+(i+1)+`'>
                    <p class="measureNumber">`+(i+1)+`</p>
                    <div class="beat">
                        `+measureString+`
                    </div>
                    <div class="beat">
                        `+measureString+`
                    </div>
                    <div class="beat">
                        `+measureString+`
                    </div>
                    <div class="beat">
                        `+measureString+`
                    </div>
                </div>
            `)
    
        }
    
        $(".measures").height(layers*60);
    }
    
    initialize();
    
    
    function playNote(type, frequency, duration, vol) {
      // create Oscillator node
    
    
      //SQUARE OSCILLATOR
        var oscillator = audioCtx.createOscillator();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        var gainNode = audioCtx.createGain();
    
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
    
    
      setTimeout(
        function() {
            gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime); 
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);
            setTimeout(function(){
                oscillator.stop();
            }, 30)
        }, duration);
        }

var tempo = 160;
var barWidth = 60;

var player = {
    active: false,
    xPosition: 0,
    measure: 1,
    beat: 1
}

$("#play").click(function(){
    if(!player.active){
        player.active = true;
        $(".playMarker").addClass("active");
        initialPlay();
    }
});
$("#pause").click(function(){
    if(player.active){
        player.active = false;

    }
});
$("#stop").click(stop);
function stop(){
    player = {
        active: false,
        xPosition: 0,
        measure: 1,
        beat: 1
    }
    $(".playMarker").css("left","0px");
    $(".playMarker").removeClass("active");
}
function initialPlay(){
    //var scroll = $(".measures").scrollLeft(player.xPosition);
    play();
}
function play(){
    processNote();
    setTimeout(function(){
        if(!player.active){ return };
        

        var scroll = $(".measures").scrollLeft();

        var width = $(".measures").width();
        console.log(player.xPosition-scroll);
        console.log(width);
        if(Math.abs(player.xPosition - scroll) > width){
            
            $(".measures").scrollLeft(player.xPosition);
        }
        player.xPosition+=barWidth;

        $(".playMarker").css("left",player.xPosition+"px");

        player.beat++;
        if(player.beat > 4){
            player.beat = 1;
            player.measure++;
        }
        if(player.measure > measures){
            stop();
            return;
        }
        processNote();
        play();


    }, 60000/tempo/4);
};
function processNote(){
    var notes = getNotes(player.measure, player.beat);
        notes.each(function(e){
            var pitch = $(notes[e]).find("p").html();


            var note = false;
            var n = $(notes[e]);
            if(n.hasClass("square")){ note = "square"}
            else if(n.hasClass("triangle")){ note = "triangle"}
            else if(n.hasClass("sawtooth")){ note = "sawtooth"}
            else if(n.hasClass("sine")){ note = "sine"}
            else if(n.hasClass("noise")){ note = "noise"}

            if(note != false){
                playNoteInPlayer(note, pitch);
            }

        });
}

function playNoteInPlayer(noteType, pitch){
    var n = Note.fromLatin(pitch);
    var freq = n.frequency();
    playNote(noteType,freq,60000/tempo/4-10,5);
}

function getNotes(measureNum, beatNum){
    return $("#measure-"+measureNum+" .beat:nth-of-type("+beatNum+") .note")
}



const slider = document.querySelector(".measures");
var initialX;
var finalX;
var canMove = true;

var movingMarker = false;
$(".playMarker").mousedown(function(){
    if(isDown){ return }
    movingMarker = true;
})
$(".playMarker").mouseup(function(){
    movingMarker = false;
});

$(document).mousemove(function(evt){
    
    if(!movingMarker){ return }
    var x = evt.pageX - $(".measures").offset().left+$(".measures").scrollLeft();
    x = Math.round(x / 60)*60;
    if(canMove){
        $(".playMarker").css("left",x+"px");
    }
    var beats = x/60;
    var remainder = beats % 4;
    var measure = (beats - remainder)/4;
    console.log("Measure: "+(measure+1));
    console.log("Remainder: "+(remainder+1));
    player.measure = measure+1;
    player.beat = remainder+1;
    player.xPosition = x;
});

document.addEventListener("mouseup", e => {
    movingMarker = false;
})

slider.addEventListener("mousedown", e => {
  if(movingMarker){return}
  isDown = true;
  slider.classList.add("active");
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;

  initialX = startX;
});

slider.addEventListener("mouseenter", () => {
    canMove = true;
})

slider.addEventListener("mouseleave", () => {
  isDown = false;
  slider.classList.remove("active");
  canMove = false;
});
slider.addEventListener("mouseup", e => {
  finalX = e.pageX - slider.offsetLeft;

  if(finalX != startX){
    setTimeout(function(){
        slider.classList.remove("active");
  isDown = false;
    }, 2)
    
    return;
  }

  slider.classList.remove("active");
  isDown = false;
  movingMarker = false;
});
slider.addEventListener("mousemove", e => {
    if(movingMarker){
        
    }
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const walk = x - startX;
  slider.scrollLeft = scrollLeft - walk;
});

