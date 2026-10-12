import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    getCategories,
    uploadBulkCSV,
} from "../../components/common/BulkImportApi";


// =========================================================
// Config
// =========================================================

// Set VITE_WS_BASE_URL (e.g. wss://api.example.com) in your .env files.
// Falls back to the page host with http(s) -> ws(s), and to the local
// dev server when running on localhost.
const resolveWsBaseUrl = () => {

    const envUrl = import.meta.env?.VITE_WS_BASE_URL;

    if (envUrl) {
        return envUrl.replace(/\/$/, "");
    }

    const { protocol, hostname, host } = window.location;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "ws://127.0.0.1:8000";
    }

    return `${protocol === "https:" ? "wss:" : "ws:"}//${host}`;
};

const WS_BASE_URL = resolveWsBaseUrl();

const MAX_RECONNECT_ATTEMPTS = 6;
const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15000;
const WS_AUTH_FAILED_CODE = 4001;

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const PREVIEW_ROWS = 5;

// Columns used for the downloadable template. Adjust to match
// what your Celery task expects.
const TEMPLATE_COLUMNS = ["name", "sku", "price", "stock", "description"];

// Missing required columns produce a warning (not a hard block),
// so the backend stays the source of truth for validation.
const REQUIRED_COLUMNS = ["name"];

const TERMINAL_STATUSES = ["completed", "failed"];

const STATUS_STYLES = {
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    processing: "bg-blue-50 text-blue-700 ring-blue-600/20",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    failed: "bg-red-50 text-red-700 ring-red-600/20",
};

const STEPS = ["Configure", "Upload", "Process"];


// =========================================================
// Utilities
// =========================================================

const formatFileSize = (bytes) => {

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDuration = (totalSeconds) => {

    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
        return "--";
    }

    const seconds = Math.round(totalSeconds);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return m > 0 ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
};

// Minimal RFC-4180 style line parser (handles quoted commas / "" escapes).
const parseCsvLine = (line) => {

    const cells = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {

        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === "," && !inQuotes) {
            cells.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }

    cells.push(current.trim());

    return cells;
};

// Reads the file locally to give instant feedback before uploading.
const inspectCsv = async (file) => {

    const text = (await file.text()).replace(/^\uFEFF/, "");
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");

    if (lines.length === 0) {
        return { empty: true, headers: [], rows: [], rowCount: 0, missing: [] };
    }

    const headers = parseCsvLine(lines[0]);
    const rows = lines.slice(1, PREVIEW_ROWS + 1).map(parseCsvLine);

    const normalized = headers.map((h) => h.toLowerCase());
    const missing = REQUIRED_COLUMNS.filter(
        (col) => !normalized.includes(col.toLowerCase())
    );

    return {
        empty: false,
        headers,
        rows,
        rowCount: Math.max(lines.length - 1, 0),
        missing,
    };
};

