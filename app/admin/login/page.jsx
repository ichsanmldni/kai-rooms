"use client";

import { Eye, EyeOff } from "lucide-react";
import { loginAdmin } from "../../../api-client/admin";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formDataLogin, setFormDataLogin] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginAdmin({ ...formDataLogin });
      if (res.status === 200) {
        toast.success(res?.data.message || "Login berhasil!", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        setTimeout(() => {
          window.location.href = "/admin";
        }, 1000);
      }
    } catch (err) {
      toast.error(err.response?.data.message || "Login berhasil!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  return (
    <div className="flex h-screen font-['Segoe_UI',sans-serif] text-black">
      {/* Kiri */}
      <div className="flex-1 bg-[#2539a0] text-white flex flex-col justify-center items-center p-5">
        <img
          src="/images/KAI_ROOMS_illustration.png"
          alt="KAI ROOMS Admin"
          className="max-w-[60%] h-auto mb-5"
        />
        <h1 className="text-2xl font-bold mb-3">KAI ROOMS Admin Portal</h1>
        <p className="text-center text-lg leading-relaxed">
          Portal khusus administrator untuk mengelola sistem KAI ROOMS
        </p>
      </div>

      {/* Kanan */}
      <div className="flex-1 p-[60px_80px] bg-white flex flex-col justify-center items-start">
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-2 text-left">
            Admin Internal Login
          </h2>
          <p className="text-sm text-gray-600 mb-8 text-left">
            Akses terbatas hanya untuk administrator KAI ROOMS
          </p>

          <input
            type="email"
            placeholder="Email Administrator"
            className="w-full p-3 text-black rounded-md border border-gray-300 text-sm mb-3 focus:outline-none focus:border-[#2539a0]"
            value={formDataLogin.email}
            onKeyDown={handleKeyDown}
            onChange={(e) =>
              setFormDataLogin((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
          />

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 text-black rounded-md border border-gray-300 text-sm mb-3 pr-10 focus:outline-none focus:border-[#2539a0]"
              value={formDataLogin.password}
              onKeyDown={handleKeyDown}
              onChange={(e) =>
                setFormDataLogin((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            className="w-full p-3 bg-[#2539a0] text-white rounded-lg text-base font-medium mb-3 hover:bg-[#1c2b7a] transition"
            onClick={handleLogin}
          >
            Login Administrator
          </button>

          <p className="mt-5 text-sm text-center w-full text-gray-500">
            Portal ini hanya untuk administrator internal KAI ROOMS.
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default LoginPage;
