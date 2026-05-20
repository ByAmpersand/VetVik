import { useState } from "react";
import {
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  Edit3,
  X,
  ChevronRight,
  Stethoscope,
} from "lucide-react";
import { StatusBadge } from "../../components/DashboardLayout";
import { doctors, appointments } from "../../data/mockData";
import type { DoctorStatus } from "../../data/mockData";

export function DoctorManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    DoctorStatus | "All"
  >("All");
  const [addDoctorOpen, setAddDoctorOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">(
    "cards",
  );

  const filtered = doctors.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses: (DoctorStatus | "All")[] = [
    "All",
    "Available",
    "Busy",
    "Off duty",
  ];

  const statusCounts = {
    All: doctors.length,
    Available: doctors.filter((d) => d.status === "Available")
      .length,
    Busy: doctors.filter((d) => d.status === "Busy").length,
    "Off duty": doctors.filter((d) => d.status === "Off duty")
      .length,
  };

  const getDoctorAppointments = (doctorId: string) =>
    appointments.filter(
      (a) =>
        a.doctorId === doctorId && a.date === "May 19, 2025",
    );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-slate-900"
            style={{ fontSize: "1.5rem", fontWeight: 700 }}
          >
            Doctor Management
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {doctors.length} doctors registered
          </p>
        </div>
        <button
          onClick={() => setAddDoctorOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600 transition-colors"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Add doctor
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-5">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
              statusFilter === s
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
            style={{ fontWeight: 500 }}
          >
            {s}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                statusFilter === s
                  ? "bg-white/20"
                  : "bg-slate-100 text-slate-500"
              }`}
              style={{ fontWeight: 600 }}
            >
              {statusCounts[s as keyof typeof statusCounts] ??
                doctors.length}
            </span>
          </button>
        ))}
      </div>

      {/* Search + view toggle */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex bg-slate-100 rounded-xl p-1 ml-auto">
          {(["cards", "table"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-4 py-1.5 rounded-lg text-xs transition-all capitalize ${
                viewMode === m
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              style={{ fontWeight: 500 }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Cards view */}
      {viewMode === "cards" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const todayApts = getDoctorAppointments(doc.id);
            const completedToday = todayApts.filter(
              (a) => a.status === "Completed",
            ).length;
            return (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-teal-200 hover:shadow-sm transition-all"
              >
                {/* Card header */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white"
                        style={{
                          fontWeight: 700,
                          fontSize: "1rem",
                        }}
                      >
                        {doc.avatar}
                      </div>
                      <div>
                        <h3
                          className="text-slate-900"
                          style={{ fontWeight: 700 }}
                        >
                          {doc.name}
                        </h3>
                        <p className="text-slate-500 text-xs">
                          {doc.specialization}
                        </p>
                      </div>
                    </div>
                    <button className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                      <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={doc.status} />
                    <span className="text-xs text-slate-400">
                      {doc.experience} exp.
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-xs truncate">
                      {doc.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-xs">{doc.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-600">
                      {doc.todayAppointments} appointments today
                    </span>
                    {completedToday > 0 && (
                      <span className="text-xs text-green-600">
                        ({completedToday} done)
                      </span>
                    )}
                  </div>

                  {/* Workload bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Today's workload</span>
                      <span>{doc.todayAppointments}/10</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          doc.todayAppointments >= 8
                            ? "bg-amber-500"
                            : "bg-teal-500"
                        }`}
                        style={{
                          width: `${(doc.todayAppointments / 10) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      className="flex-1 py-2 text-xs border border-teal-200 text-teal-600 rounded-xl hover:bg-teal-50 flex items-center justify-center gap-1 transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      <Calendar className="w-3 h-3" />
                      View schedule
                    </button>
                    <button
                      className="flex-1 py-2 text-xs border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-1 transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add doctor card */}
          <button
            onClick={() => setAddDoctorOpen(true)}
            className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 p-6 hover:border-teal-300 hover:bg-teal-50/30 transition-all min-h-64"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-slate-400" />
            </div>
            <div className="text-center">
              <p
                className="text-slate-600 text-sm"
                style={{ fontWeight: 600 }}
              >
                Add a new doctor
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Register a new veterinarian
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Table view */}
      {viewMode === "table" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    "Doctor",
                    "Specialization",
                    "Email",
                    "Phone",
                    "Today's Apts",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs text-slate-500"
                      style={{ fontWeight: 600 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xs"
                          style={{ fontWeight: 700 }}
                        >
                          {doc.avatar}
                        </div>
                        <div>
                          <p
                            className="text-sm text-slate-900"
                            style={{ fontWeight: 600 }}
                          >
                            {doc.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {doc.experience} experience
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {doc.specialization}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${doc.email}`}
                        className="text-sm text-teal-600 hover:underline"
                      >
                        {doc.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {doc.phone}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm text-slate-900"
                          style={{ fontWeight: 600 }}
                        >
                          {doc.todayAppointments}
                        </span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${doc.todayAppointments >= 8 ? "bg-amber-500" : "bg-teal-500"}`}
                            style={{
                              width: `${(doc.todayAppointments / 10) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="px-2.5 py-1.5 text-xs border border-teal-200 text-teal-600 rounded-lg hover:bg-teal-50 flex items-center gap-1"
                          style={{ fontWeight: 500 }}
                        >
                          <Calendar className="w-3 h-3" />
                          Schedule
                        </button>
                        <button
                          className="px-2.5 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 flex items-center gap-1"
                          style={{ fontWeight: 500 }}
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {addDoctorOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <h2
                  className="text-slate-900"
                  style={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                >
                  Add New Doctor
                </h2>
              </div>
              <button
                onClick={() => setAddDoctorOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label
                    className="block text-xs text-slate-600 mb-1.5"
                    style={{ fontWeight: 500 }}
                  >
                    Full name
                  </label>
                  <input
                    placeholder="Dr. First Last"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs text-slate-600 mb-1.5"
                    style={{ fontWeight: 500 }}
                  >
                    Specialization
                  </label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    <option>General Veterinary</option>
                    <option>Surgery & Orthopedics</option>
                    <option>Dermatology</option>
                    <option>Cardiology</option>
                    <option>Oncology</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs text-slate-600 mb-1.5"
                    style={{ fontWeight: 500 }}
                  >
                    Experience
                  </label>
                  <input
                    placeholder="e.g. 5 years"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs text-slate-600 mb-1.5"
                    style={{ fontWeight: 500 }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="doctor@vetvik.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs text-slate-600 mb-1.5"
                    style={{ fontWeight: 500 }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="col-span-2">
                  <label
                    className="block text-xs text-slate-600 mb-1.5"
                    style={{ fontWeight: 500 }}
                  >
                    Working status
                  </label>
                  <div className="flex gap-2">
                    {(
                      ["Available", "Busy", "Off duty"] as const
                    ).map((s) => (
                      <button
                        key={s}
                        className="flex-1 py-2 text-xs border-2 border-slate-200 text-slate-600 rounded-xl hover:border-teal-300 transition-all"
                        style={{ fontWeight: 500 }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setAddDoctorOpen(false)}
                className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50"
                style={{ fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={() => setAddDoctorOpen(false)}
                className="flex-1 py-2 bg-teal-500 text-white rounded-xl text-sm hover:bg-teal-600"
                style={{ fontWeight: 600 }}
              >
                Add doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}