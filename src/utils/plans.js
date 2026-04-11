// Configuration des limites par plan
export const PLAN_LIMITS = {
  free: {
    maxDocs: 5,
    maxStorage: 100 * 1024 * 1024, // 100 Mo
    hasAI: false,
    maxShares: 3
  },
  pro: {
    maxDocs: 100,
    maxStorage: 5 * 1024 * 1024 * 1024, // 5 Go
    hasAI: true,
    maxShares: Infinity
  },
  business: {
    maxDocs: Infinity,
    maxStorage: 50 * 1024 * 1024 * 1024, // 50 Go
    hasAI: true,
    maxShares: Infinity
  }
}

export const getPlanDetails = (plan = 'free') => PLAN_LIMITS[plan] || PLAN_LIMITS.free
