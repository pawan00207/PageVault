import { describe, it, expect } from "@jest/globals";
import { emailRules, passwordRules } from "../../../pages/auth/validations.js";

describe("auth validation rules", () => {
  it("rejects missing email", () => {
    expect(emailRules.required).toBe("Email is required.");
  });

  it("rejects invalid email", () => {
    const result = emailRules.pattern.value.test("invalid");
    expect(result).toBe(false);
  });

  it("enforces lowercase emails", () => {
    const message = emailRules.validate.lowercaseOnly("TEST@EMAIL.COM");
    expect(message).toBe("Uppercase letters are not allowed.");
  });

  it("rejects missing password", () => {
    expect(passwordRules.required).toBe("Password is required.");
  });

  it("enforces password min length", () => {
    expect(passwordRules.minLength.value).toBe(3);
  });
});
