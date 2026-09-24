import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mic,
  Square,
  Camera,
  FileUp,
  Send,
  Sparkles,
  X,
  Paperclip
} from 'lucide-react';

export const MultimodalInput = ({ onSendMessage }) => {
  const { mode } = useApp();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [attachedImage, setAttachedImage] = useState(null);
  const [attachedDoc, setAttachedDoc] = useState(null);

  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Suggested Prompts by mode
  const personalPrompts = [
    "💻 Find me a good laptop for video editing under ₦1.5m",
    "💊 Buy my mother's joint supplements and diapers when under ₦30k",
    "📸 Scan this shoe snap to find the cheapest store in Lagos",
    "🛒 Build a weekend grocery basket for 5 people under ₦150k"
  ];

  const businessPrompts = [
    "👕 Procure 50 branded polo shirts for team delivery to Lagos office",
    "🪑 Request quotes for 20 ergonomic high-back mesh chairs",
    "📄 Parse this IT tender spec sheet and check vendor pricing matrix",
    "☕ Auto-replenish office coffee and paper supplies every Monday"
  ];

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech recognition already started:', err);
      }
    } else {
      // Fallback simulated voice note
      setTimeout(() => {
        const simulated = mode === 'personal'
          ? "🎙️ [Voice Note]: Zibi, check my mother's joint supplements. If under ₦30,000 at HealthPlus, order it to her PH address."
          : "🎙️ [Voice Note]: Zibi, we need 15 wireless headsets for our customer support team in Abuja under ₦850,000.";
        setInputText(simulated);
      }, 1500);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping speech:', err);
      }
    }
  };

  // Real File Input Handler
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage({
          name: file.name,
          url: reader.result, // base64 URL
          base64: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() && !attachedImage && !attachedDoc) return;

    onSendMessage({
      text: inputText,
      image: attachedImage,
      doc: attachedDoc,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setInputText('');
    setAttachedImage(null);
    setAttachedDoc(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Preset Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none text-xs">
        <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Prompts:
        </span>
        {(mode === 'personal' ? personalPrompts : businessPrompts).map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => setInputText(prompt)}
            className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/40 rounded-xl text-slate-300 hover:text-white whitespace-nowrap transition-all text-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Attachment Previews */}
      {(attachedImage || attachedDoc) && (
        <div className="flex items-center gap-3 p-2 bg-slate-900/90 border border-slate-800 rounded-xl">
          {attachedImage && (
            <div className="relative flex items-center gap-2 bg-slate-800 p-1.5 rounded-lg text-xs">
              <img src={attachedImage.url} alt="Snap preview" className="w-10 h-10 object-cover rounded" />
              <div className="text-left">
                <p className="font-semibold text-white truncate max-w-[140px]">{attachedImage.name}</p>
                <p className="text-[10px] text-cyan-400 font-medium">Vision Scan Ready</p>
              </div>
              <button
                onClick={() => setAttachedImage(null)}
                aria-label="Remove attached image"
                className="ml-2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {attachedDoc && (
            <div className="relative flex items-center gap-2 bg-slate-800 p-2 rounded-lg text-xs">
              <Paperclip className="w-4 h-4 text-cyan-400" />
              <span className="font-medium text-white">{attachedDoc.name}</span>
              <button
                onClick={() => setAttachedDoc(null)}
                aria-label="Remove attached document"
                className="ml-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Input Box */}
      <div className="relative bg-slate-900/90 border border-slate-800 focus-within:border-purple-500/60 rounded-2xl p-2.5 shadow-xl transition-all">
        {/* Voice Note Recording Overlay */}
        {isRecording ? (
          <div className="flex items-center justify-between px-4 py-3 bg-purple-950/60 border border-purple-500/40 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Listening to Voice Input...</span>
              <span className="text-xs font-mono text-purple-300 font-bold">0:0{recordingTime}</span>
            </div>

            <div className="flex items-center gap-1">
              <div className="w-1 bg-purple-400 rounded-full animate-wave-1"></div>
              <div className="w-1 bg-purple-400 rounded-full animate-wave-2"></div>
              <div className="w-1 bg-purple-400 rounded-full animate-wave-3"></div>
              <div className="w-1 bg-purple-400 rounded-full animate-wave-4"></div>
            </div>

            <button
              onClick={handleStopRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === 'personal'
                  ? "Describe what you need, upload an image snap, or speak a voice note..."
                  : "State procurement request, bulk RFQ requirements, or attach specification sheet..."
              }
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none min-h-[52px] max-h-32 font-sans"
              rows={2}
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              {/* Media Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-purple-950/40 border border-slate-700/80 hover:border-purple-500/40 text-slate-300 hover:text-purple-300 text-xs font-medium transition-all"
                  title="Speak Voice Note"
                >
                  <Mic className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline">Voice Note</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-950/40 border border-slate-700/80 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs font-medium transition-all"
                  title="Upload Image Snap from Camera or Files"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Snap Image</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttachedDoc({ name: mode === 'personal' ? 'prescription_receipt.pdf' : 'IT_Hardware_Specs_RFQ.pdf' })}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 text-xs font-medium transition-all"
                  title="Attach Spec Sheet or PDF"
                >
                  <FileUp className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Attach Spec</span>
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim() && !attachedImage && !attachedDoc}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                  inputText.trim() || attachedImage || attachedDoc
                    ? mode === 'personal'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-600/30 hover:scale-105 active:scale-95'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-600/30 hover:scale-105 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Ask Zibi</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
