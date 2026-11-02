"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
  Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type AuthMode = "signin" | "signup" | "otp" | "forgot";

function LoginForm({
  initialMode = "signin",
  initialError = null,
}: {
  initialMode?: AuthMode;
  initialError?: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const supabase = createClient();

  // Handle Resend Cooldown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first OTP input when entering OTP mode
  useEffect(() => {
    if (mode === "otp") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [mode]);

  // Sign In with Email & Password
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrorMessage(
            "Email not yet confirmed. Please check your inbox for the 6-digit verification code or click 'Create Account' to resend."
          );
        } else {
          setErrorMessage(error.message);
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setErrorMessage("Unable to connect to the authentication server. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  // Sign Up with Email & Password
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setMode("otp");
        setResendCooldown(60);
        setOtpDigits(["", "", "", "", "", ""]);
        setSuccessMessage(`A 6-digit code has been sent to ${email.trim()}.`);
      }
    } catch {
      setErrorMessage("Unable to initiate account creation. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  // Verify 6-Digit OTP Code
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const token = otpDigits.join("").trim();
    if (token.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: "signup",
      });

      if (error) {
        // Try fallback with type: 'email'
        const fallbackRes = await supabase.auth.verifyOtp({
          email: email.trim(),
          token,
          type: "email",
        });

        if (fallbackRes.error) {
          setErrorMessage(
            fallbackRes.error.message || "Invalid or expired verification code."
          );
          return;
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Verification error. Please check your code or retry.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setResendCooldown(60);
        setSuccessMessage(`New verification code sent to ${email.trim()}!`);
      }
    } catch {
      setErrorMessage("Failed to resend code. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  // Send Password Reset Link
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your account email address.");
      return;
    }

    setLoading(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/auth/confirm?next=/reset-password`,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage("Password reset email sent! Check your inbox.");
      }
    } catch {
      setErrorMessage("Unable to send reset email. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Input Keyboard & Paste Handler
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, "");

    // Handle multi-character paste (e.g. user pastes 6 digits)
    if (digit.length > 1) {
      const pasted = digit.slice(0, 6).split("");
      const nextDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        nextDigits[i] = pasted[i] || "";
      }
      setOtpDigits(nextDigits);
      const nextFocus = Math.min(pasted.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = digit;
    setOtpDigits(nextDigits);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-transparent font-sans text-pencil selection:bg-marker selection:text-pencil overflow-x-hidden">
      {/* Prominent Header / Back to Home Navigation */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between mb-4 sm:mb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-sheet bg-sheet border border-rule text-sm font-semibold text-pencil hover:text-ink hover:border-ink/40 shadow-paper hover:shadow-paper-lg transition-all duration-150 active:scale-[0.98] group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-muted group-hover:text-ink" />
          <span>Back to Home</span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
        >
          <Image
            src="/assets/talaan-icon.png"
            alt="Talaan logo"
            width={34}
            height={34}
            className="flex-shrink-0 object-contain"
            priority
          />
          <span className="font-display font-black text-xl tracking-tight text-pencil">
            Talaan
          </span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl bg-sheet rounded-sheet border border-rule shadow-paper-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* Left Column: Interactive Auth Form */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Top Mode Tabs (Sign In vs Create Account) - shown when not in OTP or Forgot mode */}
              {(mode === "signin" || mode === "signup") && (
                <div className="inline-flex items-center gap-1 p-1 bg-paper border border-rule rounded-sm w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xs transition-all cursor-pointer ${
                      mode === "signin"
                        ? "bg-ink text-sheet shadow-xs"
                        : "text-pencil hover:bg-sheet/60"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xs transition-all cursor-pointer ${
                      mode === "signup"
                        ? "bg-ink text-sheet shadow-xs"
                        : "text-pencil hover:bg-sheet/60"
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              )}

              {/* Header Title & Subtitle */}
              <div className="space-y-1.5">
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-pencil tracking-tight">
                  {mode === "signin"
                    ? "Welcome back!"
                    : mode === "signup"
                    ? "Register your store"
                    : mode === "otp"
                    ? "Enter 6-digit code"
                    : "Reset your password"}
                </h1>
                <p className="text-xs sm:text-sm text-muted leading-relaxed font-sans">
                  {mode === "signin"
                    ? "Sign in with your store credentials to access your ledger."
                    : mode === "signup"
                    ? "Create an account. A 6-digit verification code will be sent to your email."
                    : mode === "otp"
                    ? `Enter the 6-digit code sent to ${email} to activate your store.`
                    : "Enter your store email to receive a password reset link."}
                </p>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div
                  role="alert"
                  className="p-3.5 rounded-row bg-[#FDF2F2] border border-margin text-margin text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Success Message Alert */}
              {successMessage && (
                <div
                  role="status"
                  className="p-3.5 rounded-row bg-[#F0FDF4] border border-[#1F7A4D]/40 text-[#1F7A4D] text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{successMessage}</span>
                </div>
              )}

              {/* 1. SIGN IN FORM */}
              {mode === "signin" && (
                <form onSubmit={handleEmailSignIn} className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="signin-email"
                      className="block text-xs font-semibold text-pencil font-sans"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="aling.nena@talaan.ph"
                        required
                        className="w-full min-h-[48px] pl-10 pr-3.5 py-2.5 bg-sheet border border-rule rounded-row text-sm text-pencil placeholder:text-muted focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="signin-password"
                        className="block text-xs font-semibold text-pencil font-sans"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-xs font-semibold text-ink hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full min-h-[48px] pl-10 pr-10 py-2.5 bg-sheet border border-rule rounded-row text-sm text-pencil placeholder:text-muted focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-pencil p-1 cursor-pointer transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full shadow-paper min-h-[48px] text-sm font-bold"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying credentials...</span>
                      </span>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </Button>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs font-sans border-t border-rule/60">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 text-muted hover:text-pencil font-semibold transition-colors order-2 sm:order-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Home</span>
                    </Link>
                    <div className="order-1 sm:order-2">
                      <span className="text-muted">No account yet? </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signup");
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="font-bold text-ink hover:underline cursor-pointer"
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* 2. SIGN UP FORM */}
              {mode === "signup" && (
                <form onSubmit={handleEmailSignUp} className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="signup-email"
                      className="block text-xs font-semibold text-pencil font-sans"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.store@email.com"
                        required
                        className="w-full min-h-[48px] pl-10 pr-3.5 py-2.5 bg-sheet border border-rule rounded-row text-sm text-pencil placeholder:text-muted focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="signup-password"
                      className="block text-xs font-semibold text-pencil font-sans"
                    >
                      Create Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        className="w-full min-h-[48px] pl-10 pr-10 py-2.5 bg-sheet border border-rule rounded-row text-sm text-pencil placeholder:text-muted focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-pencil p-1 cursor-pointer transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full shadow-paper min-h-[48px] text-sm font-bold"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending verification code...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-3.5 h-3.5" />
                        <span>Create Account & Send Code</span>
                      </span>
                    )}
                  </Button>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs font-sans border-t border-rule/60">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 text-muted hover:text-pencil font-semibold transition-colors order-2 sm:order-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Home</span>
                    </Link>
                    <div className="order-1 sm:order-2">
                      <span className="text-muted">Already registered? </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signin");
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="font-bold text-ink hover:underline cursor-pointer"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* 3. 6-DIGIT OTP VERIFICATION VIEW */}
              {mode === "otp" && (
                <div className="space-y-5 pt-2 animate-in fade-in duration-200">
                  {/* 6 Digit Input Cells */}
                  <div className="flex items-center justify-between gap-2 max-w-xs mx-auto">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-13 text-center font-display font-bold text-xl text-pencil bg-[#FFFEF8] border border-rule rounded-row focus:border-ink focus:ring-2 focus:ring-ink/20 outline-none transition-all shadow-xs"
                      />
                    ))}
                  </div>

                  {/* Verify Action Button */}
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => handleVerifyOtp()}
                    disabled={loading || otpDigits.join("").length !== 6}
                    className="w-full shadow-paper min-h-[48px] text-sm font-bold"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying code...</span>
                      </span>
                    ) : (
                      <span>Verify & Enter Store</span>
                    )}
                  </Button>

                  {/* Resend & Back Actions */}
                  <div className="flex items-center justify-between text-xs font-sans pt-1">
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={handleResendOtp}
                      className="font-semibold text-ink hover:underline disabled:text-muted disabled:no-underline cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                      <span>
                        {resendCooldown > 0
                          ? `Resend code in ${resendCooldown}s`
                          : "Resend Code"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-muted hover:text-pencil underline cursor-pointer"
                    >
                      Change email
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 text-xs font-sans border-t border-rule/60">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 text-muted hover:text-pencil font-semibold transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Home</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="font-bold text-ink hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. FORGOT PASSWORD VIEW */}
              {mode === "forgot" && (
                <form onSubmit={handleForgotPassword} className="space-y-4 pt-1 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="forgot-email"
                      className="block text-xs font-semibold text-pencil font-sans"
                    >
                      Account Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.store@email.com"
                        required
                        autoFocus
                        className="w-full min-h-[48px] pl-10 pr-3.5 py-2.5 bg-sheet border border-rule rounded-row text-sm text-pencil placeholder:text-muted focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full shadow-paper min-h-[48px] text-sm font-bold"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending recovery link...</span>
                      </span>
                    ) : (
                      <span>Send Password Reset Link</span>
                    )}
                  </Button>

                  <div className="flex items-center justify-between pt-3 text-xs font-sans border-t border-rule/60">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 text-muted hover:text-pencil font-semibold transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Home</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="font-bold text-ink hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Bottom Footer Note */}
            <div className="pt-4 text-center text-xs text-muted font-sans border-t border-rule/50 mt-6">
              <span>Secure authentication powered by Supabase & Brevo SMTP.</span>
            </div>
          </div>

          {/* Right Column: Physical Paper Sovereign Mockup */}
          <div className="lg:col-span-6 bg-paper/70 p-6 sm:p-8 flex flex-col justify-between items-center text-center border-t lg:border-t-0 lg:border-l border-rule relative overflow-hidden select-none">
            {/* Top Customer Avatars */}
            <div className="w-full flex items-center justify-between pt-2 px-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sheet border border-rule flex items-center justify-center text-xs font-bold text-pencil shadow-xs">
                  MJ
                </div>
                <span className="text-xs font-semibold text-pencil hidden sm:inline">
                  Mang Jose
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-row bg-sheet border border-rule text-sm font-semibold text-paid">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Deterministic Math</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-pencil hidden sm:inline">
                  Ate Baby
                </span>
                <div className="w-8 h-8 rounded-full bg-sheet border border-rule flex items-center justify-center text-xs font-bold text-pencil shadow-xs">
                  AB
                </div>
              </div>
            </div>

            {/* Central Physical Notebook Mockup */}
            <div className="my-6 w-full max-w-sm bg-sheet rounded-sheet border border-rule p-5 relative transform hover:scale-[1.02] transition-transform duration-300">
              {/* Binder Edge Holes */}
              <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-rule">
                <span className="w-2 h-2 rounded-full bg-paper border border-rule" />
                <span className="w-2 h-2 rounded-full bg-paper border border-rule" />
                <span className="w-2 h-2 rounded-full bg-paper border border-rule" />
                <span className="text-sm uppercase font-bold tracking-wider text-muted ml-1">
                  Counter Listahan &bull; Page 14
                </span>
              </div>

              {/* Lined Notebook Content with Red Margin Line */}
              <div className="relative pl-5 text-left space-y-2.5">
                <div className="absolute left-2.5 top-0 bottom-0 w-[2px] bg-margin" />

                <div className="font-hand text-lg text-pencil/90 leading-tight">
                  <p>Mang Jose — 2 corned beef @ 38 = ₱76.00</p>
                  <p className="text-margin font-semibold">
                    Ate Baby — 3 pancit canton @ 12 = ₱36.00
                  </p>
                  <p className="text-muted">Nanay Cora — toyo at suka = ₱54.00</p>
                </div>

                {/* Micro Discrepancy Caught Tag */}
                <div className="p-2 rounded-row bg-[#FDF2F2] border border-margin/40 text-sm font-sans text-margin font-semibold flex items-center justify-between">
                  <span>₱10.00 Overcharge Caught</span>
                  <span className="text-sm text-paid font-bold">100% Corrected</span>
                </div>
              </div>
            </div>

            {/* Bottom Tagline & Carousel Dots */}
            <div className="w-full space-y-3 pb-2">
              <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
                <span className="w-2 h-2 rounded-full bg-ink" />
                <span className="w-2 h-2 rounded-full bg-rule" />
                <span className="w-2 h-2 rounded-full bg-rule" />
              </div>

              <div className="space-y-1 max-w-xs mx-auto">
                <h2 className="font-display font-bold text-base sm:text-lg text-pencil leading-tight">
                  Make your store bookkeeping easier and organized with Talaan
                </h2>
                <p className="text-xs text-muted font-sans">
                  Keep writing on paper. Code verifies the centavos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const rawMode = searchParams.get("mode");
  const modeKey = rawMode || "default";
  const initialMode =
    rawMode === "signin" || rawMode === "signup" || rawMode === "forgot" || rawMode === "otp"
      ? (rawMode as AuthMode)
      : "signin";
  const initialError = searchParams.get("error");

  return <LoginForm key={modeKey} initialMode={initialMode} initialError={initialError} />;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-paper">
          <Loader2 className="w-8 h-8 animate-spin text-ink" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
