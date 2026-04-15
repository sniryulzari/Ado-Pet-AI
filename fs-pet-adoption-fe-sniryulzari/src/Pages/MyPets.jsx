import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchPetCard from "../components/Search-PetCard";
import Footer from "../components/Footer";
import { UsersContext } from "../Context/Context-Users";
import { getMyPets } from "../api/users";
import { getSavedPetInfo, getAdoptedPetInfo, getFosteredPetInfo } from "../api/pets";
import { toast } from "react-toastify";

function gridClass(count) {
  if (count === 1) return "my-pets-grid my-pets-grid--single";
  if (count === 2) return "my-pets-grid my-pets-grid--double";
  return "my-pets-grid my-pets-grid--many";
}

function PetGrid({ pets, navigate }) {
  return (
    <div className={gridClass(pets.length)}>
      {pets.map((pet) => (
        <div
          key={pet._id}
          className="my-pet-card-wrapper"
          onClick={() => navigate(`/petcard?petId=${pet._id}`)}
        >
          <SearchPetCard {...pet} id={pet._id} />
        </div>
      ))}
    </div>
  );
}

const MyPets = () => {
  const [savedPets, setSavedPets]   = useState([]);
  const [ownedPets, setOwnedPets]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [togglePets, setTogglePets] = useState(true);

  const { isLoggedIn } = useContext(UsersContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchAll = async () => {
      try {
        const res = await getMyPets();
        const user = res.data;

        // Fixed: previously three sequential for-loops each doing one request at
        // a time (N+1 pattern). Now all requests fire simultaneously with Promise.all.
        // Also fixed: each iteration called setState, causing a re-render per pet.
        // Now state is set once after all responses arrive.
        // Also fixed: state was appended (prev => [...prev, item]) rather than
        // replaced, so re-mounting the component duplicated the list.
        const [saved, adopted, fostered] = await Promise.all([
          Promise.all(user.savedPet.map((id) => getSavedPetInfo(id))),
          Promise.all(user.adoptPet.map((id) => getAdoptedPetInfo(id))),
          Promise.all(user.fosterPet.map((id) => getFosteredPetInfo(id))),
        ]);

        setSavedPets(saved.map((r) => r.data).filter((d) => d?._id));
        setOwnedPets([
          ...adopted.map((r) => r.data).filter((d) => d?._id),
          ...fostered.map((r) => r.data).filter((d) => d?._id),
        ]);
      } catch {
        toast.error("Failed to load your pets.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [isLoggedIn]);

  if (loading) {
    return <div className="my-pets-container"><p>Loading your pets...</p></div>;
  }

  return (
    <div>
      <div className="my-pets-container">
        <div className="my-pets-header-container">
          <h1 className="my-pets-header">My Pets Page</h1>
          <button
            className="pet-card-button my-pets-button"
            onClick={() => setTogglePets((prev) => !prev)}
          >
            {togglePets ? "My Saved Pets" : "My Owned Pets"}
          </button>
        </div>

        {!togglePets && (
          <div className="my-pets-result-container">
            <h2 className="my-pets-sub-header">My Saved Pets</h2>
            <PetGrid pets={savedPets} navigate={navigate} />
          </div>
        )}

        {togglePets && (
          ownedPets.length > 0 ? (
            <div className="my-pets-result-container">
              <h2 className="my-pets-sub-header">My Owned Pets</h2>
              <PetGrid pets={ownedPets} navigate={navigate} />
            </div>
          ) : (
            <h3 className="my-pets-header">You currently do not own or foster any pets.</h3>
          )
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyPets;
