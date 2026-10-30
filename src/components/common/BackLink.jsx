import { Link, useLocation, useNavigate } from 'react-router-dom'

/**
 * Lien « retour » : revient à la page d'où vient l'utilisateur. Le fallback sert quand la
 * page est ouverte directement (lien partagé, nouvel onglet) et qu'il n'y a pas de page d'avant.
 */
export default function BackLink({ fallback, children, ...props }) {
  const navigate = useNavigate()
  const { key } = useLocation()

  const retour = (event) => {
    if (key === 'default') return
    event.preventDefault()
    navigate(-1)
  }

  return (
    <Link to={fallback} onClick={retour} {...props}>
      {children}
    </Link>
  )
}
