import { Sidebar } from "@/components/Sidebar";
import { StatsCard } from "@/components/StatsCard";
import { NeonButton } from "@/components/ui/neon-button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { motion } from "framer-motion";
import { Plus, Link as LinkIcon, BarChart3, Copy, Trash2, Eye, X, ExternalLink, QrCode, Share2, Mail, MessageCircle, ChevronDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import type { LinkItem, OverviewStats } from "@shared/types";
import { useAuth } from "@/contexts/AuthContext";

const BASE_URL = window.location.origin;

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  // Create link modal state
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [qrModal, setQrModal] = useState<{ show: boolean; qrUrl: string; slug: string }>({ show: false, qrUrl: "", slug: "" });
  const [showOptional, setShowOptional] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    originalUrl: "",
    customAlias: "",
    title: "",
    password: "",
    expiresAt: "",
  });

  const loadData = useCallback(async () => {
    try {
      const [linksRes, statsRes] = await Promise.all([
        api.links.list(),
        api.analytics.overview(),
      ]);
      setLinks(linksRes.links);
      setStats(statsRes);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoadingLinks(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check for auto-open URL param from home page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const passedUrl = params.get("url");
    if (passedUrl) {
      setForm((f) => ({ ...f, originalUrl: passedUrl }));
      setShowModal(true);
      // Clean up the URL so refreshing doesn't reopen the modal
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  const handleCopy = (slug: string) => {
    navigator.clipboard.writeText(`${BASE_URL}/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShowQr = async (id: string, slug: string) => {
    try {
      const res = await api.links.qrDataUrl(id);
      setQrModal({ show: true, qrUrl: res.dataUrl, slug });
    } catch (err: any) {
      alert(err.message || "Failed to load QR code");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.links.delete(deleteConfirm);
      setLinks((prev) => prev.filter((l) => l._id !== deleteConfirm));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete link");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const { link } = await api.links.create({
        originalUrl: form.originalUrl,
        customAlias: form.customAlias || undefined,
        title: form.title || undefined,
        password: form.password || undefined,
        expiresAt: form.expiresAt || undefined,
      });
      setLinks((prev) => [link, ...prev]);
      setShowModal(false);
      setForm({ originalUrl: "", customAlias: "", title: "", password: "", expiresAt: "" });
      // Refresh stats
      api.analytics.overview().then(setStats).catch(console.error);
    } catch (err: any) {
      setCreateError(err.message || "Failed to create link");
    } finally {
      setCreating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-0">
        <div className="container max-w-6xl pt-16 md:pt-8 pb-8 px-4 md:px-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 text-white">Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-400">
                Welcome back, {user?.name?.split(" ")[0]}! Here's your link performance
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm smooth-transition backdrop-blur-md self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              New Link
            </button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8"
          >
            <motion.div variants={itemVariants}>
              <StatsCard
                icon={LinkIcon}
                title="Total Links"
                value={stats ? String(stats.totalLinks) : "—"}
                trend={0}
                color="from-indigo-600 to-indigo-400"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatsCard
                icon={BarChart3}
                title="Total Clicks"
                value={stats ? stats.totalClicks.toLocaleString() : "—"}
                trend={0}
                color="from-indigo-600 to-indigo-400"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatsCard
                icon={Eye}
                title="Last 30 Days"
                value={stats ? stats.recentClicks.toLocaleString() : "—"}
                trend={0}
                color="from-indigo-600 to-indigo-400"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatsCard
                icon={LinkIcon}
                title="Avg / Link"
                value={
                  stats && stats.totalLinks > 0
                    ? Math.round(stats.totalClicks / stats.totalLinks).toLocaleString()
                    : "—"
                }
                trend={0}
                color="from-indigo-600 to-indigo-400"
              />
            </motion.div>
          </motion.div>

          {/* Links Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="backdrop-blur-xl bg-black/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-wide">Your Links</h2>
            </div>
            <div className="overflow-x-auto">
              {isLoadingLinks ? (
                <div className="p-12 text-center text-gray-400">Loading links…</div>
              ) : links.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-400 mb-4">No links yet. Create your first short link!</p>
                  <NeonButton
                    variant="solid"
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setShowModal(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Create Link
                  </NeonButton>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-400">Short URL</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-400">Original URL</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-400">Clicks</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-400">Created</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {links.map((link) => (
                      <tr key={link._id} className="hover:bg-secondary/30 smooth-transition">
                        <td className="px-6 py-4 text-sm font-mono text-indigo-400">
                          <a
                            href={`${BASE_URL}/${link.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 font-mono text-sm flex items-center gap-1"
                          >
                            /{link.slug}
                            <ExternalLink className="h-3 w-3 opacity-50" />
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 truncate max-w-xs">
                          {link.originalUrl}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-white">
                          {link.totalClicks.toLocaleString()}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-400">
                          {new Date(link.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleCopy(link.slug)}
                              className="p-2 hover:bg-secondary rounded-lg smooth-transition"
                              title="Copy link"
                            >
                              {copied === link.slug ? (
                                <span className="text-xs text-emerald-400">Copied!</span>
                              ) : (
                                <Copy className="h-4 w-4 text-foreground/60" />
                              )}
                            </button>
                            <button
                              onClick={() => handleShowQr(link._id, link.slug)}
                              className="p-2 hover:bg-secondary rounded-lg smooth-transition"
                              title="Show QR Code"
                            >
                              <QrCode className="h-4 w-4 text-foreground/60" />
                            </button>
                            <button
                              onClick={() => setLocation(`/analytics?link=${link._id}`)}
                              className="p-2 hover:bg-secondary rounded-lg smooth-transition"
                              title="View analytics"
                            >
                              <BarChart3 className="h-4 w-4 text-foreground/60" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(link._id)}
                              className="p-2 hover:bg-secondary rounded-lg smooth-transition"
                              title="Delete link"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Create Link Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3 }}
            className="backdrop-blur-xl bg-black/50 border border-white/10 shadow-2xl w-full max-w-lg p-5 sm:p-8 rounded-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Create Short Link</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-full smooth-transition"
              >
                <X className="h-5 w-5 text-foreground/60" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              {createError && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {createError}
                </div>
              )}

              {/* Required Section */}
              <div className="space-y-4 border-l-2 border-indigo-500 pl-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Required</p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">
                    Destination URL <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/your/long/url"
                    value={form.originalUrl}
                    onChange={(e) => setForm((f) => ({ ...f, originalUrl: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl border border-indigo-500/30 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 smooth-transition"
                    required
                    disabled={creating}
                  />
                </div>
              </div>

              {/* Optional Section Toggle */}
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="flex items-center gap-2 w-full text-left text-xs font-semibold uppercase tracking-wider text-white/40 hover:text-white/60 smooth-transition py-1"
              >
                <ChevronDown className={`h-3.5 w-3.5 smooth-transition ${showOptional ? 'rotate-180' : ''}`} />
                Optional Settings
                <div className="flex-1 h-px bg-white/10 ml-2" />
              </button>

              {showOptional && (
                <div className="space-y-4 border-l-2 border-white/10 pl-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/50">Custom Alias</label>
                    <div className="flex items-center gap-0">
                      <span className="px-4 py-3.5 rounded-l-xl border border-r-0 border-white/10 bg-white/5 text-white/50 whitespace-nowrap">
                        /
                      </span>
                      <input
                        type="text"
                        placeholder="my-link"
                        value={form.customAlias}
                        onChange={(e) => setForm((f) => ({ ...f, customAlias: e.target.value }))}
                        className="flex-1 px-4 py-3.5 rounded-r-xl border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 smooth-transition"
                        disabled={creating}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/50">Title</label>
                    <input
                      type="text"
                      placeholder="My awesome link"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 smooth-transition"
                      disabled={creating}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/50">Password</label>
                      <input
                        type="password"
                        placeholder="Protect this link"
                        value={form.password}
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                        className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 smooth-transition"
                        disabled={creating}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/50">Expiration Date</label>
                      <DateTimePicker
                        date={form.expiresAt ? new Date(form.expiresAt) : undefined}
                        setDate={(date) => setForm((f) => ({ ...f, expiresAt: date ? date.toISOString() : "" }))}
                        disabled={creating}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6 mt-2 border-t border-white/10">
                <button
                  type="button"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/5 smooth-transition"
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <NeonButton
                  type="submit"
                  variant="solid"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl text-base"
                  disabled={creating}
                >
                  {creating ? "Creating…" : "Create Link"}
                </NeonButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <QrCode className="h-5 w-5 text-indigo-400" />
                QR Code
              </h2>
              <button
                onClick={() => setQrModal({ show: false, qrUrl: "", slug: "" })}
                className="p-2 hover:bg-secondary rounded-lg smooth-transition"
              >
                <X className="h-5 w-5 text-foreground/60" />
              </button>
            </div>

            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-xl shadow-xl shadow-indigo-500/10">
                <img src={qrModal.qrUrl} alt="QR Code" className="w-48 h-48" />
              </div>
            </div>

            <a
              href={qrModal.qrUrl}
              download="linklite-qr.png"
              className="inline-flex w-full justify-center items-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium smooth-transition mb-5"
            >
              Download QR Code
            </a>

            {/* Share Section */}
            <div className="border-t border-white/10 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
                <Share2 className="h-3.5 w-3.5" /> Share Link
              </p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out this link: ${BASE_URL}/${qrModal.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-sm font-medium hover:bg-[#25D366]/20 smooth-transition"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check this out: ${BASE_URL}/${qrModal.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 smooth-transition"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Twitter
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(`${BASE_URL}/${qrModal.slug}`)}&text=${encodeURIComponent('Check out this link!')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/20 text-[#0088cc] text-sm font-medium hover:bg-[#0088cc]/20 smooth-transition"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent('Check out this link')}&body=${encodeURIComponent(`Here's a link I shortened with LinkLite: ${BASE_URL}/${qrModal.slug}`)}`}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 smooth-transition"
                >
                  <Mail className="h-4 w-4" /> Email
                </a>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${BASE_URL}/${qrModal.slug}`);
                }}
                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white smooth-transition"
              >
                <Copy className="h-4 w-4" /> Copy Short URL
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card w-full max-w-sm p-6 text-center border-red-500/20"
          >
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Delete Link</h2>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete this link? This action cannot be undone and tracking data will be lost.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/50 hover:bg-secondary text-white font-medium border border-white/5 smooth-transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium smooth-transition shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
