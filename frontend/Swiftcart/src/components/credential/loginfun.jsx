import React, { useState } from "react";
import {
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/account";

/* ---------------------------------------------------------
   Re-usable Field Component with Pinpoint Icon Centering
--------------------------------------------------------- */
function Field({ label, icon: Icon, children }) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative flex items-center w-full">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10 shrink-0" />
        )}
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Banner Alert Component
--------------------------------------------------------- */
function Banner({ type, text }) {
  if (!text) return null;
  const isSuccess = type === "success";
  return (
    <div
      role="alert"
      className={`mb-5 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${
        isSuccess
          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
          : "bg-rose-50 text-rose-700 border-rose-200"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
      ) : (
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-600" />
      )}
      <span className="leading-snug">{text}</span>
    </div>
  );
}

/* ---------------------------------------------------------
   Left Side Graphic Panel (Hidden on mobile)
--------------------------------------------------------- */
function BrandPanel() {
  return (
    <div className="relative hidden md:flex md:w-[45%] lg:w-[42%] flex-col justify-between bg-slate-950 text-white p-8 lg:p-10 overflow-hidden shrink-0">
      {/* Glow Effects */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-14">
          <div className="h-9 w-9 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-serif font-bold text-lg shadow-md">
            S
          </div>
          <span className="text-xl font-semibold tracking-tight font-serif text-white">
            Swiftcart
          </span>
        </div>

        <h1 className="text-3xl lg:text-4xl leading-tight font-serif font-medium tracking-tight mb-4 text-slate-100">
          Every order,
          <br />
          one account away.
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
          Sign in to track shipments, manage returns, and check out faster — no re-entering details, ever.
        </p>
      </div>

      <div className="relative z-10 mt-8">
        <div className="flex items-end gap-[3px] h-10 mb-4 opacity-90">
          {[6, 3, 8, 2, 5, 9, 3, 6, 2, 7, 4, 8, 3, 5, 9, 2, 6, 4, 7, 3, 8, 5, 2, 6].map(
            (h, i) => (
              <span
                key={i}
                className="w-[3px] bg-amber-400/80 rounded-full"
                style={{ height: `${h * 4}px` }}
              />
            )
          )}
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-widest border-t border-white/10 pt-4">
          <span>Order verified</span>
          <span>256-bit secure</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Main Auth Page Component
--------------------------------------------------------- */
export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");

  // Login States (Updated: 'username' changed to 'email')
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginBanner, setLoginBanner] = useState({ type: "", text: "" });

  // OTP States
  const [otpData, setOtpData] = useState({ email: "", otp: "" });
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpBanner, setOtpBanner] = useState({ type: "", text: "" });

  const startCooldown = () => {
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginBanner({ type: "", text: "" });

    try {
      const response = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData), // Now sends { email, password }
      });
      const data = await response.json();
      console.log(data)

      if (response.ok) {
        if (data.access_token) localStorage.setItem("access_token", data.access_token);
        console.log(localStorage.getItem("access_token"))
        if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
        window.dispatchEvent(new Event("auth-change"));

  // Navigate to Home Page
        setLoginBanner({ type: "success", text: "Signed in successfully." });
          window.location.href = "/";
      } else {
        setLoginBanner({
          type: "error",
          text: data.detail || data.error || "Incorrect email or password.",
        });
      }
    } catch {
      setLoginBanner({
        type: "error",
        text: "Couldn't reach the server. Please try again.",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpData.otp.length !== 4) {
      setOtpBanner({ type: "error", text: "Please enter a valid 4-digit code." });
      return;
    }

    setOtpLoading(true);
    setOtpBanner({ type: "", text: "" });

    try {
      const response = await fetch(`${API_BASE}/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(otpData),
      });
      const data = await response.json();

      if (response.ok) {
        setOtpBanner({ type: "success", text: "Email verified successfully." });
      } else {
        setOtpBanner({
          type: "error",
          text: data.otp || data.email || "That code didn't work. Try again.",
        });
      }
    } catch {
      setOtpBanner({
        type: "error",
        text: "Couldn't reach the server. Please try again.",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpData.email) {
      setOtpBanner({ type: "error", text: "Enter your email first." });
      return;
    }
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setOtpBanner({ type: "", text: "" });
    try {
      const response = await fetch(`${API_BASE}/resend-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpData.email }),
      });
      const data = await response.json();

      if (response.ok) {
        setOtpBanner({ type: "success", text: "A new code is on its way." });
        startCooldown();
      } else {
        setOtpBanner({
          type: "error",
          text: typeof data === "string" ? data : data.email || "Couldn't resend the code.",
        });
      }
    } catch {
      setOtpBanner({ type: "error", text: "Couldn't reach the server. Try again shortly." });
    } finally {
      setResendLoading(false);
    }
  };

  const tabBase =
    "relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none";

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-100/70 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Main Responsive Form Card */}
      <div 
        className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col md:flex-row my-auto"
        style={{ minHeight: "520px" }}
      >
        <BrandPanel />

        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-2.5 px-6 pt-6">
          <div className="h-8 w-8 rounded-md bg-amber-400 flex items-center justify-center text-slate-950 font-serif font-bold text-sm">
            S
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-900 font-serif">
            Swiftcart
          </span>
        </div>

        {/* Form Column */}
        <div className="flex-1 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Tab Switcher */}
            <div role="tablist" className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
              <button
                role="tab"
                type="button"
                aria-selected={activeTab === "login"}
                onClick={() => setActiveTab("login")}
                className={`${tabBase} ${
                  activeTab === "login"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sign In
              </button>
              <button
                role="tab"
                type="button"
                aria-selected={activeTab === "verify"}
                onClick={() => setActiveTab("verify")}
                className={`${tabBase} ${
                  activeTab === "verify"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Verify Email
              </button>
            </div>

            {/* LOGIN SECTION */}
            {activeTab === "login" && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
                  Welcome back
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Enter your details to access your account.
                </p>

                <button
                  type="button"
                  className="w-full h-11 flex items-center justify-center gap-3 bg-white border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-sm mb-5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Continue with Google
                </button>

                <div className="relative flex items-center justify-center mb-6">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider absolute">
                    or email
                  </span>
                </div>

                <Banner type={loginBanner.type} text={loginBanner.text} />

                <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                  <Field label="Email address" icon={Mail}>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full h-11 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all text-slate-900"
                    />
                  </Field>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Password
                      </label>
                      <button
                        type="button"
                        className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative flex items-center w-full">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10 shrink-0" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="current-password"
                        required
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full h-11 pl-10 pr-11 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10 p-1"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full h-11 mt-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                  New to Swiftcart?{" "}
                  <button type="button" className="font-semibold text-amber-600 hover:text-amber-700">
                    Create an account
                  </button>
                </p>
              </div>
            )}

            {/* VERIFY OTP SECTION */}
            {activeTab === "verify" && (
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1 bg-teal-100 text-teal-700 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Verification
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
                  Verify your email
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Enter the 4-digit code we sent to your inbox.
                </p>

                <Banner type={otpBanner.type} text={otpBanner.text} />

                <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
                  <Field label="Email" icon={Mail}>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      value={otpData.email}
                      onChange={(e) => setOtpData({ ...otpData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full h-11 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 focus:bg-white transition-all text-slate-900"
                    />
                  </Field>

                  <Field label="Verification code" icon={KeyRound}>
                    <input
                      type="text"
                      name="otp"
                      inputMode="numeric"
                      maxLength={4}
                      required
                      value={otpData.otp}
                      onChange={(e) =>
                        setOtpData({ ...otpData, otp: e.target.value.replace(/\D/g, "") })
                      }
                      placeholder="4-digit code"
                      className="w-full h-11 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 focus:bg-white transition-all text-slate-900 tracking-[0.4em] font-mono font-bold"
                    />
                  </Field>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full h-11 mt-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Didn't get a code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendLoading || resendCooldown > 0}
                    className="flex items-center gap-1.5 font-semibold text-teal-700 hover:text-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? "animate-spin" : ""}`} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}