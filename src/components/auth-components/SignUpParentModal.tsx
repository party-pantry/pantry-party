import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SignUpModal from './SignUpModal';
import AddHouseModal from '../AddHouseModal';

const SignUpParentModal = ({ showSignUp, setShowSignUp }:
{ showSignUp: boolean; setShowSignUp: (show: boolean) => void }) => {
  const [showAddHouse, setShowAddHouse] = useState(false);
  const [pendingHouse, setPendingHouse] = useState(false);
  const userId = (useSession().data?.user as { id: number })?.id;
  const router = useRouter();

  // Show Add House Modal after successful sign up
  const handleSignUpSuccess = () => {
    setShowSignUp(false);
    setPendingHouse(true);
  };

  useEffect(() => {
    // Open Add House Modal if sign up was successful and userId is available
    if (pendingHouse && userId) {
      setShowAddHouse(true);
      setPendingHouse(false);
    }
  }, [pendingHouse, userId]);

  // Redirect to My Kitchen after adding a house
  const handleAddHouse = () => {
    setShowAddHouse(false);
    router.push('/my-kitchen');
  };

  return (
    <>
      <SignUpModal show={showSignUp} onHide={() => setShowSignUp(false)} onSignUpSuccess={handleSignUpSuccess} />
      {showAddHouse && userId && (
        <AddHouseModal show={showAddHouse} onHide={() => setShowAddHouse(false)} onAddHouse={handleAddHouse} />
      )}
    </>
  );
};

export default SignUpParentModal;
