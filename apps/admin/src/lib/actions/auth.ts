// apps/admin/src/lib/actions/auth.ts
'use server';

import { createServerClient } from '@colheita/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signOut(): Promise<never> {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  await supabase.auth.signOut();
  redirect('/login');
}
