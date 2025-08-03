import React from 'react';
import { useRequestStore } from '../stores/requestStore';

export function RequestViewer() {
  const { request, response } = useRequestStore();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Request/Response Viewer</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Request:</h3>
          <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-40">
            {request ? JSON.stringify(request, null, 2) : 'No request sent yet'}
          </pre>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Response:</h3>
          <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-40">
            {response ? JSON.stringify(response, null, 2) : 'No response received yet'}
          </pre>
        </div>
      </div>
    </div>
  );
}