const downloadTemplate = () => {

    const blob = new Blob([`${TEMPLATE_COLUMNS.join(",")}\n`], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "product-import-template.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
};

const extractApiError = (err, fallback) => {

    if (!err?.response) {
        return "Network error. Check your connection and try again.";
    }

    const { status, data } = err.response;

    if (status === 413) {
        return "The file is too large for the server to accept.";
    }

    if (status === 401 || status === 403) {
        return "Your session has expired or you don't have permission. Sign in again.";
    }

    return data?.error || data?.detail || data?.message || fallback;
};


// =========================================================
// Hook: live progress over WebSocket
// =========================================================

const useImportSocket = (importId, onMessage) => {

    const [connected, setConnected] = useState(false);
    const [error, setError] = useState("");

    // Keep the latest callback without re-opening the socket.
    const onMessageRef = useRef(onMessage);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {

        if (!importId) {
            return undefined;
        }

        let stopped = false;
        let attempts = 0;
        let timer = null;
        let socket = null;

        const connect = () => {

            // Browsers can't send Authorization headers on a WS handshake,
            // so the JWT travels as a query param (server-side middleware).
            const token = localStorage.getItem("access_token");

            const url =
                `${WS_BASE_URL}/ws/bulk-import/${importId}/` +
                (token ? `?token=${encodeURIComponent(token)}` : "");

            socket = new WebSocket(url);

            socket.onopen = () => {
                attempts = 0;
                setConnected(true);
                setError("");
            };

            socket.onmessage = (event) => {

                let payload;

                try {
                    payload = JSON.parse(event.data);
                } catch (err) {
                    console.error("WS message parse error:", err);
                    return;
                }

                onMessageRef.current?.(payload);

                if (TERMINAL_STATUSES.includes(payload.status)) {
                    stopped = true;
                    setError("");
                    socket.close(1000);
                }
            };

            socket.onerror = () => {
                if (!stopped) {
                    setError("Live connection interrupted. Reconnecting...");
                }
            };

            socket.onclose = (event) => {

                setConnected(false);

                if (stopped) {
                    return;
                }

                if (event.code === WS_AUTH_FAILED_CODE) {
                    setError("Live updates need a valid session. Sign in again.");
                    return;
                }

                if (attempts >= MAX_RECONNECT_ATTEMPTS) {
                    setError(
                        "Live updates are unavailable. The import continues on the server; refresh to check its status."
                    );
                    return;
                }

                // Exponential backoff with jitter.
                const delay = Math.min(
                    RECONNECT_BASE_DELAY_MS * 2 ** attempts,
                    RECONNECT_MAX_DELAY_MS
                ) + Math.random() * 400;

                attempts += 1;
                timer = setTimeout(connect, delay);
            };
        };

        connect();

        return () => {
            stopped = true;
            clearTimeout(timer);
            if (socket) {
                socket.onclose = null;
                socket.close(1000);
            }
            setConnected(false);
        };

    }, [importId]);

    return { connected, error };
};


// =========================================================
// Small presentational pieces
// =========================================================

const Icon = ({ name, className = "h-5 w-5" }) => {

    const paths = {
        upload: "M12 16V4m0 0L7 9m5-5 5 5M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
        file: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5",
        check: "m5 13 4 4L19 7",
        alert: "M12 9v4m0 4h.01M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
        info: "M12 8h.01M11 12h1v4h1m8-4a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
        close: "M6 6l12 12M18 6 6 18",
        copy: "M8 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2M6 8h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z",
        download: "M12 4v12m0 0 5-5m-5 5-5-5M4 20h16",
    };

    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={paths[name]} />
        </svg>
    );
};

const Spinner = ({ className = "h-4 w-4" }) => (
    <span
        className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
        aria-hidden="true"
    />
);

const ALERT_TONES = {
    error: {
        box: "border-red-200 bg-red-50 text-red-800",
        icon: "alert",
    },
    warning: {
        box: "border-amber-200 bg-amber-50 text-amber-800",
        icon: "alert",
    },
    success: {
        box: "border-emerald-200 bg-emerald-50 text-emerald-800",
        icon: "check",
    },
    info: {
        box: "border-sky-200 bg-sky-50 text-sky-800",
        icon: "info",
    },
};

const Alert = ({ tone = "info", title, children, onDismiss }) => {

    const { box, icon } = ALERT_TONES[tone];

    return (
        <div
            role={tone === "error" ? "alert" : "status"}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${box}`}
        >
            <Icon name={icon} className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="min-w-0 flex-1 text-sm leading-5">
                {title && <p className="font-semibold">{title}</p>}
                <div className={title ? "mt-0.5" : ""}>{children}</div>
            </div>

            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss message"
                    className="shrink-0 rounded-md p-1 opacity-70 transition hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
                >
                    <Icon name="close" className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

const ProgressBar = ({ value, label, tone = "indigo" }) => {

    const safe = Math.min(Math.max(Number(value) || 0, 0), 100);
    const color = tone === "emerald" ? "bg-emerald-500" : "bg-indigo-600";

    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={safe}
            className="h-2.5 overflow-hidden rounded-full bg-slate-200"
        >
            <div
                className={`h-full rounded-full transition-[width] duration-500 ease-out ${color}`}
                style={{ width: `${safe}%` }}
            />
        </div>
    );
};

const StatusBadge = ({ status }) => (
    <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
            STATUS_STYLES[status] || "bg-slate-50 text-slate-700 ring-slate-500/20"
        }`}
    >
        {status === "processing" && <Spinner className="h-3 w-3" />}
        {status || "pending"}
    </span>
);

