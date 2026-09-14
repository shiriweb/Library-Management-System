import { useCallback, useEffect, useState } from "react";
import AppLayout from "../../components/AppLayout";
import api from "../../services/api";

const resources = {
  categories: {
    title: "Categories",
    singular: "Category",
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "description", label: "Description" },
    ],
  },
  authors: {
    title: "Authors",
    singular: "Author",
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "biography", label: "Biography" },
    ],
  },
  publishers: {
    title: "Publishers",
    singular: "Publisher",
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "address", label: "Address" },
      { name: "website", label: "Website", type: "url" },
    ],
  },
};

function emptyForm(config) {
  return Object.fromEntries(config.fields.map((field) => [field.name, ""]));
}

function ResourceSection({ resourceKey, config }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(() => emptyForm(config));
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const endpoint = `/books/${resourceKey}/`;

  const loadItems = useCallback(async () => {
    try {
      setError("");
      const response = await api.get(endpoint);
      setItems(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || `Unable to load ${config.title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [config.title, endpoint]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const resetForm = () => {
    setForm(emptyForm(config));
    setEditingId(null);
  };

  const submitForm = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      if (editingId) {
        await api.put(`${endpoint}${editingId}/`, form);
      } else {
        await api.post(endpoint, form);
      }
      resetForm();
      await loadItems();
    } catch (requestError) {
      const data = requestError.response?.data;
      setError(
        data?.detail ||
          (data ? JSON.stringify(data) : `Unable to save ${config.singular.toLowerCase()}.`),
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    const nextForm = {};
    config.fields.forEach((field) => {
      nextForm[field.name] = item[field.name] || "";
    });
    setForm(nextForm);
    setEditingId(item.id);
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete ${config.singular.toLowerCase()} "${item.name}"?`)) return;

    try {
      setError("");
      await api.delete(`${endpoint}${item.id}/`);
      if (editingId === item.id) resetForm();
      await loadItems();
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          `Unable to delete this ${config.singular.toLowerCase()}. It may be used by a book.`,
      );
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">{config.title}</h2>
      <p className="mt-1 text-sm text-slate-500">
        {editingId ? `Editing ${config.singular.toLowerCase()} #${editingId}` : `Add and manage ${config.title.toLowerCase()}.`}
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={submitForm} className="mt-4 space-y-3 rounded-lg bg-slate-50 p-4">
        {config.fields.map((field) => (
          <div key={field.name}>
            <label className="mb-1 block text-sm font-medium text-slate-700">{field.label}</label>
            {field.name === "biography" || field.name === "description" || field.name === "address" ? (
              <textarea
                value={form[field.name]}
                onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                rows="2"
                required={field.required}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            ) : (
              <input
                type={field.type || "text"}
                value={form[field.name]}
                onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                required={field.required}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            )}
          </div>
        ))}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {saving ? "Saving..." : editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500">No records yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-800">{item.name}</p>
                {resourceKey === "publishers" && item.website && (
                  <p className="truncate text-xs text-slate-500">{item.website}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => startEdit(item)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteItem(item)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function CatalogData() {
  return (
    <AppLayout
      title="Catalog Data"
      subtitle="Manage the category, author and publisher services already provided by the backend."
    >
      <div className="grid gap-6 xl:grid-cols-3">
        {Object.entries(resources).map(([resourceKey, config]) => (
          <ResourceSection key={resourceKey} resourceKey={resourceKey} config={config} />
        ))}
      </div>
    </AppLayout>
  );
}

export default CatalogData;
