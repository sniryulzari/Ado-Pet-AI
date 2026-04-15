import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import petOfTheWeekFrame from "../Images/petOfTheWeekFrame.jpeg";
import { getPetOfTheWeek } from "../api/pets";
import { UsersContext } from "../Context/Context-Users";
import Spinner from "./Spinner";

function buildMarketingBio(pet) {
  if (pet.bio && pet.bio.trim().length > 10) return pet.bio;
  const name = pet.name || "This pet";
  const type = pet.type ? pet.type.toLowerCase() : "animal";
  const breed = pet.breed ? ` ${pet.breed}` : "";
  return `${name} is a charming${breed} ${type} who is ready to fill your home with love and joy. ` +
    `They're looking for a forever family — could that be you? Don't miss your chance to give ${name} the life they deserve!`;
}

function PetOfTheWeek() {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useContext(UsersContext);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getPetOfTheWeek()
      .then((res) => setPet(res.data[0] ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleAdoptClick() {
    if (isLoggedIn && pet?._id) {
      navigate(`/petcard?petId=${pet._id}`);
    } else {
      navigate("/");
      // Trigger login — the login button is on the home hero; bounce user there
      // and let them click it. A future refactor could open the modal directly.
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const metaItems = [
    pet?.type,
    pet?.breed,
    pet?.age != null ? `${pet.age} yr${pet.age !== 1 ? "s" : ""} old` : null,
  ].filter(Boolean);

  return (
    <section className="home-pet-of-the-week-container">
      <span className="pet-of-the-week-heading-top">Meet Our</span>
      <h2 className="pet-of-the-week-heading-bottom">PET OF THE WEEK!</h2>

      <div className="pet-of-the-week-card">
        {/* LEFT — decorative ring + circular photo */}
        <div className="pet-of-the-week-card-left">
          <img
            src={petOfTheWeekFrame}
            className="pet-of-the-week-frame"
            alt="decorative ring"
          />
          {pet?.imageUrl && (
            <div className="pet-of-the-week-image-container">
              <img
                src={pet.imageUrl}
                alt={pet.name || "pet of the week"}
                className="pet-of-the-week-image"
              />
            </div>
          )}
        </div>

        {/* RIGHT — info + CTA */}
        <div className="pet-of-the-week-card-right">
          {loading ? (
            <Spinner />
          ) : (
            <>
              {pet?.name && (
                <span className="pet-name">{pet.name}</span>
              )}

              {metaItems.length > 0 && (
                <p className="pet-meta">{metaItems.join(" · ")}</p>
              )}

              <p className="pet-bio">{buildMarketingBio(pet ?? {})}</p>

              <button
                className="pet-of-the-week-button"
                onClick={handleAdoptClick}
              >
                {isLoggedIn
                  ? `Click to Adopt ${pet?.name ?? ""}`
                  : "Login to Adopt"}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default PetOfTheWeek;
