/* eslint-disable import/prefer-default-export */
/**
 * What this file does:
  * 1. It handles the POST request to upload a barcode image to Veryfi API for processing.
  * 2. Extracts the file from the request, converts it to base64 (specific format required)
    and sends it to Veryfi's document processing endpoint (Verify API).
    3. Returns the response from Veryfi back to the client.
*/

import { NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb', // Set maximum file size to 5MB for body parsing
    },
  },
};

export async function POST(request: Request) {
  // Take a multipart/form-data POST with an image file
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // Convert to Base64 (Veryfi expects that format)
  const arrayBuffer = await file.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString('base64');

  // Send to Veryfi API
  const res = await fetch('https://api.veryfi.com/api/v8/partner/documents/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': process.env.VERYFI_CLIENT_ID!,
      Authorization: `apikey ${process.env.VERYFI_USERNAME!}:${process.env.VERYFI_API_KEY!}`,
    },
    // Parse the json body with base64 file data and categories
    body: JSON.stringify({
      file_data: base64Data,
      categories: ['Grocery'],
    }),
  });

  // Returns parsed receipt data (merchant, date, line_items, totals, etc.)
  const data = await res.json();
  return NextResponse.json(data);
}
