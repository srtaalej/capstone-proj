"use client";


import { useEffect, useState, useCallback } from "react";
import { createClient } from "../lib/client";
import { useWallet } from "@solana/wallet-adapter-react";


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
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);


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
      console.error("Error fetching submissions:", err);
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
    try {
      const { error } = await supabase
        .from("kyc_submissions")
        .update({ status: "approved" })
        .eq("id", submission.id);


      if (error) throw error;
      setSubmissions(submissions.filter((s) => s.id !== submission.id));
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };


  const handleReject = async (submission: KycSubmission) => {
    try {
      const { error } = await supabase
        .from("kyc_submissions")
        .update({ status: "rejected" })
        .eq("id", submission.id);


      if (error) throw error;
      setSubmissions(submissions.filter((s) => s.id !== submission.id));
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };


  if (checkingAdmin) {
    return (
      <div className="bg-gray-900 min-h-screen text-white p-6 flex items-center justify-center">
        <p className="text-lg">Checking access...</p>
      </div>
    );
  }


  if (!isAdmin) {
    return (
      <div className="bg-gray-900 min-h-screen text-white p-6 flex items-center justify-center">
        <p className="text-lg text-red-500 font-semibold">🚫 Access denied: Admins only.</p>
      </div>
    );
  }


  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white p-6 flex justify-center items-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading submissions...</span>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen text-white p-6">
        <div className="bg-red-500 bg-opacity-10 border border-red-400 text-red-300 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-gray-900 min-h-screen text-white p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">KYC Admin Review</h1>
        <button
          onClick={fetchSubmissions}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>


      {submissions.length === 0 ? (
        <p className="text-gray-400 text-center">No pending submissions.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="border border-gray-700 rounded-lg p-4 bg-gray-800 shadow space-y-2 text-sm"
            >
              <button onClick={() => setActiveImage(sub.image_url)} className="focus:outline-none">
                <img
                  src={sub.image_url}
                  alt="ID Upload"
                  className="w-full h-40 object-contain rounded bg-black"
                />
              </button>
              <div className="space-y-1">
                <p><strong>Name:</strong> {sub.name}</p>
                <p><strong>DOB:</strong> {sub.dob}</p>
                <p><strong>Gender:</strong> {sub.gender}</p>
                <p><strong>Wallet:</strong> {sub.wallet}</p>
                <p><strong>Submitted:</strong> {new Date(sub.submitted_at).toLocaleString()}</p>
              </div>
              <div className="flex space-x-4 pt-2">
                <button
                  onClick={() => handleApprove(sub)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(sub)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


      {activeImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={activeImage}
              alt="Full View"
              className="max-w-full max-h-[90vh] rounded"
            />
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-2 right-2 text-white bg-gray-800 hover:bg-gray-700 rounded-full p-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
