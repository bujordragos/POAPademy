"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This will set isClient to true once the component is mounted on the client-side
    setIsClient(true);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError("");

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask is not installed. Please install it to use this app.");
      }

      // Request connection to MetaMask
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        // Successfully connected
        router.back();
      } else {
        throw new Error("Failed to connect to MetaMask.");
      }
    } catch (error: any) {
      // console.error("Connection error:", error);
      setError(error.message || "Failed to connect. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-8">Connect your wallet</h1>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded flex items-center"
      >
        {isConnecting ? (
          <>
            <span className="mr-2">Connecting...</span>
            <div className="w-4 h-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </>
        ) : (
          "Connect with MetaMask"
        )}
      </button>

      <p className="mt-4 text-sm text-gray-600">
        You need MetaMask to use this application.
        {isClient && !window?.ethereum && (
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-blue-500 hover:underline"
          >
            Install MetaMask
          </a>
        )}
      </p>
    </div>
  );
}
