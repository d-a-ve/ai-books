import { Link, useLocation } from 'react-router';
import { cn } from '~/lib/utils';

interface FilterTabsProps {
  className?: string;
  basePath?: string;
}

const tabs = [
  { label: 'All', path: '' },
  { label: 'Books', path: '/books' },
  { label: 'Magazines', path: '/magazines' },
  { label: 'Newspapers', path: '/newspapers' },
];

export function FilterTabs({ className, basePath = '/library' }: FilterTabsProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tabs.map((tab) => {
        const fullPath = `${basePath}${tab.path}`;
        const isActive = currentPath === fullPath || 
          (tab.path === '' && currentPath === basePath);

        return (
          <Link
            key={tab.path}
            to={fullPath}
            className={cn(
              'relative px-5 py-2.5 font-medium text-sm transition-all duration-300',
              isActive
                ? 'text-white bg-stone-900'
                : 'text-stone-600 bg-white border border-stone-200 hover:border-stone-300 hover:text-stone-900'
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
