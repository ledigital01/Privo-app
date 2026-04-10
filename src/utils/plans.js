export const PLAN_LIMITS = {
  free: {
    maxDocs: 5,
    maxStorage: 100 * 1024 * 1024, // 100 Mo
    maxSharesPerMonth: 3,
    hasIA: false,
    hasAutoAlerts: false,
    label: 'Gratuit'
  },
  pro: {
    maxDocs: 100,
    maxStorage: 5 * 1024 * 1024 * 1024, // 5 Go
    maxSharesPerMonth: Infinity,
    hasIA: true,
    hasAutoAlerts: true,
    label: 'Pro'
  },
  business: {
    maxDocs: Infinity,
    maxStorage: 50 * 1024 * 1024 * 1024, // 50 Go
    maxSharesPerMonth: Infinity,
    hasIA: true,
    hasAutoAlerts: true,
    label: 'Business'
  }
}
