import React, { useContext, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { UsersContext } from "../Context/Context-Users";
import { getPetById, adoptPetStatus, fosterPetStatus, returnPetStatus } from "../api/pets";
import { getUserInfo, savePet, unsavePet, adoptPet, fosterPet, returnPet } from "../api/users";
import { toast } from "react-toastify";

function PetCard() {
  const [pet, setPet]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [isSaved, setIsSaved]   = useState(false);
  const [isAdopted, setIsAdopted] = useState(false);
  const [isFostered, setIsFostered] = useState(false);

  const { isLoggedIn } = useContext(UsersContext);
  const navigate = useNavigate();

  // Using React Router's hook instead of manually parsing window.location.search.
  // petId is derived once at the top and reused — no repeated URL parsing in handlers.
  const [searchParams] = useSearchParams();
  const petId = searchParams.get("petId");

  useEffect(() => {
    if (!petId) return;
    getPetById(petId)
      .then((res) => setPet(res.data))
      .catch(() => toast.error("Failed to load pet details."))
      .finally(() => setLoading(false));
  }, [petId]);

  // Fixed: was missing the [] dependency array, causing this to fire on every
  // render and spam GET /users/userInfo infinitely.
  useEffect(() => {
    if (!isLoggedIn || !petId) return;
    getUserInfo()
      .then((res) => {
        const { savedPet = [], adoptPet: adopted = [], fosterPet: fostered = [] } = res.data;
        // Fixed: replaced off-by-one for-loops (`i <= arr.length`) with Array.includes
        setIsSaved(savedPet.includes(petId));
        setIsAdopted(adopted.includes(petId));
        setIsFostered(fostered.includes(petId));
      })
      .catch(() => {});
  }, [isLoggedIn, petId]);

  const handleSavePet = async () => {
    try {
      await savePet(petId);
      setIsSaved(true);
    } catch {
      toast.error("Failed to save pet.");
    }
  };

  const handleUnsavePet = async () => {
    try {
      await unsavePet(petId);
      setIsSaved(false);
    } catch {
      toast.error("Failed to unsave pet.");
    }
  };

  const handleAdopt = async () => {
    try {
      const { data } = await adoptPet(petId);
      await adoptPetStatus({ userId: data.userId, petId });
      navigate("/adoption-success", {
        state: { petName: pet.name, petImage: pet.imageUrl, action: "adopted" },
      });
    } catch {
      toast.error("Adoption failed. Please try again.");
    }
  };

  const handleFoster = async () => {
    try {
      const { data } = await fosterPet(petId);
      await fosterPetStatus({ userId: data.userId, petId });
      navigate("/adoption-success", {
        state: { petName: pet.name, petImage: pet.imageUrl, action: "fostered" },
      });
    } catch {
      toast.error("Fostering failed. Please try again.");
    }
  };

  const handleReturn = async () => {
    try {
      const { data } = await returnPet(petId);
      await returnPetStatus({ userId: data.userId, petId });
      setIsFostered(false);
      setIsAdopted(false);
      setIsSaved(false);
      toast.success("Pet returned successfully.");
    } catch {
      toast.error("Return failed. Please try again.");
    }
  };

  if (loading) {
    return <section className="pet-card-container"><p>Loading...</p></section>;
  }

  if (!pet) {
    return <section className="pet-card-container"><p>Pet not found.</p></section>;
  }

  const isAvailable = pet.adoptionStatus === "Available";

  return (
    <section className="pet-card-container">
      <button className="back-button" onClick={() => navigate(-1)}><IoArrowBack size="1.1em" /></button>
      <div className="pet-card">
        <img
          src={pet.imageUrl}
          height="500em"
          width="500em"
          alt="Pet"
          className="pet-card-image"
        />
        <div className="card-right">
          <div className="pet-card-info">
            <span className="pet-card-pet-name">{pet.name}</span>
            <p className="pet-info">This {pet.type} is of the breed {pet.breed}.</p>
            <p className="pet-info">{pet.name} is {pet.height}cm tall and weighs {pet.weight}kg.</p>
            <p className="pet-info">Color: {pet.color}</p>
            <p className="pet-info">Adoption Status: {pet.adoptionStatus}</p>
            <p className="pet-info">Hypoallergenic: {pet.hypoallergenic}</p>
            <p className="pet-info">Dietary Restrictions: {pet.dietaryRestrictions}</p>
            <p className="pet-info">Bio: {pet.bio}</p>
          </div>

          {isLoggedIn && (isAvailable || isAdopted || isFostered) && (
            <div className="pet-card-button-container">
              {isFostered && (
                <button className="pet-card-button" onClick={handleAdopt}>Adopt</button>
              )}
              {(isAdopted || isFostered) ? (
                <button className="pet-card-button" onClick={handleReturn}>Return Pet</button>
              ) : (
                <>
                  <button className="pet-card-button" onClick={handleAdopt}>Adopt</button>
                  <button className="pet-card-button" onClick={handleFoster}>Foster</button>
                </>
              )}
              {isSaved && !(isAdopted || isFostered) && (
                <button className="pet-card-button" onClick={handleUnsavePet}>Unsave Pet</button>
              )}
              {!isSaved && !(isAdopted || isFostered) && (
                <button className="pet-card-button" onClick={handleSavePet}>Save Pet</button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PetCard;
