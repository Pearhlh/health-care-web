'use client';

import { AppHeader } from './header';
import { AppSidebar } from './sidebar';

export default function DashboardLayout ( { children } )
{
    return (
        <div className="flex min-h-screen flex-col">
            <AppHeader />
            <div className="flex flex-1">
                <AppSidebar />
                <main className="flex-1 p-6 md:p-8 lg:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
} 