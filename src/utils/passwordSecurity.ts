export const MIN_PASSWORD_LENGTH = 10

export interface PasswordRuleCheck {
  key: 'minLength' | 'uppercase' | 'lowercase' | 'number' | 'symbol'
  label: string
  passed: boolean
}

export type PasswordStrengthLevel =
  | 'empty'
  | 'weak'
  | 'fair'
  | 'strong'
  | 'very_strong'

export interface PasswordEvaluation {
  checks: PasswordRuleCheck[]
  passedCount: number
  totalRules: number
  /** Nivel visual de fortaleza (0 a 4 segmentos) */
  segmentsFilled: 0 | 1 | 2 | 3 | 4
  level: PasswordStrengthLevel
  label: string
  isValid: boolean
  errorMessage: string | null
}

/**
 * Evalúa la seguridad de una contraseña exigiendo mínimo 10 caracteres,
 * mayúsculas, minúsculas, números y al menos un carácter especial.
 */
export function evaluatePasswordSecurity(password: string): PasswordEvaluation {
  const checks: PasswordRuleCheck[] = [
    {
      key: 'minLength',
      label: `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`,
      passed: password.length >= MIN_PASSWORD_LENGTH,
    },
    {
      key: 'uppercase',
      label: 'Al menos una letra mayúscula (A–Z)',
      passed: /[A-ZÁÉÍÓÚÜÑ]/.test(password),
    },
    {
      key: 'lowercase',
      label: 'Al menos una letra minúscula (a–z)',
      passed: /[a-záéíóúüñ]/.test(password),
    },
    {
      key: 'number',
      label: 'Al menos un número (0–9)',
      passed: /\d/.test(password),
    },
    {
      key: 'symbol',
      label: 'Al menos un carácter especial (!@#$%...)',
      passed: /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]/.test(password),
    },
  ]

  const passedCount = checks.filter((c) => c.passed).length
  const totalRules = checks.length
  const isValid = passedCount === totalRules

  if (!password) {
    return {
      checks,
      passedCount: 0,
      totalRules,
      segmentsFilled: 0,
      level: 'empty',
      label: '',
      isValid: false,
      errorMessage: 'La contraseña es obligatoria',
    }
  }

  let errorMessage: string | null = null
  if (!checks[0].passed) {
    errorMessage = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
  } else if (!isValid) {
    errorMessage =
      'La contraseña debe incluir mayúsculas, minúsculas, un número y un carácter especial'
  }

  if (!isValid) {
    const isFair = passedCount >= 3 && password.length >= 8
    return {
      checks,
      passedCount,
      totalRules,
      segmentsFilled: isFair ? 2 : 1,
      level: isFair ? 'fair' : 'weak',
      label: isFair ? 'Media' : 'Débil',
      isValid: false,
      errorMessage,
    }
  }

  const isVeryStrong = password.length >= 14
  return {
    checks,
    passedCount,
    totalRules,
    segmentsFilled: isVeryStrong ? 4 : 3,
    level: isVeryStrong ? 'very_strong' : 'strong',
    label: isVeryStrong ? 'Muy segura' : 'Segura',
    isValid: true,
    errorMessage: null,
  }
}
