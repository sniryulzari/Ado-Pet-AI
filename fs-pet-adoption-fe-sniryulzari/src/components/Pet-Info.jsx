import React, { useContext, useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { FaShare, FaWhatsapp, FaFacebook, FaTwitter, FaCopy, FaPaw, FaHome, FaHeart, FaRegHeart } from "react-icons/fa";
import { UsersContext } from "../Context/Context-Users";
import { getPetById, adoptPetStatus, fosterPetStatus, returnPetStatus } from "../api/pets";
import { getUserInfo, savePet, unsavePet, adoptPet, fosterPet, returnPet } from "../api/users";
import { toast } from "../utils/toast";

function PetCard() {
  const [pet, setPet]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [isSaved, setIsSaved]       = useState(false);
  const [isAdopted, setIsAdopted]   = useState(false);
  const [isFostered, setIsFostered] = useState(false);
  const [shareOpen, setShareOpen]   = useState(false);

  const shareRef = useRef(null);
  const { isLoggedIn } = useContext(UsersContext);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const petId = searchParams.get("petId");

  useEffect(() => {
    if (!petId) return;
    getPetById(petId)
      .then((res) => setPet(res.data))
      .catch(() => toast.error("Failed to load pet details."))
      .finally(() => setLoading(false));
  }, [petId]);

  useEffect(() => {
    if (!isLoggedIn || !petId) return;
    getUserInfo()
      .then((res) => {
        const { savedPet = [], adoptPet: adopted = [], fosterPet: fostered = [] } = res.data;
        setIsSaved(savedPet.includes(petId));
        setIsAdopted(adopted.includes(petId));
        setIsFostered(fostered.includes(petId));
      })
      .catch(() => {});
  }, [isLoggedIn, petId]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (shareRef.current && !shareRef.current.contains(e.target)) {
        setShareOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const petUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(petUrl).then(() => {
      toast.success("Link copied to clipboard! 🐾");
      setShareOpen(false);
    });
  };

  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(`Check out ${pet?.name} on Ado-Pet! 🐾 ${petUrl}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
    setShareOpen(false);
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(petUrl)}`, "_blank");
    setShareOpen(false);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Meet ${pet?.name} — available for adoption on Ado-Pet! 🐾`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(petUrl)}`, "_blank");
    setShareOpen(false);
  };

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

  /* ── Action panel logic ───────────────────────────────────── */
  function ActionPanel() {
    // Not logged in: show locked buttons
    if (!isLoggedIn) {
      return (
        <div className="action-panel">
          <button className="action-btn-adopt" onClick={() => navigate("/")}>
            <FaPaw size="0.9em" /> Login to Adopt
          </button>
          <button className="action-btn-foster" onClick={() => navigate("/")}>
            <FaHome size="0.9em" /> Login to Foster
          </button>
          <p className="action-panel-note">By adopting you give a pet a forever home ❤️</p>
        </div>
      );
    }

    // Already adopted or fostered: show return + (foster→adopt upgrade)
    if (isAdopted || isFostered) {
      return (
        <div className="action-panel">
          {isFostered && (
            <button className="action-btn-adopt" onClick={handleAdopt}>
              <FaPaw size="0.9em" /> Adopt {pet.name}
            </button>
          )}
          <button className="action-btn-return" onClick={handleReturn}>
            Return {pet.name}
          </button>
          <p className="action-panel-note">By adopting you give a pet a forever home ❤️</p>
        </div>
      );
    }

    // Available and logged in
    if (isAvailable) {
      return (
        <div className="action-panel">
          <button className="action-btn-adopt" onClick={handleAdopt}>
            <FaPaw size="0.9em" /> Adopt {pet.name}
          </button>
          <button className="action-btn-foster" onClick={handleFoster}>
            <FaHome size="0.9em" /> Foster {pet.name}
          </button>
          <button
            className={`action-btn-save${isSaved ? " action-btn-save--saved" : ""}`}
            onClick={isSaved ? handleUnsavePet : handleSavePet}
          >
            {isSaved ? <FaHeart size="1em" /> : <FaRegHeart size="1em" />}
            {isSaved ? "Saved" : "Save for later"}
          </button>
          <p className="action-panel-note">By adopting you give a pet a forever home ❤️</p>
        </div>
      );
    }

    return null;
  }

  return (
    <section className="pet-card-container">
      <div className="pet-card-top-bar">
        <button className="back-button" onClick={() => navigate(-1)}>
          <IoArrowBack size="1.1em" />
        </button>
        <div className="share-wrapper" ref={shareRef}>
          <button className="share-btn" onClick={() => setShareOpen((prev) => !prev)} aria-label="Share pet">
            <FaShare size="1em" /> Share
          </button>
          {shareOpen && (
            <div className="share-dropdown">
              <button className="share-option" onClick={handleCopyLink}>
                <FaCopy size="0.95em" /> Copy link
              </button>
              <button className="share-option share-option--whatsapp" onClick={handleShareWhatsApp}>
                <FaWhatsapp size="0.95em" /> WhatsApp
              </button>
              <button className="share-option share-option--facebook" onClick={handleShareFacebook}>
                <FaFacebook size="0.95em" /> Facebook
              </button>
              <button className="share-option share-option--twitter" onClick={handleShareTwitter}>
                <FaTwitter size="0.95em" /> Twitter / X
              </button>
            </div>
          )}
        </div>
      </div>

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

          <ActionPanel />
        </div>
      </div>
    </section>
  );
}

export default PetCard;
