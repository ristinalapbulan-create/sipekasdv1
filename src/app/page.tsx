import { redirect } from 'next/navigation';

export default function Home() {
  // Middleware handles redirection to /sekolah or /disdik based on cookies.
  // If not authenticated, it will redirect to /login.
  // We just trigger a redirect to /login here as a fallback or entry point.
  redirect('/login');
}