const Stat = ({ label, value, tone = "slate" }) => {

    const tones = {
        slate: "text-slate-900",
        emerald: "text-emerald-600",
        amber: "text-amber-600",
        red: "text-red-600",
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-semibold tabular-nums ${tones[tone]}`}>
                {value}
            </p>
        </div>
    );
};

const Stepper = ({ current, done }) => (
    <ol className="flex items-center" aria-label="Import progress">
        {STEPS.map((label, index) => {

            const complete = done || index < current;
            const active = !done && index === current;

            return (
                <li
                    key={label}
                    className={`flex items-center ${index < STEPS.length - 1 ? "flex-1" : ""}`}
                    aria-current={active ? "step" : undefined}
                >
                    <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                            complete
                                ? "bg-indigo-600 text-white"
                                : active
                                    ? "border-2 border-indigo-600 bg-white text-indigo-600"
                                    : "border-2 border-slate-200 bg-white text-slate-400"
                        }`}
                    >
                        {complete ? <Icon name="check" className="h-4 w-4" /> : index + 1}
                    </span>

                    <span
                        className={`ml-2 hidden text-sm font-medium sm:inline ${
                            complete || active ? "text-slate-900" : "text-slate-400"
                        }`}
                    >
                        {label}
                    </span>

                    {index < STEPS.length - 1 && (
                        <span
                            className={`mx-3 h-0.5 flex-1 rounded transition ${
                                complete ? "bg-indigo-600" : "bg-slate-200"
                            }`}
                        />
                    )}
                </li>
            );
        })}
    </ol>
);


// =========================================================
// Main component
// =========================================================

