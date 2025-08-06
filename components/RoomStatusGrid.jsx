import React, { useState } from "react";
import {
  Building,
  Plus,
  Filter,
  PlayCircle,
  Clock,
  CheckCircle,
  MapPin,
  Users,
  Eye,
  Share2,
  X,
  Calendar,
  User,
} from "lucide-react";

const RoomStatusGrid = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // Generate time slots (8 AM - 6 PM)
  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  // Sample data dengan meeting per ruangan dan time slot
  const rooms = [
    {
      id: 1,
      name: "Meeting Room A",
      unit: "IT Department",
      capacity: 12,
      meetings: {
        "09:00": {
          title: "Sprint Planning Q1",
          endTime: "11:00",
          participants: 8,
          status: "berlangsung",
          priority: "high",
          organizer: "John Doe",
          description:
            "Sprint planning untuk quarter pertama dengan fokus pada pengembangan fitur baru.",
          duration: 2, // 2 hours
        },
        "14:00": {
          title: "Code Review",
          endTime: "15:00",
          participants: 6,
          status: "mendatang",
          priority: "medium",
          organizer: "Jane Smith",
          description: "Review code untuk release minggu depan.",
          duration: 1,
        },
      },
    },
    {
      id: 2,
      name: "Conference Room B",
      unit: "Marketing",
      capacity: 20,
      meetings: {
        "10:00": {
          title: "Campaign Strategy",
          endTime: "12:00",
          participants: 15,
          status: "berlangsung",
          priority: "high",
          organizer: "Sarah Wilson",
          description:
            "Diskusi strategi kampanye untuk peluncuran produk baru.",
          duration: 2,
        },
        "15:00": {
          title: "Client Presentation",
          endTime: "16:30",
          participants: 8,
          status: "mendatang",
          priority: "high",
          organizer: "Mike Johnson",
          description: "Presentasi proposal kepada client potensial.",
          duration: 1.5,
        },
      },
    },
    {
      id: 3,
      name: "Training Room C",
      unit: "HR",
      capacity: 25,
      meetings: {
        "13:00": {
          title: "Employee Onboarding",
          endTime: "17:00",
          participants: 12,
          status: "mendatang",
          priority: "medium",
          organizer: "Lisa Chen",
          description: "Orientasi karyawan baru batch Januari.",
          duration: 4,
        },
      },
    },
    {
      id: 4,
      name: "Executive Room",
      unit: "Management",
      capacity: 8,
      meetings: {
        "08:00": {
          title: "Board Meeting",
          endTime: "09:30",
          participants: 6,
          status: "selesai",
          priority: "high",
          organizer: "Michael Chen",
          description:
            "Meeting board bulanan untuk review performa perusahaan.",
          duration: 1.5,
        },
      },
    },
    {
      id: 5,
      name: "Creative Studio",
      unit: "Design",
      capacity: 10,
      meetings: {
        "11:00": {
          title: "Design Review",
          endTime: "12:30",
          participants: 7,
          status: "berlangsung",
          priority: "medium",
          organizer: "Emma Davis",
          description: "Review design untuk project client.",
          duration: 1.5,
        },
        "16:00": {
          title: "Creative Brainstorm",
          endTime: "17:00",
          participants: 5,
          status: "mendatang",
          priority: "low",
          organizer: "Alex Kim",
          description: "Brainstorming ide untuk campaign Q2.",
          duration: 1,
        },
      },
    },
    {
      id: 6,
      name: "Collaboration Hub",
      unit: "Sales",
      capacity: 15,
      meetings: {
        "15:00": {
          title: "Sales Strategy",
          endTime: "16:30",
          participants: 10,
          status: "mendatang",
          priority: "high",
          organizer: "Robert Taylor",
          description: "Review target sales Q1 dan strategi pencapaian.",
          duration: 1.5,
        },
      },
    },
  ];

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:00`;
  };

  const getSlotStatus = (room, timeSlot) => {
    const meeting = room.meetings[timeSlot];
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

  const isSlotSpanned = (room, timeSlot) => {
    const slotHour = parseInt(timeSlot.split(":")[0]);

    // Check if this slot is part of a longer meeting that started earlier
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

  const filteredRooms = rooms.filter((room) => {
    if (activeFilter === "all") return true;

    const hasStatus = Object.values(room.meetings).some((meeting) => {
      const status = getSlotStatus(
        room,
        Object.keys(room.meetings).find((key) => room.meetings[key] === meeting)
      );
      if (activeFilter === "berlangsung") return status === "ongoing";
      if (activeFilter === "mendatang") return status === "upcoming";
      if (activeFilter === "selesai") return status === "finished";
      return false;
    });

    return hasStatus;
  });

  const handleSlotClick = (room, timeSlot) => {
    const meeting = room.meetings[timeSlot];
    if (meeting) {
      setSelectedTimeSlot({
        room,
        timeSlot,
        meeting,
        status: getSlotStatus(room, timeSlot),
      });
    } else {
      // Handle booking new meeting
      setSelectedTimeSlot({
        room,
        timeSlot,
        meeting: null,
        status: "available",
      });
    }
  };

  const closeDetail = () => {
    setSelectedTimeSlot(null);
  };

  return (
    <div className="xl:col-span-2">
      <div className="overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#d6eaff]">
        <div className="p-5 border-b border-gray-100/50">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Building className="text-[#1b68b0]" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                Status Ruangan Hari Ini
              </h3>
            </div>
            <button
              onClick={() => setShowPopup(true)}
              className="bg-[#ff7729] text-xs text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:shadow-md transition-all hover:scale-105"
            >
              <Plus size={16} />
              <span>Book Ruangan</span>
            </button>
          </div>

          {/* Filter */}
          <div className="flex space-x-2 flex-wrap mb-4">
            {[
              { key: "all", label: "All", icon: Filter },
              { key: "berlangsung", label: "Berlangsung", icon: PlayCircle },
              { key: "mendatang", label: "Mendatang", icon: Clock },
              { key: "selesai", label: "Selesai", icon: CheckCircle },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === filter.key
                    ? "bg-[#d8eafa] text-[#1b68b0] border border-[#a7d2f3]"
                    : "text-gray-600 hover:bg-[#f0f0f2]"
                }`}
              >
                <filter.icon size={12} />
                <span>{filter.label}</span>
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
              <span className="text-gray-600">Tersedia</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-100 border-2 border-green-300 rounded"></div>
              <span className="text-gray-600">Berlangsung</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-100 border-2 border-blue-300 rounded"></div>
              <span className="text-gray-600">Mendatang</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-100 border-2 border-gray-300 rounded"></div>
              <span className="text-gray-600">Selesai</span>
            </div>
          </div>
        </div>

        {/* Time Blocking Grid */}
        <div className="p-5">
          <div className="space-y-6">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                {/* Room Header */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{room.name}</h4>
                    <p className="text-xs text-gray-500">
                      {room.unit} • Kapasitas: {room.capacity} orang
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {getCurrentTime()} - Current Time
                  </div>
                </div>

                {/* Time Slots Grid */}
                <div className="grid grid-cols-11 gap-1">
                  {timeSlots.map((timeSlot, index) => {
                    const meeting = room.meetings[timeSlot];
                    const status = getSlotStatus(room, timeSlot);
                    const isSpanned = isSlotSpanned(room, timeSlot);

                    if (isSpanned) {
                      return null; // Skip rendering spanned slots
                    }

                    const colSpan = meeting ? getSlotSpan(meeting) : 1;

                    return (
                      <button
                        key={timeSlot}
                        onClick={() => handleSlotClick(room, timeSlot)}
                        className={`
                          relative p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer
                          ${getSlotColor(status, meeting)}
                          ${colSpan > 1 ? `col-span-${colSpan}` : ""}
                          hover:shadow-sm
                        `}
                        style={
                          colSpan > 1 ? { gridColumn: `span ${colSpan}` } : {}
                        }
                      >
                        <div className="text-center">
                          <div className="font-mono text-xs mb-1">
                            {timeSlot}
                          </div>
                          {meeting ? (
                            <div className="space-y-1">
                              <div className="font-medium truncate text-xs">
                                {meeting.title}
                              </div>
                              <div className="flex items-center justify-center space-x-1 opacity-75">
                                <Users size={8} />
                                <span>{meeting.participants}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-xs">Free</div>
                          )}
                        </div>

                        {/* Priority indicator */}
                        {meeting && (
                          <div
                            className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                              meeting.priority === "high"
                                ? "bg-red-500"
                                : meeting.priority === "medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTimeSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedTimeSlot.room.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedTimeSlot.timeSlot} • {selectedTimeSlot.room.unit}
                </p>
              </div>
              <button
                onClick={closeDetail}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {selectedTimeSlot.meeting ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          selectedTimeSlot.meeting.priority === "high"
                            ? "bg-red-500"
                            : selectedTimeSlot.meeting.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      />
                      <span>{selectedTimeSlot.meeting.title}</span>
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedTimeSlot.status === "ongoing"
                          ? "bg-green-100 text-green-800"
                          : selectedTimeSlot.status === "upcoming"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {selectedTimeSlot.status === "ongoing"
                        ? "Sedang Berlangsung"
                        : selectedTimeSlot.status === "upcoming"
                        ? "Akan Datang"
                        : "Selesai"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock size={14} />
                      <span>
                        {selectedTimeSlot.timeSlot} -{" "}
                        {selectedTimeSlot.meeting.endTime}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users size={14} />
                      <span>
                        {selectedTimeSlot.meeting.participants} peserta
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 col-span-2">
                      <User size={14} />
                      <span>{selectedTimeSlot.meeting.organizer}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {selectedTimeSlot.meeting.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                  <h4 className="font-medium text-gray-600 mb-2">
                    Slot Tersedia
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Waktu: {selectedTimeSlot.timeSlot} di{" "}
                    {selectedTimeSlot.room.name}
                  </p>
                  <button className="bg-[#ff7729] text-white px-4 py-2 rounded-lg hover:bg-[#e6661a] transition-colors">
                    Book Ruangan
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedTimeSlot.meeting && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-[#1b68b0] text-white rounded-lg hover:bg-[#155a9a] transition-colors text-sm">
                      <Eye size={14} />
                      <span>Lihat Detail</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      <Share2 size={14} />
                      <span>Share</span>
                    </button>
                  </div>
                  <button
                    onClick={closeDetail}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomStatusGrid;
