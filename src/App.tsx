import { useState, useEffect } from 'react';
import { DailyProvider, useDaily, useLocalSessionId, useParticipantIds, DailyVideo, DailyAudio } from '@daily-co/daily-react';

// Video component that displays the video feed
const Video = ({ id }: { id: string }) => {
  return (
    <DailyVideo
      automirror
      sessionId={id}
      type="video"
      className="h-full w-full rounded-lg object-cover"
    />
  );
};

// Call component that manages the video call interface
const Call = ({ onLeave }: { onLeave: () => void }) => {
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });
  const localSessionId = useLocalSessionId();
  const daily = useDaily();

  return (
    <div className="relative h-screen bg-gray-900">
      <div className="absolute inset-0 flex items-center justify-center">
        {remoteParticipantIds.length > 0 ? (
          <Video id={remoteParticipantIds[0]} />
        ) : (
          <div className="text-white">Waiting for connection...</div>
        )}
      </div>
      {localSessionId && (
        <div className="absolute bottom-4 right-4 h-48 w-64 overflow-hidden rounded-lg border-2 border-white/20">
          <Video id={localSessionId} />
        </div>
      )}
      <button
        onClick={onLeave}
        className="absolute right-4 top-4 rounded-full bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        Leave Call
      </button>
      <DailyAudio />
    </div>
  );
};

// Main App component
function AppContent() {
  const [conversation, setConversation] = useState<{ conversation_url: string } | null>(null);
  const daily = useDaily();

  const TAVUS_TOKEN = 'fbc189f1d04d4710bc46a2d785a4f92d';

  const handleStartCall = async () => {
    try {
      const response = await fetch('https://tavusapi.com/v2/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TAVUS_TOKEN,
        },
        body: JSON.stringify({
          persona_id: 'p9a95912', // Demo Persona
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      setConversation(data);
      
      if (daily) {
        await daily.join({ url: data.conversation_url });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to start conversation');
    }
  };

  const handleLeave = async () => {
    if (daily) {
      await daily.leave();
    }
    setConversation(null);
  };

  useEffect(() => {
    if (conversation?.conversation_url && daily) {
      daily.join({ url: conversation.conversation_url });
    }
  }, [conversation?.conversation_url, daily]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      {!conversation ? (
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-2xl font-bold">Tavus Demo</h1>
          <button
            onClick={handleStartCall}
            className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Start Conversation
          </button>
        </div>
      ) : (
        <Call onLeave={handleLeave} />
      )}
    </main>
  );
}

// Wrap the app with DailyProvider
function App() {
  return (
    <DailyProvider>
      <AppContent />
    </DailyProvider>
  );
}

export default App;