import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SearchPetCard from "../components/Search-PetCard";
import { UsersContext } from "../Context/Context-Users";

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Strip framer-motion animation complexity — render as a plain div.
// jest.mock factories are hoisted before imports, so React is not in scope;
// use require('react') inside the factory instead.
jest.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: {
      div: ({ children, onClick, onKeyDown, role, tabIndex, "aria-label": ariaLabel, className }) =>
        React.createElement(
          "div",
          { onClick, onKeyDown, role, tabIndex, "aria-label": ariaLabel, className },
          children
        ),
    },
  };
});

jest.mock("../utils/toast", () => ({
  toast: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderCard(props = {}, contextOverrides = {}) {
  const defaultContext = {
    isLoggedIn: true,
    savedPetIds: new Set(),
    toggleSavedPet: jest.fn().mockResolvedValue(undefined),
    ...contextOverrides,
  };

  const defaultProps = {
    id: "pet123",
    breed: "Labrador",
    name: "Buddy",
    type: "Dog",
    adoptionStatus: "Available",
    imageUrl: "https://example.com/buddy.jpg",
    index: 0,
    ...props,
  };

  return {
    context: defaultContext,
    ...render(
      <MemoryRouter>
        <UsersContext.Provider value={defaultContext}>
          <SearchPetCard {...defaultProps} />
        </UsersContext.Provider>
      </MemoryRouter>
    ),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("SearchPetCard", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the pet name", () => {
    renderCard();
    expect(screen.getByText("Buddy")).toBeInTheDocument();
  });

  it("renders the breed and type joined by ·", () => {
    renderCard();
    expect(screen.getByText("Dog · Labrador")).toBeInTheDocument();
  });

  it("renders the adoption status badge", () => {
    renderCard();
    expect(screen.getByText("Available")).toBeInTheDocument();
  });

  it("renders the pet image with correct src and alt text", () => {
    renderCard();
    const img = screen.getByAltText("Buddy");
    expect(img).toHaveAttribute("src", "https://example.com/buddy.jpg");
  });

  it("renders a 'Meet Buddy →' CTA button", () => {
    renderCard();
    expect(screen.getByText("Meet Buddy →")).toBeInTheDocument();
  });

  // ── Status badge classes ───────────────────────────────────────────────────

  it("applies pet-badge--available class to Available status", () => {
    renderCard({ adoptionStatus: "Available" });
    expect(screen.getByText("Available")).toHaveClass("pet-badge--available");
  });

  it("applies pet-badge--adopted class to Adopted status", () => {
    renderCard({ adoptionStatus: "Adopted" });
    expect(screen.getByText("Adopted")).toHaveClass("pet-badge--adopted");
  });

  it("applies pet-badge--fostered class to Fostered status", () => {
    renderCard({ adoptionStatus: "Fostered" });
    expect(screen.getByText("Fostered")).toHaveClass("pet-badge--fostered");
  });

  // ── Heart icon state ───────────────────────────────────────────────────────

  it("shows 'Save pet' aria-label when pet is not saved", () => {
    renderCard({}, { savedPetIds: new Set() });
    expect(
      screen.getByRole("button", { name: "Save pet" })
    ).toBeInTheDocument();
  });

  it("shows 'Remove from saved' aria-label when pet is already saved", () => {
    renderCard({}, { savedPetIds: new Set(["pet123"]) });
    expect(
      screen.getByRole("button", { name: "Remove from saved" })
    ).toBeInTheDocument();
  });

  it("applies --saved modifier class to the heart when saved", () => {
    renderCard({}, { savedPetIds: new Set(["pet123"]) });
    const heartBtn = screen.getByRole("button", { name: "Remove from saved" });
    expect(heartBtn).toHaveClass("pet-card-modern__heart--saved");
  });

  // ── Navigation ────────────────────────────────────────────────────────────

  it("navigates to the pet detail page when the CTA button is clicked", () => {
    renderCard();
    fireEvent.click(screen.getByText("Meet Buddy →"));
    expect(mockNavigate).toHaveBeenCalledWith("/petcard?petId=pet123");
  });

  it("navigates to the pet detail page when the card div is clicked", () => {
    renderCard();
    fireEvent.click(screen.getByRole("button", { name: "View Buddy" }));
    expect(mockNavigate).toHaveBeenCalledWith("/petcard?petId=pet123");
  });

  it("navigates via keyboard Enter key on the card", () => {
    renderCard();
    const card = screen.getByRole("button", { name: "View Buddy" });
    fireEvent.keyDown(card, { key: "Enter" });
    expect(mockNavigate).toHaveBeenCalledWith("/petcard?petId=pet123");
  });

  // ── Save interaction ───────────────────────────────────────────────────────

  it("calls toggleSavedPet when logged-in user clicks the heart", () => {
    const toggleSavedPet = jest.fn().mockResolvedValue(undefined);
    renderCard({}, { isLoggedIn: true, savedPetIds: new Set(), toggleSavedPet });
    fireEvent.click(screen.getByRole("button", { name: "Save pet" }));
    expect(toggleSavedPet).toHaveBeenCalledWith("pet123");
  });

  it("navigates to home and shows info toast when unauthenticated user clicks heart", () => {
    const { toast } = require("../utils/toast");
    renderCard({}, { isLoggedIn: false, savedPetIds: new Set() });
    fireEvent.click(screen.getByRole("button", { name: "Save pet" }));
    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(toast.info).toHaveBeenCalledWith("Please log in to save pets.");
  });

  it("heart click does not propagate to card navigation", () => {
    const toggleSavedPet = jest.fn().mockResolvedValue(undefined);
    renderCard(
      {},
      { isLoggedIn: true, savedPetIds: new Set(), toggleSavedPet }
    );
    fireEvent.click(screen.getByRole("button", { name: "Save pet" }));
    // Should call toggle, not navigate to pet detail
    expect(toggleSavedPet).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith("/petcard?petId=pet123");
  });
});
