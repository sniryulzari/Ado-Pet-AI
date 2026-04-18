import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FormInput from "../components/FormInput";

const defaultProps = {
  label: "Email",
  errorMessage: "Please enter a valid email",
  onChange: jest.fn(),
  id: "email",
  type: "email",
  name: "email",
  placeholder: "Enter email",
  required: true,
};

describe("FormInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the label text", () => {
    render(<FormInput {...defaultProps} />);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders the error message text", () => {
    render(<FormInput {...defaultProps} />);
    expect(
      screen.getByText("Please enter a valid email")
    ).toBeInTheDocument();
  });

  it("renders an input element", () => {
    render(<FormInput {...defaultProps} />);
    // email type is not a textbox role — use getByPlaceholderText
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("passes extra inputProps (placeholder, required) down to the input", () => {
    render(<FormInput {...defaultProps} />);
    const input = screen.getByPlaceholderText("Enter email");
    expect(input).toBeRequired();
  });

  it("calls onChange when the input value changes", () => {
    render(<FormInput {...defaultProps} />);
    const input = screen.getByPlaceholderText("Enter email");
    fireEvent.change(input, { target: { value: "test@test.com" } });
    expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
  });

  it("starts with focused='false' attribute before any interaction", () => {
    render(<FormInput {...defaultProps} />);
    const input = screen.getByPlaceholderText("Enter email");
    expect(input).toHaveAttribute("focused", "false");
  });

  it("sets focused='true' after the input is blurred", () => {
    render(<FormInput {...defaultProps} />);
    const input = screen.getByPlaceholderText("Enter email");
    fireEvent.blur(input);
    expect(input).toHaveAttribute("focused", "true");
  });

  it("renders a password input when type=password", () => {
    render(
      <FormInput
        {...defaultProps}
        type="password"
        name="password"
        placeholder="Password"
      />
    );
    const input = screen.getByPlaceholderText("Password");
    expect(input).toHaveAttribute("type", "password");
  });

  it("renders different error messages for different instances", () => {
    const { rerender } = render(<FormInput {...defaultProps} />);
    expect(screen.getByText("Please enter a valid email")).toBeInTheDocument();
    rerender(
      <FormInput {...defaultProps} errorMessage="This field is required" />
    );
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("sets focused='true' immediately on focus when name=confirmPassword", () => {
    render(
      <FormInput
        {...defaultProps}
        name="confirmPassword"
        placeholder="Confirm password"
      />
    );
    const input = screen.getByPlaceholderText("Confirm password");
    fireEvent.focus(input);
    expect(input).toHaveAttribute("focused", "true");
  });
});
