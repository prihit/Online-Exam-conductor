const video = document.getElementById('video')

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)


function startVideo(){
    navigator.getUserMedia(
        {
            video: {}
        },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

video.addEventListener('play', () => {
    var c = 0;
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        console.log(detections.length)
        if(detections.length === 0){
            alert("Warning!   Sit Properly!!");
            c++;
        }
        if(c>20){
            // window.location.replace("http://localhost:1234/edone")
            document.getElementById("exit").submit();
        }
    }, 100)
    
})