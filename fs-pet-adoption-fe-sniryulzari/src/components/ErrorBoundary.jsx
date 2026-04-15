import React from "react";

// Catches render errors in any child component tree and shows a fallback UI
// instead of a blank white screen. Without this, any uncaught render error
// unmounts the entire React tree in production with no feedback to the user.
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Render error caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <a href="/">Return to home</a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
