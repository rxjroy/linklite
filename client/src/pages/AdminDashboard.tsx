import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { AdminStats, AdminUser } from "@shared/types";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, usersData] = await Promise.all([
          api.admin.stats(),
          api.admin.users(),
        ]);
        setStats(statsData);
        setUsers(usersData.users);
      } catch (error) {
        console.error("Failed to load admin data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStatusChange = async (userId: string, currentStatus: "active" | "suspended") => {
    try {
      const newStatus = currentStatus === "active" ? "suspended" : "active";
      const { user } = await api.admin.updateUserStatus(userId, newStatus);
      setUsers(users.map((u) => (u._id === user._id ? { ...u, status: user.status } : u)));
    } catch (error: any) {
      console.error(error.message);
      alert(error.message); // simple catch until Sonner toast is optionally patched
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <Link href="/dashboard" className="text-sm text-indigo-400 hover:text-indigo-300">
            &larr; Back to App
          </Link>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-xl border border-white/10">
              <p className="text-sm text-foreground/60 mb-1">Total Users</p>
              <p className="text-4xl font-bold">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-white/10">
              <p className="text-sm text-foreground/60 mb-1">Total Links</p>
              <p className="text-4xl font-bold">{stats.totalLinks.toLocaleString()}</p>
            </div>
            <div className="glass-panel p-6 rounded-xl border border-white/10">
              <p className="text-sm text-foreground/60 mb-1">Platform Clicks</p>
              <p className="text-4xl font-bold">{stats.totalClicks.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* User List */}
        <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 font-medium text-foreground/60">Name</th>
                  <th className="px-6 py-4 font-medium text-foreground/60">Email</th>
                  <th className="px-6 py-4 font-medium text-foreground/60">Role</th>
                  <th className="px-6 py-4 font-medium text-foreground/60">Status</th>
                  <th className="px-6 py-4 font-medium text-foreground/60">Links</th>
                  <th className="px-6 py-4 font-medium text-foreground/60">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">{u.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/10'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${u.status === 'suspended' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">{u.linkCount}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4 whitespace-nowrap">
                        <Link href={`/admin/users/${u._id}`} className="text-sm text-indigo-400 hover:text-indigo-300">
                          View Links
                        </Link>
                        {u.role !== "admin" && (
                          <button
                            onClick={() => handleStatusChange(u._id, u.status)}
                            className={`text-sm ${
                              u.status === "active" ? "text-red-400 hover:text-red-300" : "text-emerald-400 hover:text-emerald-300"
                            }`}
                          >
                            {u.status === "active" ? "Suspend" : "Reactivate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
