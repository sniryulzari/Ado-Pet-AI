import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SearchPets from "../Pages/Search";
import * as petsApi from "../api/pets";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("../api/pets", () => ({
  searchPets: jest.fn(),
}));

jest.mock("../utils/toast", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

// Replace SearchPetCard with a simple div — it pulls in framer-motion and
// UsersContext which are not relevant to Search page filtering logic.
jest.mock("../components/Search-PetCard", () =>
  function MockSearchPetCard({ name, adoptionStatus, type }) {
    return (
      <div data-testid="pet-card" data-name={name} data-status={adoptionStatus} data-type={type}>
        {name}
      </div>
    );
  }
);

jest.mock("../components/Footer", () => () => <div data-testid="footer" />);

jest.mock("../components/Spinner", () => () => <div data-testid="spinner" />);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PETS = [
  { _id: "1", name: "Buddy",   type: "Dog",   breed: "Labrador",  adoptionStatus: "Available", height: 60, weight: 25, imageUrl: "" },
  { _id: "2", name: "Whiskers",type: "Cat",   breed: "Siamese",   adoptionStatus: "Adopted",   height: 25, weight: 5,  imageUrl: "" },
  { _id: "3", name: "Storm",   type: "Horse", breed: "Arabian",   adoptionStatus: "Available", height: 160, weight: 500, imageUrl: "" },
  { _id: "4", name: "Charlie", type: "Dog",   breed: "Poodle",    adoptionStatus: "Fostered",  height: 35, weight: 10, imageUrl: "" },
];

function renderPage(initialPath = "/search") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <SearchPets />
    </MemoryRouter>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("SearchPets Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    petsApi.searchPets.mockResolvedValue({ data: PETS });
  });

  // ── Loading state ─────────────────────────────────────────────────────────

  it("shows the spinner while pets are loading", () => {
    // Never-resolving promise keeps the component in the loading state
    petsApi.searchPets.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  // ── Successful load ───────────────────────────────────────────────────────

  it("renders all pet cards after load", async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByTestId("spinner")).not.toBeInTheDocument());
    expect(screen.getAllByTestId("pet-card")).toHaveLength(PETS.length);
  });

  it("displays the result count", async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Showing/));
    expect(screen.getByText(/4/)).toBeInTheDocument();
  });

  it("calls searchPets exactly once on mount (all pets fetched up front)", async () => {
    renderPage();
    await waitFor(() => screen.getAllByTestId("pet-card"));
    expect(petsApi.searchPets).toHaveBeenCalledTimes(1);
    expect(petsApi.searchPets).toHaveBeenCalledWith({});
  });

  // ── Name filter ───────────────────────────────────────────────────────────

  it("filters pets by name as the user types", async () => {
    renderPage();
    await waitFor(() => screen.getAllByTestId("pet-card"));

    const nameInput = screen.getByPlaceholderText("e.g. Buddy");
    fireEvent.change(nameInput, { target: { value: "buddy" } });

    const cards = screen.getAllByTestId("pet-card");
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveAttribute("data-name", "Buddy");
  });

  it("name filter is case-insensitive", async () => {
    renderPage();
    await waitFor(() => screen.getAllByTestId("pet-card"));

    fireEvent.change(screen.getByPlaceholderText("e.g. Buddy"), { target: { value: "BUDDY" } });
    expect(screen.getAllByTestId("pet-card")).toHaveLength(1);
  });

  // ── Status filter ─────────────────────────────────────────────────────────

  it("filters pets by adoption status", async () => {
    renderPage();
    await waitFor(() => screen.getAllByTestId("pet-card"));

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Adopted" } });
    const cards = screen.getAllByTestId("pet-card");
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveAttribute("data-status", "Adopted");
  });

  it("shows all pets when status is reset to All", async () => {
    renderPage();
    await waitFor(() => screen.getAllByTestId("pet-card"));

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Adopted" } });
    fireEvent.change(select, { target: { value: "" } });
    expect(screen.getAllByTestId("pet-card")).toHaveLength(PETS.length);
  });

  // ── Type filter ───────────────────────────────────────────────────────────

  it("filters by type when a type icon is clicked", async () => {
    renderPage();
    await waitFor(() => screen.getAllByTestId("pet-card"));

    // Click the Dog icon (title="Dog")
    fireEvent.click(screen.getByTitle("Dog"));
    const cards = screen.getAllByTestId("pet-card");
    cards.forEach((c) => expect(c).toHaveAttribute("data-type", "Dog"));
  });

  it("clicking the same type icon again shows all pets (toggle off)", async () => {
    renderPage();
    await waitFor(() => screen.getAllByTestId("pet-card"));

    const dogIcon = screen.getByTitle("Dog");
    fireEvent.click(dogIcon);
    fireEvent.click(dogIcon);
    expect(screen.getAllByTestId("pet-card")).toHaveLength(PETS.length);
  });

  it("clicking the All button clears the type filter", async () => {
    renderPage();
    await waitFor(() => screen.getAllByTestId("pet-card"));

    fireEvent.click(screen.getByTitle("Dog"));
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getAllByTestId("pet-card")).toHaveLength(PETS.length);
  });

  // ── Empty state ───────────────────────────────────────────────────────────

  it("shows the empty state when no pets match the filters", async () => {
    renderPage();
    await waitFor(() => screen.getAllByTestId("pet-card"));

    fireEvent.change(screen.getByPlaceholderText("e.g. Buddy"), { target: { value: "zzznomatch" } });
    expect(screen.getByText("No pets found")).toBeInTheDocument();
    expect(screen.queryAllByTestId("pet-card")).toHaveLength(0);
  });

  // ── Clear filters ─────────────────────────────────────────────────────────

  it("Clear filters button appears only when a filter is active", async () => {
    renderPage();
    await waitFor(() => screen.getAllByTestId("pet-card"));

    expect(screen.queryByText("Clear filters")).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("e.g. Buddy"), { target: { value: "Buddy" } });
    expect(screen.getByText("Clear filters")).toBeInTheDocument();
  });

  it("Clear filters button resets all filters", async () => {
    renderPage();
    await waitFor(() => screen.getAllByTestId("pet-card"));

    fireEvent.change(screen.getByPlaceholderText("e.g. Buddy"), { target: { value: "Buddy" } });
    fireEvent.click(screen.getByText("Clear filters"));
    expect(screen.getAllByTestId("pet-card")).toHaveLength(PETS.length);
    expect(screen.queryByText("Clear filters")).not.toBeInTheDocument();
  });

  // ── Error state ───────────────────────────────────────────────────────────

  it("shows an error toast when searchPets fails", async () => {
    const { toast } = require("../utils/toast");
    petsApi.searchPets.mockRejectedValue(new Error("Network error"));
    renderPage();
    await waitFor(() => expect(screen.queryByTestId("spinner")).not.toBeInTheDocument());
    expect(toast.error).toHaveBeenCalledWith("Failed to load pets. Please try again.");
  });
});
