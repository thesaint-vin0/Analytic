import { FormEvent, useState } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import { useOrganization } from '../context/OrganizationContext';

export function OrganizationSetup() {
  const { createOrganization, error } = useOrganization();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(generateSlug(value));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !slug.trim()) {
      return;
    }

    setSubmitting(true);

    const organization = await createOrganization(
      name.trim(),
      slug.trim(),
    );

    if (organization) {
      window.location.reload();
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="surface rounded-3xl p-8 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Building2 size={28} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Create your organization
          </h1>

          <p className="text-sm text-muted mt-2 mb-8">
            Set up your workspace before entering
            your analytics dashboard.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium mb-2">
                Organization name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  handleNameChange(event.target.value)
                }
                placeholder="Vast Nation"
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Organization slug
              </label>

              <input
                value={slug}
                onChange={(event) =>
                  setSlug(
                    generateSlug(event.target.value),
                  )
                }
                placeholder="vast-nation"
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                disabled={submitting}
              />

              <p className="text-xs text-muted mt-2">
                Used to uniquely identify your workspace.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                submitting ||
                !name.trim() ||
                !slug.trim()
              }
              className="w-full rounded-xl px-4 py-3 font-semibold bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting && (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              )}

              {submitting
                ? 'Creating...'
                : 'Create organization'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}