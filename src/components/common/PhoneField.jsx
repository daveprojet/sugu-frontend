import PhoneInput, { getCountries, getCountryCallingCode } from 'react-phone-number-input'
import fr from 'react-phone-number-input/locale/fr'
import 'react-phone-number-input/style.css'

// Pays affichés en tête de liste : Sénégal (par défaut), voisins, puis diaspora.
const PRIORITY_COUNTRIES = ['SN', 'ML', 'GN', 'GM', 'GW', 'MR', 'CI', 'FR']

// « Sénégal (+221) » : le nom et l'indicatif dans la liste déroulante.
const labels = {
  ...fr,
  ...Object.fromEntries(
    getCountries().map((country) => [country, `${fr[country] || country} (+${getCountryCallingCode(country)})`]),
  ),
}

const variants = {
  glass:
    'w-full px-4 py-3.5 bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl text-gray-900 focus-within:border-white focus-within:ring-2 focus-within:ring-white/50 transition-all duration-200 shadow-sm',
  default:
    'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all text-sm',
}

/**
 * Champ téléphone avec drapeau + indicatif. La valeur est toujours au format
 * international (+221771234567), le même que celui stocké par le backend.
 */
export default function PhoneField({ value, onChange, variant = 'default', className = '', ...props }) {
  return (
    <PhoneInput
      international
      countryCallingCodeEditable={false}
      defaultCountry="SN"
      countryOptionsOrder={[...PRIORITY_COUNTRIES, '|', '...']}
      labels={labels}
      value={value || undefined}
      onChange={(next) => onChange(next || '')}
      className={`${variants[variant]} ${className}`}
      numberInputProps={{
        className: 'flex-1 min-w-0 bg-transparent border-0 p-0 text-inherit placeholder-gray-500 focus:outline-none focus:ring-0',
      }}
      {...props}
    />
  )
}
