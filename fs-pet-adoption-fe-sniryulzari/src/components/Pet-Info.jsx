import React, { useContext, useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { FaShare, FaWhatsapp, FaFacebook, FaTwitter, FaCopy, FaPaw, FaHome, FaHeart, FaRegHeart, FaInstagram, FaDownload, FaCalendarAlt, FaBalanceScale } from "react-icons/fa";
import { UsersContext } from "../Context/Context-Users";
import { PetContext } from "../Context/Context-Pets";
import { getPetById, adoptPetStatus, fosterPetStatus, returnPetStatus } from "../api/pets";
import { getUserInfo, savePet, unsavePet, adoptPet, fosterPet, returnPet } from "../api/users";
import { toast } from "../utils/toast";
import ScheduleVisitModal from "./ScheduleVisitModal";
import PetReviews from "./PetReviews";
import LoginModal from "./LoginModal";

function PetCard() {
  const [pet, setPet]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [isSaved, setIsSaved]       = useState(false);
  const [isAdopted, setIsAdopted]   = useState(false);
  const [isFostered, setIsFostered] = useState(false);
  const [shareOpen, setShareOpen]         = useState(false);
  const [instagramOpen, setInstagramOpen] = useState(false);
  const [facebookOpen, setFacebookOpen]   = useState(false);
  const [visitModalOpen, setVisitModalOpen]   = useState(false);
  const [showLoginModal, setShowLoginModal]   = useState(false);
  const [currentUserId, setCurrentUserId]     = useState(null);
  const [canReview, setCanReview]             = useState(false);

  const shareRef = useRef(null);
  const { isLoggedIn } = useContext(UsersContext);
  const { addToCompare } = useContext(PetContext);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const petId = searchParams.get("petId");

  useEffect(() => {
    if (!petId) { setLoading(false); return; }
    getPetById(petId)
      .then((res) => setPet(res.data))
      .catch(() => toast.error("Failed to load pet details."))
      .finally(() => setLoading(false));
  }, [petId]);

  useEffect(() => {
    if (!isLoggedIn || !petId) return;
    getUserInfo()
      .then((res) => {
        const { savedPet = [], adoptPet: adopted = [], fosterPet: fostered = [], _id } = res.data;
        setIsSaved(savedPet.includes(petId));
        setIsAdopted(adopted.includes(petId));
        setIsFostered(fostered.includes(petId));
        setCurrentUserId(_id);
        setCanReview(adopted.includes(petId) || fostered.includes(petId));
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

  // Backend share URL — carries OG meta tags so Facebook shows a rich preview.
  // In production the Vercel proxy forwards /api/* → backend.
  const backendBase =
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === "production"
      ? `${window.location.origin}/api`
      : "http://localhost:8080");
  const fbShareUrl = `${backendBase}/share/pet/${petId}`;

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
    setShareOpen(false);
    setFacebookOpen(true);
  };

  const handleOpenFbSharer = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fbShareUrl)}`,
      "_blank"
    );
  };

  const handleCopyFbPost = () => {
    navigator.clipboard.writeText(facebookPost).then(() => {
      toast.success("Post copied! 📋");
    });
  };

  const handleShareInstagram = () => {
    setShareOpen(false);
    setInstagramOpen(true);
  };

  const handleDownloadPhoto = async () => {
    try {
      const res = await fetch(pet.imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pet.name}-ado-pet.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(pet.imageUrl, "_blank");
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(instagramCaption).then(() => {
      toast.success("Caption copied! 📋");
    });
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

  const isHypo =
    pet.hypoallergenic === true ||
    String(pet.hypoallergenic).toLowerCase() === "yes" ||
    String(pet.hypoallergenic).toLowerCase() === "true";

  const instagramCaption =
    `🐾 Meet ${pet.name}!\n\n` +
    `${pet.name} is a ${pet.color} ${pet.breed} ${pet.type} ready to find a forever home ❤️\n\n` +
    `📏 ${pet.height}cm · ⚖️ ${pet.weight}kg · ${isHypo ? "✅ Hypoallergenic" : "❌ Not hypoallergenic"}\n\n` +
    (pet.bio ? `"${pet.bio}"\n\n` : "") +
    `💛 Adopt or foster ${pet.name} today!\n` +
    `🔗 Link in bio\n\n` +
    `#PetAdoption #AdoptDontShop #${pet.type}sOfInstagram #RescuePet #AdoPet ` +
    `#${pet.name.replace(/\s+/g, "")} #PetLovers #FosterPets #AnimalRescue`;

  const facebookPost =
    `🐾 Meet ${pet.name} — looking for a forever home!\n\n` +
    `${pet.name} is a ${pet.color} ${pet.breed} ${pet.type}` +
    (isHypo ? ` (hypoallergenic ✅)` : "") + `.\n` +
    `📏 ${pet.height}cm tall · ⚖️ ${pet.weight}kg\n` +
    (pet.dietaryRestrictions && pet.dietaryRestrictions !== "None"
      ? `🥗 Dietary needs: ${pet.dietaryRestrictions}\n`
      : "") +
    (pet.bio ? `\n"${pet.bio}"\n` : "") +
    `\n❤️ ${pet.name} deserves a loving home. Adopt or foster today!\n` +
    `👉 ${petUrl}`;

  /* ── Action panel logic ───────────────────────────────────── */
  function ActionPanel() {
    // Not logged in: show single login button
    if (!isLoggedIn) {
      return (
        <div className="action-panel">
          <button className="action-btn-adopt" onClick={() => setShowLoginModal(true)}>
            <FaPaw size="0.9em" /> Login to Adopt or Foster
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
          <button className="action-btn-visit" onClick={() => setVisitModalOpen(true)}>
            <FaCalendarAlt size="0.9em" /> Schedule a Visit
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
        <button className="pet-card-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <IoArrowBack size="1.2em" />
        </button>
        <span className="pet-card-top-bar__title">{pet.name}</span>
        <div className="pet-card-top-bar__actions">
          <button
            className="compare-btn"
            onClick={() => { addToCompare(pet); toast.info(`${pet.name} added to comparison.`); }}
            title="Add to comparison"
          >
            <FaBalanceScale size="0.9em" /> Compare
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
                <button className="share-option share-option--instagram" onClick={handleShareInstagram}>
                  <FaInstagram size="0.95em" /> Instagram
                </button>
              </div>
            )}
          </div>
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

      {facebookOpen && (
        <div className="fb-overlay" onClick={() => setFacebookOpen(false)}>
          <div className="fb-modal" onClick={(e) => e.stopPropagation()}>
            <button className="fb-modal-close" onClick={() => setFacebookOpen(false)}>✕</button>

            <h3 className="fb-modal-title">
              <FaFacebook className="fb-icon" size="1.15em" /> Share on Facebook
            </h3>

            <div className="fb-card-preview">
              <img src={pet.imageUrl} alt={pet.name} />
              <div className="fb-card-overlay">
                <span className="fb-card-badge">🐾 Ado-Pet</span>
                <div className="fb-card-bottom">
                  <p className="fb-card-name">{pet.name}</p>
                  <p className="fb-card-tagline">{pet.breed} · {pet.color} · {pet.type}</p>
                  <span className="fb-card-cta">
                    {pet.adoptionStatus === "Available" ? "Available for Adoption!" : pet.adoptionStatus}
                  </span>
                </div>
              </div>
            </div>

            <p className="fb-post-label">Ready-to-use post text</p>
            <textarea
              className="fb-post-textarea"
              readOnly
              value={facebookPost}
              rows={6}
            />

            <div className="fb-actions">
              <button className="fb-btn fb-btn--copy" onClick={handleCopyFbPost}>
                <FaCopy size="0.9em" /> Copy Post
              </button>
              <button className="fb-btn fb-btn--share" onClick={handleOpenFbSharer}>
                <FaFacebook size="0.9em" /> Post to Facebook
              </button>
            </div>

            <p className="fb-steps">
              1. Copy the post text &nbsp;·&nbsp; 2. Click "Post to Facebook" &nbsp;·&nbsp; 3. Paste &amp; share
            </p>
          </div>
        </div>
      )}

      {instagramOpen && (
        <div className="ig-overlay" onClick={() => setInstagramOpen(false)}>
          <div className="ig-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ig-modal-close" onClick={() => setInstagramOpen(false)}>✕</button>

            <h3 className="ig-modal-title">
              <FaInstagram className="ig-icon" size="1.15em" /> Share on Instagram
            </h3>

            <div className="ig-card-preview">
              <img src={pet.imageUrl} alt={pet.name} />
              <div className="ig-card-overlay">
                <span className="ig-card-badge">🐾 Ado-Pet</span>
                <div className="ig-card-bottom">
                  <p className="ig-card-name">{pet.name}</p>
                  <p className="ig-card-tagline">{pet.breed} · {pet.color} · {pet.type}</p>
                  <span className="ig-card-cta">
                    {pet.adoptionStatus === "Available" ? "Available for Adoption!" : pet.adoptionStatus}
                  </span>
                </div>
              </div>
            </div>

            <p className="ig-caption-label">Ready-to-use caption</p>
            <textarea
              className="ig-caption-textarea"
              readOnly
              value={instagramCaption}
              rows={6}
            />

            <div className="ig-actions">
              <button className="ig-btn ig-btn--copy" onClick={handleCopyCaption}>
                <FaCopy size="0.9em" /> Copy Caption
              </button>
              <button className="ig-btn ig-btn--download" onClick={handleDownloadPhoto}>
                <FaDownload size="0.9em" /> Save Photo
              </button>
            </div>

            <p className="ig-steps">
              1. Save the photo &nbsp;·&nbsp; 2. Copy the caption &nbsp;·&nbsp; 3. Open Instagram &nbsp;·&nbsp; 4. Create post &amp; paste
            </p>
          </div>
        </div>
      )}

      {visitModalOpen && (
        <ScheduleVisitModal
          petId={petId}
          petName={pet.name}
          onClose={() => setVisitModalOpen(false)}
        />
      )}

      <LoginModal
        loginShow={showLoginModal}
        handleLoginClose={() => setShowLoginModal(false)}
        handleShow={() => {}}
      />

      <PetReviews
        petId={petId}
        initialReviews={pet.reviews || []}
        canReview={canReview}
        currentUserId={currentUserId}
      />
    </section>
  );
}

export default PetCard;