const BulkImport = () => {

    // -----------------------------------------------------
    // State
    // -----------------------------------------------------

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [categoryError, setCategoryError] = useState("");

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [csvInfo, setCsvInfo] = useState(null);
    const [inspecting, setInspecting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [error, setError] = useState("");
    const [importData, setImportData] = useState(null);
    const [liveStatus, setLiveStatus] = useState(null);

    const [startedAt, setStartedAt] = useState(null);
    const [now, setNow] = useState(Date.now());
    const [copied, setCopied] = useState(false);

    const fileInputRef = useRef(null);
    const dragDepthRef = useRef(0);

    const importId = importData?.import_id;

    const { connected: wsConnected, error: wsError } = useImportSocket(
        importId,
        useCallback(
            (payload) => {
                // Ignore stray messages from a previous import.
                if (payload.import_id && String(payload.import_id) !== String(importId)) {
                    return;
                }
                setLiveStatus(payload);
            },
            [importId]
        )
    );


    // -----------------------------------------------------
    // Derived values
    // -----------------------------------------------------

    const displayStatus = liveStatus?.status || importData?.status || null;
    const isCompleted = displayStatus === "completed";
    const isFailed = displayStatus === "failed";
    const isRunning = Boolean(importData) && !isCompleted && !isFailed;
    const isLocked = uploading || isRunning;

    const displayPercentage = Math.round(
        liveStatus?.percentage ?? (isCompleted ? 100 : 0)
    );

    const processed = liveStatus?.processed ?? 0;
    const total = liveStatus?.total ?? 0;

    const elapsedSeconds = startedAt ? (now - startedAt) / 1000 : 0;

    const etaSeconds = useMemo(() => {

        if (!isRunning || !processed || !total || elapsedSeconds < 2) {
            return null;
        }

        const rate = processed / elapsedSeconds;

        return rate > 0 ? (total - processed) / rate : null;

    }, [isRunning, processed, total, elapsedSeconds]);

    const currentStep = importData ? 2 : selectedFile && selectedCategory ? 1 : 0;

    const selectedCategoryName = useMemo(
        () => categories.find((c) => String(c.id) === String(selectedCategory))?.name,
        [categories, selectedCategory]
    );

    const canStart =
        Boolean(selectedFile) &&
        Boolean(selectedCategory) &&
        !csvInfo?.empty &&
        !isLocked &&
        !importData;


    // -----------------------------------------------------
    // Effects
    // -----------------------------------------------------

    const fetchCategories = useCallback(async () => {

        try {
            setLoadingCategories(true);
            setCategoryError("");

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
            setCategoryError(extractApiError(err, "Unable to load categories."));
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Tick the clock only while an import is running.
    useEffect(() => {

        if (!isRunning) {
            return undefined;
        }

        const interval = setInterval(() => setNow(Date.now()), 1000);

        return () => clearInterval(interval);

    }, [isRunning]);

    // Warn before leaving mid-upload / mid-import.
    useEffect(() => {

        if (!isLocked) {
            return undefined;
        }

        const handler = (event) => {
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handler);

        return () => window.removeEventListener("beforeunload", handler);

    }, [isLocked]);


    // -----------------------------------------------------
    // File handling
    // -----------------------------------------------------

    const resetResult = () => {
        setError("");
        setImportData(null);
        setLiveStatus(null);
        setUploadProgress(0);
        setStartedAt(null);
    };

    const acceptFile = useCallback(async (file) => {

        resetResult();
        setCsvInfo(null);

        if (!file) {
            return;
        }

        const lowerName = file.name.toLowerCase();

        if (!lowerName.endsWith(".csv")) {
            setError("Only .csv files are supported.");
            return;
        }

        if (file.size === 0) {
            setError("This file is empty.");
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError(
                `This file is ${formatFileSize(file.size)}. The maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`
            );
            return;
        }

        setSelectedFile(file);

        try {
            setInspecting(true);
            setCsvInfo(await inspectCsv(file));
        } catch (err) {
            console.error("CSV inspect error:", err);
            setCsvInfo(null);
        } finally {
            setInspecting(false);
        }
    }, []);

    const handleFileChange = (event) => {
        acceptFile(event.target.files?.[0]);
        event.target.value = "";
    };

    const handleChooseFile = () => {
        if (!isLocked) {
            fileInputRef.current?.click();
        }
    };

    const handleReset = () => {
        resetResult();
        setSelectedFile(null);
        setCsvInfo(null);
        setSelectedCategory("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveFile = () => {
        resetResult();
        setSelectedFile(null);
        setCsvInfo(null);
    };

    // Drag & drop (depth counter avoids flicker over child elements)
    const handleDragEnter = (event) => {
        event.preventDefault();
        if (isLocked) return;
        dragDepthRef.current += 1;
        setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        dragDepthRef.current = Math.max(dragDepthRef.current - 1, 0);
        if (dragDepthRef.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        dragDepthRef.current = 0;
        setIsDragging(false);
        if (isLocked) return;
        acceptFile(event.dataTransfer.files?.[0]);
    };

    const handleDropzoneKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleChooseFile();
        }
    };


    // -----------------------------------------------------
    // Upload
    // -----------------------------------------------------

    const handleUploadProgress = (event) => {

        if (!event?.total) {
            return;
        }

        setUploadProgress(Math.round((event.loaded * 100) / event.total));
    };

    const handleUpload = async () => {

        setError("");
        setImportData(null);
        setLiveStatus(null);

        if (!selectedFile) {
            setError("Choose a CSV file to import.");
            return;
        }

        if (!selectedCategory) {
            setError("Select a category for the imported products.");
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

            setUploadProgress(100);
            setImportData(response);
            setStartedAt(Date.now());
            setNow(Date.now());

        } catch (err) {
            console.error("Bulk upload error:", err);
            setError(extractApiError(err, "Bulk upload failed. Try again."));
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const handleCopyId = async () => {

        if (!importId) return;

        try {
            await navigator.clipboard.writeText(String(importId));
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch (err) {
            console.error("Clipboard error:", err);
        }
    };


    // -----------------------------------------------------
    // Render helpers
    // -----------------------------------------------------

    const renderDropzone = () => (
        <div
            role="button"
            tabIndex={isLocked ? -1 : 0}
            aria-disabled={isLocked}
            aria-label="Upload CSV file. Click or drag and drop."
            onClick={handleChooseFile}
            onKeyDown={handleDropzoneKeyDown}
            onDragEnter={handleDragEnter}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex min-h-52 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 ${
                isDragging
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/40"
            }`}
        >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Icon name="upload" className="h-6 w-6" />
            </span>

            <p className="text-sm font-semibold text-slate-800">
                {isDragging ? "Drop the file to upload" : "Drag a CSV here, or click to browse"}
            </p>

            <p className="mt-1.5 text-xs text-slate-500">
                .csv only, up to {formatFileSize(MAX_FILE_SIZE)}
            </p>
        </div>
    );

    const renderFileCard = () => (
        <div className="rounded-2xl border border-slate-200 bg-white">

            <div className="flex items-center justify-between gap-4 p-4">

                <div className="flex min-w-0 items-center gap-3">

                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Icon name="file" className="h-5 w-5" />
                    </span>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                            {selectedFile.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {formatFileSize(selectedFile.size)}
                            {csvInfo && !csvInfo.empty && (
                                <> &middot; about {csvInfo.rowCount.toLocaleString()} rows</>
                            )}
                            {inspecting && <> &middot; reading file...</>}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleRemoveFile}
                    disabled={isLocked}
                    className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Remove file
                </button>
            </div>

            {uploading && (
                <div className="border-t border-slate-100 px-4 py-4">
                    <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600">Uploading file</span>
                        <span className="font-semibold tabular-nums text-indigo-600">
                            {uploadProgress}%
                        </span>
                    </div>
                    <ProgressBar value={uploadProgress} label="Upload progress" />
                </div>
            )}

            {csvInfo && !csvInfo.empty && csvInfo.headers.length > 0 && (
                <div className="border-t border-slate-100">

                    <p className="px-4 pt-3 text-xs font-medium text-slate-500">
                        Preview of the first {csvInfo.rows.length}{" "}
                        {csvInfo.rows.length === 1 ? "row" : "rows"}
                    </p>

                    <div className="overflow-x-auto px-4 pb-4 pt-2">
                        <table className="min-w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    {csvInfo.headers.map((header, i) => (
                                        <th
                                            key={`${header}-${i}`}
                                            scope="col"
                                            className="whitespace-nowrap px-3 py-2 font-semibold text-slate-700"
                                        >
                                            {header || <span className="text-slate-400">(blank)</span>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {csvInfo.rows.map((row, r) => (
                                    <tr key={r}>
                                        {csvInfo.headers.map((_, c) => (
                                            <td
                                                key={c}
                                                className="max-w-48 truncate whitespace-nowrap px-3 py-2 text-slate-600"
                                                title={row[c] || ""}
                                            >
                                                {row[c] ?? ""}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    const renderResult = () => (
        <section
            aria-live="polite"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">

                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        {isCompleted
                            ? "Import complete"
                            : isFailed
                                ? "Import failed"
                                : "Importing products"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {isCompleted
                            ? `Finished in ${formatDuration(elapsedSeconds)}.`
                            : isFailed
                                ? "The server stopped processing this file."
                                : "You can keep this tab open. Processing continues on the server."}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <StatusBadge status={displayStatus} />

                    {isRunning && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    wsConnected ? "bg-emerald-500" : "bg-slate-300"
                                }`}
                            />
                            {wsConnected ? "Live" : "Reconnecting"}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-6 px-6 py-6">

                <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">
                            {total
                                ? `${processed.toLocaleString()} of ${total.toLocaleString()} rows processed`
                                : "Waiting for processing to start..."}
                        </span>
                        <span className="font-semibold tabular-nums text-slate-900">
                            {displayPercentage}%
                        </span>
                    </div>

                    <ProgressBar
                        value={displayPercentage}
                        label="Import progress"
                        tone={isCompleted ? "emerald" : "indigo"}
                    />

                    {isRunning && (
                        <p className="mt-2 text-xs text-slate-500">
                            Elapsed {formatDuration(elapsedSeconds)}
                            {etaSeconds !== null && (
                                <> &middot; about {formatDuration(etaSeconds)} remaining</>
                            )}
                        </p>
                    )}
                </div>

                {liveStatus && (
                    <div className="grid grid-cols-3 gap-3">
                        <Stat label="Created" value={(liveStatus.created ?? 0).toLocaleString()} tone="emerald" />
                        <Stat label="Skipped" value={(liveStatus.skipped ?? 0).toLocaleString()} tone="amber" />
                        <Stat label="Failed" value={(liveStatus.failed ?? 0).toLocaleString()} tone="red" />
                    </div>
                )}

                {isFailed && (
                    <Alert tone="error" title="Processing failed">
                        {liveStatus?.error ||
                            liveStatus?.message ||
                            "The import stopped before finishing. Check the file for formatting problems and try again."}
                    </Alert>
                )}

                {isCompleted && (liveStatus?.failed ?? 0) > 0 && (
                    <Alert tone="warning" title="Some rows were not imported">
                        {liveStatus.failed.toLocaleString()} rows failed. Review them in your
                        source file and import those rows again.
                    </Alert>
                )}

                {wsError && isRunning && <Alert tone="warning">{wsError}</Alert>}

                <dl className="grid gap-x-6 gap-y-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">

                    <div className="min-w-0">
                        <dt className="text-xs font-medium text-slate-500">File</dt>
                        <dd className="mt-0.5 truncate font-medium text-slate-800">
                            {selectedFile?.name ?? "-"}
                        </dd>
                    </div>

                    <div className="min-w-0">
                        <dt className="text-xs font-medium text-slate-500">Category</dt>
                        <dd className="mt-0.5 truncate font-medium text-slate-800">
                            {selectedCategoryName ?? "-"}
                        </dd>
                    </div>

                    <div className="min-w-0">
                        <dt className="text-xs font-medium text-slate-500">Import ID</dt>
                        <dd className="mt-0.5 flex items-center gap-2 font-medium text-slate-800">
                            <span className="truncate">{importData.import_id ?? "-"}</span>
                            {importId && (
                                <button
                                    type="button"
                                    onClick={handleCopyId}
                                    aria-label="Copy import ID"
                                    className="rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <Icon name={copied ? "check" : "copy"} className="h-4 w-4" />
                                </button>
                            )}
                        </dd>
                    </div>

                    <div className="min-w-0">
                        <dt className="text-xs font-medium text-slate-500">Task ID</dt>
                        <dd className="mt-0.5 truncate font-mono text-xs text-slate-700" title={importData.task_id}>
                            {importData.task_id ?? "-"}
                        </dd>
                    </div>
                </dl>
            </div>

            {(isCompleted || isFailed) && (
                <div className="flex justify-end border-t border-slate-200 bg-slate-50/60 px-6 py-4">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
                    >
                        Start a new import
                    </button>
                </div>
            )}
        </section>
    );


    // -----------------------------------------------------
    // Render
    // -----------------------------------------------------

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-6xl">

                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Bulk product import
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Add many products at once from a CSV file. Pick a category,
                        upload the file, and follow the import as it runs.
                    </p>
                </header>

                <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-8">
                    <Stepper current={currentStep} done={isCompleted} />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Main column */}
                    <div className="space-y-6 lg:col-span-2">

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-200 px-6 py-5">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Import details
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Choose where the products go and which file to import.
                                </p>
                            </div>

                            <div className="space-y-6 px-6 py-6">

                                {/* Category */}
                                <div>
                                    <label
                                        htmlFor="category"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Category
                                        <span className="ml-1 text-red-500" aria-hidden="true">*</span>
                                    </label>

                                    <select
                                        id="category"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        disabled={loadingCategories || isLocked || Boolean(importData)}
                                        required
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                    >
                                        <option value="">
                                            {loadingCategories ? "Loading categories..." : "Select a category"}
                                        </option>

                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>

                                    {categoryError ? (
                                        <div className="mt-2 flex items-center gap-3 text-xs text-red-600">
                                            <span>{categoryError}</span>
                                            <button
                                                type="button"
                                                onClick={fetchCategories}
                                                className="font-semibold underline underline-offset-2 hover:text-red-800"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-xs text-slate-500">
                                            Every product in the file is added to this category.
                                        </p>
                                    )}
                                </div>

                                {/* File */}
                                <div>
                                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                                        CSV file
                                        <span className="ml-1 text-red-500" aria-hidden="true">*</span>
                                    </span>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv,text/csv"
                                        onChange={handleFileChange}
                                        disabled={isLocked}
                                        className="hidden"
                                        tabIndex={-1}
                                    />

                                    {selectedFile ? renderFileCard() : renderDropzone()}
                                </div>

                                {/* Messages */}
                                {error && (
                                    <Alert tone="error" onDismiss={() => setError("")}>
                                        {error}
                                    </Alert>
                                )}

                                {csvInfo?.empty && (
                                    <Alert tone="error" title="No data found">
                                        This file doesn't contain any rows. Add a header row and at
                                        least one product.
                                    </Alert>
                                )}

                                {csvInfo && !csvInfo.empty && csvInfo.missing.length > 0 && (
                                    <Alert tone="warning" title="Required columns may be missing">
                                        Couldn't find: {csvInfo.missing.join(", ")}. The server will
                                        reject rows without these values.
                                    </Alert>
                                )}

                                {csvInfo && !csvInfo.empty && csvInfo.rowCount === 0 && (
                                    <Alert tone="warning" title="Header only">
                                        The file has column names but no product rows.
                                    </Alert>
                                )}
                            </div>

                            {/* Actions */}
                            {!importData && (
                                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">

                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        disabled={isLocked || (!selectedFile && !selectedCategory)}
                                        className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Clear all
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleUpload}
                                        disabled={!canStart}
                                        className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-300"
                                    >
                                        {uploading ? (
                                            <>
                                                <Spinner />
                                                Uploading...
                                            </>
                                        ) : (
                                            "Start import"
                                        )}
                                    </button>
                                </div>
                            )}
                        </section>

                        {importData && renderResult()}
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">

                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-sm font-semibold text-slate-900">
                                CSV requirements
                            </h2>

                            <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
                                <li className="flex gap-2.5">
                                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                    First row contains column names
                                </li>
                                <li className="flex gap-2.5">
                                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                    Required: {REQUIRED_COLUMNS.join(", ")}
                                </li>
                                <li className="flex gap-2.5">
                                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                    Comma-separated, UTF-8 encoded
                                </li>
                                <li className="flex gap-2.5">
                                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                    Up to {formatFileSize(MAX_FILE_SIZE)} per file
                                </li>
                            </ul>

                            <button
                                type="button"
                                onClick={downloadTemplate}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                            >
                                <Icon name="download" className="h-4 w-4" />
                                Download template
                            </button>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-sm font-semibold text-slate-900">
                                What happens next
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                The file is uploaded, then processed in the background.
                                Progress updates here live. Rows that already exist are
                                skipped, and rows with errors are counted as failed
                                without stopping the rest.
                            </p>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
};


export default BulkImport;