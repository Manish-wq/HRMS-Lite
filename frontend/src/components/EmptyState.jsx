import { Inbox } from 'lucide-react';

export default function EmptyState({ message, icon: Icon = Inbox }) {
  return (
    <div className="empty-state">
      <Icon size={48} color="#cbd5e1" />
      <p>{message || 'No data available.'}</p>
    </div>
  );
}
