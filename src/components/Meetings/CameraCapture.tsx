import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Video, Square, RotateCcw, Download } from 'lucide-react';

interface CameraCaptureProps {
  mode: 'photo' | 'video';
  onCapture: (mediaUrl: string, type: 'photo' | 'video') => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ mode, onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Default to front camera, can be changed to 'environment' for back camera
        },
        audio: mode === 'video'
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(photoDataUrl);
  };

  const startVideoRecording = () => {
    if (!stream) return;

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9' // Use VP9 codec if available
      });

      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        
        // Convert to data URL for storage
        const reader = new FileReader();
        reader.onload = () => {
          onCapture(reader.result as string, 'video');
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting video recording:', err);
      setError('Unable to start video recording. Your browser may not support this feature.');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  const confirmCapture = () => {
    if (mode === 'photo' && capturedPhoto) {
      onCapture(capturedPhoto, 'photo');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Camera Error</h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
            <button
              onClick={() => {
                setError(null);
                startCamera();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            {mode === 'photo' ? <Camera className="w-5 h-5 mr-2" /> : <Video className="w-5 h-5 mr-2" />}
            {mode === 'photo' ? 'Take Photo' : 'Record Video'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Camera View */}
        <div className="p-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            {/* Video Preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-96 object-cover"
              style={{ display: capturedPhoto ? 'none' : 'block' }}
            />

            {/* Captured Photo Preview */}
            {capturedPhoto && (
              <img
                src={capturedPhoto}
                alt="Captured"
                className="w-full h-96 object-cover"
              />
            )}

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                REC {formatTime(recordingTime)}
              </div>
            )}

            {/* Camera Switch Button */}
            <button
              onClick={() => {
                // Toggle between front and back camera
                stopCamera();
                // This would require more complex logic to switch cameras
                startCamera();
              }}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
              title="Switch Camera"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            {mode === 'photo' ? (
              <>
                {!capturedPhoto ? (
                  <button
                    onClick={capturePhoto}
                    className="w-16 h-16 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Camera className="w-8 h-8" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={retakePhoto}
                      className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Retake</span>
                    </button>
                    <button
                      onClick={confirmCapture}
                      className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Use Photo</span>
                    </button>
                  </>
                )}
              </>
            ) : (
              <button
                onClick={isRecording ? stopVideoRecording : startVideoRecording}
                className={`w-16 h-16 rounded-full transition-colors flex items-center justify-center ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isRecording ? <Square className="w-8 h-8" /> : <Video className="w-8 h-8" />}
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center mt-4 text-gray-600 text-sm">
            {mode === 'photo' ? (
              capturedPhoto ? (
                'Review your photo and choose to retake or use it'
              ) : (
                'Position yourself in the frame and click the camera button to take a photo'
              )
            ) : (
              isRecording ? (
                'Recording... Click the stop button when finished'
              ) : (
                'Click the video button to start recording'
              )
            )}
          </div>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};