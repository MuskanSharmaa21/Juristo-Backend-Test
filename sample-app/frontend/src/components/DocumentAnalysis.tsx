import React, { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { useRequestStore } from '../stores/requestStore';

export function DocumentAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [query, setQuery] = useState('');
  const [documentId, setDocumentId] = useState<string | null>(null); // New state for documentId
  const { setRequest, setResponse } = useRequestStore();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const res = await fetch('https://juristo-test.vercel.app/analyze', {
          method: 'POST',
          body: formData,
        });
        const { data } = await res.json();
        setDocumentId(data.documentId); // Save documentId in state
        setRequest({ type: 'analyze', file: selectedFile.name, documentId: data.documentId });
        setResponse(data);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleQuery = async () => {
    if (!query.trim() || !documentId) return; // Ensure documentId is present
  
    try {
      const res = await fetch('https://juristo-test.vercel.app/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, documentId }), // Change "query" to "question"
      });
      const data = await res.json();
      console.log('Response from /query:', data);
      setRequest({ type: 'query', query, documentId });
      setResponse(data);
      setQuery('');
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-green-500" />
          <h2 className="text-xl font-semibold">Document Analysis</h2>
        </div>
        <input
          type="file"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
      </div>

      {file && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-semibold">Query Document</h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about the document"
              className="flex-1 px-4 py-2 border rounded-md"
              onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
            />
            <button
              onClick={handleQuery}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              Query
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
