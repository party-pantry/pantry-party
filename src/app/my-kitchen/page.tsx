import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import MyKitchen from '@/components/MyKitchen';

const MyKitchenPage = async () => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  return (
    <main>
      <MyKitchen />
    </main>
  );
};

export default MyKitchenPage;
