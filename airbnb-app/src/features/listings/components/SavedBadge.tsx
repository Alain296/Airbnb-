interface SavedBadgeProps {
  count: number;
}

export const SavedBadge = ({ count }: SavedBadgeProps) => {
  if (count === 0) {
    return <span className="saved-badge">0 saved</span>;
  }

  return (
    <span className="saved-badge">
      {count} {count === 1 ? 'saved' : 'saved'}
    </span>
  );
};