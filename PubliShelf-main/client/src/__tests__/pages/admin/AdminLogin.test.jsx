/* eslint-disable no-undef */
import { jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminLogin from "../../../pages/admin/login/AdminLogin.jsx";
import { loginAdmin } from "../../../services/admin.services.js";
import { setAuth } from "../../../store/slices/authSlice.js";
import { setUser } from "../../../store/slices/userSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { MemoryRouter, useNavigate } from "react-router-dom";

jest.mock("../../../services/admin.services.js", () => ({
  loginAdmin: jest.fn()
}));

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn()
}));

jest.mock("../../../store/slices/authSlice.js", () => ({
  setAuth: jest.fn((payload) => ({ type: "auth/setAuth", payload }))
}));

jest.mock("../../../store/slices/userSlice.js", () => ({
  setUser: jest.fn((payload) => ({ type: "user/setUser", payload }))
}));

describe("AdminLogin", () => {
  const dispatch = jest.fn();
  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(dispatch);
    useSelector.mockReturnValue({ isAuthenticated: false, role: null });
    useNavigate.mockReturnValue(navigate);
  });

  it("shows validation error when admin key is missing", async () => {
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("button", { name: /access admin panel/i }));

    expect(await screen.findByText(/admin key is required/i)).toBeInTheDocument();
  });

  it("submits trimmed admin key and navigates on success", async () => {
    loginAdmin.mockResolvedValue({
      success: true,
      data: { admin: { id: "admin-1" } }
    });

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/enter your admin key/i);
  await userEvent.type(input, "123456");
    await userEvent.tab();
    await userEvent.click(screen.getByRole("button", { name: /access admin panel/i }));

    await waitFor(() => {
  expect(loginAdmin).toHaveBeenCalledWith({ adminKey: "123456" });
    });
    expect(setAuth).toHaveBeenCalledWith({ isAuthenticated: true, role: "admin" });
    expect(setUser).toHaveBeenCalledWith({ id: "admin-1" });
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledWith("/admin/dashboard", { replace: true });
  });

  it("shows server error message when login fails", async () => {
    loginAdmin.mockResolvedValue({
      success: false,
      message: "Login failed"
    });

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/enter your admin key/i);
    await userEvent.type(input, "123456");
    await userEvent.click(screen.getByRole("button", { name: /access admin panel/i }));

    expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
  });
});
