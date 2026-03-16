import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { LinkItem } from "@shared/types";
import { Link, useLocation } from "wouter";

export default function AdminUserLinks({ userId }: { userId: string }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { links: linksData } = await api.admin.userLinks(userId);
        setLinks(linksData);
      } catch (error) {
        console.error("Failed to load user links", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [userId]);

  const handleLinkStatusChange = async (linkId: string, currentStatus: "active" | "disabled") => {
    try {
      const newStatus = currentStatus === "active" ? "disabled" : "active";
      const { link } = await api.admin.updateLinkStatus(linkId, newStatus);
      setLinks(links.map((l) => (l._id === link._id ? { ...l, status: link.status } : l)));
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-[#0000FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin" className="text-[#0000FF] flex items-center hover:text-[#0000DD] mb-1">
            &larr; Back to Users
          </Link>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold">User Link Management</h1>

        <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Created Links ({links.length})</h2>
          </div>
          
          {links.length === 0 ? (
            <div className="p-8 text-center text-foreground/60">
              This user hasn't created any links yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 font-medium text-foreground/60">Short Alias</th>
                    <th className="px-6 py-4 font-medium text-foreground/60">Original URL</th>
                    <th className="px-6 py-4 font-medium text-foreground/60">Clicks</th>
                    <th className="px-6 py-4 font-medium text-foreground/60">Status</th>
                    <th className="px-6 py-4 font-medium text-foreground/60">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {links.map((l) => (
                    <tr key={l._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm">
                         <a href={`/${l.slug}`} target="_blank" rel="noreferrer" className="text-[#0000FF] hover:underline">
                           /{l.slug}
                         </a>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate" title={l.originalUrl}>{l.originalUrl}</td>
                      <td className="px-6 py-4 font-mono">{l.totalClicks}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${l.status === 'disabled' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleLinkStatusChange(l._id, l.status)}
                          className={`text-sm font-medium ${
                            l.status === "active" ? "text-red-400 hover:text-red-300" : "text-emerald-400 hover:text-emerald-300"
                          }`}
                        >
                          {l.status === "active" ? "Disable Link" : "Activate Link"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
