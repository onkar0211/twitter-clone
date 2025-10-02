import { useState } from "react";
import axios from "axios";

export default function SearchUser({ onResult }) {
  const [mode, setMode] = useState("username"); // "username" | "id"
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function doSearch() {
    setErr("");
    const q = query.trim();
    if (!q) return setErr("Enter a value to search");

    setLoading(true);
    try {
      const params = mode === "id" ? { id: q } : { username: q };
      const res = await axios.get("/api/users", { params });
      // Expected shape: { user, follow }
      onResult?.(res.data);
    } catch (e) {
      // Try to surface server JSON error
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        "Search failed. Check console.";
      setErr(msg);
      console.error("Search error:", e);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter") doSearch();
  }

  return (
    <div className="w-full max-w-xl bg-twitterBorder/40 rounded-2xl p-3 flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            name="mode"
            value="username"
            checked={mode === "username"}
            onChange={() => setMode("username")}
          />
          <span>Username</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            name="mode"
            value="id"
            checked={mode === "id"}
            onChange={() => setMode("id")}
          />
          <span>User&nbsp;ID</span>
        </label>
      </div>

      <input
        className="flex-1 bg-white text-black rounded-full px-4 py-2 outline-none"
        placeholder={mode === "id" ? "Enter user id..." : "Enter username..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
      />

      <button
        onClick={doSearch}
        disabled={loading}
        className={`rounded-full px-4 py-2 ${
          loading ? "bg-gray-400" : "bg-twitterBlue"
        } text-white`}
      >
        {loading ? "Searching..." : "Search"}
      </button>

      {err && (
        <div className="text-red-600 text-sm ml-2 truncate max-w-[200px]">
          {err}
        </div>
      )}
    </div>
  );
}
