import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { UsersContext } from "../Context/Context-Users";
import * as usersApi from "../api/users";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("../api/users", () => ({
  login: jest.fn(),
  getUserInfo: jest.fn(),
}));

jest.mock("../utils/toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    POSITION: { BOTTOM_RIGHT: "bottom-right", TOP_RIGHT: "top-right" },
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// ─── Helper ───────────────────────────────────────────────────────────────────

function renderLoginForm(contextOverrides = {}, propsOverrides = {}) {
  const defaultContext = {
    setIsLoggedIn: jest.fn(),
    setFirstName: jest.fn(),
    setLastName: jest.fn(),
    setIsAdmin: jest.fn(),
    ...contextOverrides,
  };

  const defaultProps = {
    handleLoginClose: jest.fn(),
    handleShow: jest.fn(),
    ...propsOverrides,
  };

  render(
    <MemoryRouter>
      <UsersContext.Provider value={defaultContext}>
        <LoginForm {...defaultProps} />
      </UsersContext.Provider>
    </MemoryRouter>
  );

  return { context: defaultContext, props: defaultProps };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the welcome heading", () => {
    renderLoginForm();
    expect(screen.getByText("Welcome Back!")).toBeInTheDocument();
  });

  it("renders the email input", () => {
    renderLoginForm();
    expect(screen.getByPlaceholderText("Enter Email")).toBeInTheDocument();
  });

  it("renders the password input", () => {
    renderLoginForm();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("renders Log In and Close buttons", () => {
    renderLoginForm();
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("renders the sign-up link text", () => {
    renderLoginForm();
    expect(screen.getByText(/Not a member\? Sign up/i)).toBeInTheDocument();
  });

  it("renders the forgot-password link", () => {
    renderLoginForm();
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
  });

  // ── Button interactions ────────────────────────────────────────────────────

  it("calls handleLoginClose when Close button is clicked", () => {
    const { props } = renderLoginForm();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(props.handleLoginClose).toHaveBeenCalledTimes(1);
  });

  it("calls handleShow when 'Not a member? Sign up' is clicked", () => {
    const { props } = renderLoginForm();
    fireEvent.click(screen.getByText(/Not a member\? Sign up/i));
    expect(props.handleShow).toHaveBeenCalledTimes(1);
  });

  it("navigates to /forgot-password and closes modal when the link is clicked", () => {
    const { props } = renderLoginForm();
    fireEvent.click(screen.getByText("Forgot password?"));
    expect(props.handleLoginClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/forgot-password");
  });

  // ── Successful login ───────────────────────────────────────────────────────

  it("sets auth state and closes modal on successful login", async () => {
    usersApi.login.mockResolvedValue({ data: { id: "user123" } });
    usersApi.getUserInfo.mockResolvedValue({
      data: {
        _id: "user123",
        firstName: "John",
        lastName: "Doe",
        isAdmin: false,
      },
    });

    const setIsLoggedIn = jest.fn();
    const setFirstName = jest.fn();
    const setLastName = jest.fn();
    const setIsAdmin = jest.fn();
    const handleLoginClose = jest.fn();

    renderLoginForm(
      { setIsLoggedIn, setFirstName, setLastName, setIsAdmin },
      { handleLoginClose }
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(setIsLoggedIn).toHaveBeenCalledWith(true);
      expect(setFirstName).toHaveBeenCalledWith("John");
      expect(setLastName).toHaveBeenCalledWith("Doe");
      expect(setIsAdmin).toHaveBeenCalledWith(false);
      expect(handleLoginClose).toHaveBeenCalled();
    });
  });

  it("sets isAdmin=true when the logged-in user is an admin", async () => {
    usersApi.login.mockResolvedValue({ data: { id: "admin1" } });
    usersApi.getUserInfo.mockResolvedValue({
      data: {
        _id: "admin1",
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
      },
    });

    const setIsAdmin = jest.fn();
    renderLoginForm({ setIsAdmin });

    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(setIsAdmin).toHaveBeenCalledWith(true);
    });
  });

  it("stores first and last name in localStorage on successful login", async () => {
    usersApi.login.mockResolvedValue({ data: { id: "user123" } });
    usersApi.getUserInfo.mockResolvedValue({
      data: {
        _id: "user123",
        firstName: "Jane",
        lastName: "Smith",
        isAdmin: false,
      },
    });

    renderLoginForm();
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(localStorage.getItem("userFirstName")).toBe('"Jane"');
      expect(localStorage.getItem("userLastName")).toBe('"Smith"');
    });
  });

  // ── Failed login ───────────────────────────────────────────────────────────

  it("shows an error toast when login API throws", async () => {
    usersApi.login.mockRejectedValue(new Error("Invalid credentials"));
    const { toast } = require("../utils/toast");

    renderLoginForm();
    fireEvent.change(screen.getByPlaceholderText("Enter Email"), {
      target: { value: "bad@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Invalid email or password.",
        expect.any(Object)
      );
    });
  });

  it("does not call setIsLoggedIn on failed login", async () => {
    usersApi.login.mockRejectedValue(new Error("Unauthorized"));
    const setIsLoggedIn = jest.fn();

    renderLoginForm({ setIsLoggedIn });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(setIsLoggedIn).not.toHaveBeenCalled();
    });
  });

  it("does not close the modal on failed login", async () => {
    usersApi.login.mockRejectedValue(new Error("Unauthorized"));
    const handleLoginClose = jest.fn();

    renderLoginForm({}, { handleLoginClose });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(handleLoginClose).not.toHaveBeenCalled();
    });
  });
});
