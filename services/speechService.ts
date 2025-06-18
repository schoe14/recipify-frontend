
export const startSpeechRecognition = (
  onResult: (transcript: string) => void,
  onError: (error: string) => void,
  onEnd?: () => void
): (() => void) | undefined => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    onError("Speech recognition is not supported by your browser.");
    return undefined;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false; // Capture a single phrase
  recognition.interimResults = false; // We only want final results
  recognition.lang = 'en-US'; // Default to English (US)

  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    recognition.stop();
    onError("Speech recognition timed out. No speech detected.");
  }, 10000); // 10 seconds timeout


  recognition.onresult = (event: any) => {
    clearTimeout(timeout);
    if (timedOut) return;
    const transcript = event.results[event.results.length - 1][0].transcript;
    onResult(transcript.trim());
  };

  recognition.onerror = (event: any) => {
    clearTimeout(timeout);
    if (timedOut) return; // Already handled by timeout
    
    let errorMessage = `Speech recognition error: ${event.error}`;
    if (event.error === 'no-speech') {
      errorMessage = "No speech was detected. Please try again.";
    } else if (event.error === 'audio-capture') {
      errorMessage = "Audio capture failed. Please ensure your microphone is working correctly.";
    } else if (event.error === 'not-allowed') {
      errorMessage = "Microphone access was denied. Please enable it in your browser settings to use dictation.";
    } else if (event.error === 'network') {
        errorMessage = "A network error occurred during speech recognition. Please check your connection.";
    }
    onError(errorMessage);
  };
  
  recognition.onend = () => {
    clearTimeout(timeout);
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
  } catch (e) {
    clearTimeout(timeout);
    onError("Failed to start speech recognition. Ensure microphone is connected and permissions are granted.");
    return undefined;
  }
  
  return () => {
    clearTimeout(timeout);
    recognition.stop();
  };
};
