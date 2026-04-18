/**
 * Unit tests for NewsletterController – subscribe().
 *
 * Covers: email validation, missing BREVO_API_KEY (503), successful
 * subscription (email sent + subscriber saved), and email API failure (500).
 */

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("../../Models/newsletterModel");

// Keep a mutable reference so individual tests can change behaviour.
// Variable name must start with "mock" to satisfy jest.mock hoisting rules.
let mockSendTransacEmail;

jest.mock("sib-api-v3-sdk", () => ({
  ApiClient: { instance: { authentications: { "api-key": {} } } },
  TransactionalEmailsApi: jest.fn(() => ({
    sendTransacEmail: (...args) => mockSendTransacEmail(...args),
  })),
  SendSmtpEmail: jest.fn(() => ({})),
}));

// ─── Imports ─────────────────────────────────────────────────────────────────

const SibApiV3Sdk             = require("sib-api-v3-sdk");
const { saveSubscriberModel } = require("../../Models/newsletterModel");
const { subscribe }           = require("../../Controllers/NewsletterController");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeReq(body = {}) {
  return { body };
}

function makeRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    send:   jest.fn().mockReturnThis(),
  };
  return res;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("NewsletterController – subscribe", () => {
  const originalBREVO = process.env.BREVO_API_KEY;

  beforeEach(() => {
    jest.resetAllMocks();
    mockSendTransacEmail = jest.fn().mockResolvedValue({});
    // jest.resetAllMocks() clears the TransactionalEmailsApi implementation that
    // the jest.mock() factory set up — re-apply it here so the controller gets a
    // real-looking API instance each time.
    SibApiV3Sdk.TransactionalEmailsApi.mockImplementation(() => ({
      sendTransacEmail: mockSendTransacEmail,
    }));
    SibApiV3Sdk.SendSmtpEmail.mockImplementation(() => ({}));
    // Set a default API key so most tests get past the 503 guard.
    process.env.BREVO_API_KEY = "test-brevo-key";
  });

  afterEach(() => {
    process.env.BREVO_API_KEY = originalBREVO;
  });

  // ── Input validation ──────────────────────────────────────────────────────

  it("returns 400 when no email is provided", async () => {
    const res = makeRes();
    await subscribe(makeReq({}), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid email address");
  });

  it("returns 400 for a malformed email address", async () => {
    const res = makeRes();
    await subscribe(makeReq({ email: "not-an-email" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid email address");
  });

  it("returns 400 for an email missing the domain part", async () => {
    const res = makeRes();
    await subscribe(makeReq({ email: "user@" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ── Missing API key ───────────────────────────────────────────────────────

  it("returns 503 when BREVO_API_KEY is not configured", async () => {
    delete process.env.BREVO_API_KEY;
    const res = makeRes();
    await subscribe(makeReq({ email: "user@example.com" }), res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.send).toHaveBeenCalledWith("Email service not configured");
  });

  // ── Successful subscription ───────────────────────────────────────────────

  it("sends the welcome email and saves the subscriber on success", async () => {
    saveSubscriberModel.mockResolvedValue(undefined);
    const res = makeRes();
    await subscribe(makeReq({ email: "user@example.com" }), res);
    expect(mockSendTransacEmail).toHaveBeenCalledTimes(1);
    expect(saveSubscriberModel).toHaveBeenCalledWith("user@example.com");
    expect(res.send).toHaveBeenCalledWith({ ok: true });
  });

  it("does not save subscriber if email API call fails", async () => {
    mockSendTransacEmail = jest.fn().mockRejectedValue(new Error("API error"));
    const res = makeRes();
    await subscribe(makeReq({ email: "user@example.com" }), res);
    expect(saveSubscriberModel).not.toHaveBeenCalled();
  });

  // ── Email API failure ─────────────────────────────────────────────────────

  it("returns 500 when the Brevo API call throws", async () => {
    mockSendTransacEmail = jest.fn().mockRejectedValue(new Error("Network timeout"));
    const res = makeRes();
    await subscribe(makeReq({ email: "user@example.com" }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Failed to send email");
  });
});
