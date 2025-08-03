  import React, { useState } from 'react';
  import { MessageSquare } from 'lucide-react';
  import { useRequestStore } from '../stores/requestStore';

  export function ChatSection() {
    const [message, setMessage] = useState('');
    const { setRequest, setResponse } = useRequestStore();

    const handleChat = async (message: string) => {
      if (!message.trim()) return;
    
      console.log('Sending message:', message);
    
      try {
        const response = await fetch('http://localhost:3000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Set Content-Type to JSON
          },
          body: JSON.stringify({ message }), // Ensure body is stringified as JSON
        });
    
        console.log('Response:', response);
    
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
    
        const data = await response.json();
        setRequest({ type: 'chat', message });
        setResponse(data);
        setMessage('');
      } catch (error) {
        setResponse({ error: error.message || 'Failed to send message' });
      }
    };
    

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Chat</h2>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message"
            className="flex-1 px-4 py-2 border rounded-md"
            onKeyPress={(e) => e.key === 'Enter' && handleChat(message)}
          />
          <button
            onClick={() => handleChat(message)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    );
  }
