import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UsersContext } from "../Context/Context-Users";
import PetCard from "../components/Pet-Info";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("../api/pets", () => ({
  getPetById:       jest.fn(),
  adoptPetStatus:   jest.fn(),
  fosterPetStatus:  jest.fn(),
  returnPetStatus:  jest.fn(),
}));

jest.mock("../api/users", () => ({
  getUserInfo: jest.fn(),
  savePet:     jest.fn(),
  unsavePet:   jest.fn(),
  adoptPet:    jest.fn(),
  fosterPet:   jest.fn(),
  returnPet:   jest.fn(),
}));

jest.mock("../utils/toast", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SAMPLE_PET = {
  _id:                 "pet1",
  name:                "Buddy",
  type:                "Dog",
  breed:               "Labrador",
  adoptionStatus:      "Available",
  height:              60,
  weight:              25,
  color:               "Yellow",
  hypoallergenic:      false,
  dietaryRestrictions: "None",
  bio:                 "A friendly dog.",
  imageUrl:            "https://example.com/buddy.jpg",
};

function renderPetCard({ petId = "pet1", isLoggedIn = false, contextOverrides = {} } = {}) {
  const contextValue = {
    isLoggedIn,
    savedPetIds:    new Set(),
    toggleSavedPet: jest.fn().mockResolvedValue(undefined),
    ...contextOverrides,
  };

  const path = petId ? `/petcard?petId=${petId}` : "/petcard";

  return render(
    <MemoryRouter initialEntries={[path]}>
      <UsersContext.Provider value={contextValue}>
        <PetCard />
      </UsersContext.Provider>
    </MemoryRouter>
  );
}

// ─── Import API mocks for use in tests ────────────────────────────────────────

const petsApi = require("../api/pets");
const usersApi = require("../api/users");

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("PetCard (Pet-Info)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockNavigate.mockClear();
    // Default: pet loads successfully, user has no saved/adopted/fostered pets
    petsApi.getPetById.mockResolvedValue({ data: SAMPLE_PET });
    usersApi.getUserInfo.mockResolvedValue({
      data: { savedPet: [], adoptPet: [], fosterPet: [] },
    });
  });

  // ── Loading / not-found states ────────────────────────────────────────────

  it("shows Loading... while the pet is being fetched", () => {
    petsApi.getPetById.mockReturnValue(new Promise(() => {}));
    renderPetCard();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows 'Pet not found.' when no petId query param is provided", async () => {
    renderPetCard({ petId: null });
    // No petId → useEffect skips the fetch, loading becomes false, pet stays null
    await waitFor(() => expect(screen.getByText("Pet not found.")).toBeInTheDocument());
  });

  // ── Pet detail rendering ──────────────────────────────────────────────────

  it("renders the pet name", async () => {
    renderPetCard({ isLoggedIn: false });
    await waitFor(() => screen.getByText("Buddy"));
    expect(screen.getByText("Buddy")).toBeInTheDocument();
  });

  it("renders breed and type info", async () => {
    renderPetCard({ isLoggedIn: false });
    await waitFor(() => screen.getByText(/Labrador/));
    expect(screen.getByText(/Dog/)).toBeInTheDocument();
  });

  it("renders height, weight, color, and bio", async () => {
    renderPetCard({ isLoggedIn: false });
    await waitFor(() => screen.getByText(/60cm/));
    expect(screen.getByText(/25kg/)).toBeInTheDocument();
    expect(screen.getByText(/Yellow/)).toBeInTheDocument();
    expect(screen.getByText(/A friendly dog/)).toBeInTheDocument();
  });

  it("renders the pet image", async () => {
    renderPetCard({ isLoggedIn: false });
    await waitFor(() => screen.getByAltText("Pet"));
    expect(screen.getByAltText("Pet")).toHaveAttribute("src", SAMPLE_PET.imageUrl);
  });

  // ── ActionPanel – not logged in ───────────────────────────────────────────

  it("shows 'Login to Adopt' and 'Login to Foster' when not logged in", async () => {
    renderPetCard({ isLoggedIn: false });
    await waitFor(() => screen.getByText(/Login to Adopt/));
    expect(screen.getByText(/Login to Foster/)).toBeInTheDocument();
  });

  it("clicking 'Login to Adopt' navigates to home when not logged in", async () => {
    renderPetCard({ isLoggedIn: false });
    await waitFor(() => screen.getByText(/Login to Adopt/));
    fireEvent.click(screen.getByText(/Login to Adopt/));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // ── ActionPanel – logged in, available ───────────────────────────────────

  it("shows 'Adopt' and 'Foster' buttons for a logged-in user on an available pet", async () => {
    renderPetCard({ isLoggedIn: true });
    await waitFor(() => screen.getByText(/Adopt Buddy/));
    expect(screen.getByText(/Foster Buddy/)).toBeInTheDocument();
  });

  it("shows 'Save for later' button when logged in and pet is not saved/adopted/fostered", async () => {
    renderPetCard({ isLoggedIn: true });
    await waitFor(() => screen.getByText("Save for later"));
    expect(screen.getByText("Save for later")).toBeInTheDocument();
  });

  // ── Save / unsave ─────────────────────────────────────────────────────────

  it("clicking 'Save for later' calls savePet and shows 'Saved'", async () => {
    usersApi.savePet.mockResolvedValue({ data: { ok: true } });
    renderPetCard({ isLoggedIn: true });
    await waitFor(() => screen.getByText("Save for later"));

    fireEvent.click(screen.getByText("Save for later"));
    await waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
    expect(usersApi.savePet).toHaveBeenCalledWith("pet1");
  });

  it("clicking 'Saved' calls unsavePet and reverts to 'Save for later'", async () => {
    usersApi.getUserInfo.mockResolvedValue({
      data: { savedPet: ["pet1"], adoptPet: [], fosterPet: [] },
    });
    usersApi.unsavePet.mockResolvedValue({ data: { ok: true } });

    renderPetCard({ isLoggedIn: true });
    await waitFor(() => screen.getByText("Saved"));

    fireEvent.click(screen.getByText("Saved"));
    await waitFor(() => expect(screen.getByText("Save for later")).toBeInTheDocument());
    expect(usersApi.unsavePet).toHaveBeenCalledWith("pet1");
  });

  // ── ActionPanel – fostered ────────────────────────────────────────────────

  it("shows 'Adopt' and 'Return' buttons when the user has fostered this pet", async () => {
    usersApi.getUserInfo.mockResolvedValue({
      data: { savedPet: [], adoptPet: [], fosterPet: ["pet1"] },
    });
    renderPetCard({ isLoggedIn: true });
    await waitFor(() => screen.getByText(/Adopt Buddy/));
    expect(screen.getByText(/Return Buddy/)).toBeInTheDocument();
  });

  // ── ActionPanel – adopted ─────────────────────────────────────────────────

  it("shows only 'Return' button (no Adopt) when the user has adopted this pet", async () => {
    usersApi.getUserInfo.mockResolvedValue({
      data: { savedPet: [], adoptPet: ["pet1"], fosterPet: [] },
    });
    renderPetCard({ isLoggedIn: true });
    await waitFor(() => screen.getByText(/Return Buddy/));
    // Adopted users should NOT see an Adopt button (only fostered users can upgrade)
    expect(screen.queryByText(/Adopt Buddy/)).not.toBeInTheDocument();
  });

  // ── Back navigation ───────────────────────────────────────────────────────

  it("navigates back when the back button is clicked", async () => {
    renderPetCard({ isLoggedIn: false });
    await waitFor(() => screen.getByText("Buddy"));
    // The back button renders the IoArrowBack icon — find by role button near the top
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]); // back button is first
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
