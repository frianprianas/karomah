
import { getSession } from '@/lib/auth';
import StoriesList from './StoriesList';

export default async function StoriesPage() {
    const session = await getSession();

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Unauthorized</p>
            </div>
        );
    }

    // Pass user session to client component
    return <StoriesList user={session} />;
}
