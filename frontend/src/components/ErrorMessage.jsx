import { CircleAlert } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <CircleAlert size={32} color="#ef4444" />
      <p>{message || 'Something went wrong.'}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
