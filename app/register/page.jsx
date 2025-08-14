"use client";
import { registerUser } from "../../api-client/user";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { fetchUnitList } from "../../api-client/unit";
import { X } from "lucide-react";

function SignUpPage() {
  const [formDataRegister, setFormDataRegister] = useState({
    name: "",
    nipp: "", // Tambahan field NIPP
    email: "",
    noTelp: "",
    password: "",
    unitId: "",
    agree: false,
  });

  const [dataUnit, setDataUnit] = useState(null);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [modalSnk, setModalSnk] = useState(false);

  useEffect(() => {
    async function loadUnit() {
      try {
        setLoadingUnits(true);
        const data = await fetchUnitList();
        setDataUnit(data);
      } catch (error) {
        toast.error("Gagal memuat data unit: " + error.message, {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setLoadingUnits(false);
      }
    }
    loadUnit();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!formDataRegister.agree) {
      toast.error("Silakan setujui Syarat & Ketentuan terlebih dahulu.", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    if (!formDataRegister.unitId) {
      toast.error("Silakan pilih unit terlebih dahulu.", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const passwordValid = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(
      formDataRegister.password
    );

    if (!passwordValid) {
      toast.error(
        "Password minimal 8 karakter, mengandung huruf besar dan simbol.",
        {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        }
      );
      return;
    }

    try {
      const res = await registerUser({ ...formDataRegister });
      if (res.data.status === 200) {
        toast.success(res?.data.message || "Registrasi berhasil!", {
          position: "bottom-right",
          autoClose: 3000,
          theme: "colored",
        });
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }
    } catch (err) {
      toast.error(err.response?.data.message || "Registrasi gagal!", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <div className="flex h-screen font-['Segoe_UI',sans-serif] text-black">
      {/* Kiri */}
      <div className="flex-1 bg-gray-300 text-black flex flex-col justify-center items-center p-5 transition-all duration-500">
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

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full"
            onSubmit={handleSignup}
          >
            {/* Nama */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Nama</label>
              <input
                type="text"
                placeholder="Masukkan Nama"
                value={formDataRegister.name}
                onChange={(e) =>
                  setFormDataRegister((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
                className="w-full p-3 text-black rounded-md border border-gray-900 text-sm"
              />
            </div>

            {/* NIPP */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">NIPP</label>
              <input
                type="text"
                placeholder="Masukkan NIPP"
                value={formDataRegister.nipp}
                onChange={(e) =>
                  setFormDataRegister((prev) => ({
                    ...prev,
                    nipp: e.target.value,
                  }))
                }
                required
                className="w-full p-3 text-black rounded-md border border-gray-900 text-sm"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                placeholder="Masukkan Email"
                value={formDataRegister.email}
                onChange={(e) =>
                  setFormDataRegister((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                required
                className="w-full p-3 text-black rounded-md border border-gray-900 text-sm"
              />
            </div>

            {/* Nomor Telepon */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Nomor Telepon</label>
              <input
                type="tel"
                placeholder="Masukkan Nomor Telepon"
                value={formDataRegister.noTelp}
                onChange={(e) =>
                  setFormDataRegister((prev) => ({
                    ...prev,
                    noTelp: e.target.value,
                  }))
                }
                required
                className="w-full p-3 text-black rounded-md border border-gray-900 text-sm"
              />
            </div>

            {/* Unit */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Unit</label>
              <select
                value={formDataRegister.unitId}
                onChange={(e) =>
                  setFormDataRegister((prev) => ({
                    ...prev,
                    unitId: e.target.value,
                  }))
                }
                required
                disabled={loadingUnits}
                className="w-full p-3 text-black rounded-md border border-gray-900 text-sm bg-gray disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingUnits ? "Memuat unit..." : "Pilih Unit"}
                </option>
                {dataUnit &&
                  Array.isArray(dataUnit) &&
                  dataUnit.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Password */}
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                placeholder="Masukkan Password"
                value={formDataRegister.password}
                onChange={(e) =>
                  setFormDataRegister((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                required
                className="w-full p-3 text-black rounded-md border border-gray-900 text-sm"
              />
            </div>

            {/* Checkbox */}
            <div className="flex items-center md:col-span-2 text-sm mb-6">
              <input
                type="checkbox"
                id="terms"
                checked={formDataRegister.agree}
                onChange={(e) =>
                  setFormDataRegister((prev) => ({
                    ...prev,
                    agree: !prev.agree,
                  }))
                }
                className="mr-3 mt-0.5 flex-shrink-0 cursor-pointer"
              />
              <label htmlFor="terms" className="leading-relaxed">
                Saya menyetujui{" "}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setModalSnk(true);
                  }}
                  className="text-blue-600 cursor-pointer hover:text-blue-800 underline font-medium"
                >
                  Syarat & Ketentuan
                </button>{" "}
                yang berlaku
              </label>
            </div>

            {/* Tombol */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loadingUnits}
                className="w-full p-3 bg-[#5a60ea] text-white rounded-lg text-base font-medium hover:bg-[#4a50d0] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loadingUnits ? "Memuat..." : "Daftar"}
              </button>
            </div>
          </form>

          <p className="mt-5 text-sm text-center w-full">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="underline text-[#5a60ea] font-medium cursor-pointer"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default SignUpPage;
