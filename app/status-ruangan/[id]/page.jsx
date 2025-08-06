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
} from "lucide-react";
import { useParams } from "next/navigation";
import { fetchRoomById } from "../../../api-client/room";

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

    const now = new Date();
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
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
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
      const now = new Date();
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
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-[#ff7729] to-[#ff5500] p-2 rounded-xl shadow-sm">
                <Train className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[#1b68b0]">
                    {dataRuangan?.name}
                  </h1>
                  <span className="px-2 py-0.5 bg-[#1b68b0]/10 rounded-full text-xs font-medium text-[#ff7729]">
                    {dataRuangan?.capacity} Orang
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Building2 size={14} />
                  <span>{dataRuangan?.location}</span>
                  <span className="text-[#ff7729]">•</span>
                  <span className="font-medium">KAI</span>
                </div>
              </div>
            </div>

            {/* Clock Display */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-[#1b68b0]">
                  {formatTime(currentTime)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar size={12} />
                  <span>{formatDate(currentTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
                      const now = new Date();
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
                              ? "opacity-40"
                              : "hover:shadow-md hover:scale-[1.02] transform transition-all"
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

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#1b68b0]/10 p-4 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-[#ff7729]/20 p-2 rounded-xl">
                    <Clock className="text-[#ff7729]" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold">Status Ruangan</h3>
                </div>

                <div
                  className={`
                rounded-xl p-4 mb-3 border
                ${
                  roomStatus.status === "occupied"
                    ? "bg-red-500/10 border-red-500/20"
                    : roomStatus.status === "soon"
                    ? "bg-[#ff7729]/10 border-[#ff7729]/20"
                    : "bg-emerald-500/10 border-emerald-500/20"
                }
              `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full animate-pulse
                    ${
                      roomStatus.status === "occupied"
                        ? "bg-red-500"
                        : roomStatus.status === "soon"
                        ? "bg-[#ff7729]"
                        : "bg-emerald-500"
                    }
                  `}
                    />
                    <span className="font-medium">{roomStatus.text}</span>
                  </div>
                </div>

                {/* Current Meeting Card */}
                {currentMeeting && (
                  <div className="bg-[#1b68b0]/10 border border-[#1b68b0]/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-[#1b68b0] mb-3">
                      <Clock size={16} />
                      <span className="font-medium">Sedang Berlangsung</span>
                    </div>
                    <p className="font-semibold text-sm mb-2 text-gray-800">
                      {currentMeeting.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Users size={14} className="text-gray-500" />
                      <span>
                        {currentMeeting.meetingAttendees.length} peserta
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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
