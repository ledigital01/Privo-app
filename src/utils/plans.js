/**
 * PLAN FEATURE GATES - DigiSAFE
 * Définition centralisée des limites et fonctionnalités de chaque plan.
 * Source unique de vérité pour le frontend.
 */

export const PLANS = {
  free: {
    id: 'free',
    label: 'Gratuit',
    price: 0,
    maxDocuments: 5,
    maxStorageMb: 100,
    maxSharesPerMonth: 3,
    features: {
      aiScan: false,        // Scan IA désactivé
      unlimitedShare: false, // Partage limité à 3/mois
      expiryAlerts: false,  // Alertes d'expiration automatiques désactivées
      prioritySupport: false,
      multiUser: false,
      apiAccess: false,
    }
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    price: 4900,
    maxDocuments: 100,
    maxStorageMb: 5120, // 5 Go
    maxSharesPerMonth: Infinity,
    features: {
      aiScan: true,
      unlimitedShare: true,
      expiryAlerts: true,
      prioritySupport: true,
      multiUser: false,
      apiAccess: false,
    }
  },
  business: {
    id: 'business',
    label: 'Business',
    price: 12500,
    maxDocuments: Infinity,
    maxStorageMb: 51200, // 50 Go
    maxSharesPerMonth: Infinity,
    features: {
      aiScan: true,
      unlimitedShare: true,
      expiryAlerts: true,
      prioritySupport: true,
      multiUser: true,    // 5 utilisateurs max
      apiAccess: true,
    }
  }
}

/**
 * Renvoie les limites du plan d'un utilisateur.
 * @param {string} plan - 'free' | 'pro' | 'business'
 */
export const getPlanLimits = (plan = 'free') => PLANS[plan] || PLANS.free

/**
 * Vérifie si un utilisateur peut ajouter un document.
 * @param {string} plan 
 * @param {number} currentDocCount 
 * @returns {{ canAdd: boolean, reason: string | null }}
 */
export const canAddDocument = (plan, currentDocCount) => {
  const limits = getPlanLimits(plan)
  if (currentDocCount >= limits.maxDocuments) {
    return {
      canAdd: false,
      reason: `Limite de ${limits.maxDocuments} documents atteinte pour le plan ${limits.label}. Passez au plan Pro pour continuer.`
    }
  }
  return { canAdd: true, reason: null }
}

/**
 * Vérifie si un utilisateur peut partager un document.
 * @param {string} plan 
 * @param {number} sharesThisMonth 
 * @returns {{ canShare: boolean, reason: string | null }}
 */
export const canShareDocument = (plan, sharesThisMonth) => {
  const limits = getPlanLimits(plan)
  if (!limits.features.unlimitedShare && sharesThisMonth >= limits.maxSharesPerMonth) {
    return {
      canShare: false,
      reason: `Limite de ${limits.maxSharesPerMonth} partages/mois atteinte. Passez au plan Pro pour un partage illimité.`
    }
  }
  return { canShare: true, reason: null }
}

/**
 * Vérifie si une fonctionnalité est disponible pour un plan.
 * @param {string} plan 
 * @param {string} feature - clé de PLANS.features
 * @returns {boolean}
 */
export const hasFeature = (plan, feature) => {
  const limits = getPlanLimits(plan)
  return !!limits.features[feature]
}
