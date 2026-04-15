import { useLocation, useNavigate } from "react-router-dom";

export default function AdoptionSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Graceful fallback if someone navigates here directly without state
  if (!state?.petName) {
    navigate("/", { replace: true });
    return null;
  }

  const { petName, petImage, action } = state;
  const isAdoption = action === "adopted";

  const headline = isAdoption
    ? `You Adopted ${petName}!`
    : `You're Fostering ${petName}!`;

  const message = isAdoption
    ? `A new chapter begins today. ${petName} is officially part of your family — and trust us, ${petName} already knows it. Please expect a welcome kit from Ado-Pet within 3–5 business days. Our support team is always here if you have questions about feeding, training, or your new companion's care. You didn't just save a life today; you gained a best friend.`
    : `Thank you for opening your heart and your home. While fostering, ${petName} will receive all the love and stability they need to blossom. Check your email for your personalised foster care guide and emergency contact numbers. Remember: many of our best foster families ended up adopting — don't say we didn't warn you.`;

  return (
    <div className="adoption-success-container">
      <div className="adoption-success-card">
        <div className="adoption-success-paws">🐾</div>

        <h1 className="adoption-success-heading">Congratulations!</h1>
        <h2 className="adoption-success-subheading">{headline}</h2>

        {petImage && (
          <img
            src={petImage}
            alt={petName}
            className="adoption-success-pet-image"
          />
        )}

        <div className={`adoption-success-badge ${isAdoption ? "badge-adopted" : "badge-fostered"}`}>
          {isAdoption ? "Officially Adopted" : "Foster Family"}
        </div>

        <p className="adoption-success-message">{message}</p>

        <div className="adoption-success-tip">
          💡 <strong>Next steps:</strong> Schedule a vet check-up within the first week,
          introduce your pet to their new space gradually, and give them a few days to settle in.
        </div>

        <button
          className="adoption-success-button"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
