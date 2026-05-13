export function FlashMessage({ message, onClose }) {
  if (!message) return null

  return (
    <div className="msg">
      {message}
      <button onClick={onClose}>cerrar</button>
    </div>
  )
}
