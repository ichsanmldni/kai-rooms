"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, Settings, LogOut, Bell, User } from "lucide-react";
import { ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { fetchUserById, updateUser } from "../../api-client/user";
import {
  fetchSetting,
  fetchSettingById,
  updateSetting,
} from "../../api-client/setting";
import Image from "next/image";
import { fetchNotificationList } from "../../api-client/notification";
import NotificationModal from "../../components/NotificationModal";

const Pengaturan = () => {
  const router = useRouter();
  const [notificationCount, setNotificationCount] = useState(0);
  const [dataNotification, setDataNotification] = useState([]);
  const [activeTab, setActiveTab] = useState("profil");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isModalNotificationOpen, setIsModalNotificationOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [userData, setUserData] = useState({
    id: "",
    nama: "",
    email: "",
    noTelp: "",
  });
  const [userDataLogin, setUserDataLogin] = useState({
    id: "",
    nama: "",
    email: "",
    noTelp: "",
  });

  console.log("ini userdata", userData);

  const [currentTime, setCurrentTime] = useState(new Date());

  const [notifikasi, setNotifikasi] = useState({
    id: "",
    emailNotifikasi: false,
    pengingatRapat: false,
  });

  const closeNotificationModal = () => {
    setIsModalNotificationOpen(false);
  };
  console.log("ini notifikasi", notifikasi);

  async function fetchMe() {
    if (typeof window === "undefined") return null;

    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("authKAI="));

    if (!cookie) return null;

    const token = cookie.split("=")[1];

    try {
      const decoded = jwtDecode(token); // hasilnya object user
      return decoded;
    } catch (error) {
      console.error("Invalid token", error);
      return null;
    }
  }
  useEffect(() => {
    if (userDataLogin && userDataLogin.id) {
      async function loadNotification() {
        try {
          const data = await fetchNotificationList(userDataLogin.id);
          setDataNotification(data);
        } catch (error) {
          alert(error.message);
        }
      }
      loadNotification(userData.id);
    }
  }, [userDataLogin]);

  useEffect(() => {
    if (userDataLogin && userDataLogin.id) {
      async function loadUserById() {
        try {
          const data = await fetchUserById(userDataLogin.id);
          setUserData({
            id: data.id || "",
            nama: data.name || "",
            email: data.email || "",
            noTelp: data.noTelp || "",
          });
        } catch (error) {
          console.error("Error loading user:", error);
          setUserData({
            id: "",
            nama: "",
            email: "",
            noTelp: "",
          });
        }
      }
      async function loadSettingByUserId() {
        try {
          const data = await fetchSetting(userDataLogin.id);
          setNotifikasi({
            id: data?.id,
            emailNotifikasi: data?.emailNotification,
            pengingatRapat: data?.meetingReminder,
          });
        } catch (error) {
          console.error("Error loading user:", error);
          setNotifikasi({
            id: "",
            emailNotifikasi: false,
            pengingatRapat: false,
          });
        }
      }
      loadUserById();
      loadSettingByUserId();
    }
  }, [userDataLogin]);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await fetchMe();
        setUserDataLogin({
          id: data.id || "",
          nama: data.nama || "",
          email: data.email || "",
          noTelp: data.noTelp || "",
        });
      } catch (error) {
        console.error("Error loading user:", error);
        setUserDataLogin({
          id: "",
          nama: "",
          email: "",
          noTelp: "",
        });
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setNotificationCount(
      dataNotification.filter((data) => data.isRead === false).length
    );
  }, [dataNotification]);

  const handleUploadAvatar = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Harap pilih file gambar");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleKlikAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleHapusAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleToggle = (kategori, key) => {
    if (kategori === "notifikasi") {
      setNotifikasi((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleUbahInput = (kategori, key, value) => {
    if (kategori === "profil") {
      setUserData((prev) => ({ ...prev, [key]: value }));
    } else if (kategori === "pengaturanRuang") {
      setPengaturanRuang((prev) => ({ ...prev, [key]: value }));
    } else if (kategori === "pengaturanSistem") {
      setPengaturanSistem((prev) => ({ ...prev, [key]: value }));
    }
  };

  console.log(userData);

  const handleSimpanProfile = async () => {
    setIsLoading(true);

    const payload = {
      id: userData.id,
      email: userData.email,
      nama: userData.nama,
      noTelp: userData.noTelp,
    };

    const updateRes = await updateUser(payload);

    const updatedUser = updateRes.data.user;

    console.log("ini updateres", updateRes);
    await fetchUserById(updatedUser.id);

    setIsLoading(false);
  };
  const handleSimpanSetting = async () => {
    setIsLoading(true);

    const payload = {
      id: notifikasi.id,
      emailNotification: notifikasi.emailNotifikasi,
      meetingReminder: notifikasi.pengingatRapat,
    };

    await updateSetting(payload);

    setIsLoading(false);
  };

  const handleKembali = () => {
    router.back();
  };

  const ToggleSwitch = ({ aktif, onToggle }) => (
    <div
      className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-300 ${
        aktif ? "bg-green-500" : "bg-gray-300"
      }`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onToggle();
      }}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
          aktif ? "translate-x-6" : "translate-x-0.5"
        }`}
      />
    </div>
  );

  const logoutHandle = () => {
    document.cookie = "authKAI=; max-age=0; path=/;";
    window.location.reload();
  };

  const renderKontenTab = () => {
    const tabContent = {
      profil: {
        title: "Informasi Profil",
        content: (
          <div className="space-y-4">
            {/* Form Fields */}
            <div className="grid gap-4">
              {[
                { key: "nama", label: "Nama Lengkap", type: "text" },
                { key: "email", label: "Email", type: "email" },
                { key: "noTelp", label: "No. Telepon", type: "tel" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={userData[key] || ""} // Add fallback empty string
                    onChange={(e) =>
                      handleUbahInput("profil", key, e.target.value)
                    }
                    className="w-full text-black px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1b68b0] focus:border-[#1b68b0] transition-colors"
                    placeholder={`Masukkan ${label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ),
      },
      notifikasi: {
        title: "Pengaturan Notifikasi",
        content: (
          <div className="space-y-2">
            {[
              {
                key: "emailNotifikasi",
                label: "Notifikasi Email",
                desc: "Kirim pemberitahuan ke email",
              },
              {
                key: "pengingatRapat",
                label: "Pengingat Rapat",
                desc: "Ingatkan 15 menit sebelum rapat",
              },
            ].map(({ key, label, desc }) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{label}</h3>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <ToggleSwitch
                  aktif={notifikasi[key]}
                  onToggle={() => handleToggle("notifikasi", key)}
                />
              </div>
            ))}
          </div>
        ),
      },
    };

    const selected = tabContent[activeTab];
    if (!selected) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {selected.title}
          </h2>
        </div>
        <div className="py-2">{selected.content}</div>
      </div>
    );
  };

  const tabLabels = {
    profil: "Profil",
    notifikasi: "Notifikasi",
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-4 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-[#ffffff]/80 backdrop-blur-md border border-[#d6eaff] z-40 shadow-xl">
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="relative group">
                {/* Main logo container dengan improved styling */}
                <div className="w-9 h-9 p-[7px] bg-gradient-to-br from-[#1b68b0] to-[#144a87] rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ring-2 ring-blue-100/50">
                  <img
                    src="/images/KAI_ROOMS_logo.png"
                    alt="KAI Rooms Logo"
                    className="w-full h-full object-contain filter brightness-0 invert"
                  />
                </div>

                {/* Status indicator dengan animation */}
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white shadow-sm">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-full h-full bg-green-500 rounded-full"></div>
                </div>

                {/* Subtle glow effect */}
                <div className="absolute inset-0 w-10 h-10 bg-[#1b68b0]/20 rounded-xl blur-md -z-10 group-hover:bg-[#1b68b0]/30 transition-all duration-300"></div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-md font-bold text-[#1b68b0]">KAI Rooms</h2>
              <p className="text-xs text-[#6b7280]">Integrated Meeting Hub</p>
            </div>
          </div>
        </div>

        <nav className="p-3">
          <ul className="space-y-1">
            {[
              {
                icon: Calendar,
                label: "Dashboard",
                href: "/dashboard",
              },
              { icon: Clock, label: "Jadwal", href: "/jadwal" },
              {
                icon: Settings,
                label: "Pengaturan & Profil",
                href: "/pengaturan",
                active: true,
              },
            ].map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                    item.active
                      ? "bg-[#1b68b0] text-white shadow-md"
                      : "text-gray-600 hover:bg-[#f2f6fa] hover:text-[#1b68b0] hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon
                      size={16}
                      className={
                        item.active
                          ? "text-white"
                          : "text-gray-500 group-hover:text-[#1b68b0]"
                      }
                    />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div
            onClick={logoutHandle}
            className="w-full cursor-pointer mt-4 flex items-center space-x-3 px-3 py-2.5 text-[#ff7729] hover:bg-[#fff3ec] rounded-xl transition-all"
          >
            <LogOut size={16} />
            <span className="font-medium text-sm">Log out</span>
          </div>
        </nav>
      </aside>

      <main className="ml-60 relative z-10">
        <div className="max-w-6x2 mx-auto">
          {/* Header */}
          <header className="bg-[#f0f0f2] backdrop-blur-xl border-b border-[#d6eaff] px-6 py-3 shadow-sm">
            <div className="flex justify-between items-center">
              <Image
                src="/images/KAI Danantara Logo.png"
                alt="KAI Danantara Logo"
                width={200}
                height={40}
                className="object-contain ml-4"
              />
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-[#f0f0f2] px-3 py-2 rounded-lg border border-[#d6eaff]">
                  <Clock className="text-[#1b68b0]" size={16} />
                  <div className="text-sm font-bold text-gray-900">
                    {formatTime(currentTime)}{" "}
                    <span className="font-normal">WIB</span>
                  </div>
                </div>
                <div
                  className={`relative flex flex-col items-center cursor-pointer`}
                  onClick={() => setIsModalNotificationOpen((prev) => !prev)}
                >
                  <Bell className="size-4 mt-4 text-black" />
                  {notificationCount > 0 && (
                    <span className="absolute bg-red-600 top-[5px] left-[25px] text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                  <span className="text-xs">Notifikasi</span>
                </div>
              </div>
            </div>
          </header>

          <div className="p-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 mb-6">
              <div className="flex border-b border-gray-200/50">
                {Object.keys(tabLabels).map((tab, index) => (
                  <button
                    key={tab}
                    className={`px-6 py-4 text-sm font-medium cursor-pointer transition-all duration-200 relative ${
                      activeTab === tab
                        ? "text-[#1b68b0] border-b-2 border-[#1b68b0] bg-[#1b68b0]/5"
                        : "text-gray-600 hover:text-[#1b68b0] hover:bg-gray-50"
                    } ${index === 0 ? "rounded-tl-xl" : ""} ${
                      index === Object.keys(tabLabels).length - 1
                        ? "rounded-tr-xl"
                        : ""
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tabLabels[tab]}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Container */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-8">
              <div className="">
                {renderKontenTab()}

                <div className="mt-8 flex justify-center space-x-4 pt-6 border-t border-gray-200/50">
                  <button
                    className="bg-gray-500 text-sm cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors shadow-sm"
                    onClick={handleKembali}
                  >
                    Kembali
                  </button>
                  <button
                    className={`px-6 py-2 rounded-lg text-sm transition-colors shadow-sm ${
                      isLoading
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-[#1b68b0] text-white cursor-pointer hover:bg-[#1b68b0]/90"
                    }`}
                    onClick={
                      activeTab === "profil"
                        ? handleSimpanProfile
                        : handleSimpanSetting
                    }
                    disabled={isLoading}
                  >
                    {isLoading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
        </div>
      </main>
      {isModalNotificationOpen && (
        <NotificationModal
          dataNotifikasi={dataNotification}
          className={`fixed top-[4rem] right-4 z-[9999] w-80 max-h-[calc(100vh-6rem)]`} // Adjusted z-index and positioning
          onClose={closeNotificationModal}
          setDataNotification={setDataNotification}
          dataUser={userData}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default Pengaturan;
