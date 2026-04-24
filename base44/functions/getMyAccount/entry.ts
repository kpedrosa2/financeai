import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role to search ALL accounts (bypass RLS)
    const allAccounts = await base44.asServiceRole.entities.SharedAccount.list();

    const myAccount = allAccounts.find(a =>
      a.owner_email === user.email ||
      (a.member_emails || []).includes(user.email)
    );

    return Response.json({ account: myAccount || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});