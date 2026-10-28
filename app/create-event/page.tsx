import { redirect } from 'next/navigation'
import { generateSlug } from '@/lib/utils'
import { generateQRCode } from '@/lib/qr'

export default function CreateEvent() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const coupleNames = formData.get('coupleNames') as string
    const eventDate = formData.get('eventDate') as string
    const language = formData.get('language') as string
    const style = formData.get('style') as string
    const defaultSong = formData.get('defaultSong') as string

    // Generate slug, PIN, and QR code
    const slug = generateSlug()
    const pin = Math.floor(100000 + Math.random() * 900000).toString()
    const qrCode = generateQRCode(`http://localhost:3000/guest/${slug}`)

    // TODO: Save to database
    console.log('Event created:', { slug, pin, qrCode })
    redirect(`/owner/events`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Event</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Couple Names</label>
            <input
              type="text"
              name="coupleNames"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Event Date</label>
            <input
              type="date"
              name="eventDate"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Language</label>
            <select
              name="language"
              className="w-full p-2 border rounded"
              defaultValue="malay"
            >
              <option value="malay">Malay</option>
              <option value="english">English</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Style</label>
            <select
              name="style"
              className="w-full p-2 border rounded"
              defaultValue="default"
            >
              <option value="default">Default</option>
              <option value="modern">Modern</option>
              <option value="traditional">Traditional</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Default Song</label>
            <input
              type="text"
              name="defaultSong"
              className="w-full p-2 border rounded"
              placeholder="Song name"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  )
}