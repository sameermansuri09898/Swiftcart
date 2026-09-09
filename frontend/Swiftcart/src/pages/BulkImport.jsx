import React, { useEffect, useRef, useState, useCallback } from "react";

import {
    getCategories,
    uploadBulkCSV,
} from "../components/common/BulkImportApi";


// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

// Base WS host. Falls back to same host as the page, swapping
// http(s) -> ws(s). Override with REACT_APP_WS_BASE_URL if your
// API lives on a different host/port than the frontend.
// const WS_BASE_URL =
//     process.env.REACT_APP_WS_BASE_URL ||
//     `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;
const WS_BASE_URL = "ws://127.0.0.1:8000";
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY_MS = 1000;


const BulkImport = () => {

    // ---------------------------------------------------------
    // States
    // ---------------------------------------------------------

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    const [loadingCategories, setLoadingCategories] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [importData, setImportData] = useState(null);

    // Live progress pushed over the WebSocket, keyed to the
    // shape sent by BulkImportConsumer.bulk_import_progress
    const [liveStatus, setLiveStatus] = useState(null);
    const [wsConnected, setWsConnected] = useState(false);
    const [wsError, setWsError] = useState("");

    const fileInputRef = useRef(null);
    const socketRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimerRef = useRef(null);
    const manualCloseRef = useRef(false);


    // ---------------------------------------------------------
    // Fetch Categories
    // ---------------------------------------------------------

    useEffect(() => {

        const fetchCategories = async () => {

            try {
                setLoadingCategories(true);
                setError("");

                const data = await getCategories();

                if (Array.isArray(data)) {
                    setCategories(data);
                } else if (Array.isArray(data?.results)) {
                    setCategories(data.results);
                } else {
                    setCategories([]);
                }

            } catch (err) {

                console.error("Category fetch error:", err);

                setError(
                    err.response?.data?.detail ||
                    err.response?.data?.error ||
                    "Unable to load categories."
                );

            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();

    }, []);


    // ---------------------------------------------------------
    // WebSocket: connect to bulk-import progress channel
    // ---------------------------------------------------------

    const closeSocket = useCallback(() => {

        manualCloseRef.current = true;

        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }

        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }

        setWsConnected(false);
    }, []);

    const connectSocket = useCallback((importId) => {

        if (!importId) {
            return;
        }

        manualCloseRef.current = false;
        setWsError("");

        // JWT middleware on the backend expects the access
        // token; browsers can't set Authorization headers on
        // a WebSocket handshake, so it's passed as a query param.
        const token = localStorage.getItem("access_token");

        const url =
            `${WS_BASE_URL}/ws/bulk-import/${importId}/` +
            (token ? `?token=${encodeURIComponent(token)}` : "");

        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = () => {
            reconnectAttemptsRef.current = 0;
            setWsConnected(true);
            setWsError("");
        };

        socket.onmessage = (event) => {

            try {

                const payload = JSON.parse(event.data);

                // Matches BulkImportConsumer.bulk_import_progress:
                // { import_id, status, processed, total,
                //   created, skipped, failed, percentage }
                setLiveStatus(payload);

                if (payload.status === "completed") {

                    setSuccess(
                        `Import completed — ${payload.created ?? 0} created, ` +
                        `${payload.skipped ?? 0} skipped, ` +
                        `${payload.failed ?? 0} failed.`
                    );

                    closeSocket();

                } else if (payload.status === "failed") {

                    setError("Bulk import failed while processing the file.");
                    closeSocket();
                }

            } catch (err) {
                console.error("WS message parse error:", err);
            }
        };

        socket.onerror = () => {
            setWsError("Live progress connection lost. Retrying...");
        };

        socket.onclose = (event) => {

            setWsConnected(false);

            // 4001 = not authenticated, don't retry that
            if (
                manualCloseRef.current ||
                event.code === 4001 ||
                reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS
            ) {

                if (
                    !manualCloseRef.current &&
                    reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS
                ) {
                    setWsError(
                        "Couldn't maintain a live connection. Refresh to check the latest status."
                    );
                }

                return;
            }

            const delay =
                RECONNECT_BASE_DELAY_MS * 2 ** reconnectAttemptsRef.current;

            reconnectAttemptsRef.current += 1;

            reconnectTimerRef.current = setTimeout(() => {
                connectSocket(importId);
            }, delay);
        };

    }, [closeSocket]);

    // Clean up socket on unmount
    useEffect(() => {
        return () => {
            closeSocket();
        };
    }, [closeSocket]);


    // ---------------------------------------------------------
    // File Selection
    // ---------------------------------------------------------

    const handleFileChange = (event) => {

        const file = event.target.files?.[0];

        setError("");
        setSuccess("");
        setImportData(null);
        setUploadProgress(0);
        setLiveStatus(null);
        closeSocket();

        if (!file) {
            return;
        }

        const fileName = file.name.toLowerCase();

        if (!fileName.endsWith(".csv")) {
            setError("Only CSV files are allowed.");
            event.target.value = "";
            return;
        }

        const maxSize = 20 * 1024 * 1024;

        if (file.size > maxSize) {
            setError("CSV file must be less than 20 MB.");
            event.target.value = "";
            return;
        }

        setSelectedFile(file);
    };


    // ---------------------------------------------------------
    // Remove File
    // ---------------------------------------------------------

    const handleRemoveFile = () => {

        setSelectedFile(null);
        setUploadProgress(0);
        setError("");
        setSuccess("");
        setImportData(null);
        setLiveStatus(null);
        closeSocket();

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    // ---------------------------------------------------------
    // Open File Picker
    // ---------------------------------------------------------

    const handleChooseFile = () => {

        if (uploading) {
            return;
        }

        fileInputRef.current?.click();
    };


    // ---------------------------------------------------------
    // File Size Formatter
    // ---------------------------------------------------------

    const formatFileSize = (bytes) => {

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(2)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };


    // ---------------------------------------------------------
    // Upload Progress (HTTP upload, separate from WS processing)
    // ---------------------------------------------------------

    const handleUploadProgress = (event) => {

        if (!event.total) {
            return;
        }

        const progress = Math.round((event.loaded * 100) / event.total);

        setUploadProgress(progress);
    };


    // ---------------------------------------------------------
    // Upload CSV
    // ---------------------------------------------------------

    const handleUpload = async () => {

        setError("");
        setSuccess("");
        setImportData(null);
        setLiveStatus(null);

        if (!selectedFile) {
            setError("Please select a CSV file.");
            return;
        }

        if (!selectedCategory) {
            setError("Please select a category.");
            return;
        }

        try {

            setUploading(true);
            setUploadProgress(0);

            const response = await uploadBulkCSV(
                selectedFile,
                selectedCategory,
                handleUploadProgress
            );

            setImportData(response);
            setUploadProgress(100);

            setSuccess(
                response?.message || "Bulk import started successfully."
            );

            // Once the server hands back an import_id, open the
            // WebSocket to receive live processing progress.
            const importId = response?.import_id;

            if (importId) {
                connectSocket(importId);
            }

        } catch (err) {

            console.error("Bulk upload error:", err);

            const backendError = err.response?.data;

            setError(
                backendError?.error ||
                backendError?.detail ||
                backendError?.message ||
                "Bulk upload failed. Please try again."
            );

        } finally {
            setUploading(false);
        }
    };


    // ---------------------------------------------------------
    // Derived: which status badge / progress to show
    // ---------------------------------------------------------

    const displayStatus =
        liveStatus?.status || importData?.status || null;

    const displayPercentage =
        liveStatus?.percentage ??
        (displayStatus === "completed" ? 100 : 0);

    const statusStyles = {
        pending: "bg-amber-100 text-amber-700",
        processing: "bg-blue-100 text-blue-700",
        completed: "bg-emerald-100 text-emerald-700",
        failed: "bg-red-100 text-red-700",
    };

    const statusBadgeClass =
        statusStyles[displayStatus] || "bg-slate-100 text-slate-700";


    // ---------------------------------------------------------
    // Render
    // ---------------------------------------------------------

    return (

        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-5xl">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-8">

                    <div className="mb-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                        Product Management
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Bulk Product Import
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Upload multiple products at once using a CSV file.
                        Select a category and track the import in real time.
                    </p>

                </div>

                {/* =================================================
                    MAIN CARD
                ================================================= */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Import Products
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Choose the category and upload your CSV file.
                        </p>
                    </div>

                    <div className="space-y-7 px-6 py-6 sm:px-8 sm:py-8">

                        {/* =============================================
                            CATEGORY
                        ============================================= */}

                        <div>

                            <label
                                htmlFor="category"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Product Category
                                <span className="ml-1 text-red-500">*</span>
                            </label>

                            <select
                                id="category"
                                value={selectedCategory}
                                onChange={(event) =>
                                    setSelectedCategory(event.target.value)
                                }
                                disabled={loadingCategories || uploading}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                            >
                                <option value="">
                                    {loadingCategories
                                        ? "Loading categories..."
                                        : "Select a category"}
                                </option>

                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <p className="mt-2 text-xs text-slate-500">
                                Select the category that should be assigned
                                to the imported products.
                            </p>

                        </div>

                        {/* =============================================
                            FILE UPLOAD
                        ============================================= */}

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                CSV File
                                <span className="ml-1 text-red-500">*</span>
                            </label>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,text/csv"
                                onChange={handleFileChange}
                                disabled={uploading}
                                className="hidden"
                            />

                            {!selectedFile ? (

                                <button
                                    type="button"
                                    onClick={handleChooseFile}
                                    disabled={uploading}
                                    className="group flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl text-indigo-600 transition group-hover:scale-105">
                                        ↑
                                    </div>

                                    <p className="text-sm font-semibold text-slate-800">
                                        Click to upload CSV
                                    </p>

                                    <p className="mt-2 text-xs text-slate-500">
                                        CSV files only • Maximum 20 MB
                                    </p>
                                </button>

                            ) : (

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">

                                    <div className="flex items-start justify-between gap-4">

                                        <div className="flex min-w-0 items-center gap-4">

                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-700">
                                                CSV
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-800">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {formatFileSize(selectedFile.size)}
                                                </p>
                                            </div>

                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            disabled={uploading}
                                            className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Remove
                                        </button>

                                    </div>

                                    {/* HTTP upload progress */}
                                    {uploading && (

                                        <div className="mt-5">

                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-xs font-medium text-slate-600">
                                                    Uploading file...
                                                </span>
                                                <span className="text-xs font-bold text-indigo-600">
                                                    {uploadProgress}%
                                                </span>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                                <div
                                                    className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>

                                        </div>

                                    )}

                                </div>

                            )}

                        </div>

                        {/* =============================================
                            ERROR
                        ============================================= */}

                        {error && (

                            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                <div className="mt-0.5 shrink-0 font-bold text-red-600">!</div>
                                <p className="text-sm leading-5 text-red-700">{error}</p>
                            </div>

                        )}

                        {/* =============================================
                            SUCCESS
                        ============================================= */}

                        {success && (

                            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                                <div className="mt-0.5 shrink-0 font-bold text-emerald-600">✓</div>
                                <p className="text-sm leading-5 text-emerald-700">{success}</p>
                            </div>

                        )}

                        {/* =============================================
                            WS CONNECTION NOTICE
                        ============================================= */}

                        {wsError && (

                            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                                <div className="mt-0.5 shrink-0 font-bold text-amber-600">!</div>
                                <p className="text-sm leading-5 text-amber-700">{wsError}</p>
                            </div>

                        )}

                        {/* =============================================
                            IMPORT RESPONSE + LIVE PROGRESS
                        ============================================= */}

                        {importData && (

                            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">

                                <div className="mb-5 flex items-start justify-between gap-4">

                                    <div>
                                        <h3 className="text-sm font-bold text-indigo-900">
                                            {displayStatus === "completed"
                                                ? "Import Completed"
                                                : "Import in Progress"}
                                        </h3>
                                        <p className="mt-1 text-xs text-indigo-700">
                                            {displayStatus === "completed"
                                                ? "Your file has finished processing."
                                                : "Your file has been accepted and is being processed in the background."}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        <span
                                            className={`h-2 w-2 rounded-full ${
                                                wsConnected ? "bg-emerald-500" : "bg-slate-300"
                                            }`}
                                        />
                                        <span className="text-xs font-medium text-slate-500">
                                            {wsConnected ? "Live" : "Offline"}
                                        </span>
                                    </div>

                                </div>

                                {/* Live progress bar, driven by the WebSocket */}
                                <div className="mb-5">

                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-600">
                                            {liveStatus
                                                ? `${liveStatus.processed ?? 0} of ${liveStatus.total ?? "?"} processed`
                                                : "Waiting for processing to start..."}
                                        </span>
                                        <span className="text-xs font-bold text-indigo-600">
                                            {displayPercentage}%
                                        </span>
                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-white">
                                        <div
                                            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                                            style={{ width: `${displayPercentage}%` }}
                                        />
                                    </div>

                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">

                                    <div className="rounded-xl border border-indigo-100 bg-white p-4">
                                        <p className="text-xs font-medium text-slate-500">Import ID</p>
                                        <p className="mt-1 text-lg font-bold text-slate-900">
                                            {importData.import_id ?? "-"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-indigo-100 bg-white p-4">
                                        <p className="text-xs font-medium text-slate-500">Task ID</p>
                                        <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                                            {importData.task_id ?? "-"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-indigo-100 bg-white p-4">
                                        <p className="text-xs font-medium text-slate-500">Status</p>
                                        <span
                                            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${statusBadgeClass}`}
                                        >
                                            {displayStatus ?? "pending"}
                                        </span>
                                    </div>

                                </div>

                                {/* Result counters, filled in once the WS sends them */}
                                {liveStatus && (

                                    <div className="mt-4 grid gap-4 sm:grid-cols-3">

                                        <div className="rounded-xl border border-emerald-100 bg-white p-4">
                                            <p className="text-xs font-medium text-slate-500">Created</p>
                                            <p className="mt-1 text-lg font-bold text-emerald-600">
                                                {liveStatus.created ?? 0}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-amber-100 bg-white p-4">
                                            <p className="text-xs font-medium text-slate-500">Skipped</p>
                                            <p className="mt-1 text-lg font-bold text-amber-600">
                                                {liveStatus.skipped ?? 0}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-red-100 bg-white p-4">
                                            <p className="text-xs font-medium text-slate-500">Failed</p>
                                            <p className="mt-1 text-lg font-bold text-red-600">
                                                {liveStatus.failed ?? 0}
                                            </p>
                                        </div>

                                    </div>

                                )}

                            </div>

                        )}

                        {/* =============================================
                            ACTIONS
                        ============================================= */}

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-end">

                            <button
                                type="button"
                                onClick={handleRemoveFile}
                                disabled={uploading || !selectedFile}
                                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Clear
                            </button>

                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={uploading || !selectedFile || !selectedCategory}
                                className="inline-flex min-w-44 items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                {uploading ? (
                                    <>
                                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Uploading...
                                    </>
                                ) : (
                                    "Start Import"
                                )}
                            </button>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    INFORMATION
                ================================================= */}

                <div className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-4">

                    <div className="flex items-start gap-3">

                        <div className="mt-0.5 shrink-0 font-bold text-indigo-600">i</div>

                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                How bulk import works
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Select a category, upload your CSV, and start
                                the import. The server processes the products
                                asynchronously using Celery, and progress is
                                streamed here live over a WebSocket connection.
                            </p>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};


export default BulkImport;