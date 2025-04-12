// client-side recording.js
const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      let chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const formData = new FormData();
        formData.append('video', blob, 'recording.webm');
        
        // Upload to server
        await fetch('/api/videos/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
      };
      
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 15000); // 15s short video
    } catch (err) {
      console.error('Error recording:', err);
    }
  };
  
  // Live Streaming with WebRTC
  const startLiveStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const peer = new SimplePeer({
      initiator: true,
      stream: stream,
      config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
    });
    
    peer.on('signal', data => {
      // Send this signal data to server
      socket.emit('stream-signal', data);
    });
    
    // Display local stream
    videoElement.srcObject = stream;
  };