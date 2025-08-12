export default function ProfileUI({
  user,
  loading,
  error,
  onRefresh,
  onLogout,
}) {
  return (
    <div style={{ padding: 16 }}>
      {" "}
      <h1>Profile</h1> {loading && <p>Loading…</p>}{" "}
      {error && <p style={{ color: "crimson" }}>{error}</p>}{" "}
      {user ? (
        <>
          {" "}
          <p>Welcome, {user.username}</p>{" "}
          <div style={{ display: "flex", gap: 8 }}>
            {" "}
            <button onClick={onRefresh}>Refresh</button>{" "}
            <button onClick={onLogout}>Logout</button>{" "}
          </div>{" "}
        </>
      ) : (
        <p>No user loaded.</p>
      )}{" "}
    </div>
  );
}
