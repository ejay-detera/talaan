import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { selectExpiredAnonymousUsers, type CleanupUserCandidate } from "@/lib/demo-cleanup";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 1. Verify cron secret and service role key exist
  if (!cronSecret || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing required server keys (CRON_SECRET or SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 500 }
    );
  }

  // 2. Authenticate cron trigger
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    // 3. List users
    const { data: userData, error: listError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });

    if (listError || !userData?.users) {
      return NextResponse.json(
        { error: listError?.message || "Failed to list users" },
        { status: 500 }
      );
    }

    // 4. Filter expired anonymous users
    const expiredUsers = selectExpiredAnonymousUsers(userData.users as unknown as CleanupUserCandidate[]);

    let deletedCount = 0;
    const errors: Array<{ userId: string; error: string }> = [];

    for (const user of expiredUsers) {
      try {
        // Step A: Find user's store(s) to remove associated storage objects
        const { data: stores } = await admin
          .from("stores")
          .select("id")
          .eq("owner_id", user.id);

        if (stores && stores.length > 0) {
          for (const store of stores) {
            const { data: files } = await admin.storage
              .from("notebook-pages")
              .list(store.id);

            if (files && files.length > 0) {
              const filePaths = files.map((f) => `${store.id}/${f.name}`);
              await admin.storage.from("notebook-pages").remove(filePaths);
            }
          }
        }

        // Step B: Delete the auth user (cascades to stores, pages, entries in Postgres)
        const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
        if (deleteError) {
          errors.push({ userId: user.id, error: deleteError.message });
        } else {
          deletedCount++;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error during user cleanup";
        errors.push({ userId: user.id, error: msg });
      }
    }

    return NextResponse.json({
      success: true,
      processed: expiredUsers.length,
      deleted_users: deletedCount,
      errors,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Cron execution failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
