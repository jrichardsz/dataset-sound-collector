var rec;
var audioChunks;
var currentMlClass;

document.addEventListener("DOMContentLoaded", function(event) {
    initializeListeners();

    navigator
        .mediaDevices
        .getUserMedia({
            audio: true,
            video: false
        })
        .then(stream => {
            handlerFunction(stream)
        });

    function handlerFunction(stream) {
        rec = new MediaRecorder(stream);
        rec.ondataavailable = e => {
            audioChunks.push(e.data);
            if (rec.state == "inactive") {
                let blob = new Blob(audioChunks, {
                    type: 'audio/x-wav'
                });
                sendData(blob, currentMlClass);
            }
        }
    }
});


function initializeListeners() {
    $(".container button[type='playDemo']").each(function(i, btn) {
        if (!$(btn).attr("sound")) {
            return;
        }

        $(btn).click(onPlayListener);
    })

    var idCount = 0;
    $(".container button[type='startRecording']").each(function(i, btn) {
        var startButton = $(btn);
        startButton.attr("id", `start_${idCount}`);
        startButton.attr("correlationId", idCount);
        startButton.click(onStartRecordingListener);

        //get image for effects purpose
        var imageLoading = startButton.children('img')[0];
        if(imageLoading){
          $(imageLoading).attr("id", `image_${idCount}`);
        }

        var stopButton = startButton.next();
        stopButton.attr("id", `stop_${idCount}`);
        stopButton.attr("correlationId", idCount);
        stopButton.click(onStopRecordingListener);

        idCount++;
    })
}


function onPlayListener(ev) {
    var relativeSoundUrl = $(ev.target).attr("sound");
    var fullUrl = window.location + relativeSoundUrl;
    var snd = new Audio(fullUrl);
    snd.play();
}

function onStartRecordingListener(ev) {
    console.log('Recording are started..');
    var startRecordingButton = ev.target;
    startRecordingButton.disabled = true;
    var correlationId = $(startRecordingButton).attr("correlationId")

    var imageLoading = $(`#image_${correlationId}`);
    imageLoading.css('display', 'inline');

    var stopRecordingButton = $(`#stop_${correlationId}`);
    stopRecordingButton.attr("disabled", false);
    audioChunks = [];
    rec.start();
}

function onStopRecordingListener(ev) {
    console.log("Recording are stopped.");
    var stopRecordingButton = $(ev.target);
    stopRecordingButton.attr("disabled", true);

    currentMlClass = stopRecordingButton.attr("mlClass");

    var correlationId = stopRecordingButton.attr("correlationId")

    var imageLoading = $(`#image_${correlationId}`);
    imageLoading.css('display', 'none');

    var startRecordingButton = $(`#start_${correlationId}`);
    startRecordingButton.attr("disabled", false);

    rec.stop();
}

function sendData(data, mlClassId) {
    var form = new FormData();
    var id = uuidv4();
    form.append('file', data, `${mlClassId}-${id}.wav`);
    form.append('mlClassId', mlClassId);
    //Chrome inspector shows that the post data includes a file and a title.
    $.ajax({
        type: 'POST',
        url: `/save-record?mlClassId=${mlClassId}`,
        data: form,
        cache: false,
        processData: false,
        contentType: false
    }).done(function(data) {
        console.log(data);
    });
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
