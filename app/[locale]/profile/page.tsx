export default function ProfilePage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" defaultValue="Admin User" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Email</label>
                            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" defaultValue="admin@fabrisys.com" disabled />
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
                    <h3 className="text-lg font-medium">Preferences</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Email Notifications</label>
                                <p className="text-xs text-muted-foreground">Receive daily summaries.</p>
                            </div>
                            <div className="h-4 w-4 rounded border bg-primary" /> {/* Mock Checkbox */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
