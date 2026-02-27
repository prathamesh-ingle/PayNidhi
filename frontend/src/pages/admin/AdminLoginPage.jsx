// frontend/src/pages/admin/AdminLoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginAdmin,
  verifyAdminOtp,
} from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import OtpVerifyCard from "../../components/auth/OtpVerifyCard";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

const AdminLoginPage = () => {
  const [step, setStep] = useState(1); // 1 = credentials, 2 = OTP
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Fresh Start: Clear any stale sessions on mount
  React.useEffect(() => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user");
    console.log("🛠️ Admin Fresh Start: Stale session cleared.");
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      toast.error("Enter admin email and password");
      return;
    }

    try {
      await loginAdmin(form);

      toast.success("Security code sent to your admin email");
      setStep(2);
    } catch (err) {
      const msg = err?.error || "Login failed";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleVerifyOtp = async (code) => {
    try {
      const data = await verifyAdminOtp({
        email: form.email,
        code,
      });

      login(data);
      toast.success("God-Mode Activated");
      navigate("/admin/dashboard", { replace: true });

    } catch (err) {
      const msg = err?.error || "Wrong or expired code";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleResendOtp = async () => {
    await loginAdmin({ email: form.email, password: form.password });
    toast.success("A new security code has been sent.");
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-6 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 relative overflow-hidden">
        <OtpVerifyCard
          email={form.email}
          purpose="admin_login"
          mode="admin"
          onSubmitOtp={handleVerifyOtp}
          onResend={handleResendOtp}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:py-10 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 relative overflow-hidden">
      {/* Animated Background - #47C4B7 color */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#47C4B7]/20 rounded-full blur-3xl animate-bounce-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#47C4B7]/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[1.1fr_1.2fr] gap-6 lg:gap-10 items-stretch relative z-10">

        {/* Left: mini hero - PayNidhi theme */}
        <section className="hidden md:flex flex-col gap-5 border border-slate-200 rounded-2xl shadow-md px-6 py-6 hover:shadow-xl transition-all duration-300 hover:border-[#47C4B7]/30 group">
          <div className="inline-flex items-center gap-3 group/logo">
            <div className="group relative">
              <div className="relative bg-gradient-to-br from-[#47C4B7] to-emerald-500 p-2.5 rounded-2xl shadow-[0_10px_30px_rgba(71,196,183,0.45)] group-hover/logo:scale-110 group-hover/logo:-translate-y-0.5 transition-transform duration-300">
                <div className="absolute inset-0 rounded-2xl bg-white/20 blur-sm opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                <ShieldCheck className="text-white w-5 h-5 relative z-10" />
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold bg-gradient-to-r from-slate-900 to-[#47C4B7] bg-clip-text text-transparent">
                PayNidhi
              </span>
              <span className="text-[11px] text-slate-500">
                Command Center
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900 leading-snug group-hover:scale-[1.02] transition-transform duration-300">
            Secure access to manage{" "}
            <span className="text-[#47C4B7] font-bold">platform treasury</span> and{" "}
            <span className="text-emerald-500">legal NOAs</span>.
          </h1>

          <p className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors">
            Restricted access for authorized personnel only. Monitor the global ledger, verify legal documents, and oversee settlements in real time.
          </p>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="rounded-xl bg-gradient-to-br from-[#47C4B7]/10 to-emerald-500/10 border border-[#47C4B7]/30 px-3 py-3 shadow-sm hover:scale-105 transition-all duration-200 group/card">
              <div className="text-slate-500 mb-1">Security Level</div>
              <div className="text-lg font-semibold text-[#47C4B7]">Level 4</div>
              <div className="text-[10px] text-emerald-500 mt-1">
                Strict 2FA Enabled
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-3 shadow-sm flex flex-col justify-between hover:scale-105 transition-all duration-200 group/card">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>System Status</span>
                <span>Operational</span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full w-[99%] rounded-full bg-gradient-to-r from-[#47C4B7] to-emerald-400" />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Zero Downtime
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            By signing in, you agree to PayNidhi's{" "}
            <span className="text-[#47C4B7] hover:text-[#47C4B7]/80 font-semibold transition-colors cursor-pointer">Security Policy</span>.
          </p>
        </section>

        {/* Right: form - PayNidhi theme */}
        <section className="w-full">
          <div className="w-full bg-white/95 border border-slate-200 rounded-2xl shadow-xl backdrop-blur hover:shadow-2xl transition-all duration-300 hover:border-[#47C4B7]/30 px-5 py-6 sm:px-7 sm:py-7">

            {/* Top row: title + environment badge */}
            <div className="flex items-start justify-between gap-3 mb-6">
              <div className="flex items-start gap-3 flex-1">
                <div className="group relative mt-[2px]">
                  <div className="relative bg-gradient-to-br from-[#47C4B7] to-emerald-500 p-2.5 rounded-2xl shadow-[0_10px_30px_rgba(71,196,183,0.45)] group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-300">
                    <div className="absolute inset-0 rounded-2xl bg-white/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    <ShieldCheck className="text-white w-5 h-5 relative z-10" />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                    Admin Access
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                    Enter master credentials to continue.
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1">
                <span className="text-[10px] text-slate-400">
                  Environment
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-[2px] text-[10px] text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#47C4B7]" />
                  Secure · MFA
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 text-xs sm:text-sm text-red-500 bg-gradient-to-r from-red-50 to-rose-50 border border-red-100 rounded-lg px-3 py-2 shadow-sm">
                {error}
              </div>
            )}

            {/* Form - PayNidhi styling */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-700">
                  Admin Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#47C4B7]/70 hover:border-slate-300 transition-all duration-200"
                  placeholder="admin@paynidhi.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Master Password
                  </label>
                  <button
                    type="button"
                    className="text-[11px] text-[#47C4B7] hover:text-[#47C4B7]/80 font-semibold transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm outline-none focus:ring-2 focus:ring-[#47C4B7]/70 hover:border-slate-300 transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-2 flex items-center px-1 text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 pb-1">
                <div className="inline-flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-slate-300 text-[#47C4B7] focus:ring-2 focus:ring-[#47C4B7]/70"
                  />
                  <label htmlFor="remember">Keep me signed in</label>
                </div>
                <span className="text-slate-500">
                  OTP will be sent to your email
                </span>
              </div>

              <button
                type="submit"
                className="w-full mt-1 inline-flex justify-center items-center rounded-xl bg-gradient-to-r from-[#47C4B7] to-emerald-500 text-white text-sm font-semibold py-2.5 shadow-[0_14px_30px_rgba(71,196,183,0.45)] hover:shadow-[0_20px_40px_rgba(71,196,183,0.6)] hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
              >
                Request Security Code
              </button>
            </form>
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default AdminLoginPage;