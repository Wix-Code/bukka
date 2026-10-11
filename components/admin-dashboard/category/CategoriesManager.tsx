"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Add, Dropbox, Edit2, Trash } from "iconsax-react";
import { supabase } from "@/lib/supabase";
import EmptyState from "@/components/reusuable/EmptyState";
import Input from "@/components/reusuable/InputProps";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type CategoryRow = {
  id: string;
  name: string;
  created_at: string;
};

type Props = {
  initialCategories: CategoryRow[];
};

const byName = (a: CategoryRow, b: CategoryRow) => a.name.localeCompare(b.name);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function friendlyError(error: { code?: string; message: string }) {
  if (error.code === "23505")
    return "A category with that name already exists.";
  if (error.code === "42501" || error.code === "PGRST116")
    return "Only platform admins can change categories.";
  return error.message;
}

export default function CategoriesManager({ initialCategories }: Props) {
  const [categories, setCategories] =
    useState<CategoryRow[]>(initialCategories);
  const [pageError, setPageError] = useState<string | null>(null);

  // Add / edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete dialog
  const [deleting, setDeleting] = useState<CategoryRow | null>(null);
  const [removing, setRemoving] = useState(false);

  function openAdd() {
    setEditing(null);
    setName("");
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(category: CategoryRow) {
    setEditing(category);
    setName(category.name);
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Enter a category name.");
      return;
    }

    setSaving(true);
    setFormError(null);
    setPageError(null);

    if (editing) {
      const { data, error } = await supabase
        .from("categories")
        .update({ name: trimmed })
        .eq("id", editing.id)
        .select()
        .single();

      setSaving(false);

      if (error) {
        setFormError(friendlyError(error));
        return;
      }

      setCategories((prev) =>
        prev
          .map((c) => (c.id === editing.id ? (data as CategoryRow) : c))
          .sort(byName),
      );
    } else {
      const { data, error } = await supabase
        .from("categories")
        .insert({ name: trimmed })
        .select()
        .single();

      setSaving(false);

      if (error) {
        setFormError(friendlyError(error));
        return;
      }

      setCategories((prev) => [...prev, data as CategoryRow].sort(byName));
    }

    setFormOpen(false);
  }

  async function confirmDelete() {
    if (!deleting) return;

    setRemoving(true);
    setPageError(null);

    // .select("id") so we can tell a real delete from RLS silently
    // matching zero rows (which doesn't raise an error on its own).
    const { data, error } = await supabase
      .from("categories")
      .delete()
      .eq("id", deleting.id)
      .select("id");

    setRemoving(false);

    if (error) {
      setPageError(friendlyError(error));
    } else if (!data || data.length === 0) {
      setPageError("Couldn't delete that category.");
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== deleting.id));
    }

    setDeleting(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            {categories.length}{" "}
            {categories.length === 1 ? "category" : "categories"}
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 transition"
        >
          <Add size={18} color="currentColor" />
          Add category
        </button>
      </div>

      {pageError && (
        <div className="mb-6 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">
          {pageError}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <EmptyState
            icon={<Dropbox size={28} color="#16A34A" />}
            title="No categories yet"
            description="Create the first category to start organizing dishes."
            action={{ label: "Add category", onClick: openAdd }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Added</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(category.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(category)}
                          aria-label={`Edit ${category.name}`}
                          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
                        >
                          <Edit2 size={16} color="currentColor" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(category)}
                          aria-label={`Delete ${category.name}`}
                          className="w-9 h-9 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50 transition"
                        >
                          <Trash size={16} color="currentColor" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / edit */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!saving) setFormOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit category" : "Add category"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate className="mt-2">
            <Input
              label="Category name"
              placeholder="Soups & Stews"
              maxLength={40}
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {formError && (
              <p role="alert" className="mb-2 text-sm text-red-600">
                {formError}
              </p>
            )}

            <DialogFooter className="mt-4">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                disabled={saving}
                className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {saving ? "Saving…" : editing ? "Save changes" : "Add category"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !removing) setDeleting(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete category</DialogTitle>
            <DialogDescription>
              {deleting
                ? `Delete "${deleting.name}"? This can't be undone.`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <button
              type="button"
              onClick={() => setDeleting(null)}
              disabled={removing}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={removing}
              className="bg-red-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {removing ? "Deleting…" : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
