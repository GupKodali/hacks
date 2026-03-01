import EditProfileForm from "./ui";

export default function EditProfilePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Edit profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update your public info and preferences.
        </p>
      </div>

      <EditProfileForm />
    </div>
  );
}