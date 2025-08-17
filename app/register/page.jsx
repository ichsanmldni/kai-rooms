"use client";
import { registerUser } from "../../api-client/user";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { fetchUnitList } from "../../api-client/unit";
import { X } from "lucide-react";
import { set } from "date-fns";

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
                className="w-full p-3 text-black rounded-md border border-gray-900 text-sm focus:outline-none focus:border-[#7f5fff]"
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
                className="w-full p-3 text-black rounded-md border border-gray-900 text-sm focus:outline-none focus:border-[#7f5fff]"
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
                className="w-full p-3 text-black rounded-md border border-gray-900 text-sm focus:outline-none focus:border-[#7f5fff]"
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
                className="w-full p-3 text-black rounded-md border border-gray-900 text-sm focus:outline-none focus:border-[#7f5fff] bg-gray disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                className="w-full p-3 text-black rounded-md border border-gray-900 text-sm focus:outline-none focus:border-[#7f5fff]"
              />
            </div>

            {/* Checkbox - full width */}
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
      </div>
      {modalSnk && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20 backdrop-blur-md"
            onClick={() => setModalSnk(false)}
          ></div>
          <div className="relative bg-white/50 backdrop-blur-xl border border-white/30 rounded-3xl max-w-md w-full mx-4 md:max-h-[90vh] overflow-hidden shadow-2xl shadow-black/10">
            {/* Modal Header */}
            <div className="bg-white flex justify-between items-center p-6 border-b border-white/20">
              <h3 className="text-lg font-semibold">Syarat & Ketentuan</h3>
              <button
                onClick={() => setModalSnk(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 bg-white overflow-y-auto max-h-[60vh]">
              <div className="space-y-4 text-sm leading-relaxed">
                <section>
                  <h4 className="font-semibold mb-2">
                    1. Penerimaan Ketentuan
                  </h4>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2">2. Penggunaan Layanan</h4>
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                    occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2">3. Privasi dan Data</h4>
                  <p>
                    Sed ut perspiciatis unde omnis iste natus error sit
                    voluptatem accusantium doloremque laudantium, totam rem
                    aperiam, eaque ipsa quae ab illo inventore veritatis et
                    quasi architecto beatae vitae dicta sunt.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2">
                    4. Tanggung Jawab Pengguna
                  </h4>
                  <p>
                    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut
                    odit aut fugit, sed quia consequuntur magni dolores eos qui
                    ratione voluptatem sequi nesciunt neque porro quisquam est.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2">
                    5. Pembatasan Tanggung Jawab
                  </h4>
                  <p>
                    At vero eos et accusamus et iusto odio dignissimos ducimus
                    qui blanditiis praesentium voluptatum deleniti atque
                    corrupti quos dolores et quas molestias excepturi sint
                    occaecati cupiditate non provident.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2">6. Perubahan Ketentuan</h4>
                  <p>
                    Similique sunt in culpa qui officia deserunt mollitia animi,
                    id est laborum et dolorum fuga. Et harum quidem rerum
                    facilis est et expedita distinctio nam libero tempore cum
                    soluta nobis est eligendi.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold mb-2">7. Hukum yang Berlaku</h4>
                  <p>
                    Temporibus autem quibusdam et aut officiis debitis aut rerum
                    necessitatibus saepe eveniet ut et voluptates repudiandae
                    sint et molestiae non recusandae itaque earum rerum hic
                    tenetur.
                  </p>
                </section>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex bg-white gap-3 p-6 border-t border-white/20">
              <button
                onClick={() => setModalSnk(false)}
                className="flex-1 px-4 py-1 cursor-pointer text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setFormDataRegister((prev) => ({
                    ...prev,
                    agree: true,
                  }));
                  setModalSnk(false);
                }}
                className="flex-1 px-4 cursor-pointer py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Saya Setuju
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default SignUpPage;
