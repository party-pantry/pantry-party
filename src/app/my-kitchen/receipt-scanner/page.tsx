import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import ReceiptUpload from '@/components/scanner-components/ReceiptUpload';
import ReceiptCamera from '@/components/scanner-components/ReceiptCamera';

const ReceiptScannerPage = async () => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  return (
    <main className="flex flex-col items-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Scan Your Receipt:</h1>
      <ReceiptCamera />
      <ReceiptUpload />

    </main>
  );
};

export default ReceiptScannerPage;
