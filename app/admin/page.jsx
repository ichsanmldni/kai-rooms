"use client";

import { useState, useEffect } from "react";
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
import Image from "next/image";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("employee");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // Data states
  const [employeeList, setEmployeeList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    unitId: "",
    capacity: 0,
    location: "",
  });

  const tabs = [
    {
      id: "employee",
      label: "Employee",
      icon: Users, // Ikon orang untuk karyawan
      color: "blue",
    },
    {
      id: "unit",
      label: "Unit",
      icon: Landmark, // Ikon institusi untuk unit/departemen
      color: "teal",
    },
    {
      id: "room",
      label: "Room",
      icon: Building2, // Ikon bangunan untuk ruangan
      color: "green",
    },
  ];

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "employee":
          const employees = await fetchEmployeeList();
          setEmployeeList(employees);

          // Load units for dropdown
          const unitss = await fetchUnitList();
          setUnitList(unitss);
          break;

        case "unit":
          const units = await fetchUnitList();
          setUnitList(units);
          break;
        case "room":
          const rooms = await fetchRoomList();
          setRoomList(rooms);
          break;
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

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
            Locations
          </th>
          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
            Actions
          </th>
        </tr>
      );
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === "add") {
        if (activeTab === "employee") {
          await createEmployee(formData);
        } else if (activeTab === "room") {
          await createRoom(formData);
        } else {
          await createUnit(formData);
        }
      } else if (modalMode === "edit") {
        if (activeTab === "employee") {
          const payload = {
            id: selectedItem.id,
            name: formData.name,
            email: formData.email,
            unitId: formData.unitId,
          };
          await updateEmployee(payload);
        } else if (activeTab === "room") {
          const payload = {
            id: selectedItem.id,
            name: formData.name,
            location: formData.location,
            capacity: formData.capacity,
          };
          await updateRoom(payload);
        } else {
          const payload = {
            id: selectedItem.id,
            name: formData.name,
          };
          await updateUnit(payload);
        }
      } else if (modalMode === "delete") {
        if (activeTab === "employee") {
          await deleteEmployee(selectedItem.id);
        } else {
          await deleteUnit(selectedItem.id);
        }
      }

      loadData();
      closeModal();
      toast.success(
        `${modalMode === "add" ? "Created" : "Updated"} successfully`
      );
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "An error occurred");
    }
  };

  const handleDelete = async () => {
    try {
      if (activeTab === "employee") {
        await deleteEmployee(selectedItem.id);
      } else if (activeTab === "room") {
        await deleteRoom(selectedItem.id);
      } else {
        await deleteUnit(selectedItem.id);
      }

      loadData();
      closeModal();
      toast.success("Deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "An error occurred");
    }
  };

  const openModal = (mode, item = null) => {
    setModalMode(mode);
    setSelectedItem(item);
    setShowModal(true);

    if (mode === "edit" && item) {
      setFormData(item);
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

  const formatTime = (date) => {
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
                    {formatTime(currentTime)}{" "}
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

                <button
                  onClick={() => openModal("add")}
                  className="flex items-center space-x-2 px-2 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={12} />
                  <span className="text-sm">
                    Add {tabs.find((t) => t.id === activeTab)?.label}
                  </span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
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
              </div>
            </div>
          </div>
          {/* Header */}
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
                    Are you sure you want to delete this {activeTab}?
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
                    onClick={handleDelete}
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
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
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
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
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
                            setFormData((prev) => ({
                              ...prev,
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
                        {/* Custom Arrow Icon */}
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
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
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
                          setFormData((prev) => ({
                            ...prev,
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
                          setFormData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="w-full text-black px-3 py-2 text-sm border border-gray-300 rounded-xl"
                      />
                    </div>
                  </>
                ) : (
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
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
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
