"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "../lib/client";
import { useWallet } from "@solana/wallet-adapter-react";
import { CheckCircleIcon, XCircleIcon, RefreshCwIcon } from "lucide-react";

const supabase = createClient();

interface KycSubmission {
  id: number;
  wallet: string;
  name: string;
  dob: string;
  gender: string;
  image_url: string;
  status: string;
  submitted_at: string;
}

export default function AdminPage() {
  const { publicKey } = useWallet();
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState<KycSubmission | null>(null);
  const [zoom, setZoom] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("kyc_submissions")
        .select("*")
        .eq("status", "pending")
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAdminAccess = useCallback(async () => {
    if (!publicKey) return;
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("wallet", publicKey.toBase58())
      .single();

    setIsAdmin(!!data && !error);
    setCheckingAdmin(false);
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) checkAdminAccess();
  }, [publicKey, checkAdminAccess]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchSubmissions();

    const channel = supabase
      .channel("kyc_submissions_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "kyc_submissions" }, () =>
        fetchSubmissions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, fetchSubmissions]);

  const handleApprove = async (submission: KycSubmission) => {
    const { error } = await supabase
      .from("kyc_submissions")
      .update({ status: "approved" })
      .eq("id", submission.id);
    if (!error) {
      setSubmissions(submissions.filter((s) => s.id !== submission.id));
      setActiveSubmission(null);
    }
  };

  const handleReject = async (submission: KycSubmission) => {
    const { error } = await supabase
      .from("kyc_submissions")
      .update({ status: "rejected" })
      .eq("id", submission.id);
    if (!error) {
      setSubmissions(submissions.filter((s) => s.id !== submission.id));
      setActiveSubmission(null);
    }
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black min-h-screen text-white px-6 py-12 sm:px-8 lg:px-16">
      <div className="max-w-5xl mx-auto w-full">{children}</div>
    </div>
  );

  if (checkingAdmin)
    return (
      <Wrapper>
        <p className="text-xl animate-pulse">Checking access...</p>
      </Wrapper>
    );
  if (!isAdmin)
    return (
      <Wrapper>
        <p className="text-xl text-red-500 font-bold text-center">Access denied: Admins only.</p>
      </Wrapper>
    );
  if (loading)
    return (
      <Wrapper>
        <div className="flex items-center justify-center gap-2 animate-pulse">
          <RefreshCwIcon className="animate-spin" /> Loading submissions...
        </div>
      </Wrapper>
    );
  if (error)
    return (
      <Wrapper>
        <div className="bg-red-800/20 text-red-300 border border-red-500 p-4 rounded">
          Error: {error}
        </div>
      </Wrapper>
    );

  return (
    <Wrapper>
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold tracking-tight">Pending KYC Submissions</h1>
        <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
          Select a wallet from the list to review and take action.
        </p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-700">
          {submissions.map((sub, index) => (
            <li
              key={sub.id}
              className="flex items-center justify-between px-6 py-5 hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => {
                setZoom(false);
                setActiveSubmission(sub);
              }}
            >
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-400 font-mono w-6 text-right">#{index + 1}</div>
                <div className="text-sm text-gray-300 break-all">{sub.wallet}</div>
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap">
                {new Date(sub.submitted_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {activeSubmission && (
        <>
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6">
            <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 p-6 max-w-xl w-full relative min-h-[480px]">
              <button
                onClick={() => setActiveSubmission(null)}
                className="absolute top-3 right-3 text-white bg-gray-700 hover:bg-gray-600 rounded-full p-2"
              >
                ✕
              </button>

              <div
                className="relative cursor-zoom-in mt-10"
                onClick={() => setZoom(true)}
              >
                <img
                  src={activeSubmission.image_url}
                  alt="ID Document"
                  className="w-full h-56 object-contain rounded-lg bg-black mb-4"
                />
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <p><strong>Name:</strong> {activeSubmission.name}</p>
                <p><strong>DOB:</strong> {activeSubmission.dob}</p>
                <p><strong>Gender:</strong> {activeSubmission.gender}</p>
                <p className="break-all"><strong>Wallet:</strong> {activeSubmission.wallet}</p>
                <p><strong>Submitted:</strong> {new Date(activeSubmission.submitted_at).toLocaleString()}</p>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => handleApprove(activeSubmission)}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                >
                  <CheckCircleIcon className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleReject(activeSubmission)}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  <XCircleIcon className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          </div>

          {zoom && (
            <div
              className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
              onClick={() => setZoom(false)}
            >
              <img
                src={activeSubmission.image_url}
                alt="Zoomed ID"
                className="max-w-full max-h-[90vh] rounded-lg border border-gray-700"
              />
            </div>
          )}
        </>
      )}
    </Wrapper>
  );
}
