// =================================
//  IMPORTS
// =================================
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../../../api/client";
import { useAuth } from "../../../context/AuthContext";

// =================================
//  COMPONENT
// =================================
export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // =================================
  //  FUNCTIONS
  // =================================
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldMessages = err.fieldErrors
          ? Object.values(err.fieldErrors).flat()
          : [];
        setError(fieldMessages[0] ?? err.message);
      } else {
        setError("Impossibile completare la registrazione.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // =================================
  //  RENDER
  // =================================
  return (
    <div className="flex min-h-full items-center justify-center bg-base-light px-4 dark:bg-base-dark">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-base-mid/25 bg-white p-8 shadow-sm dark:bg-base-dark"
      >
        <div>
          <h1 className="text-2xl font-semibold text-base-dark dark:text-base-light">
            Crea il tuo account
          </h1>
          <p className="mt-1 text-sm text-base-mid">
            Iniziamo a costruire il tuo spazio su Astra.
          </p>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-base-mid">
            Nome
          </label>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-base-mid/40 bg-white px-3 py-2 text-sm text-base-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:bg-base-dark dark:text-base-light"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-base-mid">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-base-mid/40 bg-white px-3 py-2 text-sm text-base-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:bg-base-dark dark:text-base-light"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="password"
            className="text-sm font-medium text-base-mid"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-base-mid/40 bg-white px-3 py-2 text-sm text-base-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:bg-base-dark dark:text-base-light"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="password_confirmation"
            className="text-sm font-medium text-base-mid"
          >
            Conferma password
          </label>
          <input
            id="password_confirmation"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            className="w-full rounded-md border border-base-mid/40 bg-white px-3 py-2 text-sm text-base-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:bg-base-dark dark:text-base-light"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition hover:brightness-90 disabled:opacity-60"
        >
          {submitting ? "Creazione account…" : "Registrati"}
        </button>

        <p className="text-center text-sm text-base-mid">
          Hai già un account?{" "}
          <Link
            to="/login"
            className="font-medium text-accent hover:underline"
          >
            Accedi
          </Link>
        </p>
      </form>
    </div>
  );
}
