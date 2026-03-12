import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="space-y-2">
                    <h1 className="text-9xl font-extrabold text-blue-600 tracking-tight">404</h1>
                    <h2 className="text-3xl font-bold text-gray-900">Halaman tidak ditemukan</h2>
                    <p className="text-gray-500 text-lg">
                        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
                    </p>
                </div>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}
