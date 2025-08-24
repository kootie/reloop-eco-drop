"use client"

import QRBinInfo from '@/components/qr-bin-info'
import { useSearchParams } from 'next/navigation'

export default function QRPage({ params }: { params: { qrCode: string } }) {
	const search = useSearchParams()
	const qrCode = params.qrCode
	const lat = search.get('lat')
	const lng = search.get('lng')
	const name = search.get('name')

	// We simply render the info component; it fetches details via API by qrCode
	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
			<div className="max-w-3xl mx-auto">
				{ name && (
					<div className="mb-4 text-center text-green-800 font-semibold">{name}</div>
				)}
				<QRBinInfo qrCode={qrCode} />
			</div>
		</div>
	)
}


