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
  ChevronLeft,
  Info,
  LinkIcon,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

import NotificationModal from "../../components/NotificationModal";

import Select from "react-select";
import { fetchEmployeeList } from "../../api-client/employee";
import { fetchUnitList } from "../../api-client/unit";
import { fetchRoomList } from "../../api-client/room";
import { fetchBookingList } from "../../api-client/booking";
import {
  fetchNotificationList,
  updatedNotificationRead,
} from "../../api-client/notification";
import { createMeeting, fetchMeetingList } from "../../api-client/meeting";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { set } from "date-fns";
import Image from "next/image";
import { format } from "path";

const KaiRoomsApp = () => {
  const searchParams = useSearchParams();
  const meetingId = searchParams.get("meeting_id");

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
  const [dataMeetingsUser, setDataMeetingsUser] = useState([]);
  const [dataMeetingsAll, setDataMeetingsAll] = useState([]);
  const [todayMeetings, setTodayMeetings] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [nearestMeeting, setNearestMeeting] = useState(null);
  const [dataRoomsToday, setDataRoomsToday] = useState([]);
  const [dataRoomsSelectedTanggal, setDataRoomsSelectedTanggal] = useState([]);
  const [userData, setUserData] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);

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
    deskripsi: "",
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
    mulaiSekarang: false,
    createdById: "",
  });

  const [isModalNotificationOpen, setIsModalNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [dataNotification, setDataNotification] = useState([]);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [typePopUpBook, setTypePopUpBook] = useState("room");
  const [selectedRoom, setSelectedRoom] = useState(undefined);
  const [showConfirmationPopUp, setShowConfirmationPopUp] = useState(false);
  const [confirmationType, setConfirmationType] = useState(""); // "booking", "delete", "cancel", "edit"
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationDetails, setConfirmationDetails] = useState(null);
  const [confirmationWarning, setConfirmationWarning] = useState("");
  const [isConfirmationLoading, setIsConfirmationLoading] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);

  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
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

  function getStatus(start, end, now, forNearest = false) {
    if (!end) {
      // kalau endTime null → dianggap ongoing kalau sudah dimulai
      return start <= now ? "ongoing" : "upcoming";
    }

    if (start <= now && end >= now) return "ongoing";
    if (start > now) return "upcoming";
    if (end < now) return "finished";
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
        const duration = (end - start) / (1000 * 60 * 15); // dalam menit

        meetingsByTime[startTimeStr] = {
          id: meeting.id,
          title: meeting.title,
          startTime: startTimeStr, // 🔥 Tambahin ini
          endTime: endTimeStr, // 🔥 Tambahin ini
          participants: meeting.meetingAttendees?.length || 0,
          status: getMeetingStatus(start, end),
          priority: "medium", // isi sesuai skemamu
          organizer: meeting.createdBy?.name || "Unknown",
          description: meeting.description,
          duration,
        };
      });

      return {
        id: room.id,
        name: room.name,
        location: room.location,
        capacity: room.capacity,
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
      const duration = (end - start) / (1000 * 60 * 15); // dalam 15 menit sama seperti atas

      meetingsByTime[startTimeStr] = {
        id: meeting.id,
        title: meeting.title,
        startTime: startTimeStr, // 🔥 samain kayak atas
        endTime: endTimeStr, // 🔥 samain kayak atas
        participants: meeting.meetingAttendees?.length || 0,
        status: getMeetingStatus(start, end),
        priority: "medium", // isi sesuai skemamu
        organizer: meeting.createdBy?.name || "Unknown",
        description: meeting.description,
        duration,
      };
    });

    return [
      {
        id: room.id,
        name: room.name,
        location: room.location,
        capacity: room.capacity,
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
      async function loadEmployee() {
        try {
          const data = await fetchEmployeeList(userData.id);
          setEmployeeData(data);
        } catch (error) {
          alert(error.message);
        }
      }
      async function loadMeetingsUser() {
        try {
          const data = await fetchMeetingList(userData.id);
          console.log("ini data raw meetingss", data);
          setDataMeetingsUser(data);
        } catch (error) {
          alert(error.message);
        }
      }
      loadNotification();
      loadEmployee();
      loadMeetingsUser();
    }
  }, [userData]);

  useEffect(() => {
    setNotificationCount(
      dataNotification.filter((data) => data.isRead === false).length
    );
  }, [dataNotification]);

  console.log("ini data employee", employeeData);

  const logoutHandle = () => {
    document.cookie = "authKAI=; max-age=0; path=/;";
    window.location.reload();
  };

  console.log("ini data notifi", dataNotification);

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

  console.log("ini timeslots", splitSlotsByMeetings(selectedMeeting));

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
        console.log(data, "Ini employe list");

        const grouped = data.reduce((acc, pegawai) => {
          const unit = pegawai.unit.name || "Tanpa Unit";
          if (!acc[unit]) {
            acc[unit] = [];
          }
          acc[unit].push({
            label: `${pegawai.nipp} ${pegawai.name}`,
            value: pegawai.id,
          });
          return acc;
        }, {});

        const groupedOptions = Object.entries(grouped).map(
          ([unit, employees]) => ({
            label: unit,
            options: [
              { label: `Semua Karyawan Unit ${unit}`, value: `unit_${unit}` }, // opsi nama unit di atas
              ...employees,
            ],
          })
        );

        setEmployeeOptions(groupedOptions);
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

    function generateSlots(start = 0, end = 24, interval = 1) {
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
      generatedSlots.push(end.toString().padStart(2, "0") + ":00");
      setAllSlots(generatedSlots);
    }

    function splitSlotsByMeetings(baseSlots, room) {
      if (!room || !room.meetings) return baseSlots;

      let refinedSlots = [];

      for (let i = 0; i < baseSlots.length - 1; i++) {
        const slotStart = baseSlots[i];
        const slotEnd = baseSlots[i + 1];

        const [sH, sM] = slotStart.split(":").map(Number);
        const [eH, eM] = slotEnd.split(":").map(Number);

        const slotStartDate = new Date();
        slotStartDate.setHours(sH, sM, 0, 0);
        const slotEndDate = new Date();
        slotEndDate.setHours(eH, eM, 0, 0);

        // Cari apakah ada meeting di range ini
        let cuts = [slotStartDate, slotEndDate];
        for (const meeting of Object.values(room.meetings)) {
          const [mStartH, mStartM] = meeting.startTime
            ? meeting.startTime.split(":").map(Number)
            : [0, 0];
          const [mEndH, mEndM] = meeting.endTime
            ? meeting.endTime.split(":").map(Number)
            : [0, 0];

          const mStart = new Date();
          mStart.setHours(mStartH, mStartM, 0, 0);
          const mEnd = new Date();
          mEnd.setHours(mEndH, mEndM, 0, 0);

          if (mStart < slotEndDate && mEnd > slotStartDate) {
            cuts.push(mStart, mEnd);
          }
        }

        // Sortir & remove duplicate
        cuts = [...new Set(cuts.map((d) => d.getTime()))].sort((a, b) => a - b);

        for (let j = 0; j < cuts.length - 1; j++) {
          const subStart = new Date(cuts[j]);
          const subEnd = new Date(cuts[j + 1]);
          refinedSlots.push({
            start: subStart.toTimeString().slice(0, 5),
            end: subEnd.toTimeString().slice(0, 5),
            label: `${subStart.toTimeString().slice(0, 5)}-${subEnd
              .toTimeString()
              .slice(0, 5)}`,
            key: subStart.toTimeString().slice(0, 5),
          });
        }
      }

      console.log("refined", refinedSlots);

      return refinedSlots;
    }

    async function loadMeetingsAll() {
      try {
        const data = await fetchMeetingList();
        setDataMeetingsAll(data);
      } catch (error) {
        alert(error.message);
      }
    }
    loadUser();
    generateSlots();
    loadEmployee();
    loadUnit();
    loadRooms();
    loadMeetingsAll();
  }, []);

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
    if (!dataMeetingsUser || dataMeetingsUser.length === 0) return;

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

    for (const m of dataMeetingsUser) {
      const startTime = new Date(m.startTime);
      const endTime = m.endTime ? new Date(m.endTime) : null;
      const tanggal = startTime.toISOString().split("T")[0];
      const time = startTime.toTimeString().slice(0, 5);

      // format tampilan waktu selesai
      const end = endTime?.toTimeString().slice(0, 5);

      const meeting = {
        id: m.id,
        title: m.title,
        room: m.room?.name,
        unit: m.participants?.[0]?.unit?.name || "-",
        time,
        endTime: end, // bisa "selesai"
        tanggal,
        participants: m.meetingAttendees?.length || 0,
        status: getStatus(startTime, endTime, today),
        type: m.type ? m.type : "offline",
      };

      if (isSameDay(startTime, today)) {
        todayList.push(meeting);

        // === Logic nearest ===
        const isOngoing =
          startTime <= today &&
          // kalau endTime null → ongoing cuma valid kalau tidak ada meeting lain
          ((!endTime &&
            !dataMeetingsUser.some(
              (mm) =>
                isSameDay(new Date(mm.startTime), today) &&
                new Date(mm.startTime) > startTime && // meeting setelahnya
                new Date(mm.startTime) <= today // sudah masuk waktunya
            )) ||
            (endTime && endTime >= today)); // ada endTime & belum selesai

        if (isOngoing) {
          nearest = {
            id: m.id,
            title: m.title,
            jenisRapat: m.type ? m.type : "Offline",
            statusRapat: getStatus(startTime, endTime, today, true),
            tanggal: today.toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            time,
            endTime: end || "selesai", // tampil "selesai" kalau null
            ruangan: m.room?.name,
            linkMeet: m.linkMeet || "-",
          };
          nearestDiff = 0;
        } else if (startTime >= today) {
          const diff = startTime.getTime() - today.getTime();
          if (diff < nearestDiff) {
            nearest = {
              id: m.id,
              title: m.title,
              jenisRapat: m.type ? m.type : "Offline",
              statusRapat: getStatus(startTime, endTime, today, true),
              tanggal: today.toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              time,
              endTime: end || "selesai",
              ruangan: m.room?.name,
              linkMeet: m.linkMeet || "-",
            };
            nearestDiff = diff;
          }
        }

        // === Upcoming list ===
        if (startTime > today) {
          const tanggalFormat = startTime.toLocaleDateString("id-ID", {
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
            unit: m.organizerUnit?.name || "-",
            tanggal: tanggalFormat,
            type: m.type ? m.type : "offline",
          });
        }
      } else if (startTime > today) {
        // Meeting di hari-hari berikutnya
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
    }

    // Urutkan upcoming meetings berdasarkan tanggal dan waktu
    upcomingList.sort((a, b) => {
      const dateA = new Date(a.tanggal + " " + a.time);
      const dateB = new Date(b.tanggal + " " + b.time);
      return dateA - dateB;
    });

    setTodayMeetings(todayList);
    setUpcomingMeetings(upcomingList);
    setNearestMeeting(nearest);
  }, [dataMeetingsUser]);

  console.log("ini data rooms selected tanggal", dataRoomsSelectedTanggal);

  // useEffect(() => {
  //   const timer = setInterval(() => setCurrentTime(new Date()), 1000);
  //   return () => clearInterval(timer);
  // }, []);

  useEffect(() => {
    const jenis = formDataBookingRoom.jenisRapat;

    if (jenis === "Online") {
      setFormDataBookingRoom((prev) => ({
        ...prev,
        ruangan: "",
        tanggal: "",
        waktuMulai: "",
        waktuSelesai: "",
      }));
    } else if (jenis === "Offline") {
      setFormDataBookingRoom((prev) => ({
        ...prev,
        linkMeet: "",
        tanggal: "",
        waktuMulai: "",
        waktuSelesai: "",
      }));
    } else if (jenis === "Hybrid") {
      setFormDataBookingRoom((prev) => ({
        ...prev,
        tanggal: "",
        waktuMulai: "",
        waktuSelesai: "",
      }));
    }
  }, [formDataBookingRoom.jenisRapat]);

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

  const openConfirmationModal = ({
    type = "booking",
    message = "",
    details = null,
    warning = "",
    onConfirm = null,
  }) => {
    setConfirmationType(type);
    setConfirmationMessage(message);
    setConfirmationDetails(details);
    setConfirmationWarning(warning);
    setConfirmationAction(() => onConfirm);
    setShowConfirmationPopUp(true);
  };

  const closeConfirmationModal = () => {
    setFormDataBookingRoom({
      penyelenggara: "",
      namaRapat: "",
      tanggal: "",
      waktuMulai: "",
      waktuSelesai: "",
      ruangan: "",
      jenisRapat: "Offline",
      deskripsi: "",
      linkMeet: "",
      catatan: "",
      pesertaRapat: [],
      kirimUndanganEmail: false,
      mulaiSekarang: false,
      createdById: userData?.id || "", // tambahkan ini
    });
    setShowConfirmationPopUp(false);
    setConfirmationType("");
    setConfirmationMessage("");
    setConfirmationDetails(null);
    setConfirmationWarning("");
    setConfirmationAction(null);
    setIsConfirmationLoading(false);
  };

  // Function untuk handle confirm action
  const handleConfirmAction = async () => {
    if (confirmationAction) {
      setIsConfirmationLoading(true);
      try {
        await confirmationAction();
        closeConfirmationModal();
      } catch (error) {
        console.error("Confirmation action failed:", error);
        setIsConfirmationLoading(false);
        // Handle error here (show toast, etc.)
      }
    }
  };

  // Contoh penggunaan untuk booking confirmation
  const handleBookingSubmit = () => {
    const bookingDetails = {
      namaRapat: formDataBookingRoom.namaRapat,
      tanggal: formDataBookingRoom.tanggal,
      waktu: {
        mulai: formDataBookingRoom.waktuMulai,
        selesai: formDataBookingRoom.waktuSelesai,
      },
      ruangan: roomsOptions.find((r) => r.id === formDataBookingRoom.ruangan)
        ?.name,
      jenisRapat: formDataBookingRoom.jenisRapat,
      pesertaCount: formDataBookingRoom.pesertaRapat?.length,
    };

    openConfirmationModal({
      type:
        typePopUpBook === "meeting"
          ? "meeting"
          : typePopUpBook === "room"
          ? "booking"
          : undefined,
      message: `Apakah Anda yakin ingin ${
        typePopUpBook === "room" ? "booking ruangan" : "membuat meeting"
      } ini?`,
      details: bookingDetails,
      warning: formDataBookingRoom.kirimUndanganEmail
        ? "Undangan meeting akan dikirim ke email semua peserta."
        : null,
      onConfirm: async () => {
        await handleSubmit(); // pake e dari atas
      },
    });
  };

  // Contoh penggunaan untuk delete confirmation
  const handleDeleteMeeting = (meetingId, meetingName) => {
    openConfirmationModal({
      type: "delete",
      message: `Apakah Anda yakin ingin menghapus meeting "${meetingName}"?`,
      warning:
        "Tindakan ini tidak dapat dibatalkan dan semua peserta akan menerima notifikasi pembatalan.",
      onConfirm: async () => {
        // Your delete logic here
        // await deleteMeeting(meetingId);
      },
    });
  };

  // Contoh penggunaan untuk cancel meeting confirmation
  const handleCancelMeeting = (meetingId, meetingName) => {
    openConfirmationModal({
      type: "cancel",
      message: `Apakah Anda yakin ingin membatalkan meeting "${meetingName}"?`,
      warning: "Semua peserta akan menerima notifikasi pembatalan meeting.",
      onConfirm: async () => {
        // Your cancel logic here
        // await cancelMeeting(meetingId);
      },
    });
  };

  const handleSubmit = async () => {
    setIsLoadingSubmit(true);
    try {
      async function loadNotification() {
        try {
          const data = await fetchNotificationList(userData.id);
          setDataNotification(data);
        } catch (error) {
          alert(error.message);
        }
      }
      const meetingRes = await createMeeting({
        penyelenggara: formDataBookingRoom.penyelenggara,
        namaRapat: formDataBookingRoom.namaRapat,
        tanggal: formDataBookingRoom.tanggal,
        waktuMulai: formDataBookingRoom.waktuMulai,
        waktuSelesai: formDataBookingRoom.waktuSelesai,
        ruangan: formDataBookingRoom.ruangan,
        jenisRapat: formDataBookingRoom.jenisRapat,
        linkMeet:
          formDataBookingRoom.jenisRapat === "Online" ||
          formDataBookingRoom.jenisRapat === "Hybrid"
            ? formDataBookingRoom.linkMeet
            : "",
        catatan: formDataBookingRoom.catatan,
        deskripsi: formDataBookingRoom.deskripsi,
        pesertaRapat: formDataBookingRoom.pesertaRapat,
        kirimUndanganEmail: formDataBookingRoom.kirimUndanganEmail,
        mulaiSekarang: formDataBookingRoom.mulaiSekarang,
        createdById: formDataBookingRoom.createdById,
      });
      setIsLoadingSubmit(false);

      console.log("Form submitted:", meetingRes);

      toast.success(
        `${
          formDataBookingRoom.jenisRapat === "Online"
            ? "Jadwal Meeting Berhasil Dibuat"
            : "Ruangan Berhasil Di Booking"
        }`
      );
      const resMeetingUser = await fetchMeetingList(userData.id);
      const resMeetingAll = await fetchMeetingList();
      const data = await fetchRoomList();
      const transformed = transformRooms(data);

      setDataMeetingsUser(resMeetingUser);
      setDataMeetingsAll(resMeetingAll);
      setDataRoomsToday(transformed);
      setFormDataBookingRoom({
        penyelenggara: "",
        namaRapat: "",
        tanggal: "",
        waktuMulai: "",
        waktuSelesai: "",
        ruangan: "",
        deskripsi: "",
        jenisRapat: "Offline",
        linkMeet: "",
        catatan: "",
        mulaiSekarang: false,
        pesertaRapat: [employeeData.id],
        kirimUndanganEmail: false,
        createdById: userData?.id || "",
      });
      await loadNotification();

      setShowPopup(false);
    } catch (error) {
      setIsLoadingSubmit(false);
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Terjadi kesalahan saat memproses booking."
      );
    }
  };

  console.log("ini form data", formDataBookingRoom);

  const handleSearch = () => {
    const results = todayMeetings.filter((meeting) =>
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  };

  const handleShowDetail = (meeting) => {
    const fullMeeting = dataMeetingsAll.find((m) => m.id === meeting.id);
    console.log("ini selected cuy", fullMeeting);
    if (fullMeeting) {
      setSelectedMeeting(fullMeeting);
    } else {
      // fallback ke meeting yang dikirim kalau tidak ketemu (optional)
      setSelectedMeeting(meeting);
    }
    setShowDetailPopup(true);
  };

  useEffect(() => {
    if (meetingId && dataMeetingsAll.length > 0) {
      const foundMeeting = dataMeetingsAll.find((m) => m.id === meetingId);
      if (foundMeeting) {
        handleShowParam(foundMeeting);

        // Opsional: bersihkan query param setelah diproses
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("meeting_id");
        router.replace(newUrl.toString()); // Hapus param, tetap di halaman yang sama
      }
    }
  }, [meetingId, dataMeetingsAll]);

  const handleShowParam = (meeting) => {
    const fullMeeting = dataMeetingsAll.find((m) => m.id === meeting.id);
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
      ruangan: "",
      jenisRapat: "Offline",
      deskripsi: "",
      linkMeet: "",
      catatan: "",
      pesertaRapat: [],
      mulaiSekarang: false,
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

  // const getAvailableEndSlots = () => {
  //   if (!formDataBookingRoom.waktuMulai || !formDataBookingRoom.tanggal)
  //     return [];

  //   const selectedRoom = dataRoomsSelectedTanggal?.[0];
  //   const selectedDate = new Date(formDataBookingRoom.tanggal);
  //   const startIdx = allSlots.indexOf(formDataBookingRoom.waktuMulai);

  //   const availableSlots = [];

  //   for (let endIdx = startIdx + 1; endIdx < allSlots.length; endIdx++) {
  //     const startTimeStr = allSlots[startIdx];
  //     const endTimeStr = allSlots[endIdx]; // ✅ ini akses langsung slot selanjutnya

  //     const [startHour, startMinute] = startTimeStr.split(":").map(Number);
  //     const [endHour, endMinute] = endTimeStr.split(":").map(Number);

  //     const bookingStart = new Date(selectedDate);
  //     bookingStart.setHours(startHour, startMinute, 0, 0);

  //     const bookingEnd = new Date(selectedDate);
  //     bookingEnd.setHours(endHour, endMinute, 0, 0);

  //     const hasConflict = Object.entries(selectedRoom?.meetings || {}).some(
  //       ([meetingStartStr, meeting]) => {
  //         const [mStartH, mStartM] = meetingStartStr.split(":").map(Number);
  //         const [mEndH, mEndM] = meeting.endTime.split(":").map(Number);

  //         const meetingStart = new Date(selectedDate);
  //         meetingStart.setHours(mStartH, mStartM, 0, 0);

  //         const meetingEnd = new Date(selectedDate);
  //         meetingEnd.setHours(mEndH, mEndM, 0, 0);

  //         return bookingStart < meetingEnd && bookingEnd > meetingStart;
  //       }
  //     );

  //     if (hasConflict) break;

  //     availableSlots.push(endTimeStr);
  //   }

  //   return availableSlots;
  // };

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

    setSelectedRoom(room);
    setFormDataBookingRoom((prev) => ({
      ...prev,
      ruangan: room?.id || "",
    }));

    setTimeout(() => {
      setFormDataBookingRoom((prev) => ({
        ...prev,
        tanggal: new Date().toLocaleDateString("sv-SE", {
          timeZone: "Asia/Jakarta",
        }),
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
            penyelenggara: "",
            namaRapat: "",
            jenisRapat: "Offline",
            linkMeet: "",
            catatan: "",
            deskripsi: "",
            mulaiSekarang: false,
            pesertaRapat: [employeeData.id],
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

  const parseHHMM = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const isSlotSpanned = (room, timeSlot) => {
    if (!room || !timeSlot || !room.meetings) return false;

    // parse HH:mm ke Date
    const parseHHMM = (hhmm) => {
      const [h, m] = hhmm.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    };

    const slotStart = parseHHMM(timeSlot);

    for (const meeting of Object.values(room.meetings)) {
      const mStart = parseHHMM(meeting.startTime);
      const mEnd = parseHHMM(meeting.endTime);

      if (mEnd <= mStart) {
        mEnd.setDate(mEnd.getDate() + 1); // handle overnight
      }

      // kalau slot start di tengah meeting (bukan tepat di awal)
      if (slotStart > mStart && slotStart < mEnd) {
        return true;
      }
    }

    return false;
  };

  const getSlotSpan = (meeting) => {
    if (!meeting?.startTime || !meeting?.endTime) {
      return 1;
    }

    const startHour = parseInt(meeting.startTime.split(":")[0]);
    const startMinute = parseInt(meeting.startTime.split(":")[1]);
    const endHour = parseInt(meeting.endTime.split(":")[0]);
    const endMinute = parseInt(meeting.endTime.split(":")[1]);

    // Periksa apakah meeting dimulai dan berakhir tidak di menit :00
    // Contoh: 21:15 - 22:15 atau 14:30 - 15:30
    if (startMinute !== 0 && endMinute !== 0) {
      // Jika start dan end time-nya beda jam, maka span-nya (endHour - startHour) + 1
      if (endHour > startHour) {
        return endHour - startHour + 1;
      }
    }

    // Jika kondisi di atas tidak terpenuhi, hitung span berdasarkan durasi per 15 menit
    // (logika awal Anda)
    if (meeting.duration) {
      return Math.ceil(meeting.duration / 4);
    }

    return 1;
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

  const handleShowNotification = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000); // Menutup notifikasi setelah 3 detik
  };

  const closeNotificationModal = () => {
    setIsModalNotificationOpen(false);
  };

  const STEP_MIN = 15;

  // HH:MM -> menit total
  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  // menit -> HH:MM
  const fromMinutes = (mins) => {
    const h = String(Math.floor(mins / 60)).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  // generate array slot 24 jam (default step 15 menit)
  const buildDaySlots = (
    step = STEP_MIN,
    { excludeEnd = false, includeMidnight = true } = {}
  ) => {
    const out = [];
    for (let t = 0; t <= 24 * 60 - step; t += step) {
      out.push(fromMinutes(t));
    }

    // kalau mau ada 24:00 (alias midnight)
    if (includeMidnight) {
      out.push("24:00");
    }

    if (excludeEnd && out.length) out.pop();

    return out;
  };

  const hhmmToDate = (dateLike, hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    const d = new Date(dateLike);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const extractMeetingIntervals = (room, baseDate) => {
    if (!room?.meetings) return [];
    const intervals = [];
    for (const [maybeStartKey, meeting] of Object.entries(room.meetings)) {
      const startHH = meeting.startTime || maybeStartKey;
      const endHH = meeting.endTime;
      if (!startHH || !endHH) continue;
      const s = hhmmToDate(baseDate, startHH);
      let e = hhmmToDate(baseDate, endHH);
      if (e <= s) e.setDate(e.getDate() + 1); // antisipasi nyebrang hari
      intervals.push({ start: s, end: e });
    }
    return intervals.sort((a, b) => a.start - b.start);
  };

  const isPastHHMM = (selectedDate, hhmm) =>
    hhmmToDate(selectedDate, hhmm) < new Date();
  const isInsideAnyMeeting = (dt, intervals) =>
    intervals.some(({ start, end }) => dt >= start && dt < end);

  const getAvailableStartSlots = ({ selectedDate, jenisRapat, room }) => {
    const candidates = buildDaySlots(STEP_MIN, { excludeEnd: true });
    const intervals =
      jenisRapat === "Online"
        ? []
        : extractMeetingIntervals(room, selectedDate);

    return candidates.filter((hhmm) => {
      const dt = hhmmToDate(selectedDate, hhmm);
      if (isPastHHMM(selectedDate, hhmm)) return false;
      if (isInsideAnyMeeting(dt, intervals)) return false;
      return true;
    });
  };

  const getAvailableEndSlots = ({ selectedDate, startHHMM, room } = {}) => {
    if (!startHHMM || !selectedDate) return [];

    // pakai array yg sama
    const allSlots = buildDaySlots(STEP_MIN);
    const startIdx = allSlots.indexOf(startHHMM);
    if (startIdx === -1) return [];

    const availableSlots = [];

    for (let endIdx = startIdx + 1; endIdx < allSlots.length; endIdx++) {
      const startTimeStr = allSlots[startIdx];
      const endTimeStr = allSlots[endIdx];

      const [sH, sM] = startTimeStr.split(":").map(Number);
      const [eH, eM] = endTimeStr.split(":").map(Number);

      const bookingStart = new Date(selectedDate);
      bookingStart.setHours(sH, sM, 0, 0);

      const bookingEnd = new Date(selectedDate);
      bookingEnd.setHours(eH, eM, 0, 0);

      const hasConflict = Object.entries(room?.meetings || {}).some(
        ([mStartStr, meeting]) => {
          const [mSH, mSM] = mStartStr.split(":").map(Number);
          const [mEH, mEM] = meeting.endTime.split(":").map(Number);

          const mStart = new Date(selectedDate);
          mStart.setHours(mSH, mSM, 0, 0);

          const mEnd = new Date(selectedDate);
          mEnd.setHours(mEH, mEM, 0, 0);

          // overlap check
          return bookingStart < mEnd && bookingEnd > mStart;
        }
      );

      if (hasConflict) break;
      availableSlots.push(endTimeStr);
    }

    return availableSlots;
  };

  const formatDuration = (duration) => {
    if (!duration) return "0m";

    const totalMinutes = duration * 15; // karena 1 slot = 15 menit
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  function splitSlotsByMeetings(timeSlots, room, formDataBookingRoom) {
    if (!room || !room.meetings) return timeSlots;

    const refinedSlots = [];
    const seen = new Set();

    const today = new Date();

    // ambil dari formDataBookingRoom.tanggal kalau ada
    const selectedDate = formDataBookingRoom?.tanggal
      ? new Date(formDataBookingRoom.tanggal + "T00:00:00")
      : new Date(today.toDateString()); // fallback: hari ini

    const isToday = today.toDateString() === selectedDate.toDateString();
    const now = new Date();

    const makeDate = (hhmm, base = selectedDate) => {
      console.log("ini hahaemem", hhmm);
      const [h, m] = hhmm.split(":").map(Number);
      const d = new Date(base);
      d.setHours(h, m, 0, 0);
      return d;
    };
    console.log(timeSlots);

    function formatTime(d, isEnd = false) {
      let hh = d.getHours();
      let mm = d.getMinutes();
      // kalau end time dan tepat 00:00, ubah ke 24:00
      if (isEnd && hh === 0 && mm === 0) return "24:00";
      return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    }

    for (const { start: slotStart, end: slotEnd } of timeSlots) {
      console.log(slotStart, slotEnd);
      let slotStartDate = makeDate(slotStart);
      let slotEndDate = makeDate(slotEnd);

      if (slotEndDate <= slotStartDate) {
        slotEndDate = new Date(slotEndDate.getTime() + 24 * 60 * 60000);
      }

      let cuts = [slotStartDate.getTime(), slotEndDate.getTime()];

      // Potong oleh meeting
      for (const meeting of Object.values(room.meetings)) {
        const mStart = makeDate(meeting.startTime || "00:00");
        let mEnd = makeDate(meeting.endTime || "00:00");
        if (mEnd <= mStart) mEnd.setDate(mEnd.getDate() + 1);

        if (mStart < slotEndDate && mEnd > slotStartDate) {
          cuts.push(mStart.getTime(), mEnd.getTime());
        }
      }

      // Potong oleh quarter sekarang hanya kalau tanggal = hari ini
      if (isToday) {
        const quarterStart = new Date(now);
        quarterStart.setMinutes(Math.floor(now.getMinutes() / 15) * 15, 0, 0);
        const quarterEnd = new Date(quarterStart.getTime() + 15 * 60000);

        // Hanya tambahin cut kalau memang ada di dalam slot
        if (quarterStart >= slotStartDate && quarterStart < slotEndDate) {
          cuts.push(quarterStart.getTime());
        }
        if (quarterEnd > slotStartDate && quarterEnd <= slotEndDate) {
          cuts.push(quarterEnd.getTime());
        }
      }

      cuts = [...new Set(cuts)].sort((a, b) => a - b);

      for (let i = 0; i < cuts.length - 1; i++) {
        const subStart = new Date(cuts[i]);
        const subEnd = new Date(cuts[i + 1]);

        const overlappedMeeting = Object.values(room.meetings).find(
          (meeting) => {
            const mStart = makeDate(meeting.startTime);
            const mEnd = makeDate(meeting.endTime);
            if (mEnd <= mStart) mEnd.setDate(mEnd.getDate() + 1);
            return mStart < subEnd && mEnd > subStart; // ada overlap
          }
        );

        // pakai formatTime untuk normalisasi (24:00 bukan 00:00)
        const startStr = formatTime(subStart);
        let endStr = formatTime(subEnd);

        // tambahan safeguard: kalau ini slot terakhir dan "00:00", tampilkan 24:00
        if (endStr === "00:00" && slotEnd === "24:00") {
          endStr = "24:00";
        }

        const keyUnique = startStr;

        if (!seen.has(keyUnique)) {
          seen.add(keyUnique);

          refinedSlots.push({
            start: startStr,
            end: endStr,
            label: `${startStr}-${endStr}`,
            key: keyUnique,
            meetingId: overlappedMeeting?.id || null,
          });
        }
      }
    }

    console.log("ini todat", dataRoomsToday, refinedSlots);
    return refinedSlots;
  }

  const isFormValid = (formData) => {
    console.log("ini form data", formData);

    // Field wajib dasar
    if (
      !formData.penyelenggara ||
      !formData.namaRapat ||
      !formData.tanggal ||
      !formData.waktuMulai
    ) {
      return false;
    }

    // Validasi waktuSelesai - tidak wajib jika Online dan mulaiSekarang = true
    if (formData.jenisRapat === "Online" && formData.mulaiSekarang === true) {
      // Untuk online mulai sekarang, waktuSelesai tidak wajib
    } else {
      // Untuk semua kondisi lainnya, waktuSelesai wajib
      if (!formData.waktuSelesai) {
        return false;
      }
    }

    // Validasi ruangan - tidak wajib jika Online (baik mulai sekarang maupun pilih jadwal)
    if (formData.jenisRapat === "Online") {
      // Untuk online, ruangan tidak wajib
    } else {
      // Untuk offline dan hybrid, ruangan wajib
      if (!formData.ruangan) {
        return false;
      }
    }

    // Kalau online / hybrid wajib ada link
    if (
      (formData.jenisRapat === "Online" || formData.jenisRapat === "Hybrid") &&
      !formData.linkMeet
    ) {
      return false;
    }

    // kirimUndanganEmail minimal tidak undefined
    if (formData.kirimUndanganEmail === undefined) {
      return false;
    }

    return true; // valid
  };

  function splitMeetingToFitGrid(
    meeting,
    gridCols,
    startIndex,
    slotDuration,
    selectedDate = new Date()
  ) {
    const spans = [];
    const start = parseHHMM(meeting.startTime, selectedDate);
    const end = parseHHMM(meeting.endTime, selectedDate);

    let totalMinutes = (end - start) / 60000; // total durasi dalam menit
    let currentStart = start;
    let currentIndex = startIndex;
    let partIndex = 0;

    // Cek dulu apakah meeting akan split atau tidak
    const startCol = startIndex % gridCols;
    const remainingSlotsInStartRow = gridCols - startCol;
    const maxMinutesInStartRow = remainingSlotsInStartRow * slotDuration;
    const willBeSplit = totalMinutes > maxMinutesInStartRow;

    console.log(
      `Meeting: ${meeting.title}, Duration: ${totalMinutes} minutes, Start at col: ${startCol}, Will be split: ${willBeSplit}`
    );

    while (totalMinutes > 0) {
      // Hitung posisi kolom saat ini dalam row
      const currentCol = currentIndex % gridCols;

      // Hitung sisa slot yang tersedia di row saat ini
      const remainingSlotsInRow = gridCols - currentCol;

      // Hitung maksimal menit yang bisa digunakan di row saat ini
      const maxMinutesInRow = remainingSlotsInRow * slotDuration;

      // PENTING: Pastikan kita tidak melebihi batas row
      let spanMinutes, actualSlotsUsed;

      if (totalMinutes <= maxMinutesInRow) {
        // Meeting bisa muat di row saat ini
        spanMinutes = totalMinutes;
        actualSlotsUsed = Math.max(1, Math.ceil(spanMinutes / slotDuration));

        // CRITICAL: Pastikan tidak melebihi slot tersedia
        if (actualSlotsUsed > remainingSlotsInRow) {
          actualSlotsUsed = remainingSlotsInRow;
          spanMinutes = actualSlotsUsed * slotDuration;
        }
      } else {
        // Meeting tidak muat, potong sesuai slot tersedia
        actualSlotsUsed = remainingSlotsInRow;
        spanMinutes = actualSlotsUsed * slotDuration;
      }

      // Hitung waktu akhir untuk span ini
      const currentEnd = new Date(currentStart);
      currentEnd.setMinutes(currentStart.getMinutes() + spanMinutes);

      // Buat span object
      const span = {
        ...meeting,
        startTime: formatTime(currentStart),
        endTime: formatTime(currentEnd),
        colSpan: actualSlotsUsed,
        partIndex,
        isFirstPart: partIndex === 0,
        isLastPart: totalMinutes - spanMinutes <= 0,
        isSplit: willBeSplit,
        // Info tambahan untuk debugging
        gridPosition: {
          startCol: currentCol,
          endCol: currentCol + actualSlotsUsed - 1,
          row: Math.floor(currentIndex / gridCols),
        },
      };

      spans.push(span);

      // Update variabel untuk iterasi berikutnya
      totalMinutes -= spanMinutes;
      currentStart = new Date(currentEnd);
      currentIndex += actualSlotsUsed;
      partIndex++;

      console.log(
        `Part ${partIndex}: ${span.startTime}-${span.endTime}, ColSpan: ${
          span.colSpan
        }, Position: Col ${currentCol}-${
          currentCol + actualSlotsUsed - 1
        }, Row: ${Math.floor((currentIndex - actualSlotsUsed) / gridCols)}`
      );

      // Validasi: pastikan kita tidak melebihi batas row
      const endCol = currentCol + actualSlotsUsed - 1;
      if (endCol >= gridCols) {
        console.error(
          `ERROR: Meeting span exceeds row boundary! StartCol: ${currentCol}, EndCol: ${endCol}, GridCols: ${gridCols}`
        );
      }

      // Safety check untuk mencegah infinite loop
      if (partIndex > 50) {
        console.warn("Too many iterations, breaking loop");
        break;
      }
    }

    console.log("Final spans:", spans);
    return spans;
  }

  // Fungsi tambahan untuk validasi grid consistency
  function validateGridConsistency(timeSlots, gridCols) {
    let currentRow = 0;
    let slotsInCurrentRow = 0;

    for (let i = 0; i < timeSlots.length; i++) {
      const slot = timeSlots[i];
      const colSpan = slot.colSpan || 1;

      // Hitung slot di row saat ini
      slotsInCurrentRow += colSpan;

      // Cek apakah melebihi gridCols
      if (slotsInCurrentRow > gridCols) {
        console.error(
          `Row ${currentRow} has ${slotsInCurrentRow} slots, exceeds ${gridCols}!`
        );
        console.error(`Problem at slot ${i}:`, slot);
        return false;
      }

      // Jika row penuh, reset counter
      if (slotsInCurrentRow === gridCols) {
        console.log(
          `Row ${currentRow}: Complete with ${slotsInCurrentRow} slots`
        );
        currentRow++;
        slotsInCurrentRow = 0;
      }
    }

    // Cek row terakhir
    if (slotsInCurrentRow > 0) {
      console.log(`Last row ${currentRow}: ${slotsInCurrentRow} slots`);
    }

    return true;
  }

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
                active: true,
                children: selectedMeeting
                  ? [
                      {
                        label: "Detail Meeting",
                        href: "/dashboard/detail-meeting",
                      },
                    ]
                  : [],
              },
              { icon: Clock, label: "Jadwal", href: "/jadwal" },
              {
                icon: Settings,
                label: "Pengaturan & Profil",
                href: "/pengaturan",
              },
              {
                icon: HelpCircle,
                label: "Bantuan",
                href: "/bantuan",
              },
            ].map((item, index) => (
              <li key={index} className="relative">
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
                {/* Render submenu jika ada children */}
                {item.children && item.children.length > 0 && (
                  <ul className="ml-5 space-y-1 relative">
                    {item.children.map((child, cIdx) => {
                      return (
                        <li key={cIdx} className="relative">
                          {/* Garis L */}
                          <span className="absolute -left-[1px] top-[calc(50%+4px)] h-[0.5px] w-5 bg-gray-400" />
                          <span className="absolute -left-[1px] top-0 h-full w-px bg-gray-400" />
                          <div
                            className={`block pl-2 pr-[2px] py-1 rounded-xl transition-all text-sm group ml-4 `}
                          >
                            <div
                              className={`flex gap-2 items-center mt-2 px-4 py-2 w-full rounded-xl ${
                                selectedMeeting
                                  ? "bg-[#e6f0fb] text-[#1b68b0] shadow-sm"
                                  : "text-gray-600 hover:bg-[#f2f6fa] hover:text-[#1b68b0]"
                              }`}
                            >
                              <Info size={14} className="shrink-0" />
                              {child.label}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {/* Logout */}
          <div
            onClick={logoutHandle}
            className="w-full mt-4 cursor-pointer flex items-center space-x-3 px-3 py-2.5 text-[#ff7729] hover:bg-[#fff3ec] rounded-xl transition-all"
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
            <div className="flex items-center gap-4">
              {selectedMeeting && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={closeModalDetail}
                    className="flex cursor-pointer items-center gap-2 text-white hover:bg-white/10 rounded-md text-sm transition-all"
                  >
                    <ChevronLeft className="text-gray-600" size={20} />
                  </button>
                </div>
              )}

              <Image
                src="/images/KAI Danantara Logo.png"
                alt="KAI Danantara Logo"
                width={200}
                height={40}
                className="object-contain ml-4"
              />
            </div>
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

        {selectedMeeting ? (
          <div className="">
            {/* Header with Back Button */}

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-4">
              {/* Title & Time */}
              <div className="bg-white rounded-lg p-4 shadow mb-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedMeeting?.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-gray-600 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} />
                    <span>
                      {new Date(selectedMeeting?.startTime).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    <span>
                      {new Date(selectedMeeting?.startTime).toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}{" "}
                      -{" "}
                      {selectedMeeting?.endTime
                        ? new Date(selectedMeeting.endTime).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "selesai"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                {/* Lokasi */}
                <div className="bg-white rounded-lg p-4 shadow">
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

                {/* Penyelenggara */}
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#ff7729] text-white rounded-md">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Penyelenggara
                      </h3>
                      <p className="text-gray-600 text-sm">Unit Kerja</p>
                    </div>
                  </div>
                  <div className="bg-[#f8fafc] rounded-md p-3 text-sm">
                    <p className="font-medium text-gray-900">
                      {selectedMeeting?.organizerUnit?.name}
                    </p>
                  </div>
                </div>

                {/* Peserta */}
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#1b68b0] text-white rounded-md">
                      <Users size={16} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Peserta
                      </h3>
                      <p className="text-gray-600 text-sm">Total Peserta</p>
                    </div>
                  </div>
                  <div className="bg-[#f8fafc] rounded-md p-3 text-sm">
                    <div className="flex items-baseline">
                      <span className="text-xl font-bold text-[#1b68b0]">
                        {selectedMeeting?.meetingAttendees?.length}
                      </span>
                      <span className="ml-2 text-gray-600">peserta</span>
                    </div>
                  </div>
                </div>

                {/* Durasi */}
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#ff7729] text-white rounded-md">
                      <Clock size={16} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Durasi
                      </h3>
                      <p className="text-gray-600 text-sm">Waktu Rapat</p>
                    </div>
                  </div>
                  <div className="bg-[#f8fafc] rounded-md p-3 text-sm">
                    <p className="font-medium text-gray-900">
                      {Math.round(
                        (new Date(selectedMeeting?.endTime) -
                          new Date(selectedMeeting?.startTime)) /
                          (1000 * 60)
                      )}{" "}
                      menit
                    </p>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              {selectedMeeting?.description && (
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#1b68b0] text-white rounded-md">
                      <FileText size={16} />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Deskripsi Rapat
                    </h3>
                  </div>
                  <div className="bg-[#f8fafc] rounded-md p-3 text-sm">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                      {selectedMeeting?.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#1b68b0]">
            <div className="p-6 space-y-6">
              {/* Welcome Section */}
              <div className="bg-[#1b68b0] rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10"></div>

                {/* Tombol "+ Buat Rapat" */}
                <div className="relative z-10 flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">
                      Selamat Datang, {userData?.nama}!
                    </h2>
                    <p className="text-[#d6eaff] text-sm">
                      Kelola meeting dengan mudah dan efisien hari ini
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFormDataBookingRoom((prev) => ({
                        ...prev,
                        pesertaRapat: [employeeData.id],
                      }));

                      setTypePopUpBook("meeting");
                      setShowPopup(true);
                    }}
                    className="bg-[#ff7729] text-xs text-white cursor-pointer px-3 py-2 rounded-lg flex items-center space-x-2 hover:shadow-md transition-all hover:scale-105"
                  >
                    <Plus size={16} />
                    <span>Buat Meeting</span>
                  </button>
                </div>

                {nearestMeeting?.title ? (
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-md font-semibold mb-2">
                          {nearestMeeting.title}
                        </h3>
                        <span className="inline-block px-3 py-1 bg-green-400 text-green-900 rounded-full text-xs font-medium">
                          {nearestMeeting.statusRapat}
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Monitor size={12} />
                        <span>{nearestMeeting.jenisRapat}</span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 text-sm mb-4">
                      <div className="flex items-center space-x-2">
                        <Timer className="text-blue-200" size={16} />
                        <span>
                          {nearestMeeting.tanggal} {nearestMeeting.time} -{" "}
                          {nearestMeeting.endTime
                            ? `${nearestMeeting.endTime} WIB`
                            : "selesai"}
                        </span>
                      </div>

                      {nearestMeeting.ruangan && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Building className="text-white/80" size={16} />
                          <span>Ruang {nearestMeeting.ruangan}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      {nearestMeeting.linkMeet.trim() !== "" &&
                        nearestMeeting.linkMeet !== "-" && (
                          <button className="bg-[#ff7729] cursor-pointer text-xs px-4 py-1 rounded-lg font-medium hover:bg-[#e0651d] transition-colors flex items-center space-x-2">
                            <Video size={16} />
                            <span>Join Now</span>
                          </button>
                        )}
                      <button
                        onClick={() => handleShowDetail(nearestMeeting)}
                        className="bg-white/20 text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center space-x-2 cursor-pointer"
                      >
                        <Info size={12} />
                        <span>Detail</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-5 border border-white/20 text-center">
                    <Calendar
                      className="mx-auto mb-2 text-white/60"
                      size={32}
                    />
                    <p>Belum ada jadwal meeting hari ini!</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 text-black">
                  <div className="overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#d6eaff]">
                    <div className="p-5 border-b border-gray-100/50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Building className="text-[#1b68b0]" size={20} />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Status Ruangan Hari Ini
                          </h3>
                        </div>
                        <button
                          onClick={() => {
                            setFormDataBookingRoom((prev) => ({
                              ...prev,
                              pesertaRapat: [employeeData.id],
                            }));

                            setTypePopUpBook("room");
                            setShowPopup(true);
                          }}
                          className="bg-[#ff7729] text-xs text-white cursor-pointer px-3 py-2 rounded-lg flex items-center space-x-2 hover:shadow-md transition-all hover:scale-105"
                        >
                          <Plus size={16} />
                          <span>Book Ruangan</span>
                        </button>
                      </div>
                    </div>

                    {/* Time Blocking Grid */}
                    <div className="p-5">
                      <div className="space-y-6">
                        {dataRoomsToday.map((room) => {
                          // Helper functions (same as before but optimized)
                          const getCurrentRoomStatus = (room) => {
                            const currentHour = new Date().getHours();
                            const timeSlotKey = `${currentHour}:00`;
                            if (room.meetings[timeSlotKey]) {
                              const meeting = room.meetings[timeSlotKey];
                              if (meeting.status === "berlangsung")
                                return "occupied";
                              if (meeting.status === "mendatang")
                                return "upcoming";
                            }
                            return "available";
                          };

                          const getCurrentActivity = (room) => {
                            for (const [timeKey, meeting] of Object.entries(
                              room.meetings || {}
                            )) {
                              if (meeting.status === "berlangsung")
                                return meeting;
                            }
                            return null;
                          };

                          const getNextMeeting = (room) => {
                            const currentHour = new Date().getHours();
                            const futureMeetings = Object.entries(
                              room.meetings || {}
                            )
                              .filter(([timeKey, meeting]) => {
                                const meetingHour = parseInt(
                                  timeKey.split(":")[0]
                                );
                                return (
                                  meetingHour > currentHour &&
                                  meeting.status === "mendatang"
                                );
                              })
                              .sort(
                                ([a], [b]) =>
                                  parseInt(a.split(":")[0]) -
                                  parseInt(b.split(":")[0])
                              );

                            return futureMeetings.length > 0
                              ? {
                                  ...futureMeetings[0][1],
                                  startTime: futureMeetings[0][0],
                                }
                              : null;
                          };

                          const getTimeUntilNext = (nextMeeting) => {
                            if (!nextMeeting) return "";
                            const now = new Date();
                            const meetingTime = new Date();
                            const [hours, minutes] =
                              nextMeeting.startTime.split(":");
                            meetingTime.setHours(
                              parseInt(hours),
                              parseInt(minutes),
                              0,
                              0
                            );
                            const diffMs = meetingTime - now;
                            const diffHours = Math.floor(
                              diffMs / (1000 * 60 * 60)
                            );
                            const diffMinutes = Math.floor(
                              (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                            );
                            return diffHours > 0
                              ? `${diffHours}j ${diffMinutes}m tersisa`
                              : `${diffMinutes}m tersisa`;
                          };

                          // Get dynamic values
                          const roomStatus = getCurrentRoomStatus(room);
                          const currentActivity = getCurrentActivity(room);
                          const nextMeeting = getNextMeeting(room);
                          const bookingsCount = Object.keys(
                            room.meetings || {}
                          ).length;

                          return (
                            <div
                              key={room.id}
                              className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                            >
                              {/* Compact Header */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-gray-900 text-sm">
                                    {room.name}
                                  </h4>
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      roomStatus === "available"
                                        ? "bg-green-500"
                                        : roomStatus === "occupied"
                                        ? "bg-red-500"
                                        : "bg-yellow-500"
                                    }`}
                                  ></div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span className="flex items-center space-x-1">
                                      <Users size={12} />
                                      <span>
                                        Kapasitas: {room.capacity} orang
                                      </span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <Calendar size={12} />
                                      <span>{bookingsCount} booking</span>
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => handleShowDetailRooms(room)}
                                    className="ml-4 px-2 py-1 cursor-pointer bg-[#1b68b0]/10 hover:bg-[#1b68b0] text-[#1b68b0] hover:text-white rounded-full transition-all duration-200 flex items-center space-x-2 text-xs font-medium"
                                  >
                                    <Info size={12} />
                                    <span>Lihat Detail Status Ruangan</span>
                                  </button>
                                </div>
                              </div>

                              {/* Status Banner - Ultra Compact */}
                              {(currentActivity || nextMeeting) && (
                                <div className="mb-2">
                                  {currentActivity && (
                                    <div className="bg-blue-50 border-l-2 border-blue-500 px-2 py-1 mb-2">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-blue-900 font-medium truncate">
                                          {currentActivity.title}
                                        </span>
                                        <span className="text-blue-600">
                                          sampai {currentActivity.endTime}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  {nextMeeting && (
                                    <div className="bg-amber-50 border-l-2 border-amber-500 px-2 py-1">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-amber-900 font-medium truncate">
                                          {nextMeeting.title}
                                        </span>
                                        <span className="text-amber-600">
                                          mulai {nextMeeting.startTime} (
                                          {getTimeUntilNext(nextMeeting)})
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Ultra Compact Time Slots Grid */}
                              <div className="grid grid-cols-9 gap-1 mt-2">
                                {splitSlotsByMeetings(timeSlots, room)
                                  .flatMap((timeSlot, index) => {
                                    const meeting = room.meetings[timeSlot.key];
                                    const isSpanned = isSlotSpanned(
                                      room,
                                      timeSlot.key
                                    );
                                    if (isSpanned) return [];

                                    const slotStart = new Date(
                                      `1970-01-01T${timeSlot.start}:00`
                                    );
                                    const slotEnd = new Date(
                                      `1970-01-01T${timeSlot.end}:00`
                                    );
                                    const slotDuration =
                                      (slotEnd.getTime() -
                                        slotStart.getTime()) /
                                      (1000 * 60); // menit

                                    if (meeting) {
                                      return splitMeetingToFitGrid(
                                        meeting,
                                        9,
                                        index,
                                        slotDuration
                                      ).map((part, idx) => ({
                                        ...timeSlot,
                                        meeting: part,
                                        colSpan: part.colSpan,
                                        label: `${part.startTime}-${part.endTime}`,
                                        isFirstPart: part.isFirstPart,
                                        isLastPart: part.isLastPart,
                                      }));
                                    }

                                    return [
                                      {
                                        ...timeSlot,
                                        meeting: null,
                                        colSpan: 1,
                                      },
                                    ];
                                  })
                                  .map((slot, idx) => {
                                    const meeting = slot.meeting;

                                    const isSpanned = isSlotSpanned(
                                      room,
                                      slot.key
                                    );
                                    if (isSpanned) return null;

                                    const status = meeting
                                      ? getSlotStatus(room, slot.key)
                                      : "available";
                                    const now = new Date();
                                    const selectedDate = new Date(); // atau tanggal yang dipilih user

                                    // Ambil jam dan menit dari slot.key (format "HH:mm")
                                    const [slotHour, slotMinute] = slot.key
                                      .split(":")
                                      .map(Number);

                                    // Gabungkan tanggal hari ini dengan jam slot
                                    const slotTime = new Date(selectedDate);
                                    slotTime.setHours(
                                      slotHour,
                                      slotMinute,
                                      0,
                                      0
                                    );

                                    const parseHHMM = (hhmm) => {
                                      const [h, m] = hhmm
                                        .split(":")
                                        .map(Number);
                                      const d = new Date(selectedDate);
                                      d.setHours(h, m, 0, 0);
                                      return d;
                                    };

                                    let slotStart = parseHHMM(slot.start);
                                    let slotEnd = parseHHMM(slot.end);
                                    if (slotEnd <= slotStart)
                                      slotEnd.setDate(slotEnd.getDate() + 1);

                                    const isCurrentTime =
                                      now >= slotStart && now < slotEnd;
                                    const isPastTime = now >= slotEnd;

                                    const isDisabled =
                                      (isPastTime && !meeting) ||
                                      (isCurrentTime && !meeting);
                                    const isUnavailable =
                                      isPastTime || isCurrentTime;

                                    return (
                                      <button
                                        key={idx}
                                        onClick={() =>
                                          handleSlotClick(room, slot)
                                        }
                                        disabled={isUnavailable && !meeting}
                                        className={`
    group relative p-2 rounded text-xs transition-all cursor-pointer 
    h-[72px] border flex flex-col justify-center items-center
    ${getSlotColor(status, meeting)}
    ${isCurrentTime ? "ring-2 ring-blue-500" : ""}
    ${
      isPastTime && !meeting
        ? "opacity-40 cursor-not-allowed"
        : "hover:shadow-sm hover:scale-[1.02]"
    }
    ${
      meeting && meeting.isSplit
        ? meeting.isFirstPart
          ? "border-r-0 rounded-r-none"
          : meeting.isLastPart
          ? "border-l-0 rounded-l-none"
          : "border-l-0 border-r-0 rounded-none"
        : ""
    }
  `}
                                        style={
                                          slot.colSpan > 1
                                            ? {
                                                gridColumn: `span ${slot.colSpan}`,
                                              }
                                            : {}
                                        }
                                      >
                                        {/* Tooltip on hover */}
                                        <div
                                          className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 
                  bg-gray-900 text-white text-[10px] rounded shadow-lg
                  opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none"
                                        >
                                          {meeting
                                            ? isPastTime
                                              ? "Lihat Detail Meeting Yang Telah Lewat"
                                              : "Lihat Detail Meeting"
                                            : isUnavailable
                                            ? "Telah Lewat"
                                            : "Booking Slot Ruangan"}
                                        </div>

                                        {/* Current Time Indicator */}
                                        {isCurrentTime && (
                                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                                            <div className="bg-blue-500 text-white text-[8px] px-1 py-0.5 rounded-full font-bold shadow">
                                              Sekarang
                                            </div>
                                          </div>
                                        )}

                                        {/* Time Display */}
                                        <div className="font-mono text-[10px] font-semibold text-center mb-1">
                                          {meeting
                                            ? `${meeting.startTime}-${meeting.endTime}`
                                            : slot.label}
                                        </div>

                                        {/* Content */}
                                        {meeting ? (
                                          <div className="flex-1 flex flex-col justify-center items-center space-y-0.5 min-w-0">
                                            <div className="font-medium text-[10px] leading-tight text-center truncate w-full px-1">
                                              {meeting.title}
                                            </div>
                                            <div className="text-[8px] flex items-center gap-1 opacity-75">
                                              <span>
                                                {meeting.participants}
                                              </span>
                                              <Users size={8} />
                                            </div>
                                            <div className="text-[8px] opacity-60">
                                              {formatDuration(meeting.duration)}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="text-[10px] opacity-60 text-center">
                                            {isUnavailable
                                              ? "Telah Lewat"
                                              : "Tersedia"}
                                          </div>
                                        )}

                                        {/* Priority dot */}

                                        {/* Duration bar */}
                                      </button>
                                    );
                                  })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming */}
                {upcomingMeetings.length === 0 ? (
                  <div className="bg-[#f9fbfd] border border-[#e3f1ff] rounded-xl p-8 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      {/* Icon */}
                      <div className="w-16 h-16 bg-[#e3f1ff] rounded-full flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-[#2a75f3]" />
                      </div>

                      {/* Text Content */}
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-gray-800">
                          Tidak ada meeting yang akan datang
                        </h4>
                        <p className="text-sm text-gray-500 max-w-sm">
                          Anda belum memiliki jadwal meeting untuk periode
                          mendatang. Jadwal meeting baru akan muncul di sini.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {upcomingMeetings.map((meeting, idx) => (
                      <li
                        key={idx}
                        className="bg-[#f9fbfd] border border-[#e3f1ff] rounded-xl p-4 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          {/* Left Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2.5">
                              <h4 className="text-sm font-semibold text-gray-800 truncate pr-2">
                                {meeting.title}
                              </h4>
                              <div className="flex items-center space-x-4 flex-shrink-0">
                                {/* Eye Icon Button */}
                                <button
                                  onClick={() => handleShowDetail(meeting)}
                                  className="bg-[#1b68b0]/10 hover:bg-[#1b68b0] hover:text-white text-[#1b68b0] text-[11px] px-3 py-1 rounded-full font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
                                >
                                  <Info size={10} />
                                  <span>Detail</span>
                                </button>

                                {/* Status Badge */}
                                <div className="bg-[#d7ebff] text-[#2a75f3] text-[11px] px-2 py-1 rounded-full font-medium whitespace-nowrap">
                                  Mendatang
                                </div>
                              </div>
                            </div>

                            {/* Meeting Info */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 truncate">
                                  {meeting.unit} • {meeting.type}
                                </span>
                                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                  {meeting.tanggal}
                                </span>
                              </div>

                              <div className="flex items-center">
                                <span className="text-sm text-[#2a75f3] font-semibold">
                                  {meeting.time} - {meeting.endTime}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Buttons */}
              {/* <div className="flex space-x-4">
              <button
                onClick={() => setShowSearchPopup(true)}
                className="flex-1 bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-6 hover:bg-[#f0f0f2] transition-all group"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Search
                    className="text-[#1b68b0] group-hover:text-[#175c9e]"
                    size={24}
                  />
                  <span className="font-medium text-gray-900">
                    Search Meeting
                  </span>
                </div>
              </button>
              <button className="flex-1 bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-6 hover:bg-[#f0f0f2] transition-all group">
                <div className="flex items-center justify-center space-x-3">
                  <FileText
                    className="text-[#ff7729] group-hover:text-[#e0651d]"
                    size={24}
                  />
                  <span className="font-medium text-gray-900">
                    Riwayat Rapat
                  </span>
                </div>
              </button>
            </div> */}
            </div>
          </div>
        )}
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
              <div className="flex justify-between cursor-pointer items-center border-b border-gray-100 pb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {typePopUpBook === "room"
                    ? "Booking Ruangan"
                    : "Buat Meeting"}
                </h2>

                <button
                  onClick={closeModalBook}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content - Scrollable but optimized */}
            <div className="flex-1 min-h-0 pt-2">
              <div className="py-2 space-y-4 h-full overflow-y-auto">
                {typePopUpBook === "meeting" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Jenis Rapat *
                      </label>
                      <div className="flex space-x-4 mt-2">
                        {[
                          { value: "Offline", icon: Users, label: "Offline" },
                          { value: "Hybrid", icon: Monitor, label: "Hybrid" },
                          { value: "Online", icon: Video, label: "Online" },
                        ]
                          // Filter berdasarkan typePopUpBook
                          .filter((option) => {
                            if (typePopUpBook === "room") {
                              return option.value !== "Online";
                            }
                            return true; // "meeting" boleh semua
                          })
                          .map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center space-x-1 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="jenisRapat"
                                value={option.value}
                                checked={
                                  formDataBookingRoom.jenisRapat ===
                                  option.value
                                }
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 cursor-pointer focus:ring-blue-500"
                              />
                              <option.icon
                                size={16}
                                className="text-gray-600"
                              />
                              <span className="text-xs text-gray-700">
                                {option.label}
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>
                    {(formDataBookingRoom.jenisRapat === "Online" ||
                      formDataBookingRoom.jenisRapat === "Hybrid") &&
                      typePopUpBook === "meeting" && (
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
                  </div>
                )}
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

                  {formDataBookingRoom.jenisRapat !== "Online" && (
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
                  )}
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Deskripsi Rapat
                  </label>
                  <textarea
                    type="text"
                    name="deskripsi"
                    value={formDataBookingRoom.deskripsi}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan deskripsi rapat"
                  />
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Catatan
                  </label>
                  <textarea
                    type="text"
                    name="catatan"
                    value={formDataBookingRoom.catatan}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan catatan rapat"
                  />
                </div>

                {/* Row 2: Date & Time */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                  {/* Checkbox untuk Online Meeting - Mulai Sekarang atau Pilih Jadwal */}
                  {formDataBookingRoom.jenisRapat === "Online" && (
                    <div className="lg:col-span-4 mb-3">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="onlineMeetingOption"
                            value="mulaiSekarang"
                            checked={formDataBookingRoom.mulaiSekarang === true}
                            onChange={(e) => {
                              const now = new Date();
                              const currentDate = now
                                .toISOString()
                                .split("T")[0]; // Format YYYY-MM-DD
                              const currentTime = now
                                .toTimeString()
                                .slice(0, 5); // Format HH:MM

                              setFormDataBookingRoom((prev) => ({
                                ...prev,
                                mulaiSekarang: true,
                                tanggal: currentDate,
                                waktuMulai: currentTime,
                                waktuSelesai: "",
                              }));
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Mulai Sekarang
                          </span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="onlineMeetingOption"
                            value="pilihJadwal"
                            checked={
                              formDataBookingRoom.mulaiSekarang === false
                            }
                            onChange={(e) =>
                              setFormDataBookingRoom((prev) => ({
                                ...prev,
                                mulaiSekarang: false,
                              }))
                            }
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Pilih Jadwal
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tanggal{" "}
                      {formDataBookingRoom.jenisRapat === "Online" &&
                      formDataBookingRoom.mulaiSekarang === true
                        ? ""
                        : "*"}
                    </label>
                    <input
                      disabled={
                        // Disabled jika Online dan pilih "Mulai Sekarang"
                        (formDataBookingRoom.jenisRapat === "Online" &&
                          formDataBookingRoom.mulaiSekarang === true) ||
                        // Disabled jika Offline/Hybrid dan ruangan kosong
                        ((formDataBookingRoom.jenisRapat === "Offline" ||
                          formDataBookingRoom.jenisRapat === "Hybrid") &&
                          formDataBookingRoom.ruangan === "")
                      }
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
          // Style untuk disabled
          (formDataBookingRoom.jenisRapat === "Online" &&
            formDataBookingRoom.mulaiSekarang === true) ||
          ((formDataBookingRoom.jenisRapat === "Offline" ||
            formDataBookingRoom.jenisRapat === "Hybrid") &&
            formDataBookingRoom.ruangan === "")
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
            : "border-gray-300"
        }`}
                      placeholder={
                        formDataBookingRoom.jenisRapat === "Online" &&
                        formDataBookingRoom.mulaiSekarang === true
                          ? "Tanggal saat ini"
                          : ""
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Jam Mulai{" "}
                      {formDataBookingRoom.jenisRapat === "Online" &&
                      formDataBookingRoom.mulaiSekarang === true
                        ? ""
                        : "*"}
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
                        // Disabled jika Online dan pilih "Mulai Sekarang"
                        (formDataBookingRoom.jenisRapat === "Online" &&
                          formDataBookingRoom.mulaiSekarang === true) ||
                        // Disabled jika tanggal kosong
                        formDataBookingRoom.tanggal === "" ||
                        // Disabled jika bukan Online dan ruangan kosong
                        (formDataBookingRoom.jenisRapat !== "Online" &&
                          formDataBookingRoom.ruangan === "")
                      }
                      className={`w-full text-sm border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${
          (formDataBookingRoom.jenisRapat === "Online" &&
            formDataBookingRoom.mulaiSekarang === true) ||
          formDataBookingRoom.tanggal === "" ||
          (formDataBookingRoom.jenisRapat !== "Online" &&
            formDataBookingRoom.ruangan === "")
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
            : "border-gray-300"
        }`}
                    >
                      <option value="">
                        {formDataBookingRoom.jenisRapat === "Online" &&
                        formDataBookingRoom.mulaiSekarang === true
                          ? "Waktu saat ini"
                          : "Pilih Jam"}
                      </option>
                      {formDataBookingRoom.jenisRapat === "Online" &&
                      formDataBookingRoom.mulaiSekarang === true
                        ? null
                        : getAvailableStartSlots({
                            selectedDate: new Date(formDataBookingRoom.tanggal),
                            jenisRapat: formDataBookingRoom.jenisRapat,
                            room: dataRoomsSelectedTanggal?.[0],
                          }).map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Jam Selesai{" "}
                      {formDataBookingRoom.jenisRapat === "Online" &&
                      formDataBookingRoom.mulaiSekarang === true
                        ? ""
                        : "*"}
                    </label>
                    {formDataBookingRoom.jenisRapat === "Online" ? (
                      <select
                        value={formDataBookingRoom.waktuSelesai}
                        onChange={(e) =>
                          setFormDataBookingRoom((prev) => ({
                            ...prev,
                            waktuSelesai: e.target.value,
                          }))
                        }
                        disabled={
                          // Disabled jika pilih "Mulai Sekarang"
                          formDataBookingRoom.mulaiSekarang === true ||
                          // Disabled jika start time atau tanggal kosong (untuk pilih jadwal)
                          (formDataBookingRoom.mulaiSekarang === false &&
                            (formDataBookingRoom.waktuMulai === "" ||
                              formDataBookingRoom.tanggal === ""))
                        }
                        className={`w-full text-sm border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formDataBookingRoom.mulaiSekarang === true ||
                          (formDataBookingRoom.mulaiSekarang === false &&
                            (formDataBookingRoom.waktuMulai === "" ||
                              formDataBookingRoom.tanggal === ""))
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">
                          {formDataBookingRoom.jenisRapat === "Online" &&
                          formDataBookingRoom.mulaiSekarang === true
                            ? "Tidak perlu jam selesai"
                            : "Pilih Jam"}
                        </option>
                        {formDataBookingRoom.mulaiSekarang === true
                          ? null
                          : getAvailableEndSlots({
                              selectedDate: new Date(
                                formDataBookingRoom.tanggal
                              ),
                              startHHMM: formDataBookingRoom.waktuMulai,
                              jenisRapat: formDataBookingRoom.jenisRapat,
                            }).map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                      </select>
                    ) : (
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
                          formDataBookingRoom.tanggal === ""
                        }
                        className={`w-full text-sm border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formDataBookingRoom.waktuMulai === "" ||
                          formDataBookingRoom.tanggal === ""
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Pilih Jam</option>
                        {getAvailableEndSlots({
                          selectedDate: new Date(formDataBookingRoom.tanggal),
                          startHHMM: formDataBookingRoom.waktuMulai,
                          jenisRapat: formDataBookingRoom.jenisRapat,
                          room: dataRoomsSelectedTanggal?.[0],
                        }).map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Row 3: Time Slots Visualization */}
                {formDataBookingRoom.jenisRapat !== "Online" &&
                  formDataBookingRoom.tanggal !== "" && (
                    <div className="grid grid-cols-9 gap-1 mt-2">
                      {splitSlotsByMeetings(
                        timeSlots,
                        dataRoomsSelectedTanggal?.[0]
                      ).map((timeSlot) => {
                        const meeting =
                          dataRoomsSelectedTanggal?.[0]?.meetings?.[
                            timeSlot.key
                          ];
                        const isSpanned = isSlotSpanned(
                          dataRoomsSelectedTanggal?.[0],
                          timeSlot.key
                        );

                        if (isSpanned) return null;

                        const status = meeting
                          ? getSlotStatus(
                              dataRoomsSelectedTanggal?.[0],
                              timeSlot.key
                            )
                          : "available";
                        const colSpan = meeting ? getSlotSpan(meeting) : 1;
                        const now = new Date();
                        const selectedDate = new Date(
                          formDataBookingRoom.tanggal + "T00:00:00"
                        );

                        // Ambil jam dan menit dari timeSlot.key (format "HH:mm")
                        const [slotHour, slotMinute] = timeSlot.key
                          .split(":")
                          .map(Number);

                        // Gabungkan tanggal hari ini dengan jam slot
                        const slotTime = new Date(selectedDate);
                        slotTime.setHours(slotHour, slotMinute, 0, 0);

                        const parseHHMM = (hhmm) => {
                          const [h, m] = hhmm.split(":").map(Number);
                          const d = new Date(selectedDate);
                          d.setHours(h, m, 0, 0);
                          return d;
                        };

                        let slotStart = parseHHMM(timeSlot.start);
                        let slotEnd = parseHHMM(timeSlot.end);
                        if (slotEnd <= slotStart)
                          slotEnd.setDate(slotEnd.getDate() + 1);

                        const isCurrentTime = now >= slotStart && now < slotEnd;
                        const isPastTime = now >= slotEnd;

                        const isDisabled =
                          (isPastTime && !meeting) ||
                          (isCurrentTime && !meeting);

                        const isUnavailable = isPastTime || isCurrentTime;

                        return (
                          <div
                            key={timeSlot.key}
                            disabled={true}
                            className={`
    group relative p-1.5 rounded text-xs transition-all min-h-[50px] border
    bg-gray-50 border-gray-200 ${getSlotColor(status, meeting)}
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
                            {/* Tooltip on hover */}

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
                                  <div className="text-[8px] opacity-50">
                                    {formatDuration(meeting.duration)}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-400 text-[10px]">
                                  {isUnavailable ? "Telah Lewat" : "Tersedia"}
                                </div>
                              )}
                            </div>

                            {/* Priority dot */}
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

                            {/* Duration bar */}
                            {meeting && colSpan > 1 && (
                              <div className="absolute bottom-0.5 left-0.5 right-0.5 h-0.5 bg-black bg-opacity-20 rounded-full">
                                <div
                                  className="h-full bg-white bg-opacity-50 rounded-full"
                                  style={{ width: "100%" }}
                                ></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                      value={(employeeOptions || [])
                        .flatMap((group) => group.options || [])
                        .filter((opt) =>
                          formDataBookingRoom.pesertaRapat?.includes(opt.value)
                        )}
                      onChange={(selectedOptions) => {
                        let newSelection = [...(selectedOptions || [])];

                        // Cek apakah ada yang memilih "Semua Karyawan Unit ..."
                        const allUnitSelected = newSelection.find((opt) =>
                          opt.value.startsWith("unit_")
                        );
                        if (allUnitSelected) {
                          const unitName = allUnitSelected.value.replace(
                            "unit_",
                            ""
                          );

                          // Cari semua pegawai dari unit itu
                          const unitGroup = employeeOptions.find(
                            (group) => group.label === unitName
                          );
                          if (unitGroup) {
                            // Gabungkan semua pegawai unit itu ke dalam pilihan
                            newSelection = [
                              ...newSelection.filter(
                                (opt) => !opt.value.startsWith("unit_")
                              ), // hapus tag unit
                              ...unitGroup.options.filter(
                                (opt) => !opt.value.startsWith("unit_")
                              ), // ambil semua pegawai unit
                            ];

                            // Hilangkan duplikat berdasarkan value
                            const seen = new Set();
                            newSelection = newSelection.filter((opt) => {
                              if (seen.has(opt.value)) return false;
                              seen.add(opt.value);
                              return true;
                            });
                          }
                        }

                        setFormDataBookingRoom((prev) => ({
                          ...prev,
                          pesertaRapat: newSelection.map((opt) => opt.value),
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

                  {typePopUpBook === "room" && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Jenis Rapat *
                      </label>
                      <div className="flex space-x-4 mt-2">
                        {[
                          { value: "Offline", icon: Users, label: "Offline" },
                          { value: "Online", icon: Video, label: "Online" },
                          { value: "Hybrid", icon: Monitor, label: "Hybrid" },
                        ]
                          // Filter berdasarkan typePopUpBook
                          .filter((option) => {
                            if (typePopUpBook === "room") {
                              return option.value !== "Online";
                            }
                            return true; // "meeting" boleh semua
                          })
                          .map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center space-x-1 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="jenisRapat"
                                value={option.value}
                                checked={
                                  formDataBookingRoom.jenisRapat ===
                                  option.value
                                }
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 cursor-pointer focus:ring-blue-500"
                              />
                              <option.icon
                                size={16}
                                className="text-gray-600"
                              />
                              <span className="text-xs text-gray-700">
                                {option.label}
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 5: Meeting Link & Email Invitation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {(formDataBookingRoom.jenisRapat === "Online" ||
                    formDataBookingRoom.jenisRapat === "Hybrid") &&
                    typePopUpBook === "room" && (
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
                          className="w-4 h-4 text-blue-600 cursor-pointer focus:ring-blue-500"
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
                          className="w-4 h-4 text-blue-600 cursor-pointer focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">Tidak</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="flex-shrink-0 pt-4">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModalBook}
                  className="px-3 py-1 border cursor-pointer border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoadingSubmit}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPopup(false);
                    handleBookingSubmit();
                  }}
                  disabled={
                    isLoadingSubmit || !isFormValid(formDataBookingRoom)
                  }
                  className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-2 ${
                    isLoadingSubmit || !isFormValid(formDataBookingRoom)
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-[#ff7729] text-white cursor-pointer hover:shadow-lg"
                  }`}
                >
                  {isLoadingSubmit && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  <span>
                    {isLoadingSubmit
                      ? "Sedang diproses..."
                      : typePopUpBook === "room"
                      ? "Book Ruangan"
                      : "Buat Meeting"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showConfirmationPopUp && (
        <div className="fixed text-black text-sm inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20 backdrop-blur-md"
            onClick={closeConfirmationModal}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl px-8 py-6 w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Konfirmasi{" "}
                  {confirmationType === "booking"
                    ? "Booking"
                    : confirmationType === "meeting"
                    ? "Buat Meeting"
                    : "Tindakan"}
                </h3>
              </div>

              <button
                onClick={closeConfirmationModal}
                className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                disabled={isConfirmationLoading}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                {confirmationMessage ||
                  "Apakah Anda yakin ingin melanjutkan tindakan ini?"}
              </p>

              {/* Detail Information (if any) */}
              {confirmationDetails && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {confirmationDetails.namaRapat && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Nama Rapat:</span>
                      <span className="font-medium text-gray-900">
                        {confirmationDetails.namaRapat}
                      </span>
                    </div>
                  )}
                  {confirmationDetails.tanggal && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tanggal:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(
                          confirmationDetails.tanggal
                        ).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {confirmationDetails.waktu && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Waktu:</span>
                      <span className="font-medium text-gray-900">
                        {confirmationDetails.waktu.mulai} -{" "}
                        {confirmationDetails.waktu.selesai || "Selesai"}
                      </span>
                    </div>
                  )}
                  {confirmationDetails.ruangan && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ruangan:</span>
                      <span className="font-medium text-gray-900">
                        {confirmationDetails.ruangan}
                      </span>
                    </div>
                  )}
                  {confirmationDetails.jenisRapat && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Jenis Rapat:</span>
                      <span className="font-medium text-gray-900">
                        {confirmationDetails.jenisRapat}
                      </span>
                    </div>
                  )}
                  {confirmationDetails.pesertaCount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Jumlah Peserta:</span>
                      <span className="font-medium text-gray-900">
                        {confirmationDetails.pesertaCount} orang
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Warning Message (if any) */}
              {confirmationWarning && (
                <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-700">
                      {confirmationWarning}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeConfirmationModal}
                className="px-4 py-2 border cursor-pointer border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isConfirmationLoading}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isConfirmationLoading}
                className={`px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center space-x-2 font-medium ${
                  confirmationType === "delete" || confirmationType === "cancel"
                    ? isConfirmationLoading
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg"
                    : isConfirmationLoading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#ff7729] text-white hover:bg-[#e6691f] hover:shadow-lg"
                }`}
              >
                {isConfirmationLoading && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                <span>
                  {isConfirmationLoading
                    ? "Memproses..."
                    : confirmationType === "delete"
                    ? "Ya, Hapus"
                    : confirmationType === "cancel"
                    ? "Ya, Batalkan"
                    : confirmationType === "booking"
                    ? "Ya, Book Sekarang"
                    : confirmationType === "meeting"
                    ? "Ya, Buat Meeting Sekarang"
                    : "Ya, Lanjutkan"}
                </span>
              </button>
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
                  className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
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
                            Ruang {meeting.room}
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
