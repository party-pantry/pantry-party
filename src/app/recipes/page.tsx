import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import Recipes from '@/components/Recipes';

const RecipesPage = async () => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  // Chain other filters (difficulty, time, serving, ratings, etc) later

  return (
    <main>
      <Recipes />
    </main>
  );
};

export default RecipesPage;
