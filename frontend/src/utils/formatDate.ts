export function formatDate(value: string | Date, locale = 'pt-BR'): string {
  return new Intl.DateTimeFormat(locale).format(new Date(value))
}

export function formatDateTime(value: string | Date, locale = 'pt-BR'): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
