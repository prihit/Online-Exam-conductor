const video = window.video = document.querySelector('video');

const constraints = {
    audio: false,
    video: true
  };
  
  function handleSuccess(stream) {
    window.stream = stream; // make stream available to browser console
    video.srcObject = stream;
  }
  
  function handleError(error) {
    console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
  }
  
  navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);

