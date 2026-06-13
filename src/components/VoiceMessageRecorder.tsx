import React, { useState, useRef } from "react";
import { Mic, Square, Send } from "lucide-react";
import { hiveAudio } from "../utils/audio";

interface VoiceMessageRecorderProps {
  onSend: (dataUrl: string) => void;
}

export const VoiceMessageRecorder: React.FC<VoiceMessageRecorderProps> = ({ onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    chunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
      const reader = new FileReader();
      reader.onload = () => {
        onSend(reader.result as string);
      };
      reader.readAsDataURL(audioBlob);
    };
    
    mediaRecorder.start();
    setIsRecording(true);
    hiveAudio.playHoneyPop();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        hiveAudio.playHoneyPop();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <button onClick={stopRecording} className="p-2 bg-red-500 text-white rounded-full">
            <Square className="w-4 h-4" />
        </button>
      ) : (
        <button onClick={startRecording} className="p-2 bg-sky-500 text-white rounded-full">
            <Mic className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
