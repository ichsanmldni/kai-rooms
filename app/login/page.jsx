"use client";

import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "../../api-client/user";
import Link from "next/link";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  // Tambahkan state untuk form
  const [formDataLogin, setFormDataLogin] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ ...formDataLogin });
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
          window.location.href = "/dashboard";
        }, 1000);
      }
    } catch (err) {
      console.log(err);
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
      <div className="flex-1 bg-gradient-to-b from-[#f7825f] to-[#2539a0] text-white flex flex-col justify-center items-center p-5">
        <img
          src="/images/KAI_ROOMS_illustration.png"
          alt="KAI ROOMS"
          className="max-w-[80%] h-auto mb-5"
        />
        <p className="text-center text-lg leading-relaxed">
          Kelola dan ikuti rapat online dengan mudah di platform meeting resmi
          dari KAI.
        </p>
      </div>

      {/* Kanan */}
      <div className="flex-1 p-[60px_80px] bg-white flex flex-col justify-center items-start">
        <h2 className="text-2xl font-bold mb-2 text-left">
          Masuk ke Akun Anda
        </h2>
        <p className="text-sm text-gray-600 mb-8 text-left">
          Kelola rapat online dengan mudah dan tetap produktif bersama KAI
          ROOMS.
        </p>

        <input
          type="email"
          placeholder="Masukkan Email"
          className="w-full p-3 text-black rounded-md border border-gray-300 text-sm mb-3 focus:outline-none focus:border-[#7f5fff]"
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
            placeholder="Masukkan Password"
            className="w-full p-3 text-black rounded-md border border-gray-300 text-sm mb-3 pr-10 focus:outline-none focus:border-[#7f5fff]"
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

        {/* <div className="flex items-center text-sm mb-8 w-full"> */}
        {/* <label className="flex items-center gap-2">
          <input type="checkbox" />
          Ingat Saya
        </label> */}
        {/* <a
            href="#"
            className="text-[#5a73ff] ml-auto underline cursor-pointer"
          >
            Forgot password
          </a> */}
        {/* </div> */}

        <button
          className="w-full p-3 bg-[#5a60ea] text-white rounded-lg text-base font-medium mb-3 hover:bg-[#4a50d0] transition"
          onClick={handleLogin}
        >
          Masuk
        </button>
        {/* 
        <button className="w-full p-3 text-sm border border-gray-300 bg-white text-gray-800 rounded-lg flex items-center justify-center gap-2 mb-2 hover:bg-gray-100 transition">
          <img
            src="/images/google-logo.png"
            alt="Google Logo"
            className="w-5"
          />
          Sign in with Google
        </button>

        <button className="w-full p-3 text-sm border border-gray-300 bg-white text-gray-800 rounded-lg flex items-center justify-center gap-2 mb-2 hover:bg-gray-100 transition">
          <img
            src="/images/microsoft-logo.png"
            alt="Microsoft Logo"
            className="w-5"
          />
          Sign in with Microsoft
        </button> */}

        <p className="mt-5 text-sm text-center w-full">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="underline text-[#5a60ea] font-medium cursor-pointer"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
}

export default LoginPage;
