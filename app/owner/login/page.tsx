import { redirect } from 'next/navigation'

export default function OwnerLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Owner Login</h1>
        <p className="text-center mb-4">Sign in to manage events.</p>
        <div className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="JWT Secret"
            className="p-2 border rounded"
            required
          />
          <button
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            onClick={() => redirect('/owner/events')}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}