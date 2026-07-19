"use client";

import React, { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [username, setUsername] = useState(""); // Email or Phone for login
  const [password, setPassword] = useState("");
  
  // Register specific states
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");

  const getBaseUrl = () => {
    let baseUrl = "https://api.calnovaai.com/glowlab";
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.includes("calnovaai.com")) {
        baseUrl = "https://api.calnovaai.com/glowlab";
      }
    }
    return baseUrl;
  };

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${getBaseUrl()}/auth/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const result = await res.json();

      if (res.ok && (result.code === 0 || result.code === "OPERATION_SUCCESS")) {
        const token = result.data.accessToken;
        
        // Fetch current user details including credits
        const meRes = await fetch(`${getBaseUrl()}/auth/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const meResult = await meRes.json();
        if (meRes.ok && (meResult.code === 0 || meResult.code === "OPERATION_SUCCESS")) {
          onLoginSuccess(token, meResult.data);
          onClose();
        } else {
          setErrorMsg("Không thể tải thông tin tài khoản sau khi đăng nhập.");
        }
      } else {
        setErrorMsg(result.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Lỗi kết nối. Không thể liên lạc với máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 20;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEmail || !registerPassword || !firstName || !lastName || !dateOfBirth) {
      setErrorMsg("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    if (registerPassword.length < 7) {
      setErrorMsg("Mật khẩu phải dài ít nhất 7 ký tự.");
      return;
    }

    if (registerPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${getBaseUrl()}/users/signUp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registerEmail,
          phone: registerPhone || undefined,
          password: registerPassword,
          confirmPassword,
          firstName,
          lastName,
          age: calculateAge(dateOfBirth),
          gender,
          username: registerEmail,
        }),
      });

      const result = await res.json();

      if (res.ok && (result.code === 0 || result.code === "OPERATION_SUCCESS")) {
        setSuccessMsg("Đăng ký tài khoản thành công! Đang tự động đăng nhập...");
        
        // Prefill login fields just in case
        setUsername(registerEmail);
        setPassword(registerPassword);

        // Perform auto-login
        try {
          const loginRes = await fetch(`${getBaseUrl()}/auth/user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: registerEmail,
              password: registerPassword,
            }),
          });

          const loginResult = await loginRes.json();

          if (loginRes.ok && (loginResult.code === 0 || loginResult.code === "OPERATION_SUCCESS")) {
            const token = loginResult.data.accessToken;
            
            // Fetch current user details including credits
            const meRes = await fetch(`${getBaseUrl()}/auth/me`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            const meResult = await meRes.json();
            if (meRes.ok && (meResult.code === 0 || meResult.code === "OPERATION_SUCCESS")) {
              onLoginSuccess(token, meResult.data);
              onClose();
              return;
            }
          }
          
          // If login calls failed, redirect to login tab
          setIsLogin(true);
          setSuccessMsg("");
          setErrorMsg("Đăng ký thành công nhưng không thể tự động đăng nhập. Vui lòng đăng nhập lại.");
        } catch (loginErr) {
          console.error("Auto-login error:", loginErr);
          setIsLogin(true);
          setSuccessMsg("");
          setErrorMsg("Đăng ký thành công nhưng không thể tự động đăng nhập. Vui lòng đăng nhập lại.");
        }
      } else {
        setErrorMsg(result.message || "Đăng ký thất bại. Email hoặc Số điện thoại có thể đã tồn tại.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMsg("Lỗi kết nối. Không thể liên lạc với máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full max-w-md bg-[#0f0724]/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          ✕
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl border border-violet-500/30 overflow-hidden shadow-lg shadow-violet-500/20">
              <img 
                src="/images/logo.png" 
                alt="Huyền Cơ Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-300 to-[#8B5CF6]">
            {isLogin ? "Đăng Nhập" : "Đăng Ký"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isLogin
              ? "Đăng nhập cổng Huyền Cơ AI để sử dụng toàn bộ tính năng và quản lý tín chỉ."
              : "Tạo tài khoản mới để nhận 100 tín chỉ khởi đầu khám phá bản mệnh."}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl text-center">
            {successMsg}
          </div>
        )}

        {isLogin ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-indigo-300 font-bold mb-1.5">
                Số điện thoại hoặc Email
              </label>
              <input
                type="text"
                placeholder="Nhập email hoặc số điện thoại"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#090514] border border-indigo-500/20 rounded-xl outline-none focus:border-[#8B5CF6] text-sm text-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-indigo-300 font-bold mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#090514] border border-indigo-500/20 rounded-xl outline-none focus:border-[#8B5CF6] text-sm text-white transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#8B5CF6] to-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:from-violet-500 hover:to-indigo-500 transition-all shadow-[0_0_15px_rgba(139,92,241,0.2)] disabled:opacity-50 mt-6 cursor-pointer"
            >
              {loading ? "Đang xác thực..." : "Đăng Nhập"}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-indigo-300 font-bold mb-1.5">
                  Họ
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#090514] border border-indigo-500/20 rounded-xl outline-none focus:border-[#8B5CF6] text-sm text-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-indigo-300 font-bold mb-1.5">
                  Tên
                </label>
                <input
                  type="text"
                  placeholder="Văn A"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#090514] border border-indigo-500/20 rounded-xl outline-none focus:border-[#8B5CF6] text-sm text-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-indigo-300 font-bold mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#090514] border border-indigo-500/20 rounded-xl outline-none focus:border-[#8B5CF6] text-sm text-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-indigo-300 font-bold mb-1.5">
                Ngày sinh
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#090514] border border-indigo-500/20 rounded-xl outline-none focus:border-[#8B5CF6] text-sm text-white transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-indigo-300 font-bold mb-1.5">
                  Số điện thoại (Tùy chọn)
                </label>
                <input
                  type="tel"
                  placeholder="09XXXXXXXX"
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#090514] border border-indigo-500/20 rounded-xl outline-none focus:border-[#8B5CF6] text-sm text-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-indigo-300 font-bold mb-1.5">
                  Giới tính
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "male" | "female")}
                  className="w-full px-4 py-2.5 bg-[#090514] border border-indigo-500/20 rounded-xl outline-none focus:border-[#8B5CF6] text-sm text-white transition-all"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-indigo-300 font-bold mb-1.5">
                Mật khẩu (tối thiểu 7 ký tự)
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#090514] border border-indigo-500/20 rounded-xl outline-none focus:border-[#8B5CF6] text-sm text-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-indigo-300 font-bold mb-1.5">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#090514] border border-indigo-500/20 rounded-xl outline-none focus:border-[#8B5CF6] text-sm text-white transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#8B5CF6] to-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:from-violet-500 hover:to-indigo-500 transition-all shadow-[0_0_15px_rgba(139,92,241,0.2)] disabled:opacity-50 mt-6 cursor-pointer"
            >
              {loading ? "Đang đăng ký..." : "Đăng Ký"}
            </button>
          </form>
        )}

        {/* Form switcher */}
        <div className="mt-6 text-center text-xs text-slate-400 border-t border-indigo-500/10 pt-4">
          {isLogin ? (
            <p>
              Chưa có tài khoản?{" "}
              <button
                onClick={() => {
                  setIsLogin(false);
                  setErrorMsg("");
                }}
                className="text-[#8B5CF6] font-bold hover:underline cursor-pointer"
              >
                Đăng ký ngay
              </button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{" "}
              <button
                onClick={() => {
                  setIsLogin(true);
                  setErrorMsg("");
                }}
                className="text-[#8B5CF6] font-bold hover:underline cursor-pointer"
              >
                Đăng nhập
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
