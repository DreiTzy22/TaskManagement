const FILTER_OPTIONS = [
  { value: 'all', label: 'All Tasks' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'completed', label: 'Completed' },
];

const SearchFilterBar = ({ search, onSearchChange, filter, onFilterChange, counts }) => {
  return (
    <div className="search-filter-bar">
      <div className="search-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          placeholder="Search tasks by name or description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        {search && (
          <button className="clear-search" onClick={() => onSearchChange('')} aria-label="Clear search">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      <div className="filter-tabs" role="tablist">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            role="tab"
            aria-selected={filter === option.value}
            className={`filter-tab ${filter === option.value ? 'active' : ''}`}
            onClick={() => onFilterChange(option.value)}
          >
            {option.label}
            <span className="filter-count">{counts[option.value] ?? 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchFilterBar;
