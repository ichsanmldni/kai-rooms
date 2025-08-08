"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  Wifi,
  Coffee,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Train,
  Building2,
  CheckCircle,
  Info,
  CircleDot,
  AlertCircle,
  Activity,
} from "lucide-react";
import { useParams } from "next/navigation";
import { fetchRoomById } from "../../../api-client/room";
import Image from "next/image";

// Sample data structure based on your room data

const timeSlots = [
  { hour: 8, label: "08:00-09:00", start: "08:00", end: "09:00" },
  { hour: 9, label: "09:00-10:00", start: "09:00", end: "10:00" },
  { hour: 10, label: "10:00-11:00", start: "10:00", end: "11:00" },
  { hour: 11, label: "11:00-12:00", start: "11:00", end: "12:00" },
  { hour: 12, label: "12:00-13:00", start: "12:00", end: "13:00" },
  { hour: 13, label: "13:00-14:00", start: "13:00", end: "14:00" },
  { hour: 14, label: "14:00-15:00", start: "14:00", end: "15:00" },
  { hour: 15, label: "15:00-16:00", start: "15:00", end: "16:00" },
  { hour: 16, label: "16:00-17:00", start: "16:00", end: "17:00" },
];

export default function StatusRuanganDetail() {
  const { id: roomId } = useParams();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dataRuangan, setDataRuangan] = useState(null);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [nextMeeting, setNextMeeting] = useState(null);
  const [todayMeetings, setTodayMeetings] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [nearestMeeting, setNearestMeeting] = useState(null);

  console.log("ini next", nextMeeting);

  // Background music for KAI
  useEffect(() => {
    const audio = new Audio("/Mars KAI.mp3");
    audio.loop = true;
    audio.volume = 0.3;

    audio.play().catch(() => {
      console.warn("Autoplay diblokir. Perlu interaksi pengguna.");
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (roomId) {
      async function loadRooms() {
        try {
          const data = await fetchRoomById(roomId);

          setDataRuangan(data);
        } catch (error) {
          alert(error.message);
        }
      }

      loadRooms();
    }
  }, [roomId]);

  // Find current and next meeting
  useEffect(() => {
    if (!dataRuangan?.meetings) return;

    const now = currentTime;
    // const now = new Date();
    // now.setDate(now.getDate() + 1); // ⬅️ ubah ke besok
    // now.setHours(10, 50, 0, 0); // ⬅️ set waktu ke 09:50

    const todayMeetings = dataRuangan.meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.startTime);
      return meetingDate.toDateString() === now.toDateString();
    });

    // Find current meeting
    const current = todayMeetings.find((meeting) => {
      const start = new Date(meeting.startTime);
      const end = new Date(meeting.endTime);
      return now >= start && now <= end;
    });

    // Find next meeting
    const upcoming = todayMeetings
      .filter((meeting) => new Date(meeting.startTime) > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];

    setCurrentMeeting(current || null);
    setNextMeeting(upcoming || null);
  }, [currentTime, dataRuangan]);

  console.log(currentMeeting);

  function getStatus(start, end, now, readable = false) {
    if (end < now) return readable ? "Selesai" : "selesai";
    if (start <= now && end >= now)
      return readable ? "Berlangsung" : "berlangsung";
    return readable ? "Mendatang" : "mendatang";
  }

  console.log("ini data ruangan", dataRuangan);
  // Replace the existing nearest meeting logic in the useEffect:
  useEffect(() => {
    if (!dataRuangan?.meetings || dataRuangan.meetings.length === 0) return;

    const today = new Date();
    const todayList = [];
    const upcomingList = [];

    let nearest = null;
    let nearestDiff = Infinity;

    for (const m of dataRuangan.meetings) {
      const startTime = new Date(m.startTime);
      const endTime = new Date(m.endTime);
      const tanggal = startTime.toISOString().split("T")[0];
      const time = startTime.toTimeString().slice(0, 5);
      const end = endTime.toTimeString().slice(0, 5);

      const meeting = {
        id: m.id,
        title: m.title,
        lokasi: "Jakarta Pusat",
        room: m.room?.name,
        unit: m.participants?.[0]?.unit?.name || "-",
        time,
        endTime: end,
        tanggal,
        participants: m.meetingAttendees?.length || 0,
        priority: "medium",
        status: getStatus(startTime, endTime, today),
        type: m.type ? m.type : "offline",
      };

      // Check if meeting is upcoming (regardless of date)
      if (startTime > today) {
        const diff = startTime.getTime() - today.getTime();
        if (diff < nearestDiff) {
          nearest = {
            id: m.id,
            title: m.title,
            jenisRapat: m.type ? m.type : "Offline",
            statusRapat: "Mendatang",
            tanggal: startTime.toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            time,
            endTime: end,
            ruangan: m?.room?.name,
            linkMeet: m.linkMeet || "-",
            timeUntil: formatTimeUntil(diff), // Add time until meeting
          };
          nearestDiff = diff;
        }

        // Still maintain upcoming list logic
        const tanggalFormat = new Date(tanggal).toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        upcomingList.push({
          id: m.id,
          title: m.title,
          time,
          endTime: end,
          unit: m.organizerUnit.name || "-",
          tanggal: tanggalFormat,
          type: m.type ? m.type : "offline",
        });
      }

      // Add to today list if meeting is today
      if (
        today.getFullYear() === startTime.getFullYear() &&
        today.getMonth() === startTime.getMonth() &&
        today.getDate() === startTime.getDate()
      ) {
        todayList.push(meeting);
      }
    }

    setTodayMeetings(todayList);
    setUpcomingMeetings(upcomingList);
    setNearestMeeting(nearest);
  }, [dataRuangan]);

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoomStatus = () => {
    if (currentMeeting)
      return {
        status: "occupied",
        color: "bg-red-600",
        text: "Sedang Digunakan",
      };
    if (nextMeeting) {
      const timeUntil = new Date(nextMeeting.startTime) - currentTime;
      if (timeUntil < 15 * 60 * 1000) {
        // 15 minutes
        return {
          status: "soon",
          color: "bg-orange-500",
          text: "Akan Digunakan",
        };
      }
    }
    return { status: "available", color: "bg-green-600", text: "Tersedia" };
  };

  const getTimeSlotStatus = (hour) => {
    if (!dataRuangan?.meetings) return "available";

    const selectedDateStr = selectedDate.toDateString();
    const slotTime = new Date(selectedDate);
    slotTime.setHours(hour, 0, 0, 0);

    const meeting = dataRuangan.meetings.find((meeting) => {
      const start = new Date(meeting.startTime);
      const end = new Date(meeting.endTime);
      return (
        start.toDateString() === selectedDateStr &&
        slotTime >= start &&
        slotTime < end
      );
    });

    if (meeting) {
      const now = currentTime;
      // const now = new Date();
      const start = new Date(meeting.startTime);
      const end = new Date(meeting.endTime);

      if (
        now >= start &&
        now <= end &&
        selectedDateStr === now.toDateString()
      ) {
        return "current";
      }
      return "occupied";
    }

    // Check if time has passed for today
    if (
      selectedDateStr === new Date().toDateString() &&
      slotTime < currentTime
    ) {
      return "past";
    }

    return "available";
  };

  function getRemainingTime(endTime) {
    const now = currentTime;
    // const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return "00:00";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  // Function untuk mendapatkan waktu hingga meeting selanjutnya dalam menit
  function getTimeUntilNextInMinutes(meeting) {
    const now = currentTime;
    // const now = new Date();
    // now.setDate(now.getDate() + 1); // ⬅️ ubah ke besok
    // now.setHours(10, 50, 0, 0); // ⬅️ set waktu ke 09:50

    const start = new Date(meeting.startTime);
    const diff = start - now;

    if (diff <= 0) return 0;

    return Math.ceil(diff / (1000 * 60)); // hasil dalam menit
  }

  const getMeetingAtTime = (hour) => {
    if (!dataRuangan?.meetings) return null;

    const selectedDateStr = selectedDate.toDateString();
    const slotTime = new Date(selectedDate);
    slotTime.setHours(hour, 0, 0, 0);

    return dataRuangan.meetings.find((meeting) => {
      const start = new Date(meeting.startTime);
      const end = new Date(meeting.endTime);
      return (
        start.toDateString() === selectedDateStr &&
        slotTime >= start &&
        slotTime < end
      );
    });
  };

  const getTimeUntilNext = (meeting) => {
    if (!meeting) return "";
    const timeUntil = new Date(meeting.startTime) - currentTime;
    const hours = Math.floor(timeUntil / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}j ${minutes}m lagi`;
    }
    return `${minutes}m lagi`;
  };

  const roomStatus = getRoomStatus();

  const changeDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  // Add this helper function for formatting time until meeting
  const formatTimeUntil = (milliseconds) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} hari ${hours} jam lagi`;
    } else if (hours > 0) {
      return `${hours} jam ${minutes} menit lagi`;
    } else {
      return `${minutes} menit lagi`;
    }
  };

  return (
    <div className="h-screen bg-[#f0f0f2] text-gray-800 relative overflow-hidden flex flex-col">
      {/* Header */}

      <div className="relative z-10 bg-white border-b border-[#1b68b0]/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center">
              <div className="">
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
                    <h2 className="text-md font-bold text-[#1b68b0]">
                      KAI Rooms
                    </h2>
                    <p className="text-xs text-[#6b7280]">
                      Integrated Meeting Hub
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Image
              src="/images/KAI Danantara Logo.png"
              alt="KAI Danantara Logo"
              width={200}
              height={40}
              className="object-contain ml-4"
            />
          </div>
        </div>
      </div>

      <div
        className={`fixed z-20 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-md p-4 ${
          currentMeeting ||
          (nextMeeting && getTimeUntilNextInMinutes(nextMeeting) <= 10)
            ? "top-24 right-4 "
            : "bottom-12 right-4 "
        }`}
      >
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-[#1b68b0] tracking-wider">
            {formatTime(currentTime)}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-sm text-gray-600 mt-1">
            <Calendar size={14} />
            <span>{formatDate(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Room Information Section */}
      {currentMeeting ||
      (nextMeeting && getTimeUntilNextInMinutes(nextMeeting) <= 10) ? (
        <div className="bg-gradient-to-br h-full from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
          {currentMeeting && (
            <div className="w-full max-w-4xl">
              <div className="text-center mb-8 animate-fade-in">
                <div className="inline-flex items-center space-x-2 bg-red-500/10 px-4 py-2 rounded-xl mb-4">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 border-2 border-red-500/50 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-red-600 font-semibold text-sm">
                    LIVE MEETING
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 leading-snug">
                  MEETING
                </h1>
                <h2 className="text-xl md:text-3xl font-bold text-red-500 mb-4">
                  SEDANG BERLANGSUNG
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-red-400 to-red-600 mx-auto rounded-full"></div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
                    <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full translate-x-32 translate-y-32"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                      {/* Meeting Details */}
                      <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-start space-x-4">
                          <div className="min-w-0 flex-1">
                            <div className="text-white/70 text-sm font-medium mb-2">
                              Meeting Title
                            </div>
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-tight break-words">
                              {currentMeeting.title}
                            </h3>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <div className="flex items-center space-x-3 mb-3">
                              <Clock className="w-5 h-5 text-white/80" />
                              <span className="text-white/80 text-sm font-medium">
                                Waktu Meeting
                              </span>
                            </div>
                            <div className="text-lg font-bold text-white leading-relaxed">
                              {new Date(
                                currentMeeting.startTime
                              ).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              <span className="text-white/70 mx-2">–</span>
                              {new Date(
                                currentMeeting.endTime
                              ).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>

                          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <div className="flex items-center space-x-3 mb-3">
                              <Users className="w-5 h-5 text-white/80" />
                              <span className="text-white/80 text-sm font-medium">
                                Peserta
                              </span>
                            </div>
                            <div className="text-xl font-bold text-white">
                              {currentMeeting.meetingAttendees?.length || 0}
                              <span className="text-white/70 text-base ml-2 font-normal">
                                orang
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Countdown and QR Code */}
                      <div className="xl:col-span-1 flex flex-row gap-4 items-stretch h-full">
                        {/* Countdown */}
                        <div className="flex-1 bg-white/15 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20 shadow-lg relative overflow-hidden">
                          <div className="relative z-10 h-full flex flex-col justify-center">
                            <div className="text-white/80 text-sm font-medium mb-3">
                              Waktu Tersisa
                            </div>
                            <div className="text-2xl lg:text-3xl font-black text-white font-mono mb-2">
                              {getRemainingTime(currentMeeting.endTime)}
                            </div>
                            <div className="w-16 h-1 bg-white/40 mx-auto rounded-full"></div>
                          </div>
                        </div>

                        {/* QR Code for Hybrid Meeting */}
                        {currentMeeting.type === "Hybrid" &&
                          currentMeeting.linkMeet && (
                            <div className="flex-1 bg-white/15 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20 shadow-lg">
                              <div className="flex flex-col items-center justify-center h-full space-y-3">
                                <div className="w-16 h-16 lg:w-18 lg:h-18 bg-white p-2 rounded-lg shadow-lg">
                                  <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                      currentMeeting.linkMeet.startsWith(
                                        "http://"
                                      ) ||
                                        currentMeeting.linkMeet.startsWith(
                                          "https://"
                                        )
                                        ? currentMeeting.linkMeet
                                        : `https://${currentMeeting.linkMeet}`
                                    )}`}
                                    alt="QR Code"
                                    className="w-full h-full object-cover rounded"
                                  />
                                </div>
                                <div className="text-sm font-medium text-white/90 leading-tight">
                                  QR Hybrid Link Meeting
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="text-white/80">
                        Status:{" "}
                        <span className="font-bold text-white">Terpakai</span>
                      </div>
                    </div>
                    <div className="text-white/80 flex items-center justify-start sm:justify-end space-x-4">
                      {/* Info Ruangan */}
                      <div className="text-left sm:text-right">
                        <div className="text-xs text-white/70 mb-1">Room</div>
                        <div className="font-semibold text-base text-white">
                          {dataRuangan?.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!currentMeeting &&
            nextMeeting &&
            getTimeUntilNextInMinutes(nextMeeting) <= 10 && (
              <div className="w-full max-w-4xl">
                {/* Header dengan animasi */}
                <div className="text-center mb-8 animate-bounce-slow">
                  <div className="inline-flex items-center space-x-2 bg-amber-500/10 px-4 py-2 rounded-xl mb-4">
                    <AlertCircle className="w-4 h-4 text-amber-500 animate-bounce" />
                    <span className="text-amber-600 font-semibold text-sm">
                      UPCOMING MEETING
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 leading-snug">
                    BERSIAP
                  </h1>
                  <h2 className="text-xl md:text-2xl font-bold text-amber-500 mb-3">
                    MEETING DIMULAI SEBENTAR LAGI
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full animate-pulse"></div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-32 -translate-y-32 animate-pulse"></div>
                      <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full translate-x-32 translate-y-32 animate-pulse"></div>
                    </div>

                    <div className="relative z-10">
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                        {/* Meeting Details */}
                        <div className="xl:col-span-2 space-y-6">
                          <div className="flex items-start space-x-4">
                            <div className="bg-white/20 p-3 rounded-xl animate-pulse flex-shrink-0">
                              <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-white/70 text-sm font-medium mb-2">
                                Meeting Selanjutnya
                              </div>
                              <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-tight break-words">
                                {nextMeeting.title}
                              </h3>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                              <div className="flex items-center space-x-3 mb-3">
                                <Clock className="w-5 h-5 text-white/80" />
                                <span className="text-white/80 text-sm font-medium">
                                  Waktu Meeting
                                </span>
                              </div>
                              <div className="text-lg font-bold text-white leading-relaxed">
                                {new Date(
                                  nextMeeting.startTime
                                ).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                <span className="text-white/70 mx-2">–</span>
                                {new Date(
                                  nextMeeting.endTime
                                ).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                              <div className="flex items-center space-x-3 mb-3">
                                <Users className="w-5 h-5 text-white/80" />
                                <span className="text-white/80 text-sm font-medium">
                                  Peserta
                                </span>
                              </div>
                              <div className="text-xl font-bold text-white">
                                {nextMeeting.meetingAttendees?.length || 0}
                                <span className="text-white/70 text-base ml-2 font-normal">
                                  orang
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Countdown and QR Code */}
                        <div className="xl:col-span-1 flex flex-row gap-4 items-stretch h-full">
                          {/* Countdown */}
                          <div className="flex-1 bg-white/15 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20 shadow-lg relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/5 animate-pulse rounded-2xl"></div>
                            <div className="relative z-10 h-full flex flex-col justify-center">
                              <div className="text-white/80 text-sm font-medium mb-3">
                                Dimulai Dalam
                              </div>
                              <div className="text-4xl xl:text-5xl font-black text-white font-mono mb-2 animate-pulse">
                                {getTimeUntilNextInMinutes(nextMeeting)}
                              </div>
                              <div className="text-lg font-bold text-white/90 mb-3">
                                MENIT
                              </div>
                              <div className="w-16 h-1 bg-white/40 mx-auto rounded-full animate-pulse"></div>
                            </div>
                          </div>

                          {/* QR Code for Hybrid Meeting */}
                          {nextMeeting.type === "Hybrid" &&
                            nextMeeting.linkMeet && (
                              <div className="flex-1 bg-white/15 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20 shadow-lg">
                                <div className="flex flex-col items-center justify-center h-full space-y-3">
                                  <div className="w-20 h-20 xl:w-24 xl:h-24 bg-white p-2 rounded-lg shadow-lg">
                                    <img
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                        nextMeeting.linkMeet.startsWith(
                                          "http://"
                                        ) ||
                                          nextMeeting.linkMeet.startsWith(
                                            "https://"
                                          )
                                          ? nextMeeting.linkMeet
                                          : `https://${nextMeeting.linkMeet}`
                                      )}`}
                                      alt="QR Code"
                                      className="w-full h-full object-cover rounded"
                                    />
                                  </div>
                                  <div className="text-sm font-medium text-white/90 leading-tight">
                                    QR Hybrid Link Meeting
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="text-white/80">
                          Status:{" "}
                          <span className="font-bold text-white">
                            Dimulai Sebentar Lagi
                          </span>
                        </div>
                      </div>
                      <div className="text-white/80 flex items-center justify-start sm:justify-end space-x-4">
                        {/* Info Ruangan */}
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-white/70 mb-1">Room</div>
                          <div className="font-semibold text-base text-white">
                            {dataRuangan?.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      ) : (
        /* Regular Schedule Display */
        <div className="h-full">
          <div className="bg-white/70 mx-4 mt-4 backdrop-blur-xl rounded-2xl border border-white/20 shadow-sm">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-[#1b68b0]">
                      {dataRuangan?.name}
                    </h1>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={14} className="text-[#1b68b0]" />
                      <span>{dataRuangan?.location}</span>
                    </div>
                    <span className="text-[#1b68b0]">•</span>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-[#1b68b0]" />
                      <span>Kapasitas {dataRuangan?.capacity} orang</span>
                    </div>
                  </div>
                </div>

                {/* Room Status */}
                <div
                  className={`
                    flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs
                    ${
                      roomStatus.status === "occupied"
                        ? "bg-red-50 text-red-600"
                        : roomStatus.status === "soon"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-emerald-50 text-emerald-600"
                    }
                  `}
                >
                  <CircleDot className="w-3 h-3" />
                  <span className="font-medium">{roomStatus.text}</span>
                </div>
              </div>

              {/* Current Meeting Info */}
              {currentMeeting && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-medium text-red-800">
                      Sedang Berlangsung
                    </span>
                  </div>
                  <h3 className="font-bold text-red-900 text-base mb-2">
                    {currentMeeting.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-red-700 text-xs">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(currentMeeting.startTime).toLocaleTimeString(
                          "id-ID",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}{" "}
                        -
                        {new Date(currentMeeting.endTime).toLocaleTimeString(
                          "id-ID",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {currentMeeting.meetingAttendees?.length || 0} peserta
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Meeting Info */}
              {nextMeeting && !currentMeeting && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-100 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-800">
                      Selanjutnya
                    </span>
                  </div>
                  <h3 className="font-bold text-amber-900 text-base mb-2">
                    {nextMeeting.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-amber-700 text-xs">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(nextMeeting.startTime).toLocaleTimeString(
                          "id-ID",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}{" "}
                        -
                        {new Date(nextMeeting.endTime).toLocaleTimeString(
                          "id-ID",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {nextMeeting.meetingAttendees?.length || 0} peserta
                      </span>
                    </div>
                    <div className="text-amber-800 font-medium">
                      {getTimeUntilNext(nextMeeting)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto p-4">
              <div className="grid grid-cols-1 gap-6">
                {/* Schedule Grid */}
                <div className="xl:col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl border border-[#1b68b0]/10 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-[#1b68b0]/10">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="bg-[#1b68b0]/10 p-2 rounded-xl">
                            <Calendar className="text-[#1b68b0]" size={20} />
                          </div>
                          <h3 className="text-lg font-semibold text-[#1b68b0]">
                            Jadwal Ruangan
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 bg-[#f0f0f2] rounded-lg p-1">
                          <button
                            onClick={() => changeDate(-1)}
                            className="p-2 hover:bg-[#1b68b0] hover:text-white text-[#1b68b0] rounded-lg transition-all"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-sm font-medium px-2 text-gray-600">
                            {selectedDate.toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
                          </span>
                          <button
                            onClick={() => changeDate(1)}
                            className="p-2 hover:bg-[#1b68b0] hover:text-white text-[#1b68b0] rounded-lg transition-all"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Time Slots Grid */}
                    <div className="p-4">
                      <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-9 gap-2">
                        {timeSlots.map((slot) => {
                          const status = getTimeSlotStatus(slot.hour);
                          const meeting = getMeetingAtTime(slot.hour);
                          const now = currentTime;
                          // const now = new Date();
                          const slotTime = new Date(selectedDate);
                          slotTime.setHours(slot.hour, 0, 0, 0);
                          const isCurrentTime =
                            now.toDateString() === slotTime.toDateString() &&
                            now.getHours() === slotTime.getHours();
                          const isPastTime = slotTime < now;

                          return (
                            <div
                              key={slot.hour}
                              className={`
                          relative p-2 rounded-xl transition-all min-h-[70px] border
                          ${
                            status === "occupied"
                              ? "bg-red-50 border-red-200 text-red-700"
                              : ""
                          }
                          ${
                            status === "current"
                              ? "bg-[#ff7729]/10 border-[#ff7729]/20 text-[#ff7729]"
                              : ""
                          }
                          ${
                            status === "past"
                              ? "bg-gray-50 border-gray-200 text-gray-400"
                              : ""
                          }
                          ${
                            status === "available"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : ""
                          }
                          ${isCurrentTime ? "ring-2 ring-[#1b68b0]" : ""}
                          ${
                            isPastTime && !meeting
                              ? "opacity-80"
                              : "transform transition-all"
                          }
                        `}
                            >
                              {/* Current Time Indicator */}
                              {isCurrentTime && (
                                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                                  <div className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                                    Sekarang
                                  </div>
                                </div>
                              )}

                              <div className="text-center">
                                <div className="font-mono text-[10px] mb-2 font-medium opacity-80">
                                  {slot.label}
                                </div>

                                {meeting ? (
                                  <div className="space-y-1">
                                    <div className="font-medium text-xs leading-tight truncate">
                                      {meeting.title}
                                    </div>
                                    <div className="text-[10px] flex justify-center items-center gap-1 opacity-75">
                                      <Users size={10} />
                                      <span>{meeting.participants}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-[10px] font-medium opacity-60">
                                    {isPastTime ? "Telah Lewat" : "Tersedia"}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-white border-t border-[#1b68b0]/10 py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>PT Kereta Api Indonesia (Persero)</span>
            <span>© {new Date().getFullYear()} KAI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
