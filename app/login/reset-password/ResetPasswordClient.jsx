"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { resetPasswordUser, verifyTokenUser } from "../../../api-client/user";
import { Eye, EyeOff } from "lucide-react";
import React from "react";

function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token"); // Ambil token dari URL

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isLoadingSubmitForm, setIsLoadingSubmitForm] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false); // State untuk password baru
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  console.log("ini pw", newPassword, confirmPassword);
  useEffect(() => {
    const checkToken = async () => {
      if (token) {
        try {
          const payload = { token };
          console.log("ini payload", payload);
          const { data } = await verifyTokenUser(payload);
          if (data.message === "Token valid") {
            setIsValid(true);
          } else {
            setMessage("Token tidak valid atau sudah kadaluarsa");
          }
        } catch (error) {
          setMessage("Terjadi kesalahan saat memverifikasi token.");
          console.error(error);
        }
      } else {
        setMessage("Token tidak ditemukan.");
      }
    };

    checkToken();
  }, [token]);

  // Fungsi untuk submit password baru
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Password tidak cocok!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }

    setIsLoadingSubmitForm(true);

    const payload = { token, newPassword };

    const response = await resetPasswordUser(payload);
    console.log("ini response", response);

    if (response.data.message === "Password berhasil diperbarui") {
      toast.success("Password berhasil diubah. Silakan login.", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setTimeout(() => router.push("/login"), 2000);
    } else {
      toast.error(data.message || "Terjadi kesalahan saat mengubah password.", {
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

 return (
  <div className="flex h-screen font-['Segoe_UI',sans-serif] text-black">
    {/* Kiri */}
    <div className="flex-1 white-300 text-black flex flex-col justify-center items-center p-5 transition-all duration-500">
      {/* Slideshow */}
      {(() => {
        const slides = [
          { src: "/images/A1.png", text: "" },
          { src: "/images/A2.png", text: "" },
          { src: "/images/A3.png", text: "" },
          { src: "/images/A4.png", text: "" },
          { src: "/images/A5.png", text: "" },
          { src: "/images/A6.png", text: "" },
          { src: "/images/A7.png", text: "" },
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
            {slides[currentIndex].text && (
              <h3 className="whitespace-pre-line text-center text-lg leading-relaxed px-4">
                {slides[currentIndex].text}
              </h3>
            )}
          </>
        );
      })()}
    </div>

      {/* Kanan */}
      <div className="flex-1 p-[60px_80px] bg-gray-100 flex flex-col justify-center items-start">
        <div className="bg-white w-full p-6 rounded-md shadow-md">
        <div className="flex justify-between items-center mb-1 w-full">
  <div className="flex items-center gap-2">
    <img
      src="/images/a8.svg"
      alt="A8"
      className="max-w-[50px] object-contain"
    />
    <h4 className="text-2xl font-bold text-left">
      Buat Akun Baru
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

        <p className="text-sm text-gray-600 mb-8 text-left">
          {message
            ? message
            : isValid
            ? "Masukkan password baru Anda di bawah."
            : "Memvalidasi token..."}
        </p>
        

        {isValid && (
          <form onSubmit={handleResetPassword} className="w-full">
            <div className="relative mb-4">
              <input
                type={showNewPassword ? "text" : "password"} // Ubah tipe input berdasarkan state
                className="w-full p-3 text-black rounded-md border border-gray-900 text-sm focus:outline-none focus:border-[#7f5fff] pr-10" // Tambahkan padding kanan untuk ikon
                placeholder="Masukkan Password Baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <span
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowNewPassword(!showNewPassword)} // Toggle state saat ikon diklik
              >
                {showNewPassword ? (
                  <EyeOff
                    size={16}
                    className="text-gray-500 hover:text-gray-800"
                  />
                ) : (
                  <Eye
                    size={16}
                    className="text-gray-500 hover:text-gray-800"
                  />
                )}
              </span>
            </div>

            {/* Input Konfirmasi Password */}
            <div className="relative mb-4">
              <input
                type={showConfirmPassword ? "text" : "password"} // Ubah tipe input
                className="w-full p-3 text-black rounded-md border border-gray-900 text-sm focus:outline-none focus:border-[#7f5fff] pr-10"
                placeholder="Konfirmasi Password Baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff
                    size={16}
                    className="text-gray-500 hover:text-gray-800"
                  />
                ) : (
                  <Eye
                    size={16}
                    className="text-gray-500 hover:text-gray-800"
                  />
                )}
              </span>
            </div>

            <button
              type="submit"
              className="w-full p-3 cursor-pointer bg-[#5a60ea] text-white rounded-lg text-base font-medium mb-3 transition"
              disabled={isLoadingSubmitForm}
            >
              {isLoadingSubmitForm ? "Mengubah..." : "Simpan Password Baru"}
            </button>
          </form>
        )}
        {!isValid && !message && (
          <p className="text-center text-gray-500 w-full mt-4">
            Token tidak valid. Silakan kembali ke halaman lupa password.
          </p>
        )}
        <ToastContainer />
      </div>
    </div>
    </div>
  );
}

export default ResetPasswordClient;
