import React, { useState } from "react";

const Notification = ({ message, type, show, onClose }) => {
  // State untuk melacak apakah pesan sudah dibaca
  const [isMessageRead, setIsMessageRead] = useState(false);

  if (!show) return null; // Jika notifikasi tidak perlu ditampilkan

  // Fungsi untuk menangani ketika pesan diakses
  const handleAccessMessage = () => {
    setIsMessageRead(true);
  };

  return (
    <div className="fixed z-50 top-[64px] right-20 w-[320px] rounded-lg shadow-md border border-stroke-1 text-black bg-white transition transform">
      <div className="flex justify-between items-center p-4">
        <p className="font-bold text-5">Notifikasi</p>
        <button onClick={onClose} className="ml-4 font-bold">
          x
        </button>
      </div>
      <div
        className={`flex flex-col gap-2 p-4 cursor-pointer transition-colors border border-stroke-1 ${
          isMessageRead ? "bg-white" : "bg-orange-200"
        }`}
        onClick={handleAccessMessage} // Ubah state ketika pesan diakses
      >
        <p className="text-neutral-600">date</p>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Notification;
