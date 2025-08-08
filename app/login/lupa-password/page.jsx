"use client";

import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { lupaPasswordUser } from "../../../api-client/user"; // sesuaikan path jika berbeda

function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoadingSubmitForm, setIsLoadingSubmitForm] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoadingSubmitForm(true);

    try {
      const payload = { email };
      const response = await lupaPasswordUser(payload);

      if (response.status === 200) {
        toast.success(
          response.data.message ||
            "Instruksi reset password telah dikirim ke email Anda!",
          {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          }
        );
        setEmail("");
      }
      setIsLoadingSubmitForm(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data.message ||
            "Gagal mengirim instruksi reset password!",
          {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          }
        );
      } else {
        toast.error("Terjadi kesalahan, coba lagi nanti!", {
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
      setIsLoadingSubmitForm(false);
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
        <h2 className="text-2xl font-bold mb-2 text-left">Lupa Password</h2>
        <p className="text-sm text-gray-600 mb-8 text-left">
          Masukkan email Anda untuk menerima instruksi reset password.
        </p>

        <form onSubmit={handleForgotPassword} className="w-full">
          <input
            type="email"
            className="w-full p-3 text-black rounded-md border border-gray-300 text-sm mb-4 focus:outline-none focus:border-[#7f5fff]"
            placeholder="Masukkan Email Anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full p-3 cursor-pointer bg-[#5a60ea] text-white rounded-lg text-base font-medium mb-3 transition"
            disabled={isLoadingSubmitForm}
          >
            {isLoadingSubmitForm ? (
              <>
                <span className="mr-2">Loading...</span>
                {/* Tambahkan spinner atau indikator loading di sini jika perlu */}
              </>
            ) : (
              "Kirim Instruksi Reset Password"
            )}
          </button>

          <p className="mt-5 text-sm text-center w-full">
            Kembali ke halaman{" "}
            <Link
              href="/login"
              className="underline text-[#5a60ea] font-medium cursor-pointer"
            >
              Login
            </Link>
          </p>
        </form>

        <ToastContainer />
      </div>
    </div>
  );
}

export default LupaPasswordPage;
