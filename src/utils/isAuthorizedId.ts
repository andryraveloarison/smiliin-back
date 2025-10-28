import { JwtPayload } from 'jsonwebtoken';

/**
 * Vérifie si l'utilisateur a le droit d'accéder à une ressource
 * @param receiverIds tableau d'IDs autorisés (string)
 * @param user objet user venant du JWT (req.user)
 */
export function isAuthorized(receiverIds: string[] | undefined, user: JwtPayload): boolean {

  if (!receiverIds || receiverIds.length === 0) return false;

  // 1 = accès public, 0 = admin, sinon accès spécifique
  if (receiverIds.includes('1')) return true; // tout le monde
  if (receiverIds.includes('0') && user.role === 'admin') return true; // admin
  if (receiverIds.includes(user.id)) return true; // l'utilisateur est explicitement autorisé

  return false;
}
