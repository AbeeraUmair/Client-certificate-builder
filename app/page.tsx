import { CertificateBuilder } from "@/components/certificate-builder"

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8">
        <div className="flex justify-center mb-8">
          <img src="/images/techforce-logo.png" alt="Techforce Pakistan Logo" className="h-24 md:h-32" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-center font-bold text-slate-800 mb-8">
          Certificate Builder
        </h1>
        <CertificateBuilder />
      </div>
    </main>
  )
}
