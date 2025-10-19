'use client';

import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const ReceiptCamera = () => {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setImage(imageSrc);
  }, [webcamRef]);

  const uploadReceipt = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      // Convert base64 → blob format
      const res = await fetch(image);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('file', blob, 'receipt.jpg');

      const apiRes = await fetch('/api/barcode-scanner', {
        method: 'POST',
        body: formData,
      });

      const json = await apiRes.json();
      console.log('Received data from Veryfi (camera capture):', json);
      if (!apiRes.ok) throw new Error(json.error || 'Upload failed');

      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setImage(null);
    setData(null);
    setError(null);
  };

  return (
    <div className="p-4 flex flex-col items-center gap-4">
      {!image ? (
        <div className="flex flex-col items-center">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: { ideal: 'environment' }, // Use rear camera on mobile
            }}
            className="rounded-lg shadow-md w-full max-w-md"
          />
          <button
            onClick={capture}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
          >
            Capture Receipt
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <img
            src={image}
            alt="Captured receipt"
            className="rounded-lg shadow-md max-w-md"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={uploadReceipt}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {loading ? 'Processing...' : 'Upload to Veryfi'}
            </button>
            <button
              onClick={retake}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Retake
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {data && (
        <div className="mt-6 bg-gray-100 p-4 rounded max-w-md w-full">
          <h2 className="font-bold mb-2 text-lg">Parsed Receipt</h2>
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

export default ReceiptCamera;
