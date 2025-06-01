import { useState } from 'react';
import { DailyProvider } from '@daily-co/daily-react';

function App() {
  const [token, setToken] = useState('');
  const [isCallStarted, setIsCallStarted] = useState(false);

  const handleStartCall = async () => {
    if (!token) {
      alert('Please enter your Tavus API token');
      return;
    }

    try {
      const response = await fetch('https://tavusapi.com/v2/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': token,
        },
        body: JSON.stringify({
          persona_id: 'p9a95912', // Demo Persona
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      setIsCallStarted(true);
      
      // Initialize call frame
      const callFrame = await window.DailyIframe.createFrame({
        iframeStyle: {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
        },
      });

      await callFrame.join({ url: data.conversation_url });

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to start conversation. Please check your API token.');
    }
  };

  return (
    <DailyProvider>
      <main className="min-h-screen bg-gray-100 p-4">
        <div className="mx-auto max-w-md">
          {!isCallStarted ? (
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h1 className="mb-4 text-2xl font-bold">Tavus Demo</h1>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your Tavus API token"
                className="mb-4 w-full rounded border p-2"
              />
              <button
                onClick={handleStartCall}
                className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Start Conversation
              </button>
              <p className="mt-4 text-sm text-gray-600">
                Don't have a token?{' '}
                <a
                  href="https://platform.tavus.io/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Get one here
                </a>
              </p>
            </div>
          ) : (
            <div id="call-frame"></div>
          )}
        </div>
      </main>
    </DailyProvider>
  );
}

export default App;