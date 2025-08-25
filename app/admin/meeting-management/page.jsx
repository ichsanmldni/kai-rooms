"use client";

import React, { useEffect, useState } from "react";
import { fetchMeetingList, deleteMeeting } from "../../../api-client/meeting";

export default function MeetingManagement() {
  const [meetings, setMeetings] = useState([]);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterDate, setFilterDate] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // <-- state baru

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const res = await fetchMeetingList();

      let meetingData = [];
      if (Array.isArray(res)) {
        meetingData = res;
      } else if (res?.data && Array.isArray(res.data)) {
        meetingData = res.data;
      } else if (res?.meetings && Array.isArray(res.meetings)) {
        meetingData = res.meetings;
      } else {
        console.error("Unrecognized data format from backend", res);
        setMeetings([]);
        return;
      }

      if (filterDate) {
        meetingData = meetingData.filter((meeting) => {
          const startDate = new Date(meeting.startTime);
          const meetingDate = startDate.toISOString().slice(0, 10);
          return meetingDate === filterDate;
        });
      }

      // Filter pencarian nama rapat (case-insensitive)
      if (searchQuery.trim() !== "") {
        const lowerSearch = searchQuery.toLowerCase();
        meetingData = meetingData.filter((meeting) =>
          meeting.title.toLowerCase().includes(lowerSearch)
        );
      }

      meetingData.sort((a, b) => {
        const timeA = new Date(a.startTime).getTime();
        const timeB = new Date(b.startTime).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });

      setMeetings(meetingData);
    } catch (error) {
      console.error("Failed to fetch meeting data:", error);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  // Tambahkan searchQuery di dependency supaya reload saat berubah
  useEffect(() => {
    loadMeetings();
  }, [sortOrder, filterDate, searchQuery]);

  const handleDelete = async (id) => {
    try {
      await deleteMeeting(id);
      setPendingDeleteId(null);
      await loadMeetings();
    } catch (error) {
      console.error("Failed to delete meeting:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
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
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "upcoming":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "ongoing":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "completed":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Rapat</h1>
          <p className="text-gray-600">Kelola dan pantau semua rapat yang telah dijadwalkan</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Sort Control */}
            <div className="flex items-center gap-3">
              <label htmlFor="sortOrder" className="text-sm font-medium text-gray-700">
                Urutkan:
              </label>
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">Terbaru</option>
                <option value="asc">Terlama</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-3">
              <label htmlFor="filterDate" className="text-sm font-medium text-gray-700">
                Filter Tanggal:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  id="filterDate"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {filterDate && (
                  <button
                    onClick={() => setFilterDate("")}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    title="Reset filter tanggal"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Search Box */}
            <div className="flex items-center gap-3 flex-grow">
              <label htmlFor="searchMeeting" className="text-sm font-medium text-gray-700">
                Cari Nama Rapat:
              </label>
              <input
                type="text"
                id="searchMeeting"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama rapat..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Memuat data rapat...</span>
              </div>
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rapat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {meetings.map((meeting) => {
                    const status = getMeetingStatus(meeting.startTime, meeting.endTime);
                    return (
                      <tr key={meeting.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <h3 className="text-sm font-medium text-gray-900">
                              {meeting.title}
                            </h3>
                            {meeting.description && (
                              <p className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                                {meeting.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {meeting.type}
                              </span>
                              {meeting.room && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {meeting.room.nama}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {formatDate(meeting.startTime)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
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
                              onClick={() => handleDelete(meeting.id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                              Konfirmasi Hapus
                            </button>
                          ) : (
                            <button
                              onClick={() => setPendingDeleteId(meeting.id)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
            </div>
          )}
        </div>

        {/* Footer Info */}
        {meetings.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Menampilkan {meetings.length} rapat
            {filterDate && ` untuk tanggal ${formatDate(filterDate)}`}
          </div>
        )}
      </div>
    </div>
  );
}