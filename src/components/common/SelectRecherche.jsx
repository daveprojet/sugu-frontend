import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Search } from 'lucide-react'

const HAUTEUR_MAX = 320
const MARGE = 8

const normaliser = (texte) => texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/**
 * Liste déroulante avec barre de recherche. Les options ont la forme
 * { value, label, groupe? } ; la recherche porte sur le libellé et le groupe.
 * Le panneau est rendu dans <body> : un parent en overflow-hidden ne le coupe pas.
 */
export default function SelectRecherche({
  value,
  onChange,
  options,
  disabled = false,
  className = '',
  ariaLabel,
  placeholderRecherche = 'Rechercher…',
}) {
  const [ouvert, setOuvert] = useState(false)
  const [recherche, setRecherche] = useState('')
  const [actif, setActif] = useState(0)
  const [position, setPosition] = useState(null)
  const boutonRef = useRef(null)
  const panneauRef = useRef(null)

  const selection = options.find((option) => option.value === value) || options[0]
  const visibles = useMemo(() => {
    const terme = normaliser(recherche.trim())
    if (!terme) return options
    return options.filter((option) => (
      option.value !== '' && normaliser(`${option.label} ${option.groupe || ''}`).includes(terme)
    ))
  }, [options, recherche])

  const fermer = () => {
    setOuvert(false)
    setRecherche('')
    setActif(0)
  }

  const choisir = (option) => {
    onChange(option.value)
    fermer()
    boutonRef.current?.focus()
  }

  useLayoutEffect(() => {
    if (!ouvert) return undefined
    const placer = () => {
      const rect = boutonRef.current.getBoundingClientRect()
      const dessous = window.innerHeight - rect.bottom - MARGE
      const dessus = rect.top - MARGE
      const versLeHaut = dessous < 240 && dessus > dessous
      setPosition({
        left: rect.left,
        width: rect.width,
        maxHeight: Math.min(HAUTEUR_MAX, versLeHaut ? dessus : dessous),
        ...(versLeHaut ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
      })
    }
    placer()
    window.addEventListener('resize', placer)
    window.addEventListener('scroll', placer, true)
    return () => {
      window.removeEventListener('resize', placer)
      window.removeEventListener('scroll', placer, true)
    }
  }, [ouvert])

  useEffect(() => {
    if (!ouvert) return undefined
    const fermerSiDehors = (event) => {
      if (!boutonRef.current?.contains(event.target) && !panneauRef.current?.contains(event.target)) fermer()
    }
    document.addEventListener('pointerdown', fermerSiDehors)
    return () => document.removeEventListener('pointerdown', fermerSiDehors)
  }, [ouvert])

  useEffect(() => {
    if (!ouvert) return
    panneauRef.current?.querySelector('[data-actif="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [actif, ouvert])

  const surTouche = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      fermer()
      boutonRef.current?.focus()
    } else if (event.key === 'ArrowDown' && visibles.length) {
      event.preventDefault()
      setActif((index) => (index + 1) % visibles.length)
    } else if (event.key === 'ArrowUp' && visibles.length) {
      event.preventDefault()
      setActif((index) => (index - 1 + visibles.length) % visibles.length)
    } else if (event.key === 'Enter') {
      // Entrée choisit l'option : elle ne doit pas envoyer le formulaire parent.
      event.preventDefault()
      if (visibles[actif]) choisir(visibles[actif])
    } else if (event.key === 'Tab') {
      fermer()
    }
  }

  return (
    <>
      <button
        ref={boutonRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={ouvert}
        onClick={() => (ouvert ? fermer() : setOuvert(true))}
        className={`${className} flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed`}
      >
        <span className="truncate">{selection?.label}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
      </button>

      {ouvert && position && createPortal(
        <div
          ref={panneauRef}
          style={position}
          className="fixed z-[60] flex min-w-[240px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-900 shadow-xl"
        >
          <div className="relative border-b border-gray-100 p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              autoFocus
              type="text"
              value={recherche}
              onChange={(event) => {
                setRecherche(event.target.value)
                setActif(0)
              }}
              onKeyDown={surTouche}
              placeholder={placeholderRecherche}
              aria-label={placeholderRecherche}
              className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <ul role="listbox" className="min-h-0 flex-1 overflow-y-auto py-1 text-sm">
            {visibles.length ? visibles.map((option, index) => (
              <li key={option.value} role="presentation">
                {option.groupe && option.groupe !== visibles[index - 1]?.groupe && (
                  <div className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{option.groupe}</div>
                )}
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  data-actif={index === actif}
                  onMouseEnter={() => setActif(index)}
                  onClick={() => choisir(option)}
                  className={`block w-full px-3 py-2 text-left ${index === actif ? 'bg-indigo-50 text-indigo-700' : ''} ${option.value === value ? 'font-semibold' : ''}`}
                >
                  {option.label}
                </button>
              </li>
            )) : <li className="px-3 py-3 text-center text-gray-500">Aucun résultat</li>}
          </ul>
        </div>,
        document.body,
      )}
    </>
  )
}
