import { useEffect, useState } from "react";
import { toast } from "../utils/toast";
import { getNewsletterSubscribers, deleteNewsletterSubscriber } from "../api/admin";

export default function AdminNewsletterList() {
  const [subscribers, setSubscribers] = useState([]);
  const [count, setCount]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [confirmEmail, setConfirmEmail] = useState(null); // email pending deletion

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    setLoading(true);
    try {
      const res = await getNewsletterSubscribers();
      setSubscribers(res.data.subscribers);
      setCount(res.data.count);
    } catch {
      toast.error("Failed to load subscribers.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(email) {
    try {
      await deleteNewsletterSubscriber(email);
      setSubscribers((prev) => prev.filter((s) => s.email !== email));
      setCount((prev) => prev - 1);
      toast.success(`${email} removed.`);
    } catch {
      toast.error("Failed to remove subscriber.");
    } finally {
      setConfirmEmail(null);
    }
  }

  function handleExportCSV() {
    const header = "Email,Subscribed At\n";
    const rows = subscribers
      .map((s) => `${s.email},${new Date(s.subscribedAt).toLocaleDateString()}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = "ado-pet-subscribers.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="newsletter-section">
      <div className="newsletter-header-row">
        <div>
          <h2 className="admin-dashboard-table-header">Newsletter Subscribers</h2>
          <span className="newsletter-count-badge">{count} active subscriber{count !== 1 ? "s" : ""}</span>
        </div>
        <button className="newsletter-export-btn" onClick={handleExportCSV} disabled={count === 0}>
          Export CSV
        </button>
      </div>

      {loading ? (
        <p className="newsletter-loading">Loading…</p>
      ) : subscribers.length === 0 ? (
        <p className="newsletter-empty">No subscribers yet.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Subscribed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => (
                <tr key={s.email}>
                  <td>{i + 1}</td>
                  <td>{s.email}</td>
                  <td>{new Date(s.subscribedAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="newsletter-delete-btn"
                      onClick={() => setConfirmEmail(s.email)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inline confirmation dialog */}
      {confirmEmail && (
        <div className="newsletter-confirm-overlay">
          <div className="newsletter-confirm-dialog">
            <p className="newsletter-confirm-text">
              Remove <strong>{confirmEmail}</strong> from the newsletter?
            </p>
            <div className="newsletter-confirm-actions">
              <button className="newsletter-confirm-yes" onClick={() => handleDelete(confirmEmail)}>
                Yes, Remove
              </button>
              <button className="newsletter-confirm-no" onClick={() => setConfirmEmail(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
