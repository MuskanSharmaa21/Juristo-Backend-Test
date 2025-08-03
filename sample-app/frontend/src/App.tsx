import React from 'react';
import { ChatSection } from './components/ChatSection';
import { DocumentAnalysis } from './components/DocumentAnalysis';
import { DocumentDrafting } from './components/DocumentDrafting';
import { RequestViewer } from './components/RequestViewer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Demo Interface</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ChatSection />
            <DocumentAnalysis />
            <DocumentDrafting />
          </div>
          <div className="md:sticky md:top-8 self-start">
            <RequestViewer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;