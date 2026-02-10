
import LoginForm from '@/components/LoginForm';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950 dark:to-emerald-900">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm lg:flex">
        {/* Only login form for now */}
        <div className="flex flex-col items-center justify-center w-full">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
