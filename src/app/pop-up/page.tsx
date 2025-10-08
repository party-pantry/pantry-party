import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import Popup from '../../components/Popup';

const PopupDemoPage = async () => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  return (
    <main>
      <h1 className="text-2xl font-bold text-center mt-6">Popup Demo Page</h1>
      <Popup />
    </main>
  );
};

export default PopupDemoPage;
