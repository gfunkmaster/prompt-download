import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const text = formData.get('text') as string;
        const title = formData.get('title') as string;
        const url = formData.get('url') as string;
        const file = formData.get('media') as File;

        // Priority: File > URL > Text > Title

        // 1. Handle File (Image)
        if (file && file.size > 0) {
            // Note: Transferring files via URL is not possible due to size limits.
            // In a real PWA, this should be intercepted by Service Worker.
            // As a fallback for this MVP without complex SW config:
            // We can't easily pass the file. We'll ask the user to upload manually if SW fails.
            // OR: We could use a temporary KV store if we had one.
            // For now, we redirect with a flag telling the UI "Check for shared file" (if we could save it).

            // Current limitation: Server-side file handling without DB.
            // WE WILL RETURN A PAGE that runs client-side JS to store it? No, it's a POST.

            // Temporary Workaround: Redirect with error/instruction mostly for now, 
            // BUT: Text sharing is the priority we can solve 100%.

            console.log("Received file:", file.name, file.size);
            return NextResponse.redirect(new URL('/?share_error=image_requires_sw', req.url), 303);
        }

        // 2. Handle Text/URL
        let sharedContent = url || text || title;
        if (sharedContent) {
            // Clean up: If it's a URL, we might want to just pass it.
            // If it is text from X/Twitter, it often comes as "Title: ... URL: ...".

            const params = new URLSearchParams();
            if (url) sharedContent = url + "\n" + (text || "");

            params.set('share_text', sharedContent.trim());
            return NextResponse.redirect(new URL(`/?${params.toString()}`, req.url), 303);
        }

        return NextResponse.redirect(new URL('/', req.url), 303);
    } catch (error) {
        console.error("Share Handler Error:", error);
        return NextResponse.redirect(new URL('/?share_error=failed', req.url), 303);
    }
}
