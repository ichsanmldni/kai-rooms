"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginUser } from "../../api-client/user";
import Link from "next/link";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  // Tambahkan state untuk form
  const [formDataLogin, setFormDataLogin] = useState({
    identifier: "",
    password: "",
  });
  const [isLoadingSubmitLogin, setisLoadingSubmitLogin] = useState(false);

  const handleLogin = async (e) => {
    setisLoadingSubmitLogin(true);
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
        setisLoadingSubmitLogin(false);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }
    } catch (err) {
      console.log(err);
      setisLoadingSubmitLogin(false);
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
      {/* Kiri */}
      <div className="flex-1 bg-gray-300 text-black flex flex-col justify-center items-center p-5 transition-all duration-500">
        {/* Slideshow */}
        {(() => {
          const slides = [
            { src: "/images/A1.png" },
            { src: "/images/A2.png" },
            { src: "/images/A3.png" },
            { src: "/images/A4.png" },
            { src: "/images/A5.png" },
            { src: "/images/A6.png" },
            { src: "/images/A7.png" },
          ];

          const [currentIndex, setCurrentIndex] = React.useState(0);

          React.useEffect(() => {
            const interval = setInterval(() => {
              setCurrentIndex((prev) => (prev + 1) % slides.length);
            }, 3000);
            return () => clearInterval(interval);
          }, []);

          return (
            <>
              <img
                src={slides[currentIndex].src}
                alt={`A${currentIndex + 1}`}
                className="max-w-[80%] h-auto mb-5 transition-opacity duration-500"
              />
              <h3 className="text-center text-lg leading-relaxed px-4">
                {slides[currentIndex].text}
              </h3>
            </>
          );
        })()}
      </div>

      {/* Kanan */}
      <div className="flex-1 p-[60px_80px] bg-gray-50 flex flex-col justify-center items-start">
        <div className="bg-white w-full p-6 rounded-md shadow-md">
          <div className="flex items-center justify-between mb-1 w-full">
            <div className="flex items-center gap-2">
              <img
                src="/images/a8.svg"
                alt="A8"
                className="max-w-[50px] object-contain"
              />
              <h4 className="text-2xl font-bold text-left">
                Masuk Ke Akun Anda
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <img
                src="/images/KAI Danantara Logo.png"
                alt="KAI Danantara Logo"
                className="max-w-[250px] object-contain"
              />
            </div>
          </div>

          <p className="text-sm text-gray-900 mb-8 text-left">
            Kelola rapat online dengan mudah dan tetap produktif bersama KAI
            ROOMS.
          </p>

          <input
            type="email"
            placeholder="Masukkan NIPP / Email"
            className="w-full p-3 text-black rounded-md border border-gray-900 text-sm mb-3 focus:outline-none focus:border-[#7f5fff]"
            value={formDataLogin.identifier}
            onKeyDown={handleKeyDown}
            onChange={(e) =>
              setFormDataLogin((prev) => ({
                ...prev,
                identifier: e.target.value,
              }))
            }
          />

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan Password"
              className="w-full p-3 text-black rounded-md border border-gray-900 text-sm mb-3 pr-10 focus:outline-none focus:border-[#7f5fff]"
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

          <div className="flex items-center text-sm mb-8 w-full">
            <Link
              href="/login/lupa-password"
              className="text-[#5a60ea] ml-auto underline cursor-pointer"
            >
              Lupa Password?
            </Link>
          </div>

          <button
            className="w-full p-3 bg-[#5a60ea] text-white cursor-pointer rounded-lg text-base font-medium mb-3 hover:bg-[#4a50d0] transition flex items-center justify-center"
            onClick={handleLogin}
            disabled={isLoadingSubmitLogin} // biar tombol ga bisa diklik berulang
          >
            {isLoadingSubmitLogin ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Masuk"
            )}
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
    </div>
  );
}

export default LoginPage;
