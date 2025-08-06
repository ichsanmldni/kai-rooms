"use client";
import React, { useEffect, useRef } from "react";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import { format, formatDate } from "date-fns";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  fetchNotificationList,
  updatedNotificationRead,
} from "../api-client/notification";

const NotificationModal = ({
  dataUser,
  onClose,
  className,
  dataNotifikasi,
  setDataNotification,
}) => {
  const modalRef = useRef(null);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleNotificationClick = async (data) => {
    if (!data.isRead) {
      const payload = {
        id: data.id,
        read: data.isRead,
      };
      await updatedNotificationRead(payload);
      const updatedRes = await fetchNotificationList(dataUser.id);
      console.log("ini updatedRes", updatedRes);
      setDataNotification(updatedRes);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [onClose]);

  console.log("ini data notifikasi", dataNotifikasi);
  return (
    <div className={className}>
      <div
        ref={modalRef}
        className="bg-white bg-opacity-30 backdrop-blur-md border border-gray-200 rounded-lg shadow-2xl w-80"
      >
        <div className="flex justify-between px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Notifikasi</h2>
        </div>
        <div className="flex flex-col max-h-[300px] mb-6 overflow-y-auto px-4">
          {dataNotifikasi.length > 0 ? (
            dataNotifikasi
              .slice()
              .reverse()
              .map((data, index) => (
                <div
                  key={index}
                  onClick={() => handleNotificationClick(data)}
                  className={`backdrop-blur-sm border border-gray-200 rounded-lg p-3 mb-2 mx-2 hover:cursor-pointer shadow-sm transition-transform transform hover:scale-[101%] ${
                    data.isRead
                      ? "bg-white bg-opacity-60"
                      : "bg-orange-200 bg-opacity-60"
                  }`}
                >
                  <div className="flex items-center">
                    {/* Icon to indicate unread status */}
                    {!data.isRead && (
                      <FiberNewIcon className="text-orange-500 mr-2" />
                    )}
                    <p
                      className={`text-xs ${
                        data.isRead
                          ? "text-gray-500"
                          : "font-semibold text-gray-800"
                      }`}
                    >
                      {format(new Date(data.createdAt), "d/M/yyyy, hh:mm a")}
                    </p>
                  </div>
                  <p
                    className={`mt-1 text-[14px] ${
                      data.isRead
                        ? "text-gray-700"
                        : "font-medium text-gray-900"
                    }`}
                  >
                    {data.message}
                  </p>
                </div>
              ))
          ) : (
            <p className="text-center text-gray-400">Belum ada notifikasi</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
