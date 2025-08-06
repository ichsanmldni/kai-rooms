"use client";
import { registerUser } from "../../api-client/user";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { fetchUnitList } from "../../api-client/unit";

function SignUpPage() {
  const [formDataRegister, setFormDataRegister] = useState({
    name: "",
    email: "",
    noTelp: "",
    password: "",
    unitId: "",
    agree: false,
  });

  const [dataUnit, setDataUnit] = useState(null);
  const [loadingUnits, setLoadingUnits] = useState(true);

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
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
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
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }

    if (!formDataRegister.unitId) {
      toast.error("Silakan pilih unit terlebih dahulu.", {
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

    const passwordValid = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(
      formDataRegister.password
    );

    if (!passwordValid) {
      toast.error(
        "Password minimal 8 karakter, mengandung huruf besar dan simbol.",
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
      return;
    }

    console.log(formDataRegister);

    try {
      const res = await registerUser({ ...formDataRegister });
      console.log(res);
      if (res.data.status === 200) {
        toast.success(res?.data.message || "Registrasi berhasil!", {
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
      toast.error(err.response?.data.message || "Registrasi gagal!", {
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
      <div className="flex-1 bg-gradient-to-b from-[#f7825f] to-[#2539a0] flex justify-center items-center p-5">
        <img
          src="/images/KAI_ROOMS_illustration.png"
          alt="Illustration"
          className="max-w-[80%] h-auto"
        />
      </div>

      {/* Kanan */}
      <div className="flex-1 p-[60px_80px] bg-white flex flex-col justify-center items-start">
        <h2 className="text-2xl font-bold mb-2 text-left">Buat Akun Baru</h2>
        <p className="text-sm text-gray-600 mb-8 text-left">
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
              className="w-full p-3 text-black rounded-md border border-gray-300 text-sm focus:outline-none focus:border-[#7f5fff]"
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
              className="w-full p-3 text-black rounded-md border border-gray-300 text-sm focus:outline-none focus:border-[#7f5fff]"
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
              className="w-full p-3 text-black rounded-md border border-gray-300 text-sm focus:outline-none focus:border-[#7f5fff]"
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
              className="w-full p-3 text-black rounded-md border border-gray-300 text-sm focus:outline-none focus:border-[#7f5fff] bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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

          {/* Password - full width */}
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
              className="w-full p-3 text-black rounded-md border border-gray-300 text-sm focus:outline-none focus:border-[#7f5fff]"
            />
          </div>

          {/* Checkbox - full width */}
          <div className="flex items-center md:col-span-2 text-sm">
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
              className="mr-2"
            />
            <label htmlFor="terms">Saya menyetujui Syarat & Ketentuan</label>
          </div>

          {/* Button - full width */}
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

      <ToastContainer />
    </div>
  );
}

export default SignUpPage;
