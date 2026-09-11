// Définitions des outils MCP lingua + exécution.

import { appeler } from './paiement.js';

const PAIEMENT =
  'Paiement à l\'unité x402 (USDC sur Solana, gas sponsorisé) : aucun compte, aucune clé API. ' +
  'Configurez le serveur avec X402_PAYER_KEY_B64 (wallet financé en USDC) ou X402_CREDIT_TOKEN (crédit prépayé).';

export const OUTILS = [
  {
    nom: 'detect_langue',
    titre: "Détecter la langue d'un texte (0,002 $ USDC)",
    description:
      "Identifie la langue d'un texte (hors-ligne, 186 langues, ISO 639-3) et renvoie " +
      "les 5 langues les plus probables avec leur confiance. " + PAIEMENT +
      ' `text` doit faire au moins 10 caractères pour une détection fiable.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Texte à analyser (au moins 10 caractères).',
        },
      },
      required: ['text'],
    },
    chemin: '/detect',
    versCorps: (a) => ({ text: a.text }),
  },
  {
    nom: 'verifier_langue',
    titre: "Vérifier qu'un texte est dans une langue donnée (0,004 $ USDC)",
    description:
      "Vérifie qu'un texte est effectivement écrit dans la langue annoncée. " + PAIEMENT +
      " `expected` accepte un code ISO 639-1 (ex. « fr ») ou ISO 639-3 (ex. « fra »). " +
      'Renvoie `ok`, la langue détectée et la confiance.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Texte à vérifier (au moins 10 caractères).' },
        expected: { type: 'string', description: 'Langue attendue (ISO 639-1 ou 639-3).' },
      },
      required: ['text', 'expected'],
    },
    chemin: '/verify',
    versCorps: (a) => ({ text: a.text, expected: a.expected }),
  },
  {
    nom: 'bundle_check',
    titre: 'Acheter un lot de crédit prépayé (0,006 $ USDC)',
    description:
      "Achète un lot de crédit prépayé (0,006 $ USDC) et renvoie un jeton `X402-Credit` " +
      'réutilisable sur les appels suivants sans nouvelle transaction Solana. ' + PAIEMENT,
    inputSchema: { type: 'object', properties: {} },
    chemin: '/v1/bundle/check',
    versCorps: () => ({}),
  },
  {
    nom: 'credit_topup',
    titre: 'Recharger le crédit prépayé (montant libre, min 0,006 $ USDC)',
    description:
      "Recharge le crédit prépayé d'un montant libre en USDC (min 0,006 $, max 1000 $) " +
      'et renvoie un jeton `X402-Credit`. Une seule transaction Solana pour de nombreux appels. ' +
      PAIEMENT,
    inputSchema: {
      type: 'object',
      properties: {
        montant: {
          type: 'string',
          description: 'Montant en USDC (ex. "0.50"). Min 0.006, max 1000.',
        },
      },
      required: ['montant'],
    },
    chemin: '/v1/credit/topup',
    versCorps: (a) => ({ montant: a.montant }),
  },
];

export async function executerOutil(outil, args) {
  const corps = outil.versCorps(args || {});
  const resultat = await appeler({ chemin: outil.chemin, corps });
  return { corps, resultat };
}
