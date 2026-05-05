export default function WishlistDetailPage({ params }: { params: { id: string } }) {
  return <div className="p-8 text-2xl">Wishlist Item {params.id}</div>
}
