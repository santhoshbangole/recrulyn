interface SectionHeaderProps {
  title: string;
  description?: string;
}

export default function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900">
        {title}
      </h1>

      {description && (
        <p className="mt-2 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}