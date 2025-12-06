import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials in .env file!');
    console.error('Please add to your .env or .env.local:');
    console.error('NEXT_PUBLIC_SUPABASE_URL=your_project_url');
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
    console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
}

// Client-side Supabase client (for browser/realtime)
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Server-side Supabase client (with service role for admin operations)
export const supabaseAdmin = supabaseServiceRoleKey
    ? createClient(supabaseUrl || '', supabaseServiceRoleKey)
    : supabase; // Fallback to regular client if service role key not available

// Realtime helper functions
export function subscribeToMessages(conversationId: string, callback: (message: any) => void) {
    return supabase
        .channel(`conversation:${conversationId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'Message',
                filter: `conversationId=eq.${conversationId}`,
            },
            callback
        )
        .subscribe();
}

export function unsubscribeFromMessages(conversationId: string) {
    const channel = supabase.getChannels().find(c => c.topic === `conversation:${conversationId}`);
    if (channel) {
        supabase.removeChannel(channel);
    }
}

// Storage helpers
export async function uploadVideo(file: File, path: string) {
    const { data, error } = await supabase.storage
        .from('tutor-videos')
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
        .from('tutor-videos')
        .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
}

export async function deleteVideo(path: string) {
    const { error } = await supabase.storage.from('tutor-videos').remove([path]);
    if (error) throw error;
}
