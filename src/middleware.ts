/**
 * @license
 * MIT License
 * Copyright (c) 2025 D8ger
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { clerkMiddleware, ClerkMiddlewareAuth, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from 'next/server';
import { appConfig } from '@/lib/appConfig';

const allowPassWhitelist = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)',  '/waitlist(.*)'])

export default clerkMiddleware(async (auth: ClerkMiddlewareAuth, req: NextRequest) => {
    if (!allowPassWhitelist(req)) {
        const { userId, redirectToSignIn } = await auth()
        if (!userId) {
            return redirectToSignIn()
        }
        console.log('User is authorized:', userId)
    }

    // If protect() didn't redirect, execution continues here.
    // Generate request ID.
    const requestId = crypto.randomUUID();

    // Create a base response to allow the request to proceed.
    // Pass request headers to allow Clerk-added headers to pass through.
    const response = NextResponse.next({
        request: {
            headers: new Headers(req.headers),
        },
    });

    // Add the custom header.
    response.headers.set('X-Request-ID', requestId);

    // Return the modified response.
    return response;
}, { debug: appConfig.clerk.debug }
);

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*.(?:html?|txt|xml|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|pdf|mp3|mp4|docx?|xlsx?|zip|webmanifest|otf)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};