import React, { useState } from 'react';
import { FileEdit } from 'lucide-react';
import { useRequestStore } from '../stores/requestStore';

export function DocumentDrafting() {
  const [prompt, setPrompt] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [docxBase64, setDocxBase64] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const { setRequest, setResponse } = useRequestStore();

  const handleGetQuestions = async () => {
    if (!prompt.trim()) return;

    try {
      const res = await fetch('http://localhost:3000/drafting/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setRequest({ type: 'drafting_questions', prompt });
      setResponse(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGenerateDocument = async () => {
    if (Object.keys(answers).length === 0) return;

    try {
      const res = await fetch('http://localhost:3000/drafting/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, answers }),
      });
      const data = await res.json();
      setRequest({ type: 'drafting_document', prompt, answers });
      setResponse(data);
      
      setDocxBase64(data.docx);
      setPdfBase64(data.pdf);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const downloadDocx = (docxBase64: string | null) => {
    if (!docxBase64) {
      console.error("Base64 data is empty, cannot download the DOCX.");
      return;
    }
  
    const binaryString = atob(docxBase64); 
    const byteArray = Uint8Array.from(binaryString, char => char.charCodeAt(0)); 
    const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }); 
  
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "document.docx"; 
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
  };
  
  const downloadPdf = (pdfBase64: string | null) => {
    if (!pdfBase64) {
      console.error("Base64 data is empty, cannot download the PDF.");
      return;
    }
  
    const binaryString = atob(pdfBase64); 
    const byteArray = Uint8Array.from(binaryString, char => char.charCodeAt(0)); 
    const blob = new Blob([byteArray], { type: "application/pdf" }); 
  
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "document.pdf"; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <FileEdit className="w-5 h-5 text-orange-500" />
        <h2 className="text-xl font-semibold">Document Drafting</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What kind of document do you want to create?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Create a professional email to request a meeting..."
            className="w-full px-4 py-2 border rounded-md"
            rows={3}
          />
        </div>
        
        <button
          onClick={handleGetQuestions}
          disabled={!prompt.trim()}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Get Questions
        </button>

        {questions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Please answer these questions:</h3>
            {questions.map((question, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {question}
                </label>
                <input
                  type="text"
                  onChange={(e) => setAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
            ))}
            <button
              onClick={handleGenerateDocument}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Generate Document
            </button>
            
            {docxBase64 && (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => downloadDocx(docxBase64)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Generate DOCX
                </button>
                <button
                  onClick={() => downloadPdf(pdfBase64)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Generate PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
