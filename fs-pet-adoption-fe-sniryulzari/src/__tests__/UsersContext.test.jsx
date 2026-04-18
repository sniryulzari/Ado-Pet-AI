import React, { useContext } from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { UsersProvider, UsersContext } from "../Context/Context-Users";
import * as usersApi from "../api/users";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("../api/users", () => ({
  getUserInfo: jest.fn(),
  savePet: jest.fn(),
  unsavePet: jest.fn(),
}));

// ─── Consumer helper ──────────────────────────────────────────────────────────

function ContextConsumer() {
  const ctx = useContext(UsersContext);
  return (
    <div>
      <span data-testid="loggedIn">{String(ctx.isLoggedIn)}</span>
      <span data-testid="admin">{String(ctx.isAdmin)}</span>
      <span data-testid="authChecked">{String(ctx.authChecked)}</span>
      <span data-testid="firstName">{ctx.firstName}</span>
      <span data-testid="lastName">{ctx.lastName}</span>
      <span data-testid="savedCount">{ctx.savedPetIds.size}</span>
      <span data-testid="savedHasPet1">
        {String(ctx.savedPetIds.has("pet1"))}
      </span>
      {/* .catch prevents unhandled rejections from bleeding into subsequent tests */}
      <button onClick={() => ctx.toggleSavedPet("pet1").catch(() => {})}>
        Toggle pet1
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <UsersProvider>
      <ContextConsumer />
    </UsersProvider>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("UsersContext – UsersProvider", () => {
  beforeEach(() => {
    // resetAllMocks clears calls AND resets implementations (clearAllMocks only clears calls).
    // Without this, a mockRejectedValue from one test leaks into the next.
    jest.resetAllMocks();
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  it("starts with isLoggedIn=false and authChecked=false before the API resolves", async () => {
    // Deferred promise — lets us control resolution so React can finish cleanly.
    let resolveAuth;
    usersApi.getUserInfo.mockReturnValue(new Promise((res) => { resolveAuth = res; }));
    renderProvider();
    // Assertions fire before the promise resolves — state is still initial.
    expect(screen.getByTestId("loggedIn").textContent).toBe("false");
    expect(screen.getByTestId("authChecked").textContent).toBe("false");
    expect(screen.getByTestId("admin").textContent).toBe("false");
    expect(screen.getByTestId("firstName").textContent).toBe("");
    expect(screen.getByTestId("savedCount").textContent).toBe("0");
    // Resolve inside act() so React can flush the resulting state update before
    // the test ends — prevents the "not wrapped in act()" console warning.
    await act(async () => {
      resolveAuth({ data: { _id: "u1", firstName: "", lastName: "", isAdmin: false, savedPet: [] } });
    });
  });

  // ── Successful auth check ─────────────────────────────────────────────────

  it("sets isLoggedIn=true and authChecked=true when getUserInfo returns a user", async () => {
    usersApi.getUserInfo.mockResolvedValue({
      data: {
        _id: "u1",
        firstName: "Jane",
        lastName: "Doe",
        isAdmin: false,
        savedPet: [],
        profileImage: "",
      },
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId("authChecked").textContent).toBe("true");
    });
    expect(screen.getByTestId("loggedIn").textContent).toBe("true");
  });

  it("sets firstName and lastName from the API response", async () => {
    usersApi.getUserInfo.mockResolvedValue({
      data: {
        _id: "u1",
        firstName: "Jane",
        lastName: "Doe",
        isAdmin: false,
        savedPet: [],
      },
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId("firstName").textContent).toBe("Jane");
      expect(screen.getByTestId("lastName").textContent).toBe("Doe");
    });
  });

  it("populates savedPetIds from the user's savedPet array", async () => {
    usersApi.getUserInfo.mockResolvedValue({
      data: {
        _id: "u1",
        firstName: "Jane",
        lastName: "Doe",
        isAdmin: false,
        savedPet: ["pet1", "pet2", "pet3"],
      },
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId("savedCount").textContent).toBe("3");
      expect(screen.getByTestId("savedHasPet1").textContent).toBe("true");
    });
  });

  it("marks isAdmin=true for admin users", async () => {
    usersApi.getUserInfo.mockResolvedValue({
      data: {
        _id: "admin1",
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
        savedPet: [],
      },
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId("admin").textContent).toBe("true");
    });
  });

  it("keeps isAdmin=false for regular users", async () => {
    usersApi.getUserInfo.mockResolvedValue({
      data: {
        _id: "u1",
        firstName: "Jane",
        lastName: "Doe",
        isAdmin: false,
        savedPet: [],
      },
    });
    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId("admin").textContent).toBe("false");
    });
  });

  // ── Failed auth check ─────────────────────────────────────────────────────

  it("sets authChecked=true even when getUserInfo fails (user not logged in)", async () => {
    usersApi.getUserInfo.mockRejectedValue(new Error("Unauthorized"));
    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId("authChecked").textContent).toBe("true");
    });
    expect(screen.getByTestId("loggedIn").textContent).toBe("false");
  });

  it("leaves firstName empty when getUserInfo fails", async () => {
    usersApi.getUserInfo.mockRejectedValue(new Error("Unauthorized"));
    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId("authChecked").textContent).toBe("true");
    });
    expect(screen.getByTestId("firstName").textContent).toBe("");
  });

  it("leaves savedPetIds empty when getUserInfo fails", async () => {
    usersApi.getUserInfo.mockRejectedValue(new Error("Unauthorized"));
    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId("authChecked").textContent).toBe("true");
    });
    expect(screen.getByTestId("savedCount").textContent).toBe("0");
  });

  // ── toggleSavedPet – saving ───────────────────────────────────────────────

  it("adds a pet to savedPetIds when it is not already saved", async () => {
    usersApi.getUserInfo.mockResolvedValue({
      data: {
        _id: "u1",
        firstName: "Jane",
        lastName: "Doe",
        isAdmin: false,
        savedPet: [],
      },
    });
    usersApi.savePet.mockResolvedValue({ data: { ok: true } });

    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId("authChecked").textContent).toBe("true")
    );

    await act(async () => {
      screen.getByText("Toggle pet1").click();
    });

    expect(usersApi.savePet).toHaveBeenCalledWith("pet1");
    await waitFor(() => {
      expect(screen.getByTestId("savedCount").textContent).toBe("1");
      expect(screen.getByTestId("savedHasPet1").textContent).toBe("true");
    });
  });

  // ── toggleSavedPet – unsaving ─────────────────────────────────────────────

  it("removes a pet from savedPetIds when it is already saved", async () => {
    usersApi.getUserInfo.mockResolvedValue({
      data: {
        _id: "u1",
        firstName: "Jane",
        lastName: "Doe",
        isAdmin: false,
        savedPet: ["pet1"],
      },
    });
    usersApi.unsavePet.mockResolvedValue({ data: { ok: true } });

    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId("savedCount").textContent).toBe("1");
    });

    await act(async () => {
      screen.getByText("Toggle pet1").click();
    });

    expect(usersApi.unsavePet).toHaveBeenCalledWith("pet1");
    await waitFor(() => {
      expect(screen.getByTestId("savedCount").textContent).toBe("0");
      expect(screen.getByTestId("savedHasPet1").textContent).toBe("false");
    });
  });

  it("leaves savedPetIds unchanged when the save API call fails", async () => {
    usersApi.getUserInfo.mockResolvedValue({
      data: {
        _id: "u1",
        firstName: "Jane",
        lastName: "Doe",
        isAdmin: false,
        savedPet: [],
      },
    });
    // savePet rejects — the consumer's .catch() silences the rejection so it
    // doesn't bleed into the next test as an unhandled rejection.
    usersApi.savePet.mockRejectedValue(new Error("Network error"));

    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId("authChecked").textContent).toBe("true")
    );

    await act(async () => {
      screen.getByText("Toggle pet1").click();
      await new Promise((r) => setTimeout(r, 0));
    });

    // savedPetIds should remain 0 — the optimistic update must NOT happen on failure
    expect(screen.getByTestId("savedCount").textContent).toBe("0");
  });

  // ── getUserInfo called exactly once on mount ──────────────────────────────

  it("calls getUserInfo exactly once on mount", async () => {
    usersApi.getUserInfo.mockResolvedValue({
      data: {
        _id: "u1",
        firstName: "A",
        lastName: "B",
        isAdmin: false,
        savedPet: [],
      },
    });
    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId("authChecked").textContent).toBe("true")
    );
    expect(usersApi.getUserInfo).toHaveBeenCalledTimes(1);
  });
});
