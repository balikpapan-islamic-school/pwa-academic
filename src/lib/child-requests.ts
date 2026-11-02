import { ChildLinkRequest } from '@/lib/dummy-ui'

// Pengajuan hubungkan anak hanya boleh dikirim bila tidak ada pengajuan PENDING:
// akun baru maupun yang sudah punya anak harus menunggu verifikasi admin selesai dulu.
export function hasPendingChildRequest(requests: ChildLinkRequest[]) {
    return requests.some((request) => request.status === 'PENDING')
}
