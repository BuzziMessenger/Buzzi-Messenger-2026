/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Buzzi Webcamgesprek Component (MSN Messenger 2004 Videobellen Clone)
 */

import React, { useEffect, useRef, useState } from "react";
import { Laptop, Smartphone, Video, VideoOff, Mic, MicOff, Maximize2, PhoneOff, RefreshCw, Disc } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WebcamCallProps {
  activeContactId: string;
  activeContactName: string;
  activeContactAvatar: string;
  myUserId?: string;
  roomId?: string;
  isInitiator?: boolean;
  onClose: () => void;
}

export const WebcamCall: React.FC<WebcamCallProps> = ({
  activeContactId,
  activeContactName,
  activeContactAvatar,
  myUserId,
  roomId,
  isInitiator,
  onClose
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<"dialing" | "connecting" | "active" | "ended">("dialing");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFpsDrop, setIsFpsDrop] = useState(false);
  const [remoteCaption, setRemoteCaption] = useState("");
  
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const isAIBot = ["queen", "kelly", "wouter", "danny", "sanne"].includes(activeContactId);

  // Synthesize dialing or calling sounds retro style
  const playBeep = (freq: number, duration: number, type: OscillatorType = "sine") => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration - 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Synth audio failed", e);
    }
  };

  // Play continuous ringing tone during dialing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === "dialing") {
      // Retro telephone dial chime
      playBeep(440, 0.5);
      setTimeout(() => playBeep(480, 0.5), 100);

      interval = setInterval(() => {
        playBeep(440, 0.6);
        setTimeout(() => playBeep(480, 0.6), 100);
      }, 2000);
    }

    if (callStatus === "connecting") {
      // Static "white noise" glitch sound when establishing peer to peer
      playBeep(220, 0.2, "triangle");
      setTimeout(() => playBeep(880, 0.1, "sawtooth"), 150);
    }

    if (callStatus === "active") {
      // Happy Buzzi connecting chime
      playBeep(880, 0.15);
      setTimeout(() => playBeep(1109, 0.15), 100);
      setTimeout(() => playBeep(1318, 0.25), 200);
    }

    return () => clearInterval(interval);
  }, [callStatus]);

  // Handle call timing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callStatus === "active") {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        if (Math.random() < 0.08) {
          setIsFpsDrop(true);
          setTimeout(() => setIsFpsDrop(false), 900);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  // Simulate contact chat captions based on contact during call
  useEffect(() => {
    if (callStatus !== "active") return;
    
    const captions: Record<string, string[]> = {
      queen: [
        "Bezig met analyseren van retro-feeds...",
        "Webcam verbonden op breedband ISDN!",
        "Stuur eens een duwtje als de FPS hapert! 💻",
        "Buzzi Bot is live! Vraag gerust om hulp."
      ],
      kelly: [
        "OMG Robbin, hoor je me? :-D",
        "Mijn mascara zit hopelijk goed...",
        "Britney Spears staat kei hard hier! 🎵",
        "Wacht, mijn zus roept dat ze op de inbelverbinding wil!"
      ],
      wouter: [
        "Vet cool dit man! \\m/",
        "Ik neem dit op via een echte VHS-band!",
        "Numb van Linkin Park staat op herhaling!",
        "Mijn SoundBlaster audio kraakt een beetje..."
      ],
      danny: [
        "DirectX 9.0c is vereist voor deze FPS haha!",
        "Mijn CRT-monitor flikkert enorm op camera.",
        "Yo! Heb je CS 1.6 al gedownload?",
        "Tandem-modem aangesloten voor extra bandwidth!"
      ],
      sanne: [
        "Heeeeeey! Wat leuk dit! ✨",
        "Mijn webcam was super goedkoop (10 euro)!",
        "Er zit stof op mijn webcam lens geloof ik.",
        "Kopje thee erbij en Buzzi'en maar!"
      ]
    };

    const contactCaps = captions[activeContactId] || [
      "In verbinding via directe koppeling...",
      "SoundBlaster Live-geluidskaart geselecteerd!",
      "Nostalgie ten top!",
      "Chatting live op Buzzi Webcampopp!"
    ];

    setRemoteCaption(contactCaps[0]);
    const capInterval = setInterval(() => {
      const idx = Math.floor(Math.random() * contactCaps.length);
      setRemoteCaption(contactCaps[idx]);
    }, 7000);

    return () => clearInterval(capInterval);
  }, [callStatus, activeContactId]);

  // Connect local camera stream
  useEffect(() => {
    let active = true;

    // Phase 1 fallback (only for bot mode. For WebTC, we transition on connection!)
    let dialTimer: NodeJS.Timeout;
    if (isAIBot) {
      dialTimer = setTimeout(() => {
        setCallStatus("connecting");
        
        const connectTimer = setTimeout(() => {
          setCallStatus("active");
        }, 1800);

        return () => clearTimeout(connectTimer);
      }, 3200);
    }

    // Initialize media capture
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240, facingMode: "user" },
            audio: true
          });
          if (active) {
            setLocalStream(stream);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          }
        } else {
          if (active) setCameraError("Browser ondersteunt geen webcam media APIs.");
        }
      } catch (err: any) {
        console.warn("Could not start local camera", err);
        if (active) {
          setCameraError(
            "Webcam niet gevonden of toegang geweigerd. We tonen een vintage webcam-simulatie!"
          );
        }
      }
    };

    startCamera();

    // Cleanup on unmount
    return () => {
      active = false;
      if (dialTimer) clearTimeout(dialTimer);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // WebRTC Real-Time Signaling Handshake Hook
  useEffect(() => {
    if (isAIBot || !myUserId || !localStream) return;

    const calculatedRoomId = roomId || [myUserId, activeContactId].sort().join("-");

    let active = true;
    let pc: RTCPeerConnection | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let localCandidatesUploaded: string[] = [];
    let remoteCandidatesAdded: string[] = [];

    const initializeWebRTC = async () => {
      pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ]
      });
      pcRef.current = pc;

      localStream.getTracks().forEach(track => {
        if (pc) pc.addTrack(track, localStream);
      });

      pc.ontrack = (event) => {
        const stream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream([event.track]);
        if (active) {
          setRemoteStream(stream);
          setCallStatus("active");
        }
      };

      let isCaller = isInitiator !== undefined ? isInitiator : false;
      try {
        setCallStatus("connecting");
        const res = await fetch(`/api/db/calls/signal?roomId=${calculatedRoomId}`);
        const signalData = await res.json();
        
        if (isInitiator === false || (isInitiator === undefined && signalData && signalData.offer)) {
          isCaller = false;
          
          const processOffer = async () => {
            const offerToUse = signalData?.offer;
            if (offerToUse) {
              await pc!.setRemoteDescription(new RTCSessionDescription(offerToUse));
              const answer = await pc!.createAnswer();
              await pc!.setLocalDescription(answer);

              await fetch("/api/db/calls/signal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId: calculatedRoomId, type: "answer", data: answer })
              });

              setTimeout(() => {
                if (active) setCallStatus("active");
              }, 1500);
            }
          };
          
          if (signalData && signalData.offer) {
            await processOffer();
          }
        } else if (isInitiator === true || (isInitiator === undefined && (!signalData || !signalData.offer))) {
          isCaller = true;
          await fetch("/api/db/calls/signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId: calculatedRoomId, type: "reset" })
          });

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          await fetch("/api/db/calls/signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId: calculatedRoomId, type: "offer", data: offer })
          });
        }
      } catch (err) {
        console.error("WebRTC Handshake failed:", err);
      }

      pc.onicecandidate = (event) => {
        if (event.candidate && event.candidate.candidate && event.candidate.candidate !== "" && active) {
          const candStr = JSON.stringify(event.candidate);
          if (!localCandidatesUploaded.includes(candStr)) {
            localCandidatesUploaded.push(candStr);
            fetch("/api/db/calls/signal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                roomId: calculatedRoomId,
                type: isCaller ? "caller_candidate" : "callee_candidate",
                data: event.candidate
              })
            }).catch(console.warn);
          }
        }
      };

      const fallbackTimer = setTimeout(() => {
        if (active) {
          setCallStatus((prev) => (prev === "dialing" || prev === "connecting" ? "active" : prev));
        }
      }, 5000);

      pollInterval = setInterval(async () => {
        if (!active || !pc) return;
        try {
          const res = await fetch(`/api/db/calls/signal?roomId=${calculatedRoomId}`);
          if (!res.ok) return;
          const signalInfo = await res.json();
          if (!signalInfo) return;

          if (isCaller && signalInfo.answer && pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(signalInfo.answer));
            setCallStatus("active");
          }                
          
          if (!isCaller && signalInfo.offer && pc.signalingState === "stable" && !pc.currentRemoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(signalInfo.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await fetch("/api/db/calls/signal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ roomId: calculatedRoomId, type: "answer", data: answer })
            });
            setCallStatus("active");
          }

          const foreignCandidates = isCaller ? signalInfo.calleeCandidates : signalInfo.callerCandidates;
          if (foreignCandidates && foreignCandidates.length > 0) {
            for (const item of foreignCandidates) {
              const itemStr = JSON.stringify(item);
              if (!remoteCandidatesAdded.includes(itemStr)) {
                try {
                  if (pc.remoteDescription) {
                    await pc.addIceCandidate(new RTCIceCandidate(item));
                    remoteCandidatesAdded.push(itemStr);
                  }
                } catch (candidateErr) {}
              }
            }
          }
        } catch (pollErr) {}
      }, 500);

      return () => {
        clearTimeout(fallbackTimer);
      };
    };

    const cleanup = initializeWebRTC();

    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
      cleanup.then(cb => { if (typeof cb === 'function') cb() });
      if (pc) pc.close();
    };
  }, [localStream, myUserId, activeContactId, isAIBot]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callStatus]);

  const handleEndCall = () => {
    playBeep(261.63, 0.4, "sine");
    setTimeout(() => playBeep(196, 0.5, "sine"), 150);
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setCallStatus("ended");
    setTimeout(() => onClose(), 850);
  };

  const getFormattedTime = () => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="absolute inset-x-4 top-16 bottom-[140px] z-40 bg-[#cbdcf0] border-2 border-[#1d5c8a] rounded-lg shadow-2xl flex flex-col overflow-hidden font-sans animate-fade-in select-none">
      
      <div className="bg-gradient-to-r from-[#1d5fb0] via-[#2473cf] to-[#124d8f] px-3.5 py-1.8 flex items-center justify-between text-white border-b border-[#0f448c]">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-sky-200 animate-pulse" />
          <span className="text-xs font-extrabold tracking-wide drop-shadow-xs font-mono">
            Buzzi Videogesprek met {activeContactName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={handleEndCall} className="w-5 h-5 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-[10px] flex items-center justify-center cursor-pointer transition-all shadow-sm shadow-red-950/20">✕</button>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col md:flex-row gap-4 bg-gradient-to-b from-[#e1edf9] to-[#ccdcf0] overflow-hidden justify-center items-center">
        <div className="relative w-full max-w-[340px] aspect-[4/3] bg-stone-900 border-2 border-[#8ba7c1] rounded p-1 shadow-lg flex flex-col overflow-hidden group">
          <div className="bg-slate-900 text-[10px] text-stone-200 py-1 px-2 border-b border-stone-800 flex items-center justify-between font-mono">
            <span>🎥 REMOTE: {activeContactName}</span>
            {callStatus === "active" && <span className="flex items-center gap-1 text-emerald-400 font-extrabold animate-pulse"><span className="w-2 h-2 rounded-full bg-emerald-500" />LIVE</span>}
          </div>

          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
            {callStatus === "dialing" && <div className="text-stone-300 text-xs font-mono font-bold">Bezig met verbinding leggen...</div>}
            {callStatus === "connecting" && <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto" />}
            {callStatus === "active" && (
              <div className="w-full h-full relative flex items-center justify-center bg-stone-950">
                {remoteStream && !isAIBot ? (
                    <video ref={(el) => { if (el && el.srcObject !== remoteStream) el.srcObject = remoteStream; }} autoPlay playsInline className="w-full h-full object-cover filter brightness-95 contrast-105 saturate-100" />
                ) : (
                    <div className="w-24 h-24 rounded border-2 border-slate-500/40 p-0.5 bg-white shadow-md relative">{activeContactAvatar}</div>
                )}
                {remoteCaption && <div className="absolute bottom-2 inset-x-2 bg-black/85 border border-[#3e668b]/40 py-1.5 px-2 rounded text-[10.5px] text-slate-100 text-center font-bold font-sans">💬 {activeContactName}: <span className="font-semibold text-yellow-300 text-[10px]">{remoteCaption}</span></div>}
              </div>
            )}
            {callStatus === "ended" && <div className="text-center p-3 text-red-400">Gesprek Beëindigd</div>}
          </div>
        </div>

        <div className="relative w-full max-w-[280px] aspect-[4/3] bg-stone-900 border-2 border-[#8ba7c1] rounded p-1 shadow-lg flex flex-col overflow-hidden">
          <div className="bg-slate-900 text-[10px] text-stone-200 py-1 px-2 border-b border-stone-800 flex items-center justify-between font-mono">
            <span>🎥 LOCAL: Jijzelf</span>
          </div>
          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
            {!isVideoOff && localStream ? (
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover filter contrast-105 brightness-110 saturate-95 scale-x-[-1]" />
            ) : (
              <div className="w-full h-full bg-stone-950 flex items-center justify-center text-center p-4">👤</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#cbdcf0] p-3 border-t border-[#9ebcd1] flex items-center justify-between select-none">
        <div className="flex items-center gap-1">
          {callStatus === "active" && <div className="bg-white px-2.5 py-1 rounded shadow-inner text-[10.5px] font-mono text-[#1a5a92] font-black mr-2">⏱️ {getFormattedTime()}</div>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMuted(!isMuted)} className={`p-2 rounded-lg border cursor-pointer ${isMuted ? 'bg-red-100' : 'bg-white'}`}>
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-2 rounded-lg border cursor-pointer ${isVideoOff ? 'bg-red-100' : 'bg-white'}`}>
            {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>
          <button onClick={handleEndCall} className="bg-red-600 text-white font-bold py-2 px-3.5 rounded-lg flex items-center gap-1.5 text-xs"><PhoneOff className="w-4 h-4" /> Beëindigen</button>
        </div>
      </div>
    </div>
  );
};
