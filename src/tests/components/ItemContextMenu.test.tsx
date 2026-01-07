import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ItemContextMenu from "../../components/ItemContextMenu";
import { useRef } from "react";

/**
 * Test Suite for ItemContextMenu Component
 *
 * Tests rendering, positioning, menu interactions, and accessibility
 * for the three-dot context menu component.
 */

// Helper component to provide a ref
function TestWrapper(props: {
  isOpen: boolean;
  isLastRow: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return <ItemContextMenu {...props} buttonRef={buttonRef} />;
}

describe("ItemContextMenu Component", () => {
  const defaultProps = {
    isOpen: false,
    isLastRow: false,
    onToggle: vi.fn(),
    onRename: vi.fn(),
    onDelete: vi.fn(),
    onClose: vi.fn(),
  };

  describe("Rendering", () => {
    it("should render the menu trigger button", () => {
      render(<TestWrapper {...defaultProps} />);

      const button = screen.getByRole("button", {
        name: /more actions for this item/i,
      });
      expect(button).toBeInTheDocument();
    });

    it("should not show menu dropdown when closed", () => {
      render(<TestWrapper {...defaultProps} />);

      const menu = screen.queryByRole("menu");
      expect(menu).not.toBeInTheDocument();
    });

    it("should show menu dropdown when open", () => {
      render(<TestWrapper {...defaultProps} isOpen={true} />);

      const menu = screen.getByRole("menu");
      expect(menu).toBeInTheDocument();
    });

    it("should have proper ARIA attributes on trigger button", () => {
      render(<TestWrapper {...defaultProps} />);

      const button = screen.getByRole("button", {
        name: /more actions/i,
      });
      expect(button).toHaveAttribute("aria-haspopup", "menu");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("should update aria-expanded when menu opens", () => {
      const { rerender } = render(<TestWrapper {...defaultProps} />);

      let button = screen.getByRole("button", { name: /more actions/i });
      expect(button).toHaveAttribute("aria-expanded", "false");

      rerender(<TestWrapper {...defaultProps} isOpen={true} />);

      button = screen.getByRole("button", { name: /more actions/i });
      expect(button).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Menu Actions", () => {
    it("should display Rename and Delete options when open", () => {
      render(<TestWrapper {...defaultProps} isOpen={true} />);

      expect(
        screen.getByRole("menuitem", { name: /rename/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("menuitem", { name: /delete/i })
      ).toBeInTheDocument();
    });

    it("should call onRename when Rename is clicked", async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();

      render(
        <TestWrapper {...defaultProps} isOpen={true} onRename={onRename} />
      );

      const renameButton = screen.getByRole("menuitem", { name: /rename/i });
      await user.click(renameButton);

      expect(onRename).toHaveBeenCalledTimes(1);
    });

    it("should call onDelete when Delete is clicked", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

      render(
        <TestWrapper {...defaultProps} isOpen={true} onDelete={onDelete} />
      );

      const deleteButton = screen.getByRole("menuitem", { name: /delete/i });
      await user.click(deleteButton);

      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("should call onClose after Rename is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<TestWrapper {...defaultProps} isOpen={true} onClose={onClose} />);

      const renameButton = screen.getByRole("menuitem", { name: /rename/i });
      await user.click(renameButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose after Delete is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<TestWrapper {...defaultProps} isOpen={true} onClose={onClose} />);

      const deleteButton = screen.getByRole("menuitem", { name: /delete/i });
      await user.click(deleteButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Menu Positioning", () => {
    it("should position menu below button for non-last rows", () => {
      render(<TestWrapper {...defaultProps} isOpen={true} isLastRow={false} />);

      const menu = screen.getByRole("menu");
      expect(menu).toHaveClass("top-8");
      expect(menu).not.toHaveClass("bottom-8");
    });

    it("should position menu above button for last rows", () => {
      render(<TestWrapper {...defaultProps} isOpen={true} isLastRow={true} />);

      const menu = screen.getByRole("menu");
      expect(menu).toHaveClass("bottom-8");
      expect(menu).not.toHaveClass("top-8");
    });
  });

  describe("Click Outside Behavior", () => {
    it("should render backdrop when menu is open", () => {
      const { container } = render(
        <TestWrapper {...defaultProps} isOpen={true} />
      );

      const backdrop = container.querySelector('[role="presentation"]');
      expect(backdrop).toBeInTheDocument();
    });

    it("should call onClose when backdrop is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const { container } = render(
        <TestWrapper {...defaultProps} isOpen={true} onClose={onClose} />
      );

      const backdrop = container.querySelector('[role="presentation"]')!;
      await user.click(backdrop);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not render backdrop when menu is closed", () => {
      const { container } = render(
        <TestWrapper {...defaultProps} isOpen={false} />
      );

      const backdrop = container.querySelector('[role="presentation"]');
      expect(backdrop).not.toBeInTheDocument();
    });
  });

  describe("Toggle Behavior", () => {
    it("should call onToggle when trigger button is clicked", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(<TestWrapper {...defaultProps} onToggle={onToggle} />);

      const button = screen.getByRole("button", { name: /more actions/i });
      await user.click(button);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("should receive mouse event in onToggle callback", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(<TestWrapper {...defaultProps} onToggle={onToggle} />);

      const button = screen.getByRole("button", { name: /more actions/i });
      await user.click(button);

      expect(onToggle).toHaveBeenCalledWith(expect.any(Object));
      expect(onToggle.mock.calls[0][0]).toHaveProperty("type", "click");
    });
  });

  describe("Event Propagation", () => {
    it("should stop propagation on menu item clicks", async () => {
      const user = userEvent.setup();
      const parentClick = vi.fn();
      const onRename = vi.fn();

      render(
        <div onClick={parentClick}>
          <TestWrapper {...defaultProps} isOpen={true} onRename={onRename} />
        </div>
      );

      const renameButton = screen.getByRole("menuitem", { name: /rename/i });
      await user.click(renameButton);

      expect(onRename).toHaveBeenCalled();
      expect(parentClick).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper menu role and structure", () => {
      render(<TestWrapper {...defaultProps} isOpen={true} />);

      const menu = screen.getByRole("menu");
      expect(menu).toBeInTheDocument();

      const menuItems = screen.getAllByRole("menuitem");
      expect(menuItems).toHaveLength(2); // Rename and Delete
    });

    it("should apply proper focus styles on menu items", () => {
      render(<TestWrapper {...defaultProps} isOpen={true} />);

      const renameButton = screen.getByRole("menuitem", { name: /rename/i });
      expect(renameButton).toHaveClass(
        "focus:outline-none",
        "focus:bg-gray-50"
      );
    });

    it("should apply danger styling to Delete action", () => {
      render(<TestWrapper {...defaultProps} isOpen={true} />);

      const deleteButton = screen.getByRole("menuitem", { name: /delete/i });
      expect(deleteButton).toHaveClass("text-red-600", "hover:bg-red-50");
    });
  });
});
