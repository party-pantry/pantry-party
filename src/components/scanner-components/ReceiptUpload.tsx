/* eslint-disable @next/next/no-img-element */
/**
 * This component uploads a receipt image, sending the image to the Veryfi API
 * (/api/receipt-scanner/route.ts)route
*/

'use client';

import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Trash2, CloudUpload } from 'lucide-react';
import { LocalCategory } from '../../lib/Units';

const ReceiptUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Modal for item selection
  const [openModal, setOpenModal] = useState(false);
  const [itemSelections, setItemSelections] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showSelectAllModal, setShowSelectAllModal] = useState(false);
  const [selectAllStorage, setSelectAllStorage] = useState(Object.keys(LocalCategory)[0]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/receipt-scanner', {
      method: 'POST',
      body: formData,
    });

    const json = await res.json();
    console.log('Received data from Veryfi (upload):', json);
    setLoading(false);

    // Initialize selection state for all items
    const initialSelection = json.line_items.map((item: any) => ({
      ...item,
      selected: false,
      storage: Object.keys(LocalCategory)[0], // default to first category
      userQuantity: item.quantity,
    }));

    setItemSelections(initialSelection);
    setOpenModal(true);
    setLoading(false);
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
    alert('Items saved!');
  };

  return (
    <div className="p-4 h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex justify-center align-items-center">
          <label
            htmlFor="receipt-input"
            className="
              flex flex-col items-center justify-center
              w-full max-w-md h-[500px]
              border-2 border-indigo-600 border-solid
              rounded-2xl cursor-pointer
              hover:border-indigo-500 transition
              p-6 text-center
            "
          >
            <div className="w-full h-full flex items-center justify-center">
              {previewUrl ? (
                <div>
                  <p className="font-semibold text-lg text-gray-600 pb-2">Receipt Preview</p>
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="border rounded-xl w-full max-h-[350px] object-contai pb-4 mb-4"
                  />
                  <div
                      className="
                        mt-3 bg-indigo-500 text-white
                        px-4 py-2 rounded-lg text-sm font-medium
                        hover:bg-indigo-600 transition
                      "
                    >
                      Choose Another File
                    </div>
                </div>
              ) : (
                <div className="flex flex-col align-items-center gap-3">
                    {/* Cloud Upload Icon */}
                    <div className="rounded-full bg-indigo-200 p-4">
                      <CloudUpload className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Select Receipt to Upload</p>
                      <p className="text-gray-500 text-sm">Supported Format: JPG, PNG, HEIC, SVG (10mb)</p>
                    </div>
                    <div
                      className="
                        mt-3 bg-indigo-500 text-white
                        px-4 py-2 rounded-lg text-sm font-medium
                        hover:bg-indigo-600 transition
                      "
                    >
                      Select File
                    </div>
                  </div>
              )}
            </div>

            {/* Hidden real input */}
            <input
              id="receipt-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
        {/* <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="border p-2"
        /> */}

        <button
          type="submit"
          disabled={!file || loading}
          className={`px-4 py-2 rounded text-white transition 
            ${!file || loading ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Processing...' : 'Upload Receipt'}
        </button>
      </form>

      {/* {data && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Parsed Receipt</h2>
          <p><strong>Vendor:</strong> {data.vendor?.name}</p>
          <p><strong>Total:</strong> ${data.total}</p>
          <h3 className="mt-2 font-semibold">Items:</h3>
          <ul className="list-disc ml-5">
            {data.line_items?.map((item: any, i: number) => (
              <li key={i}>
                {item.description} — {item.quantity} (${item.price} )
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

export default ReceiptUpload;
