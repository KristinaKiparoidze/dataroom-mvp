type Crumb = {
  id: string;
  name: string;
};

type BreadcrumbsProps = {
  path: Crumb[];
  onNavigate: (id: string) => void;
};

function Breadcrumbs({ path, onNavigate }: BreadcrumbsProps) {
  return (
    <nav
      className="flex flex-wrap items-center gap-2 text-sm"
      aria-label="Breadcrumb"
    >
      <button
        type="button"
        onClick={() => onNavigate(path[0]?.id || "")}
        className="font-medium text-gray-600 hover:text-gray-900 transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded px-1.5 py-1 cursor-pointer"
      >
        Data Room
      </button>
      {path.map((folder, index) => {
        const isCurrent = index === path.length - 1;
        return (
          <div key={folder.id} className="flex items-center gap-2">
            <span className="text-gray-300" aria-hidden="true">
              /
            </span>
            {isCurrent ? (
              <span
                className="rounded px-1.5 py-1 font-medium text-gray-900"
                aria-current="page"
              >
                {folder.name}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(folder.id)}
                className="rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded px-1.5 py-1 cursor-pointer font-normal text-gray-600 hover:text-gray-900 hover:underline"
              >
                {folder.name}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
