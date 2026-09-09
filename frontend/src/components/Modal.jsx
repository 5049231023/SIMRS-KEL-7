export default function Modal({ show, icon, isError, title, text, onClose }) {
  if (!show) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className={`modal-icon ${isError ? 'error' : ''}`}>{icon || '✓'}</div>
        <h3>{title}</h3>
        <p>{text}</p>
        <button className="modal-btn" onClick={onClose}>OK / Selesai</button>
      </div>
    </div>
  );
}
