/**
 * This component uploads a receipt image, sending the image to the Veryfi API
 * (/api/barcode-scanners/route.ts)route
*/

'use client';

import React, { useState } from 'react';

const ReceiptUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/barcode-scanner', {
      method: 'POST',
      body: formData,
    });

    const json = await res.json();
    console.log('Received data from Veryfi (upload):', json);
    setData(json);
    setLoading(false);
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2"
        />
        <button
          type="submit"
          disabled={!file || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Processing...' : 'Upload Receipt'}
        </button>
      </form>

      {data && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Parsed Receipt</h2>
          <p><strong>Vendor:</strong> {data.vendor?.name}</p>
          <p><strong>Total:</strong> ${data.total}</p>
          <h3 className="mt-2 font-semibold">Items:</h3>
          <ul className="list-disc ml-5">
            {data.line_items?.map((item: any, i: number) => (
              <li key={i}>
                {item.description} — {item.quantity} × ${item.price}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReceiptUpload;
