import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../../components/ErrorBoundary";

/**
 * Test Suite for ErrorBoundary Component
 *
 * Ensures error boundaries catch errors and display fallback UI
 */

// Component that throws an error when shouldThrow is true
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>Normal content</div>;
}

describe("ErrorBoundary Component", () => {
  describe("Normal Rendering", () => {
    it("should render children when no error occurs", () => {
      render(
        <ErrorBoundary>
          <div>Child component</div>
        </ErrorBoundary>
      );

      expect(screen.getByText("Child component")).toBeInTheDocument();
    });

    it("should not display error UI when children render successfully", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Normal content")).toBeInTheDocument();
      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should catch errors and display fallback UI", () => {
      const originalError = console.error;
      try {
        console.error = () => {};

        render(
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        );

        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
        expect(
          screen.getByText(/unexpected error occurred/i)
        ).toBeInTheDocument();
        expect(screen.queryByText("Normal content")).not.toBeInTheDocument();
      } finally {
        console.error = originalError;
      }
    });

    it("should display error details in expandable section", () => {
      const originalError = console.error;
      try {
        console.error = () => {};

        render(
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        );

        expect(screen.getByText(/error details/i)).toBeInTheDocument();
        expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
      } finally {
        console.error = originalError;
      }
    });

    it("should provide reload button", () => {
      const originalError = console.error;
      try {
        console.error = () => {};

        render(
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        );

        const reloadButton = screen.getByRole("button", {
          name: /reload page/i,
        });
        expect(reloadButton).toBeInTheDocument();
      } finally {
        console.error = originalError;
      }
    });
  });

  describe("Custom Fallback", () => {
    it("should render custom fallback when provided", () => {
      const originalError = console.error;
      console.error = () => {};

      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Custom error message")).toBeInTheDocument();
      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument();

      console.error = originalError;
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading for error message", () => {
      const originalError = console.error;
      try {
        console.error = () => {};

        render(
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        );

        const heading = screen.getByRole("heading", {
          name: /something went wrong/i,
        });
        expect(heading).toBeInTheDocument();
      } finally {
        console.error = originalError;
      }
    });

    it("should have accessible reload button", () => {
      const originalError = console.error;
      try {
        console.error = () => {};

        render(
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        );

        const button = screen.getByRole("button", { name: /reload page/i });
        expect(button).toBeInTheDocument();
      } finally {
        console.error = originalError;
      }
    });
  });
});
