export default function ProjectPage({ params }: { params: { id: string } }) {
  return <div className="p-8 text-2xl">Project {params.id}</div>
}
