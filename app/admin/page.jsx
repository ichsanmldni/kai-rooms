"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Users,
  Building2,
  Plus,
  Edit,
  Trash2,
  Home,
  ChevronRight,
  Package,
  X,
  AlertTriangle,
  LogOut,
  Landmark,
  Clock,
  Bell,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// API clients - sesuaikan path jika struktur folder berbeda
import {
  createUnit,
  deleteUnit,
  fetchUnitList,
  updateUnit,
} from "../../api-client/unit";
import {
  createEmployee,
  deleteEmployee,
  fetchEmployeeList,
  updateEmployee,
} from "../../api-client/employee";
import {
  createRoom,
  deleteRoom,
  fetchRoomList,
  updateRoom,
} from "../../api-client/room";
import { fetchMeetingList, deleteMeeting } from "../../api-client/meeting";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("employee");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add | edit | delete
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // data lists
  const [employeeList, setEmployeeList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [meetings, setMeetings] = useState([]);

  // clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // form data (reused for employee/unit/room)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    unitId: "",
    capacity: 0,
    location: "",
  });

  // meeting controls
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterDate, setFilterDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const tabs = [
    { id: "employee", label: "Employee", icon: Users, color: "blue" },
    { id: "unit", label: "Unit", icon: Landmark, color: "teal" },
    { id: "room", label: "Room", icon: Building2, color: "green" },
    { id: "meeting", label: "Meeting", icon: Bell, color: "violet" },
  ];

  useEffect(() => {
    loadData();
    // clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // reload meetings when filters change
  useEffect(() => {
    if (activeTab === "meeting") {
      loadMeetings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder, filterDate, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "employee") {
        const employees = await fetchEmployeeList();
        setEmployeeList(
          Array.isArray(employees) ? employees : employees.data || []
        );
        // also load units for dropdown
        const units = await fetchUnitList();
        setUnitList(Array.isArray(units) ? units : units.data || []);
      } else if (activeTab === "unit") {
        const units = await fetchUnitList();
        setUnitList(Array.isArray(units) ? units : units.data || []);
      } else if (activeTab === "room") {
        const rooms = await fetchRoomList();
        setRoomList(Array.isArray(rooms) ? rooms : rooms.data || []);
      } else if (activeTab === "meeting") {
        await loadMeetings();
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const res = await fetchMeetingList();

      let meetingData = [];
      if (Array.isArray(res)) meetingData = res;
      else if (res?.data && Array.isArray(res.data)) meetingData = res.data;
      else if (res?.meetings && Array.isArray(res.meetings))
        meetingData = res.meetings;
      else if (res) meetingData = Array.isArray(res) ? res : [];

      // filter by date
      if (filterDate) {
        meetingData = meetingData.filter((m) => {
          const startDate = new Date(
            m.startTime || m.date || m.start || m.start_time
          );
          const meetingDate = startDate.toISOString().slice(0, 10);
          return meetingDate === filterDate;
        });
      }

      // search by title (case-insensitive)
      if (searchQuery.trim() !== "") {
        const lower = searchQuery.toLowerCase();
        meetingData = meetingData.filter((m) =>
          (m.title || m.name || "").toLowerCase().includes(lower)
        );
      }

      meetingData.sort((a, b) => {
        const timeA = new Date(a.startTime || a.date || a.start).getTime();
        const timeB = new Date(b.startTime || b.date || b.start).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });

      setMeetings(meetingData);
    } catch (error) {
      console.error("Failed to fetch meeting data:", error);
      setMeetings([]);
      toast.error("Gagal memuat data rapat");
    } finally {
      setLoading(false);
    }
  };

  // helpers for meeting status & formatting
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMeetingStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "ongoing";
    return "completed";
  };

  const getStatusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "upcoming":
        return `${base} bg-blue-100 text-blue-800`;
      case "ongoing":
        return `${base} bg-green-100 text-green-800`;
      case "completed":
        return `${base} bg-gray-100 text-gray-800`;
      default:
        return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "upcoming":
        return "Akan Datang";
      case "ongoing":
        return "Berlangsung";
      case "completed":
        return "Selesai";
      default:
        return "-";
    }
  };

  // modal open/close and form handling (employee/unit/room)
  const openModal = (mode, item = null) => {
    setModalMode(mode);
    setSelectedItem(item);
    setShowModal(true);

    if (mode === "edit" && item) {
      // map item properties to formData keys used by forms
      setFormData({
        name: item.name || item.nama || "",
        email: item.email || "",
        unitId: item.unitId || item.unit_id || item.unit || "",
        capacity: item.capacity || item.kapasitas || 0,
        location: item.location || item.location || item.lokasi || "",
      });
    } else if (mode === "delete" && item) {
      // nothing to set in form
      setFormData({
        name: item.name || item.nama || "",
        email: "",
        unitId: "",
        capacity: 0,
        location: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        unitId: "",
        capacity: 0,
        location: "",
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalMode("add");
    setFormData({
      name: "",
      email: "",
      unitId: "",
      capacity: 0,
      location: "",
    });
  };

  // submit for add / edit / delete (employee, unit, room)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === "add") {
        if (activeTab === "employee") {
          await createEmployee({
            name: formData.name,
            email: formData.email,
            unitId: formData.unitId,
          });
          toast.success("Karyawan dibuat");
        } else if (activeTab === "room") {
          await createRoom({
            name: formData.name,
            capacity: formData.capacity,
            location: formData.location,
          });
          toast.success("Ruangan dibuat");
        } else if (activeTab === "unit") {
          await createUnit({
            name: formData.name,
          });
          toast.success("Unit dibuat");
        }
      } else if (modalMode === "edit" && selectedItem) {
        if (activeTab === "employee") {
          await updateEmployee({
            id: selectedItem.id,
            name: formData.name,
            email: formData.email,
            unitId: formData.unitId,
          });
          toast.success("Karyawan diperbarui");
        } else if (activeTab === "room") {
          await updateRoom({
            id: selectedItem.id,
            name: formData.name,
            capacity: formData.capacity,
            location: formData.location,
          });
          toast.success("Ruangan diperbarui");
        } else if (activeTab === "unit") {
          await updateUnit({
            id: selectedItem.id,
            name: formData.name,
          });
          toast.success("Unit diperbarui");
        }
      } else if (modalMode === "delete" && selectedItem) {
        if (activeTab === "employee") {
          await deleteEmployee(selectedItem.id);
          toast.success("Karyawan dihapus");
        } else if (activeTab === "room") {
          await deleteRoom(selectedItem.id);
          toast.success("Ruangan dihapus");
        } else if (activeTab === "unit") {
          await deleteUnit(selectedItem.id);
          toast.success("Unit dihapus");
        }
      }

      await loadData();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Terjadi kesalahan");
    }
  };

  // meeting delete
  const handleDeleteMeeting = async (id) => {
    try {
      await deleteMeeting(id);
      setPendingDeleteId(null);
      toast.success("Rapat dihapus");
      await loadMeetings();
    } catch (error) {
      console.error("Failed to delete meeting:", error);
      toast.error("Gagal menghapus rapat");
    }
  };

  // table helpers for employee/unit/room
  const getCurrentData = () => {
    switch (activeTab) {
      case "employee":
        return employeeList;
      case "unit":
        return unitList;
      case "room":
        return roomList;
      default:
        return [];
    }
  };

  const renderTableHeaders = () => {
    if (activeTab === "employee") {
      return (
        <tr className="bg-gray-50">
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Name
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Email
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Unit
          </th>
          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
            Actions
          </th>
        </tr>
      );
    } else if (activeTab === "room") {
      return (
        <tr className="bg-gray-50">
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Name
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Capacity
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Location
          </th>
          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
            Actions
          </th>
        </tr>
      );
    }

    // unit or default
    return (
      <tr className="bg-gray-50">
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Name
        </th>
        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
          Actions
        </th>
      </tr>
    );
  };

  const renderTableRow = (item) => {
    if (activeTab === "employee") {
      return (
        <tr key={item.id} className="hover:bg-gray-50">
          <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
          <td className="px-4 py-3 text-sm text-gray-900">{item.email}</td>
          <td className="px-4 py-3 text-sm text-gray-900">
            {unitList.find((u) => u.id === item.unitId)?.name || "-"}
          </td>
          <td className="px-4 py-3 text-sm text-center">
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => openModal("edit", item)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => openModal("delete", item)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </td>
        </tr>
      );
    } else if (activeTab === "room") {
      return (
        <tr key={item.id} className="hover:bg-gray-50">
          <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
          <td className="px-4 py-3 text-sm text-gray-900">{item.capacity}</td>
          <td className="px-4 py-3 text-sm text-gray-900">{item.location}</td>
          <td className="px-4 py-3 text-sm text-center">
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => openModal("edit", item)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => openModal("delete", item)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </td>
        </tr>
      );
    }

    // unit
    return (
      <tr key={item.id} className="hover:bg-gray-50">
        <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
        <td className="px-4 py-3 text-sm text-center">
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => openModal("edit", item)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => openModal("delete", item)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // format time for header clock
  const formatClock = (date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const logoutHandle = () => {
    document.cookie = "authKAI=; max-age=0; path=/;";
    window.location.reload();
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-60 bg-[#ffffff]/80 backdrop-blur-md border border-[#d6eaff] z-40 shadow-xl">
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="relative group">
                  <div className="w-9 h-9 p-[7px] bg-gradient-to-br from-[#1b68b0] to-[#144a87] rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ring-2 ring-blue-100/50">
                    <img
                      src="/images/KAI_ROOMS_logo.png"
                      alt="KAI Rooms Logo"
                      className="w-full h-full object-contain filter brightness-0 invert"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white shadow-sm">
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                    <div className="relative w-full h-full bg-green-500 rounded-full"></div>
                  </div>
                  <div className="absolute inset-0 w-10 h-10 bg-[#1b68b0]/20 rounded-xl blur-md -z-10 group-hover:bg-[#1b68b0]/30 transition-all duration-300"></div>
                </div>
              </div>
              <div>
                <h2 className="text-md font-bold text-[#1b68b0]">KAI Rooms</h2>
                <p className="text-xs text-[#6b7280]">Integrated Meeting Hub</p>
              </div>
            </div>
          </div>

          <nav className="p-3">
            <ul className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <li key={tab.id} className="relative">
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                        isActive
                          ? "bg-[#1b68b0] text-white shadow-md"
                          : "text-gray-600 hover:bg-[#f2f6fa] hover:text-[#1b68b0] hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          size={16}
                          className={
                            isActive
                              ? "text-white"
                              : "text-gray-500 group-hover:text-[#1b68b0]"
                          }
                        />
                        <span className="font-medium text-sm">{tab.label}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

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
        <main className="flex-1 ml-60">
          <header className="bg-[#f0f0f2] backdrop-blur-xl border-b border-[#d6eaff] px-6 py-[17px] shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
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
                    {formatClock(currentTime)}{" "}
                    <span className="font-normal">WIB</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <Home size={16} />
                <ChevronRight size={16} />
                <span className="text-gray-900">
                  {tabs.find((t) => t.id === activeTab)?.label}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  {tabs.find((t) => t.id === activeTab)?.label} Management
                </h1>

                {activeTab !== "meeting" ? (
                  <button
                    onClick={() => openModal("add")}
                    className="flex items-center space-x-2 px-2 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={12} />
                    <span className="text-sm">
                      Add {tabs.find((t) => t.id === activeTab)?.label}
                    </span>
                  </button>
                ) : null}
              </div>
            </div>

            {/* Table / Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4">
                {/* Meeting controls */}
                {activeTab === "meeting" && (
                  <div className="bg-white rounded-lg shadow-none border border-gray-100 p-4 mb-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor="sortOrder"
                          className="text-sm font-medium text-gray-700"
                        >
                          Urutkan:
                        </label>
                        <select
                          id="sortOrder"
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value)}
                          className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="desc">Terbaru</option>
                          <option value="asc">Terlama</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3">
                        <label
                          htmlFor="filterDate"
                          className="text-sm font-medium text-gray-700"
                        >
                          Filter Tanggal:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            id="filterDate"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md"
                          />
                          {filterDate && (
                            <button
                              onClick={() => setFilterDate("")}
                              className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-grow">
                        <label
                          htmlFor="searchMeeting"
                          className="text-sm font-medium text-gray-700"
                        >
                          Cari Nama Rapat:
                        </label>
                        <input
                          type="text"
                          id="searchMeeting"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Cari berdasarkan nama rapat..."
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                  {activeTab === "meeting" ? (
                    <>
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-gray-600">
                              Memuat data rapat...
                            </span>
                          </div>
                        </div>
                      ) : meetings.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                            <svg
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-8 0a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2M8 7h8m0 0v4a2 2 0 01-2 2H10a2 2 0 01-2-2V7"
                              />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Tidak ada rapat ditemukan
                          </h3>
                          <p className="text-gray-600">
                            {filterDate
                              ? "Tidak ada rapat pada tanggal yang dipilih"
                              : "Belum ada rapat yang dijadwalkan"}
                          </p>
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Rapat
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Waktu
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                Aksi
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {meetings.map((meeting) => {
                              const status = getMeetingStatus(
                                meeting.startTime || meeting.start,
                                meeting.endTime || meeting.end
                              );
                              return (
                                <tr
                                  key={meeting.id}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                      <h3 className="text-sm font-medium text-gray-900">
                                        {meeting.title || meeting.name}
                                      </h3>
                                      {meeting.description && (
                                        <p className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                                          {meeting.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-2 mt-2">
                                        {meeting.type && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {meeting.type}
                                          </span>
                                        )}
                                        {meeting.room && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {meeting.room.nama ||
                                              meeting.room.name}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                      {formatDate(
                                        meeting.startTime || meeting.start
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {formatTime(
                                        meeting.startTime || meeting.start
                                      )}{" "}
                                      -{" "}
                                      {formatTime(
                                        meeting.endTime || meeting.end
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={getStatusBadge(status)}>
                                      {getStatusText(status)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    {pendingDeleteId === meeting.id ? (
                                      <button
                                        onClick={() =>
                                          handleDeleteMeeting(meeting.id)
                                        }
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                      >
                                        Konfirmasi Hapus
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          setPendingDeleteId(meeting.id)
                                        }
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                      >
                                        <svg
                                          className="w-4 h-4 mr-2"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                        Hapus
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </>
                  ) : (
                    // employee / unit / room tables
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>{renderTableHeaders()}</thead>
                      <tbody className="divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span>Loading...</span>
                              </div>
                            </td>
                          </tr>
                        ) : getCurrentData().length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              <Package
                                size={48}
                                className="mx-auto text-gray-300 mb-3"
                              />
                              <p>No data available</p>
                            </td>
                          </tr>
                        ) : (
                          getCurrentData().map(renderTableRow)
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Footer info for meetings */}
            {activeTab === "meeting" && meetings.length > 0 && (
              <div className="mt-4 text-sm text-gray-600 text-center">
                Menampilkan {meetings.length} rapat
                {filterDate && ` untuk tanggal ${formatDate(filterDate)}`}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          ></div>

          <div className="relative bg-white rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-md font-semibold text-black">
                {modalMode === "delete"
                  ? `Delete ${tabs.find((t) => t.id === activeTab)?.label}`
                  : `${modalMode === "add" ? "Add" : "Edit"} ${
                      tabs.find((t) => t.id === activeTab)?.label
                    }`}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>

            {modalMode === "delete" ? (
              <div className="p-4">
                <div className="flex text-black items-center space-x-3 mb-4">
                  <AlertTriangle className="text-red-500" size={16} />
                  <p className="text-sm">
                    Are you sure to delete this {activeTab}?
                  </p>
                </div>
                <div className="flex space-x-3 justify-end">
                  <button
                    onClick={closeModal}
                    className="px-2 py-1 cursor-pointer text-gray-600 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-2 py-1 cursor-pointer bg-red-600 text-sm text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-4 space-y-4 text-black"
              >
                {activeTab === "employee" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full px-3 text-black text-sm py-2 border border-gray-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, email: e.target.value }))
                        }
                        className="w-full px-3 text-black py-2 text-sm border border-gray-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit
                      </label>
                      <div className="relative w-full">
                        <select
                          required
                          value={formData.unitId}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              unitId: e.target.value,
                            }))
                          }
                          className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-xl appearance-none"
                        >
                          <option value="">Select Unit</option>
                          {unitList.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg
                            className="w-4 h-4 text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 12a1 1 0 01-.7-.3l-3-3a1 1 0 111.4-1.4L10 9.6l2.3-2.3a1 1 0 111.4 1.4l-3 3a1 1 0 01-.7.3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </>
                ) : activeTab === "room" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full text-black text-sm px-3 py-2 border border-gray-300 rounded-xl"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.capacity}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            capacity: +e.target.value,
                          }))
                        }
                        className="w-full text-black text-sm px-3 py-2 border border-gray-300 rounded-xl"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            location: e.target.value,
                          }))
                        }
                        className="w-full text-black px-3 py-2 text-sm border border-gray-300 rounded-xl"
                      />
                    </div>
                  </>
                ) : (
                  // unit
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full text-black px-3 py-2 text-sm border border-gray-300 rounded-xl"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-2 py-1 text-sm cursor-pointer text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2 py-1 text-sm cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {modalMode === "add" ? "Create" : "Save"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
