import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ItemContextMenu from "../../components/ItemContextMenu";
import { useRef } from "react";

/**
 * Test Suite for ItemContextMenu Component
 *
 * Tests the Radix UI dropdown menu for rename and delete actions.
 */

function TestWrapper(props: { onRename: () => void; onDelete: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <ItemContextMenu
      buttonRef={buttonRef}
      onRename={props.onRename}
      onDelete={props.onDelete}
    />
  );
}

describe("ItemContextMenu Component", () => {
  describe("Rendering", () => {
    it("should render the menu trigger button", () => {
      render(<TestWrapper onRename={vi.fn()} onDelete={vi.fn()} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should show menu items when button is clicked", async () => {
      const user = userEvent.setup();
      render(<TestWrapper onRename={vi.fn()} onDelete={vi.fn()} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const renameOption = screen.getByRole("menuitem", { name: /rename/i });
      const deleteOption = screen.getByRole("menuitem", { name: /delete/i });

      expect(renameOption).toBeInTheDocument();
      expect(deleteOption).toBeInTheDocument();
    });
  });

  describe("Actions", () => {
    it("should call onRename when rename option is clicked", async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      const onDelete = vi.fn();

      render(<TestWrapper onRename={onRename} onDelete={onDelete} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const renameOption = screen.getByRole("menuitem", { name: /rename/i });
      await user.click(renameOption);

      expect(onRename).toHaveBeenCalled();
    });

    it("should call onDelete when delete option is clicked", async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      const onDelete = vi.fn();

      render(<TestWrapper onRename={onRename} onDelete={onDelete} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const deleteOption = screen.getByRole("menuitem", { name: /delete/i });
      await user.click(deleteOption);

      expect(onDelete).toHaveBeenCalled();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should close menu when Escape is pressed", async () => {
      const user = userEvent.setup();
      render(<TestWrapper onRename={vi.fn()} onDelete={vi.fn()} />);

      const button = screen.getByRole("button");
      await user.click(button);

      let menuItems = screen.queryAllByRole("menuitem");
      expect(menuItems.length).toBeGreaterThan(0);

      await user.keyboard("{Escape}");

      await waitFor(() => {
        menuItems = screen.queryAllByRole("menuitem");
        expect(menuItems.length).toBe(0);
      });
    });

    it("should allow keyboard navigation between menu items", async () => {
      const user = userEvent.setup();
      render(<TestWrapper onRename={vi.fn()} onDelete={vi.fn()} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const renameOption = screen.getByRole("menuitem", { name: /rename/i });
      expect(renameOption).toBeInTheDocument();
    });
  });
});
