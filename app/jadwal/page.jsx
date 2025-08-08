"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Bell,
  Settings,
  LogOut,
  Search,
  FileText,
  Plus,
  X,
  Users,
  MapPin,
  Video,
  Monitor,
  Wifi,
  Star,
  Zap,
  Coffee,
  ChevronRight,
  Sparkles,
  Activity,
  TrendingUp,
  User,
  Mail,
  Phone,
  Building,
  Timer,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Eye,
  Filter,
  Download,
  Share2,
  Moon,
  Sun,
  Palette,
  Gift,
  Heart,
  Smile,
  MessageSquare,
  Camera,
  Mic,
  MicOff,
  ScreenShare,
  CloudCog,
  Building2,
  LinkIcon,
} from "lucide-react";
import Link from "next/link";

import Select from "react-select";
import { fetchEmployeeList } from "../../api-client/employee";
import { fetchUnitList } from "../../api-client/unit";
import { fetchRoomList } from "../../api-client/room";
import { fetchBookingList } from "../../api-client/booking";
import { createMeeting, fetchMeetingList } from "../../api-client/meeting";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import NotificationModal from "../../components/NotificationModal";
import { fetchNotificationList } from "../../api-client/notification";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";

const KaiRoomsApp = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPopup, setShowPopup] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [roomsOptions, setRoomsOptions] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [allSlots, setAllSlots] = useState([]);
  const [timeRanges, setTimeRanges] = useState([]);
  const [dataMeetings, setDataMeetings] = useState([]);
  const [todayMeetings, setTodayMeetings] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [nearestMeeting, setNearestMeeting] = useState(null);
  const [dataRoomsToday, setDataRoomsToday] = useState([]);
  const [dataRoomsSelectedTanggal, setDataRoomsSelectedTanggal] = useState([]);
  const [userData, setUserData] = useState(null);

  const router = useRouter();

  const handleShowDetailRooms = (room) => {
    router.push(`/status-ruangan/${room.id}`); // ganti sesuai struktur datamu
  };

  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  console.log("ini data rooms", dataRoomsToday);
  const [formDataBookingRoom, setFormDataBookingRoom] = useState({
    penyelenggara: "",
    namaRapat: "",
    tanggal: "",
    waktuMulai: "",
    waktuSelesai: "",
    lokasi: "",
    ruangan: "",
    jenisRapat: "Offline",
    linkMeet: "",
    kapasitas: "",
    catatan: "",
    pesertaRapat: [],
    kirimUndanganEmail: false,
    createdById: "",
  });

  const [isModalNotificationOpen, setIsModalNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [dataNotification, setDataNotification] = useState([]);

  const timeSlots = [];
  for (let hour = 8; hour < 17; hour++) {
    const startTime = `${hour.toString().padStart(2, "0")}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
    timeSlots.push({
      start: startTime,
      end: endTime,
      label: `${startTime}-${endTime}`,
      key: startTime,
    });
  }

  console.log(
    "ini nearest",
    nearestMeeting,
    "ini today",
    todayMeetings,
    "ini upcomingMeetings",
    upcomingMeetings
  );

  function getStatus(start, end, now, readable = false) {
    if (end < now) return readable ? "Selesai" : "selesai";
    if (start <= now && end >= now)
      return readable ? "Berlangsung" : "berlangsung";
    return readable ? "Mendatang" : "mendatang";
  }

  useEffect(() => {
    if (allSlots.length > 1) {
      const ranges = allSlots.slice(0, -1).map((start, index) => ({
        start,
        end: allSlots[index + 1],
        range: `${start} - ${allSlots[index + 1]}`,
      }));
      setTimeRanges(ranges);
    }
  }, [allSlots]);

  useEffect(() => {
    if (formDataBookingRoom.ruangan && formDataBookingRoom.tanggal) {
      const selectedRoom = dataRoomsToday.find(
        (room) => room.id === formDataBookingRoom.ruangan
      );

      if (selectedRoom) {
        const bookings = Object.entries(selectedRoom.meetings || {})
          .filter(
            ([key, meeting]) => meeting.date === formDataBookingRoom.tanggal
          )
          .map(([key]) => key); // misalnya: ['08:00', '09:00']

        setBookedSlots(bookings);
      }
    }
  }, [
    formDataBookingRoom.ruangan,
    formDataBookingRoom.tanggal,
    dataRoomsToday,
  ]);

  function isTodayInWIB(date) {
    const wibOffsetMs = 7 * 60 * 60 * 1000; // UTC+7
    const wibDate = new Date(date.getTime() + wibOffsetMs);

    const now = new Date();
    const nowWIB = new Date(now.getTime() + wibOffsetMs);

    console.log("ini date today in wib", date);

    return (
      wibDate.getUTCFullYear() === nowWIB.getUTCFullYear() &&
      wibDate.getUTCMonth() === nowWIB.getUTCMonth() &&
      wibDate.getUTCDate() === nowWIB.getUTCDate()
    );
  }

  function isSelectedTanggalInWIB(start, formDataBookingRoom) {
    const selectedDate = new Date(formDataBookingRoom.tanggal);

    // Hilangkan waktu dari selectedDate
    const selectedDateOnly = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );

    // Hilangkan waktu dari start (waktu mulai meeting)
    const meetingDateOnly = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );

    return selectedDateOnly.getTime() === meetingDateOnly.getTime();
  }

  function transformRooms(data) {
    return data.map((room) => {
      const meetingsByTime = {};

      room.meetings?.forEach((meeting) => {
        const start = new Date(meeting.startTime);
        const end = new Date(meeting.endTime);

        if (!isTodayInWIB(start)) return; // skip jika bukan hari ini

        const startTimeStr = start.toTimeString().slice(0, 5); // "HH:mm"
        const endTimeStr = end.toTimeString().slice(0, 5); // "HH:mm"
        const duration = (end - start) / (1000 * 60 * 60); // dalam jam

        meetingsByTime[startTimeStr] = {
          id: meeting.id,
          title: meeting.title,
          endTime: endTimeStr,
          participants: meeting.meetingAttendees?.length || 0,
          status: getMeetingStatus(start, end),
          priority: "medium", // isi sesuai skemamu
          organizer: meeting.createdBy?.name || "Unknown",
          description: meeting.description,
          duration,
        };
      });

      return {
        id: room?.id,
        name: room?.name,
        location: room?.location,
        capacity: room?.capacity,
        meetings: meetingsByTime,
      };
    });
  }
  function transformRoomsSelectedTanggalAndSelectedRoom(
    data,
    formDataBookingRoom
  ) {
    const selectedRoomId = formDataBookingRoom.ruangan;

    // Temukan hanya ruangan yang dipilih
    const room = data.find((room) => room.id === selectedRoomId);
    if (!room) return []; // Kalau ruangan tidak ditemukan, return kosong

    const meetingsByTime = {};

    room.meetings?.forEach((meeting) => {
      const start = new Date(meeting.startTime);
      const end = new Date(meeting.endTime);

      // Filter berdasarkan tanggal yang dipilih dalam WIB
      if (!isSelectedTanggalInWIB(start, formDataBookingRoom)) return;

      const startTimeStr = start.toTimeString().slice(0, 5); // "HH:mm"
      const endTimeStr = end.toTimeString().slice(0, 5); // "HH:mm"
      const duration = (end - start) / (1000 * 60 * 60); // jam

      meetingsByTime[startTimeStr] = {
        id: meeting.id,
        title: meeting.title,
        endTime: endTimeStr,
        participants: meeting.meetingAttendees?.length || 0,
        status: getMeetingStatus(start, end),
        priority: "medium", // sesuaikan jika perlu
        organizer: meeting.createdBy?.name || "Unknown",
        description: meeting.description,
        duration,
      };
    });

    return [
      {
        id: room?.id,
        name: room?.name,
        location: room?.location,
        capacity: room?.capacity,
        meetings: meetingsByTime,
      },
    ];
  }

  function getMeetingStatus(start, end) {
    const now = new Date();
    if (now < start) return "mendatang";
    if (now >= start && now <= end) return "berlangsung";
    return "selesai";
  }

  useEffect(() => {
    if (userData && userData.id) {
      setFormDataBookingRoom((prev) => ({
        ...prev,
        createdById: userData.id,
      }));
      async function loadNotification() {
        try {
          const data = await fetchNotificationList(userData.id);
          setDataNotification(data);
        } catch (error) {
          alert(error.message);
        }
      }
      loadNotification(userData.id);
    }
  }, [userData]);

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
    async function loadUser() {
      try {
        const data = await fetchMe();
        setUserData(data);
      } catch (error) {
        alert(error.message);
      }
    }
    async function loadEmployee() {
      try {
        const data = await fetchEmployeeList();
        setEmployeeOptions(
          data.map((pegawai) => ({
            label: pegawai.name,
            value: pegawai.id,
          }))
        );
      } catch (error) {
        alert(error.message);
      }
    }
    async function loadUnit() {
      try {
        const data = await fetchUnitList();
        setUnitOptions(data);
      } catch (error) {
        alert(error.message);
      }
    }
    async function loadRooms() {
      try {
        const data = await fetchRoomList(); // pastikan ini include meetings
        const transformed = transformRooms(data);
        console.log("ini data rooms asli", data);
        console.log("inii trans", transformed);
        setRoomsOptions(data);
        setDataRoomsToday(transformed);
      } catch (error) {
        alert(error.message);
      }
    }

    function generateSlots(start = 8, end = 17, interval = 1) {
      const generatedSlots = [];

      if (end <= start || interval <= 0) {
        console.error("Parameter waktu tidak valid");
        setAllSlots([]);
        return;
      }

      for (let i = start; i < end; i += interval) {
        const startHour = i.toString().padStart(2, "0") + ":00";
        generatedSlots.push(startHour);
      }

      // Tambahkan jam akhir sebagai batas maksimal untuk waktu selesai
      generatedSlots.push(end.toString().padStart(2, "0") + ":00");

      setAllSlots(generatedSlots);
    }

    loadUser();
    generateSlots();
    loadEmployee();
    loadUnit();
    loadRooms();
  }, []);

  useEffect(() => {
    if (userData && userData.id) {
      async function loadMeetings() {
        try {
          const data = await fetchMeetingList(userData.id);
          console.log("ini data raw meetingss", data);
          setDataMeetings(data);
        } catch (error) {
          alert(error.message);
        }
      }
      loadMeetings();
    }
  }, [userData]);

  console.log("ini user data", userData);

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await fetchRoomList(); // pastikan ini include meetings
        const transformedSelectedTanggal =
          transformRoomsSelectedTanggalAndSelectedRoom(
            data,
            formDataBookingRoom
          );
        console.log("ini data rooms asli", data);
        console.log("inii trans selected tanggal", transformedSelectedTanggal);
        setDataRoomsSelectedTanggal(transformedSelectedTanggal);
      } catch (error) {
        alert(error.message);
      }
    }

    loadRooms();
  }, [formDataBookingRoom.tanggal]);

  useEffect(() => {
    setFormDataBookingRoom((prev) => ({
      ...prev,
      tanggal: "",
      waktuMulai: "",
      waktuSelesai: "",
    }));
  }, [formDataBookingRoom.ruangan]);

  useEffect(() => {
    if (!dataMeetings || dataMeetings.length === 0) return;

    const today = new Date();
    const isSameDay = (date1, date2) =>
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();

    const formattedToday = today.toISOString().split("T")[0];

    const todayList = [];
    const upcomingList = [];

    let nearest = null;
    let nearestDiff = Infinity;

    for (const m of dataMeetings) {
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
        priority: "medium", // or determine from data
        status: getStatus(startTime, endTime, today),
        type: m.type ? m.type : "offline",
      };

      if (isSameDay(startTime, today)) {
        todayList.push(meeting);

        const diff = Math.abs(startTime.getTime() - today.getTime());
        if (diff < nearestDiff && startTime >= today) {
          nearest = {
            id: m.id,
            title: m.title,
            jenisRapat: m.type ? m.type : "Offline",
            statusRapat: getStatus(startTime, endTime, today, true),
            tanggal: today.toLocaleDateString("id-ID", {
              weekday: "long", // tampilkan nama hari
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            time,
            endTime: end,
            ruangan: m.room?.name,
            linkMeet: m.linkMeet || "-", // fallback if no online link
          };
          nearestDiff = diff;
        }
      } else if (startTime > today) {
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
          type: m.type ? m.type : "Offline",
        });
      }
    }

    setTodayMeetings(todayList);
    setUpcomingMeetings(upcomingList);
    setNearestMeeting(nearest);
  }, [dataMeetings]);

  console.log("ini data rooms selected tanggal", dataRoomsSelectedTanggal);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setNotificationCount(
      dataNotification.filter((data) => data.isRead === false).length
    );
  }, [dataNotification]);

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

  const handleChange = (e) => {
    setFormDataBookingRoom({
      ...formDataBookingRoom,
      [e.target.name]: e.target.value,
    });
  };

  console.log("inih form", formDataBookingRoom);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const meetingRes = await createMeeting({
        penyelenggara: formDataBookingRoom.penyelenggara,
        namaRapat: formDataBookingRoom.namaRapat,
        tanggal: formDataBookingRoom.tanggal,
        waktuMulai: formDataBookingRoom.waktuMulai,
        waktuSelesai: formDataBookingRoom.waktuSelesai,
        lokasi: formDataBookingRoom.lokasi,
        ruangan: formDataBookingRoom.ruangan,
        jenisRapat: formDataBookingRoom.jenisRapat,
        linkMeet:
          formDataBookingRoom.jenisRapat === "Online"
            ? formDataBookingRoom.linkMeet
            : "",
        kapasitas: formDataBookingRoom.kapasitas,
        catatan: formDataBookingRoom.catatan,
        pesertaRapat: formDataBookingRoom.pesertaRapat,
        kirimUndanganEmail: formDataBookingRoom.kirimUndanganEmail,
        createdById: formDataBookingRoom.createdById,
      });

      console.log("Form submitted:", meetingRes);
      toast.success("Ruangan Berhasil Di Booking.");
      setShowPopup(false);
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Terjadi kesalahan saat memproses booking."
      );
    }
  };

  const handleSearch = () => {
    const results = todayMeetings.filter((meeting) =>
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  };

  const handleShowDetail = (meeting) => {
    const fullMeeting = dataMeetings.find((m) => m.id === meeting.id);
    if (fullMeeting) {
      setSelectedMeeting(fullMeeting);
    } else {
      // fallback ke meeting yang dikirim kalau tidak ketemu (optional)
      setSelectedMeeting(meeting);
    }
    setShowDetailPopup(true);
  };

  console.log("ini selected meeting detail", selectedMeeting);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const renderStatus = (status) => {
    const statusConfig = {
      ongoing: { text: "Berlangsung", color: "bg-green-500", icon: PlayCircle },
      upcoming: { text: "Mendatang", color: "bg-blue-500", icon: Clock },
      completed: { text: "Selesai", color: "bg-gray-400", icon: CheckCircle },
    };

    const config = statusConfig[status] || statusConfig.upcoming;

    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
        <span className="text-xs font-medium text-gray-700">{config.text}</span>
      </div>
    );
  };

  const filteredMeetings = todayMeetings.filter((meeting) => {
    if (activeFilter === "all") return true;
    return meeting.status === activeFilter;
  });

  const closeModalBook = () => {
    setFormDataBookingRoom({
      penyelenggara: "",
      namaRapat: "",
      tanggal: "",
      waktuMulai: "",
      waktuSelesai: "",
      lokasi: "",
      ruangan: "",
      jenisRapat: "Offline",
      linkMeet: "",
      kapasitas: "",
      catatan: "",
      pesertaRapat: [],
      kirimUndanganEmail: false,
      createdById: userData?.id || "", // tambahkan ini
    });
    setShowPopup(false);
  };

  const closeModalDetail = () => {
    setSelectedMeeting(null);
    setSelectedTimeSlot(null);
    setShowDetailPopup(false);
  };

  const isSlotRangeAvailable = (start, end, booked, all) => {
    const startIdx = all.indexOf(start);
    const endIdx = all.indexOf(end);

    for (let i = startIdx; i < endIdx; i++) {
      if (booked.includes(all[i])) {
        return false;
      }
    }
    return true;
  };

  const getAvailableEndSlots = () => {
    if (!formDataBookingRoom.waktuMulai || !formDataBookingRoom.tanggal)
      return [];

    const selectedRoom = dataRoomsSelectedTanggal?.[0];
    const selectedDate = new Date(formDataBookingRoom.tanggal);
    const startIdx = allSlots.indexOf(formDataBookingRoom.waktuMulai);

    const availableSlots = [];

    for (let endIdx = startIdx + 1; endIdx < allSlots.length; endIdx++) {
      const startTimeStr = allSlots[startIdx];
      const endTimeStr = allSlots[endIdx]; // ✅ ini akses langsung slot selanjutnya

      const [startHour, startMinute] = startTimeStr.split(":").map(Number);
      const [endHour, endMinute] = endTimeStr.split(":").map(Number);

      const bookingStart = new Date(selectedDate);
      bookingStart.setHours(startHour, startMinute, 0, 0);

      const bookingEnd = new Date(selectedDate);
      bookingEnd.setHours(endHour, endMinute, 0, 0);

      const hasConflict = Object.entries(selectedRoom?.meetings || {}).some(
        ([meetingStartStr, meeting]) => {
          const [mStartH, mStartM] = meetingStartStr.split(":").map(Number);
          const [mEndH, mEndM] = meeting.endTime.split(":").map(Number);

          const meetingStart = new Date(selectedDate);
          meetingStart.setHours(mStartH, mStartM, 0, 0);

          const meetingEnd = new Date(selectedDate);
          meetingEnd.setHours(mEndH, mEndM, 0, 0);

          return bookingStart < meetingEnd && bookingEnd > meetingStart;
        }
      );

      if (hasConflict) break;

      availableSlots.push(endTimeStr);
    }

    return availableSlots;
  };

  const handleSlotClick = (room, timeSlot) => {
    console.log(
      "ini meeting raw",
      room,
      timeSlot,
      room?.meetings?.[timeSlot.start]
    );

    if (room?.meetings?.[timeSlot.start]) {
      // Kalau sudah ada meeting → tampilkan detail, bukan booking baru
      handleShowDetail(room?.meetings?.[timeSlot.start]);
      return;
    }

    setFormDataBookingRoom((prev) => ({
      ...prev,
      ruangan: room?.id || "",
    }));

    setTimeout(() => {
      setFormDataBookingRoom((prev) => ({
        ...prev,
        tanggal: new Date().toISOString().split("T")[0],
      }));

      setTimeout(() => {
        setFormDataBookingRoom((prev) => ({
          ...prev,
          waktuMulai: timeSlot.start,
          waktuSelesai: timeSlot.end,
        }));

        setTimeout(() => {
          setFormDataBookingRoom((prev) => ({
            ...prev,
            lokasi: room?.location || "",
            kapasitas: room?.capacity || "",
            penyelenggara: "",
            namaRapat: "",
            jenisRapat: "Offline",
            linkMeet: "",
            catatan: "",
            pesertaRapat: [],
            kirimUndanganEmail: false,
          }));

          setShowPopup(true);
        }, 50); // step 4
      }, 50); // step 3
    }, 50); // step 2
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:00`;
  };
  const getSlotStatus = (room, timeSlot) => {
    const meeting = room?.meetings?.[timeSlot];
    if (!meeting) return "available";

    const currentHour = new Date().getHours();
    const slotHour = parseInt(timeSlot.split(":")[0]);
    const endHour = slotHour + meeting.duration;

    if (currentHour >= slotHour && currentHour < endHour) {
      return "ongoing";
    } else if (currentHour < slotHour) {
      return "upcoming";
    } else {
      return "finished";
    }
  };

  const isSlotSpanned = (room, timeSlot) => {
    if (!room || !timeSlot || !room.meetings) return false;

    const slotHour = parseInt(timeSlot.split(":")[0]);

    for (const [startTime, meeting] of Object.entries(room.meetings)) {
      const startHour = parseInt(startTime.split(":")[0]);
      const endHour = startHour + meeting.duration;

      if (slotHour > startHour && slotHour < endHour) {
        return true;
      }
    }

    return false;
  };

  const getSlotSpan = (meeting) => {
    return Math.ceil(meeting.duration);
  };
  const getSlotColor = (status, meeting) => {
    if (status === "available") {
      return "bg-gray-50 hover:bg-green-50 border-gray-200 hover:border-green-300";
    }

    const priorityColors = {
      high: "border-red-300",
      medium: "border-yellow-300",
      low: "border-green-300",
    };

    switch (status) {
      case "ongoing":
        return `bg-green-100 border-2 ${
          priorityColors[meeting?.priority]
        } text-green-800`;
      case "upcoming":
        return `bg-blue-100 border-2 ${
          priorityColors[meeting?.priority]
        } text-blue-800`;
      case "finished":
        return `bg-gray-100 border-2 ${
          priorityColors[meeting?.priority]
        } text-gray-600`;
      default:
        return "bg-gray-50 hover:bg-green-50 border-gray-200";
    }
  };

  const closeDetail = () => {
    setSelectedTimeSlot(null);
  };
  const logoutHandle = () => {
    document.cookie = "authKAI=; max-age=0; path=/;";
    window.location.reload();
  };

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const handleCalendarDayClick = (day) => {
    if (!day) return;

    const year = calendarMonth.getFullYear(); // ✅ pakai calendarMonth
    const month = calendarMonth.getMonth();

    const dateObj = new Date(Date.UTC(year, month, day, 0, 0, 0));
    dateObj.setUTCHours(dateObj.getUTCHours() + 7); // convert ke WIB

    setSelectedDate(dateObj.toISOString().split("T")[0]); // format: YYYY-MM-DD
  };

  // Filter events sesuai tanggal yang dipilih
  const [selYear, selMonth, selDay] = selectedDate.split("-").map(Number);
  const eventsForSelectedDate = dataMeetings.filter((m) => {
    const startTime = new Date(m.startTime);
    return (
      startTime.getFullYear() === selYear &&
      startTime.getMonth() === selMonth - 1 &&
      startTime.getDate() === selDay
    );
  });

  console.log("iniiiiiii", eventsForSelectedDate);

  const [now] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const closeNotificationModal = () => {
    setIsModalNotificationOpen(false);
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
              { icon: Clock, label: "Jadwal", href: "/jadwal", active: true },
              {
                icon: Settings,
                label: "Pengaturan & Profil",
                href: "/pengaturan",
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

      {/* Main Content */}
      <main className="ml-60 min-h-screen">
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

        {/* Jadwal Kalender */}
        <div className="p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Kalender */}
              <div className="bg-white rounded-xl p-6 flex-1 shadow-lg">
                <div className="flex items-center text-black justify-between mb-6">
                  <button
                    className="bg-[#ff7b00] text-white text-lg px-3 py-2 rounded-md cursor-pointer transition hover:bg-[#e06900] border-none"
                    onClick={() =>
                      setCalendarMonth(
                        new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth() - 1,
                          1
                        )
                      )
                    }
                  >
                    ‹
                  </button>

                  <h2 className="m-0 text-xl text-gray-900 font-bold">
                    {calendarMonth.toLocaleString("id-ID", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>

                  <button
                    onClick={() =>
                      setCalendarMonth(
                        new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth() + 1,
                          1
                        )
                      )
                    }
                    className="bg-[#ff7b00] text-white text-lg px-3 py-2 rounded-md cursor-pointer transition hover:bg-[#e06900] border-none"
                  >
                    ›
                  </button>
                </div>
                {/* Kalender grid */}
                <div>
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(
                      (d) => (
                        <div
                          key={d}
                          className="text-center font-semibold text-gray-700 py-3 text-sm"
                        >
                          {d}
                        </div>
                      )
                    )}
                  </div>
                  <div className="grid grid-cols-7 gap-2 bg-transparent">
                    {(() => {
                      // Generate days for current month
                      const year = calendarMonth.getFullYear();
                      const month = calendarMonth.getMonth();

                      const firstDay = new Date(year, month, 1);
                      const lastDay = new Date(year, month + 1, 0);
                      const daysInMonth = lastDay.getDate();
                      const startDay = (firstDay.getDay() + 6) % 7; // Senin = 0

                      const days = [];
                      for (let i = 0; i < startDay; i++) days.push(null);
                      for (let d = 1; d <= daysInMonth; d++) days.push(d);

                      return days.map((day, idx) => {
                        let isSelected = false;
                        if (day) {
                          const [selYear, selMonth, selDay] = selectedDate
                            .split("-")
                            .map(Number);
                          const thisDate = new Date(year, month, day);
                          // selectedDate bentuknya "YYYY-MM-DD"
                          isSelected =
                            day &&
                            selYear === year &&
                            selMonth - 1 === month && // karena bulan di JS 0-based
                            selDay === day;
                        }

                        return (
                          <div
                            key={idx}
                            className={[
                              "flex items-center justify-center rounded-lg border-2 transition-all min-h-[45px] text-base cursor-pointer",
                              day
                                ? isSelected
                                  ? "bg-[#ff7b00] text-white font-bold border-[#e06900]" // active state
                                  : "bg-[#f8f9fa] hover:bg-[#eaeaea] text-gray-900" // hover only if not selected
                                : "bg-transparent cursor-default",
                              isSelected ? "" : "border-transparent",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            onClick={() => handleCalendarDayClick(day)}
                          >
                            {day || ""}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Events */}
              <div className="bg-white rounded-xl flex-1 max-w-md h-[500px] shadow-lg relative overflow-hidden">
                {/* Header sticky dengan backdrop yang solid dan shadow */}
                <div className="sticky top-0 bg-white px-6 pt-6 pb-3 z-30">
                  <h3 className="text-gray-900 text-lg font-bold">Events</h3>
                </div>

                {/* Container untuk scrollable content */}
                <div className="h-[calc(100%-80px)] overflow-y-auto px-6">
                  {/* Subheader sticky dengan backdrop yang solid */}
                  <div className="sticky top-0 bg-white pt-3 pb-3 mb-4 z-20 -mx-6 px-6">
                    <h4 className="text-base font-semibold text-gray-800">
                      {selectedDate
                        ? new Date(selectedDate).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Pilih tanggal"}
                    </h4>
                  </div>

                  {/* Content area dengan padding bottom untuk space */}
                  <div className="flex flex-col gap-4 pb-6">
                    {eventsForSelectedDate.length > 0 ? (
                      eventsForSelectedDate.map((event, index) => {
                        const type = event.type ?? "Offline"; // default ke offline jika null
                        return (
                          <div
                            key={index}
                            className="p-4 bg-[#f8f9fa] rounded-lg border-l-4 border-[#ff7b00] transition hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {event.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {event.startTime
                                    ? new Date(
                                        event.startTime
                                      ).toLocaleTimeString("id-ID", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                        timeZone: "Asia/Jakarta",
                                      })
                                    : "-"}
                                  {" - "}
                                  {event.endTime
                                    ? new Date(
                                        event.endTime
                                      ).toLocaleTimeString("id-ID", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                        timeZone: "Asia/Jakarta",
                                      })
                                    : "-"}
                                  {" WIB"}
                                </p>

                                {/* Tampilkan type rapat */}
                                <p className="text-xs text-gray-500 italic mt-1">
                                  Tipe Rapat: {type}
                                </p>

                                {/* Tampilkan lokasi/link berdasarkan type */}
                                <div className="mt-1 space-y-1">
                                  {(type === "Online" || type === "Hybrid") &&
                                    event.linkMeet && (
                                      <a
                                        href={
                                          event.linkMeet.startsWith(
                                            "http://"
                                          ) ||
                                          event.linkMeet.startsWith("https://")
                                            ? event.linkMeet
                                            : `https://${event.linkMeet}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline break-all"
                                      >
                                        {event.linkMeet.startsWith("http://") ||
                                        event.linkMeet.startsWith("https://")
                                          ? event.linkMeet
                                          : `https://${event.linkMeet}`}
                                      </a>
                                    )}

                                  {(type === "Offline" || type === "Hybrid") &&
                                    event.room?.name && (
                                      <p className="text-sm text-gray-600">
                                        Ruang {event.room.name}
                                      </p>
                                    )}
                                </div>
                              </div>

                              <button
                                onClick={() => handleShowDetail(event)}
                                className="px-3 py-1 cursor-pointer bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                              >
                                Detail
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="italic text-gray-400">
                        Tidak ada meeting pada tanggal ini.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Book Room Popup */}
      {showPopup && (
        <div className="fixed text-black text-sm inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20 backdrop-blur-md"
            onClick={closeModalBook}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl px-8 py-6 w-full max-w-4xl h-[90vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="flex-shrink-0">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h2 className="text-xl font-bold text-gray-900 ">
                  Booking Ruangan
                </h2>
                <button
                  onClick={closeModalBook}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content - Scrollable but optimized */}
            <div className="flex-1 min-h-0 pt-2">
              <div className="py-2 space-y-4 h-full overflow-y-auto">
                {/* Row 1: Basic Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nama Rapat *
                    </label>
                    <input
                      type="text"
                      name="namaRapat"
                      value={formDataBookingRoom.namaRapat}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan nama rapat"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Penyelenggara *
                    </label>
                    <select
                      name="penyelenggara"
                      value={formDataBookingRoom.penyelenggara}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option disabled value="">
                        Pilih Unit
                      </option>
                      {unitOptions.map((data) => (
                        <option key={data.id} value={data.id}>
                          {data.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ruangan *
                    </label>
                    <select
                      name="ruangan"
                      value={formDataBookingRoom.ruangan}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="" disabled>
                        Pilih Ruangan
                      </option>
                      {roomsOptions.map((data) => (
                        <option key={data.id} value={data.id}>
                          {data.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Deskripsi Rapat
                  </label>
                  <textarea
                    type="text"
                    name="catatan"
                    value={formDataBookingRoom.agendaRapat}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan deskripsi rapat"
                  />
                </div>

                {/* Row 2: Date & Time */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tanggal *
                    </label>
                    <input
                      disabled={formDataBookingRoom.ruangan === ""}
                      type="date"
                      name="tanggal"
                      value={formDataBookingRoom.tanggal}
                      onChange={(e) =>
                        setFormDataBookingRoom((prev) => ({
                          ...prev,
                          tanggal: e.target.value,
                          waktuMulai: "",
                          waktuSelesai: "",
                        }))
                      }
                      className={`w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                        ${
                          formDataBookingRoom.ruangan === ""
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                            : "border-gray-300"
                        }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Jam Mulai *
                    </label>
                    <select
                      value={formDataBookingRoom.waktuMulai}
                      onChange={(e) =>
                        setFormDataBookingRoom((prev) => ({
                          ...prev,
                          waktuMulai: e.target.value,
                          waktuSelesai: "",
                        }))
                      }
                      disabled={
                        formDataBookingRoom.tanggal === "" ||
                        formDataBookingRoom.ruangan === ""
                      }
                      className={`w-full text-sm border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formDataBookingRoom.tanggal === "" ||
                        formDataBookingRoom.ruangan === ""
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Pilih Jam</option>
                      {allSlots
                        .filter((slot, index, arr) => {
                          const selectedRoom = dataRoomsSelectedTanggal?.[0];
                          const [slotHour, slotMinute] = slot
                            .split(":")
                            .map(Number);

                          // 1️⃣ Cek apakah ada slot setelah ini
                          const isLastSlot = index === arr.length - 1;
                          if (isLastSlot) return false; // ❌ Jangan tampilkan slot terakhir sebagai jam mulai

                          // 2️⃣ Waktu slot berdasarkan tanggal yang dipilih
                          const selectedDate = new Date(
                            formDataBookingRoom.tanggal
                          );
                          const slotDateTime = new Date(selectedDate);
                          slotDateTime.setHours(slotHour, slotMinute, 0, 0);

                          const now = new Date();
                          const isPastTime = slotDateTime < now;

                          // 3️⃣ Cek apakah slot bentrok dengan meeting
                          const isConflict = Object.values(
                            selectedRoom?.meetings || {}
                          ).some((meeting) => {
                            const startKey = Object.keys(
                              selectedRoom.meetings
                            ).find(
                              (key) =>
                                selectedRoom.meetings[key].id === meeting.id
                            );

                            const [startH, startM] = startKey
                              .split(":")
                              .map(Number);
                            const [endH, endM] = meeting.endTime
                              .split(":")
                              .map(Number);

                            const startDateTime = new Date(selectedDate);
                            startDateTime.setHours(startH, startM, 0, 0);

                            const endDateTime = new Date(selectedDate);
                            endDateTime.setHours(endH, endM, 0, 0);

                            return (
                              slotDateTime >= startDateTime &&
                              slotDateTime < endDateTime
                            );
                          });

                          return !isPastTime && !isConflict;
                        })
                        .map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Jam Selesai *
                    </label>
                    <select
                      value={formDataBookingRoom.waktuSelesai}
                      onChange={(e) =>
                        setFormDataBookingRoom((prev) => ({
                          ...prev,
                          waktuSelesai: e.target.value,
                        }))
                      }
                      disabled={
                        formDataBookingRoom.waktuMulai === "" ||
                        formDataBookingRoom.tanggal === "" ||
                        formDataBookingRoom.ruangan === ""
                      }
                      className={`w-full text-sm border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formDataBookingRoom.waktuMulai === "" ||
                        formDataBookingRoom.tanggal === "" ||
                        formDataBookingRoom.ruangan === ""
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Pilih Jam</option>
                      {getAvailableEndSlots().map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Time Slots Visualization */}
                {formDataBookingRoom.tanggal !== "" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Status Slot Waktu
                    </label>
                    <div className="grid grid-cols-9 gap-1 mt-2">
                      {timeSlots.map((timeSlot, index) => {
                        const meeting =
                          dataRoomsSelectedTanggal?.[0]?.meetings?.[
                            timeSlot.key
                          ] || null;

                        const isSpanned = isSlotSpanned(
                          dataRoomsSelectedTanggal[0],
                          timeSlot.key
                        );

                        if (isSpanned) return null;

                        const status = meeting
                          ? getSlotStatus(
                              dataRoomsSelectedTanggal[0],
                              timeSlot.key
                            )
                          : "available";
                        const colSpan = meeting ? getSlotSpan(meeting) : 1;
                        const selectedDate = new Date(
                          formDataBookingRoom.tanggal
                        );
                        const slotTime = new Date(selectedDate);
                        const [slotHour, slotMinute] = timeSlot.key
                          .split(":")
                          .map(Number);
                        slotTime.setHours(slotHour, slotMinute, 0, 0);

                        const now = new Date();
                        const isCurrentTime =
                          now.toDateString() === slotTime.toDateString() &&
                          now.getHours() === slotTime.getHours();

                        const isPastTime = now > slotTime;

                        return (
                          <button
                            key={timeSlot.key}
                            className={`
                relative p-1.5 rounded text-xs transition-all min-h-[50px] border
                ${getSlotColor(status, meeting)}
                ${isCurrentTime ? "ring-1 ring-blue-500" : ""}
                ${
                  isPastTime && !meeting
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:shadow-sm"
                }
              `}
                            style={
                              colSpan > 1
                                ? { gridColumn: `span ${colSpan}` }
                                : {}
                            }
                          >
                            {/* Current Time Indicator */}
                            {isCurrentTime && (
                              <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2">
                                <div className="bg-blue-500 text-white text-[6px] px-0.5 py-0.5 rounded-full font-bold">
                                  Sekarang
                                </div>
                              </div>
                            )}

                            <div className="text-center">
                              <div className="font-mono text-[10px] mb-1 font-semibold">
                                {meeting && colSpan > 1
                                  ? `${timeSlot.start}-${meeting.endTime}`
                                  : timeSlot.label}
                              </div>

                              {meeting ? (
                                <div className="space-y-0.5">
                                  <div className="font-medium text-[10px] leading-tight truncate">
                                    {meeting.title}
                                  </div>
                                  <div className="text-[8px] flex justify-center opacity-75">
                                    {meeting.participants}
                                    <Users size={10} />
                                  </div>
                                  {colSpan > 1 && (
                                    <div className="text-[8px] opacity-50">
                                      {meeting.duration}h
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-gray-400 text-[10px]">
                                  {isPastTime ? "Telah Lewat" : "Tersedia"}
                                </div>
                              )}
                            </div>

                            {/* Priority dot - smaller */}
                            {meeting && meeting.priority && (
                              <div
                                className={`absolute top-1 right-1 w-1 h-1 rounded-full ${
                                  meeting.priority === "high"
                                    ? "bg-red-500"
                                    : meeting.priority === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                              />
                            )}

                            {/* Duration bar - thinner */}
                            {meeting && colSpan > 1 && (
                              <div className="absolute bottom-0.5 left-0.5 right-0.5 h-0.5 bg-black bg-opacity-20 rounded-full">
                                <div
                                  className="h-full bg-white bg-opacity-50 rounded-full"
                                  style={{ width: "100%" }}
                                ></div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Row 4: Participants & Meeting Type */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Peserta Rapat *
                    </label>
                    <Select
                      inputId="meeting-atendee"
                      name="pesertaRapat"
                      options={employeeOptions}
                      value={employeeOptions.filter((opt) =>
                        formDataBookingRoom.pesertaRapat?.includes(opt.value)
                      )}
                      onChange={(selectedOptions) => {
                        setFormDataBookingRoom((prev) => ({
                          ...prev,
                          pesertaRapat: selectedOptions
                            ? selectedOptions.map((opt) => opt.value)
                            : [],
                        }));
                      }}
                      isMulti
                      className="text-sm text-black"
                      classNamePrefix="react-select"
                      placeholder="Pilih Peserta..."
                      isSearchable
                      menuPlacement="auto"
                      styles={{
                        menuList: (base) => ({
                          ...base,
                          maxHeight: 200, // misalnya tinggi sekitar 5 item
                          overflowY: "auto",
                        }),
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Jenis Rapat *
                    </label>
                    <div className="flex space-x-4 mt-2">
                      {[
                        { value: "Offline", icon: Users, label: "Offline" },
                        { value: "Online", icon: Video, label: "Online" },
                        { value: "Hybrid", icon: Monitor, label: "Hybrid" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-1 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="jenisRapat"
                            value={option.value}
                            checked={
                              formDataBookingRoom.jenisRapat === option.value
                            }
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <option.icon size={16} className="text-gray-600" />
                          <span className="text-xs text-gray-700">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 5: Meeting Link & Email Invitation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {(formDataBookingRoom.jenisRapat === "Online" ||
                    formDataBookingRoom.jenisRapat === "Hybrid") && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Link Meeting *
                      </label>
                      <input
                        type="url"
                        name="linkMeet"
                        value={formDataBookingRoom.linkMeet}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://meet.google.com/..."
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Kirim Undangan Meeting ke Email Peserta? *
                    </label>
                    <div className="flex items-center space-x-4 mt-2">
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="kirimUndanganEmail"
                          value="true"
                          checked={
                            formDataBookingRoom.kirimUndanganEmail === true
                          }
                          onChange={() =>
                            setFormDataBookingRoom((prev) => ({
                              ...prev,
                              kirimUndanganEmail: true,
                            }))
                          }
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">Ya</span>
                      </label>

                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="kirimUndanganEmail"
                          value="false"
                          checked={
                            formDataBookingRoom.kirimUndanganEmail === false
                          }
                          onChange={() =>
                            setFormDataBookingRoom((prev) => ({
                              ...prev,
                              kirimUndanganEmail: false,
                            }))
                          }
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">Tidak</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="flex-shrink-0 border-t border-gray-100">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModalBook}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-3 py-1 bg-[#ff7729] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Buat Rapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Popup */}
      {showSearchPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Find Your Meeting
                </h2>
                <button
                  onClick={() => setShowSearchPopup(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Cari nama meeting..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg transition-all"
              >
                Search Now
              </button>

              {searchResults.length > 0 && (
                <div className="space-y-3 mt-6">
                  {searchResults.map((meeting, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {meeting.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {meeting.time} - {meeting.endTime}
                          </p>
                          <p className="text-sm text-gray-600">
                            Ruang {meeting.room?.name}
                          </p>
                        </div>
                        <button
                          onClick={() => handleShowDetail(meeting)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDetailPopup && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 backdrop-blur-md"
            onClick={closeModalDetail}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Detail Rapat</h2>
              <button
                onClick={closeModalDetail}
                className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content Area */}
            <div className="px-6 py-4 space-y-4 overflow-y-auto max-h-[calc(95vh-200px)]">
              {/* Info Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Location Card */}
                <div className="bg-gradient-to-br from-[#f0f0f2] to-[#ffffff] border border-gray-200 rounded-2xl p-4">
                  {selectedMeeting.room && selectedMeeting.linkMeet ? (
                    // HYBRID
                    <>
                      <div className="flex items-start justify-between mb-3">
                        {/* Lokasi */}
                        <div className="flex items-center space-x-3">
                          <div className="p-1.5 bg-[#1b68b0] text-white rounded-lg">
                            <MapPin size={16} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">
                              Lokasi
                            </h4>
                            <p className="text-xs text-gray-600">
                              {selectedMeeting.room.location}
                            </p>
                          </div>
                        </div>

                        {/* Nama Ruang & Kapasitas */}
                        <div className="text-right text-gray-800">
                          <p className="font-medium text-sm">
                            {selectedMeeting.room.name}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Kapasitas:{" "}
                            <span className="font-medium">
                              {selectedMeeting.room.capacity} orang
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Link Meet */}
                      <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-[#1b68b0] text-white rounded-lg">
                          <LinkIcon size={16} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            Link Meeting
                          </h4>
                          <a
                            href={
                              selectedMeeting.linkMeet.startsWith("http://") ||
                              selectedMeeting.linkMeet.startsWith("https://")
                                ? selectedMeeting.linkMeet
                                : `https://${selectedMeeting.linkMeet}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline cursor-pointer break-all"
                          >
                            {selectedMeeting.linkMeet.startsWith("http://") ||
                            selectedMeeting.linkMeet.startsWith("https://")
                              ? selectedMeeting.linkMeet
                              : `https://${selectedMeeting.linkMeet}`}
                          </a>
                        </div>
                      </div>
                    </>
                  ) : selectedMeeting.room ? (
                    // OFFLINE ONLY
                    <>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-1.5 bg-[#1b68b0] text-white rounded-lg">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            Lokasi
                          </h4>
                          <p className="text-xs text-gray-600">
                            {selectedMeeting.room.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-gray-800">
                        <p className="font-medium text-sm">
                          {selectedMeeting.room.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Kapasitas:{" "}
                          <span className="font-medium">
                            {selectedMeeting.room.capacity} orang
                          </span>
                        </p>
                      </div>
                    </>
                  ) : selectedMeeting.linkMeet ? (
                    // ONLINE ONLY
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 bg-[#1b68b0] text-white rounded-lg">
                        <LinkIcon size={16} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          Link Meeting
                        </h4>
                        <a
                          href={
                            selectedMeeting.linkMeet.startsWith("http://") ||
                            selectedMeeting.linkMeet.startsWith("https://")
                              ? selectedMeeting.linkMeet
                              : `https://${selectedMeeting.linkMeet}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline cursor-pointer break-all"
                        >
                          {selectedMeeting.linkMeet.startsWith("http://") ||
                          selectedMeeting.linkMeet.startsWith("https://")
                            ? selectedMeeting.linkMeet
                            : `https://${selectedMeeting.linkMeet}`}
                        </a>
                      </div>
                    </div>
                  ) : (
                    // No Info
                    <p className="text-sm text-gray-600 italic">
                      Informasi lokasi atau link tidak tersedia.
                    </p>
                  )}
                </div>

                {/* Organizer Card */}
                <div className="bg-gradient-to-br from-[#f0f0f2] to-[#ffffff] border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-1.5 bg-[#ff7729] text-white rounded-lg">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        Penyelenggara
                      </h4>
                      <p className="text-xs text-gray-600">Unit Kerja</p>
                    </div>
                  </div>
                  <p className="text-gray-800 font-medium text-sm">
                    {selectedMeeting.organizerUnit.name}
                  </p>
                </div>

                {/* Participants Card */}
                <div className="bg-gradient-to-br from-[#f0f0f2] to-[#ffffff] border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-1.5 bg-[#1b68b0] text-white rounded-lg">
                      <Users size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        Peserta
                      </h4>
                      <p className="text-xs text-gray-600">Total Peserta</p>
                    </div>
                  </div>
                  <p className="text-gray-800">
                    <span className="text-xl font-bold text-[#1b68b0]">
                      {selectedMeeting.meetingAttendees.length}
                    </span>
                    <span className="text-gray-600 ml-1 text-sm">peserta</span>
                  </p>
                </div>

                {/* Duration Card */}
                <div className="bg-gradient-to-br from-[#f0f0f2] to-[#ffffff] border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-1.5 bg-[#ff7729] text-white rounded-lg">
                      <Clock size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        Durasi
                      </h4>
                      <p className="text-xs text-gray-600">Waktu Rapat</p>
                    </div>
                  </div>
                  <p className="text-gray-800 font-medium text-sm">
                    {Math.round(
                      (new Date(selectedMeeting.endTime) -
                        new Date(selectedMeeting.startTime)) /
                        (1000 * 60)
                    )}{" "}
                    menit
                  </p>
                </div>
              </div>

              {/* Description Section */}
              {selectedMeeting.description && (
                <div className="bg-gradient-to-br from-[#f0f0f2] to-[#ffffff] border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-1.5 bg-[#1b68b0] text-white rounded-lg">
                      <FileText size={16} />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Deskripsi Rapat
                    </h4>
                  </div>
                  <div className="bg-[#ffffff] rounded-xl p-3 border border-gray-100">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                      {selectedMeeting.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Footer */}
            <div className="px-8 pb-4 bg-white border-gray-200 rounded-xl">
              <div className="flex items-center justify-end">
                <div className="flex space-x-3">
                  <button
                    onClick={closeModalDetail}
                    className="px-4 bg-[#ff7729] cursor-pointer text-sm py-2 text-white rounded-xl transition-all duration-200 font-medium"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default KaiRoomsApp;
