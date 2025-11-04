import Link from 'next/link';

const ProfileRecipes = () => (
  <>
    <Link href="/recipes">
      <h5 className="text-center mb-4">
        <strong>View all your recipes </strong>
      </h5>
    </Link>
  </>
);

export default ProfileRecipes;
