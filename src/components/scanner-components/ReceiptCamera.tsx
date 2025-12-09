/* eslint-disable @next/next/no-img-element */

'use client';

import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Row, Col } from 'react-bootstrap';
import { Trash2 } from 'lucide-react';
import { LocalCategory } from '../../lib/Units';

const ReceiptCamera = () => {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Modal for item selection
  const [openModal, setOpenModal] = useState(false);
  const [itemSelections, setItemSelections] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showSelectAllModal, setShowSelectAllModal] = useState(false);
  const [selectAllStorage, setSelectAllStorage] = useState(Object.keys(LocalCategory)[0]);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setImage(imageSrc);
  }, [webcamRef]);

  const uploadReceipt = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
      // Convert base64 → blob format
      const res = await fetch(image);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('file', blob, 'receipt.jpg');

      const apiRes = await fetch('/api/receipt-scanner', {
        method: 'POST',
        body: formData,
      });

      const json = await apiRes.json();
      console.log('Received data from Veryfi (camera capture):', json);
      if (!apiRes.ok) throw new Error(json.error || 'Upload failed');

      // Prepare item selections: Initialize selection state for all items
      const initialSelection = json.line_items.map((item: any) => ({
        ...item,
        selected: false,
        storage: Object.keys(LocalCategory)[0], // default to first category
        userQuantity: item.quantity,
      }));

      setItemSelections(initialSelection);
      setOpenModal(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setImage(null);
    setError(null);
  };

  const toggleSelectItem = (index: number) => {
    const updated = [...itemSelections];
    updated[index].selected = !updated[index].selected;
    setItemSelections(updated);

    // Update "select all"
    const allSelected = updated.every((i) => i.selected);
    setSelectAll(allSelected);
  };

  const handleSelectAll = () => {
    const newValue = !selectAll;
    const updated = itemSelections.map((i) => ({
      ...i,
      selected: newValue,
    }));

    setSelectAll(newValue);
    setItemSelections(updated);

    if (newValue === true) {
      setShowSelectAllModal(true);
    }
  };

  const handleStorageChange = (index: number, value: string) => {
    const updated = [...itemSelections];
    updated[index].storage = value;
    setItemSelections(updated);
  };

  const changeQuantity = (index: number, newQty: number) => {
    const updated = [...itemSelections];
    updated[index].userQuantity = newQty;
    setItemSelections(updated);
  };

  const removeItem = (index: number) => {
    const updated = [...itemSelections];
    updated.splice(index, 1);
    setItemSelections(updated);
  };

  const handleSave = () => {
    const selectedItems = itemSelections.filter((i) => i.selected);
    console.log('Items to store:', selectedItems);

    // Close modal
    setOpenModal(false);

    // Optionally show a success message or reset form
    // eslint-disable-next-line no-alert
    alert('Items saved!');
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
            className="rounded-lg shadow-md w-[1000px] max-w-lg h-[500px] object-cover"
            // rounded-lg shadow-md w-full max-w-2xl h-[500px]
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
              {loading ? 'Processing...' : 'Scan Receipt'}
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

      {/* {data && (
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
      )} */}

      {/* ----------- MODAL ----------- */}
            {openModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white w-full max-w-2xl p-6 rounded shadow-lg">
                  <h2 className="text-lg font-bold mb-4">Receipt Items</h2>

                  <div className="mb-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium">Select All</span>
                  </div>

                  <div className="max-h-64 overflow-auto border rounded p-3">
                    {itemSelections.map((item, i) => (
                      <Row key={i} className="align-items-center py-3">
                        {/* Left side: checkbox + description + price */}
                        <Col md={7} className="d-flex align-items-center gap-3">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleSelectItem(i)}
                          />

                          <div className="flex flex-col">
                            <span className="font-medium">{item.description}</span>
                            <span className="text-sm text-gray-600">
                              ${item.price} • Qty: {item.quantity}
                            </span>
                          </div>
                        </Col>

                        {/* Quantity controls */}
                        <Col md={1} className="d-flex align-items-center justify-content-center gap-2 pe-4">
                          <button
                            className="px-2 py-1 border rounded disabled:opacity-40"
                            disabled={item.userQuantity <= 1}
                            onClick={() => changeQuantity(i, item.userQuantity - 1)}
                          >
                            –
                          </button>

                          <span>{item.userQuantity}</span>

                          <button
                            className="px-2 py-1 border rounded disabled:opacity-40"
                            disabled={item.userQuantity >= item.quantity}
                            onClick={() => changeQuantity(i, item.userQuantity + 1)}
                          >
                            +
                          </button>
                        </Col>

                        {/* Storage dropdown */}
                        <Col md={2} className="ps-4">
                          <select
                            className="border p-1 rounded text-sm"
                            value={item.storage}
                            onChange={(e) => handleStorageChange(i, e.target.value)}
                          >
                            {Object.entries(LocalCategory).map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </Col>

                        {/* Delete (trash icon) */}
                        <Col md={2} className="d-flex justify-content-center ps-4">
                          <button
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() => removeItem(i)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </Col>
                      </Row>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      className="px-4 py-2 bg-gray-300 rounded"
                      onClick={() => setOpenModal(false)}
                    >
                      Cancel
                    </button>

                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                      onClick={handleSave}
                    >
                      Save Selected
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* -------- SELECT ALL MODAL -------- */}
            {showSelectAllModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded p-6 w-full max-w-2xl shadow-lg">
                  <h3 className="font-bold text-lg mb-4">Store Bought Items</h3>

                  <label className="block mb-2 text-sm text-gray-700">Save all items to:</label>
                  <select
                    className="border rounded p-2 w-full"
                    value={selectAllStorage}
                    onChange={(e) => setSelectAllStorage(e.target.value)}
                  >
                    {Object.entries(LocalCategory).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <div className="flex justify-end gap-3 mt-5">
                    <button
                      className="px-4 py-2 bg-gray-200 rounded"
                      onClick={() => {
                        setShowSelectAllModal(false);
                        setSelectAll(false);
                        handleSelectAll(); // undo the select-all check
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                      onClick={() => {
                        // Apply storage type to all items
                        const updated = itemSelections.map((item) => (item.selected ? { ...item, storage: selectAllStorage } : item));
                        setItemSelections(updated);

                        setShowSelectAllModal(false);
                        setOpenModal(false);
                      }}
                    >
                      Save All
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* -------- END MODAL -------- */}
    </div>
  );
};

export default ReceiptCamera;
