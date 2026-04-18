import React from "react";
import { render, screen } from "@testing-library/react";
import Spinner from "../components/Spinner";

describe("Spinner", () => {
  it("renders with the accessible status role and aria-label", () => {
    render(<Spinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-label", "Loading");
  });

  it("applies default size of 2.5rem", () => {
    render(<Spinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveStyle({ width: "2.5rem", height: "2.5rem" });
  });

  it("respects a custom size prop", () => {
    render(<Spinner size="4rem" />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveStyle({ width: "4rem", height: "4rem" });
  });

  it("wraps inside .site-spinner-wrapper when inline=false (default)", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector(".site-spinner-wrapper")).toBeInTheDocument();
  });

  it("does NOT render the wrapper when inline=true", () => {
    const { container } = render(<Spinner inline />);
    expect(
      container.querySelector(".site-spinner-wrapper")
    ).not.toBeInTheDocument();
  });

  it("renders the .site-spinner element directly when inline=true", () => {
    const { container } = render(<Spinner inline />);
    expect(container.querySelector(".site-spinner")).toBeInTheDocument();
  });

  it("applies the .site-spinner class to the inner element", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector(".site-spinner")).toBeInTheDocument();
  });
});
