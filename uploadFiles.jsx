import { useState, useRef, useCallback } from "react";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function FileUploader() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [response, setResponse] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const addFiles = (newFiles) => {
    const mapped = Array.from(newFiles).map((f) => ({
      file: f,
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    setFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (id) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const handleUpload = async () => {
    if (!files.length) return;
    setStatus("uploading");
    setResponse(null);

    try {
      const filesPayload = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
          data: await toBase64(f.file),
        }))
      );

      const body = JSON.stringify({ files: filesPayload });

      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResponse(data);
      setStatus("success");
      setFiles([]);
    } catch (err) {
      setResponse({ error: err.message });
      setStatus("error");
    }
  };

  const formatSize = (bytes) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 font-mono">
      <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col gap-5">

        {/* Header */}
        <div className="text-center">
          <div className="text-4xl">⬆</div>
          <h1 className="mt-2 mb-1 text-3xl font-bold text-white tracking-widest">Uploader</h1>
          <p className="text-xs text-gray-400 tracking-widest">JSON · Base64 · Python API</p>
        </div>

        {/* Drop Zone */}
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragging
              ? "border-indigo-500 bg-indigo-950"
              : "border-gray-700 bg-gray-950 hover:border-indigo-600"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <div className="text-5xl mb-3">{dragging ? "📂" : "📁"}</div>
          <p className="text-white text-sm mb-1 font-medium">
            {dragging ? "Relâchez ici…" : "Glissez vos fichiers ou cliquez"}
          </p>
          <span className="text-gray-400 text-xs tracking-widest">Tous types de fichiers acceptés</span>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <ul className="flex flex-col gap-2">
            {files.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-white text-sm font-medium">{f.name}</span>
                  <span className="text-gray-400 text-xs">{formatSize(f.size)}</span>
                </div>
                <button
                  onClick={() => removeFile(f.id)}
                  className="text-gray-400 hover:text-red-400 transition-colors text-sm px-2 py-1 rounded font-bold"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || status === "uploading"}
          className={`w-full py-3.5 rounded-xl text-white font-semibold tracking-wide transition-all duration-200 text-sm ${
            files.length === 0
              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
              : status === "uploading"
              ? "bg-indigo-800 cursor-wait"
              : "bg-indigo-600 hover:bg-indigo-500 active:scale-95"
          }`}
        >
          {status === "uploading"
            ? "⏳ Envoi en cours…"
            : `Envoyer${files.length > 0 ? ` (${files.length} fichier${files.length > 1 ? "s" : ""})` : ""}`}
        </button>

        {/* Response */}
        {response && (
          <div className={`bg-gray-950 rounded-xl p-4 border-2 ${status === "success" ? "border-green-500" : "border-red-500"}`}>
            <span className="text-gray-400 text-xs uppercase tracking-widest block mb-3">
              {status === "success" ? "✅ Réponse API" : "❌ Erreur"}
            </span>
            <pre className={`text-xs overflow-x-auto leading-relaxed ${status === "success" ? "text-green-400" : "text-red-400"}`}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
