// =================================
//  IMPORTS
// =================================
import { useState } from "react";
import { Camera } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { ApiError } from "../../../../api/client";

// =================================
//  COMPONENT
// =================================
export default function ProfileSection() {
  // =================================
  //  CONSTS
  // =================================
  const { user, uploadProfilePicture } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      await uploadProfilePicture(file);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossibile caricare la foto profilo.",
      );
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
      setPreview(null);
    }
  };

  // =================================
  //  RENDER
  // =================================
  return (
    <section className="rounded-2xl border border-base-mid/25 bg-white p-4 shadow-sm dark:bg-base-dark">
      <h2 className="mb-3 text-sm font-semibold">Profilo</h2>
      <div className="flex items-center gap-3">
        <label
          title="Cambia foto profilo"
          className="group relative h-14 w-14 shrink-0 cursor-pointer rounded-full"
        >
          {preview || user?.profile_pic ? (
            <img
              src={preview ?? user!.profile_pic!}
              alt={user?.name || "Avatar"}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-base-mid/20 text-base font-semibold text-base-mid">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera size={18} className="text-white" />
          </div>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(event) => void handlePhotoChange(event)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
        <div>
          <p className="text-sm font-medium text-base-dark dark:text-base-light">
            {user?.name}
          </p>
          <p className="text-xs text-base-mid">
            {uploading ? "Caricamento…" : "Tocca la foto per cambiarla"}
          </p>
          {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>
    </section>
  );
}
