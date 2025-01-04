import React, { useState, useEffect } from "react";
import "../index.css"; // Import your global styles

const VoiceRecorder = () => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);

  const fetchRecordings = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/list-audios/");
      const data = await response.json();
      if (response.ok) {
        setRecordings(data.files);
      } else {
        console.error("Error fetching recordings:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(chunks, { type: "audio/wav" });
      setAudioBlob(audioBlob);
      const audioURL = URL.createObjectURL(audioBlob);
      const audioElement = document.getElementById("audio-playback");
      audioElement.src = audioURL;
      setIsRecording(false);
    };

    mediaRecorder.start();
    setIsRecording(true);

    document.getElementById("stop-recording").addEventListener("click", () => {
      mediaRecorder.stop();
    });
  };

  const onUploadRecording = async () => {
    if (!audioBlob) {
      setUploadStatus("No audio to upload!");
      return;
    }

    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");

    try {
      const response = await fetch("http://127.0.0.1:8000/upload-audio/", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setUploadStatus(`✅ Uploaded successfully! File path: ${data.file_path}`);
        fetchRecordings(); // Refresh the list of recordings
      } else {
        setUploadStatus(`❌ Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setUploadStatus("❌ An error occurred while uploading the recording.");
    }
  };

  return (
    <div className="recorder-container">
      <h1 className="recorder-title">🎙 Voice Recorder</h1>
      <div className="button-container">
        <button
          className={`record-button ${isRecording ? "disabled" : ""}`}
          onClick={startRecording}
          disabled={isRecording}
        >
          {isRecording ? "Recording..." : "Start Recording"}
        </button>
        <button
          className="stop-button"
          id="stop-recording"
          disabled={!isRecording}
        >
          Stop Recording
        </button>
      </div>
      <audio id="audio-playback" controls className="audio-player"></audio>
      <button className="upload-button" onClick={onUploadRecording}>
        Upload Recording
      </button>
      {uploadStatus && <p className="upload-status">{uploadStatus}</p>}

      <h2 className="sub-title">Uploaded Recordings</h2>
      <div className="recordings-list">
        {recordings.length > 0 ? (
          recordings.map((file, index) => (
            <div key={index} className="recording-item">
              <audio controls src={file} className="audio-player"></audio>
            </div>
          ))
        ) : (
          <p className="no-recordings">No recordings available.</p>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;