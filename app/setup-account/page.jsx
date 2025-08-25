"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SetupAccountForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [noWa, setNoWa] = useState("");
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cek apakah token valid
  useEffect(() => {
    if (token) {
      fetch("/api/auth/verifytoken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "Token valid") {
            setIsValid(true);
          } else {
            setMessage("Token tidak valid atau sudah kadaluarsa");
          }
        });
    } else {
      setMessage("Token tidak ditemukan");
    }
  }, [token]);

  // Fungsi untuk submit password baru
  const handleSetupAccount = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Password tidak cocok!");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/setupaccount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword, noWa }),
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
    <div className="border mx-4 md:mx-0 rounded-xl md:rounded-lg md:w-1/2 self-center p-4">
      <h3 className="text-[16px] text-center pt-4 pb-2 px-20 font-semibold md:text-[28px]">
        Setup Account
      </h3>

      {message && <p className="text-center text-red-500">{message}</p>}

      {isValid ? (
        <form className="px-8 py-4 flex flex-col" onSubmit={handleSetupAccount}>
          <input
            type="text"
            className="px-3 py-2 text-[15px] mt-4 border focus:outline-none rounded-lg"
            placeholder="Masukkan No HP"
            value={noWa}
            onChange={(e) => setNoWa(e.target.value)}
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
  );
}
