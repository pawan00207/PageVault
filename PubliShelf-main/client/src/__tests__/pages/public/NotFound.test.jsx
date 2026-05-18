/* eslint-disable no-undef */
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotFound from "../../../pages/public/NotFound.jsx";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate
}));

describe("NotFound page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("navigates back to home", async () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("button", { name: /back to home/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
