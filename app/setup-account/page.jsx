"use client";

import React, { useState, useEffect } from "react";

import { useSearchParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { verifyTokenUser } from "../../api-client/user";

export default function SetupAccountForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cek apakah token valid
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setMessage("Token tidak ditemukan");
        return;
      }

      try {
        const res = await verifyTokenUser(token);
        console.log("ini res", res);

        if (res?.data.message === "Token valid") {
          setIsValid(true);
        } else {
          setMessage("Token tidak valid atau sudah kadaluarsa");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setMessage("Terjadi kesalahan saat verifikasi token");
      }
    };

    verifyToken();
  }, [token]);

  // Fungsi untuk submit password baru
  const handleSetupAccount = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Password tidak cocok!");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/user/setup-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword, noTelp }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast.success("Akun berhasil di setup. Silakan login.");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      toast.error(data.message);
    }
  };

  return (
    <div className="flex h-screen font-['Segoe_UI',sans-serif] text-black">
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
          <div className="flex justify-between items-center mb-1 w-full">
            <div className="flex items-center gap-2">
              <img
                src="/images/a8.svg"
                alt="A8"
                className="max-w-[50px] object-contain"
              />
              <h4 className="text-2xl font-bold text-left">Buat Akun Baru</h4>
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
            Gabung dengan KAI ROOMS dan mulai kelola rapat online dengan mudah.
          </p>

          <div className="border mx-4 md:mx-0 rounded-xl md:rounded-lg  self-center p-4">
            <h3 className="text-[16px] text-center pt-4 pb-2 px-20 font-semibold md:text-[28px]">
              Setup Account
            </h3>

            {message && <p className="text-center text-red-500">{message}</p>}

            {isValid ? (
              <form
                className="px-8 py-4 flex flex-col"
                onSubmit={handleSetupAccount}
              >
                <input
                  type="text"
                  className="px-3 py-2 text-[15px] mt-4 border focus:outline-none rounded-lg"
                  placeholder="Masukkan No HP"
                  value={noTelp}
                  onChange={(e) => setNoTelp(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="px-3 py-2 text-[15px] mt-4 border focus:outline-none rounded-lg"
                  placeholder="Masukkan Password Baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="px-3 py-2 text-[15px] mt-4 border focus:outline-none rounded-lg"
                  placeholder="Konfirmasi Password Baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="p-2 mt-4 mb-4 rounded-lg text-[14px] bg-orange-500 text-white hover:bg-orange-600"
                  disabled={loading}
                >
                  {loading ? "Mengubah..." : "Simpan Data"}
                </button>
                <ToastContainer />
              </form>
            ) : (
              <p className="text-center text-gray-500">
                Cek kembali email Anda untuk link reset.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
