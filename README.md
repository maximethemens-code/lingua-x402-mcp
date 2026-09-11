# Lingua Detective x402 MCP

Serveur MCP exposant les API payantes de Lingua Detective en **paiement à l'unité x402** (USDC sur Solana, gas sponsorisé) : aucun compte, aucune clé API, aucun abonnement. Un agent IA appelle l'outil, paie quelques centimes, reçoit le résultat.

## Outils (4)

| Outil | Endpoint | Prix |
|---|---|---|
| `detect_langue` | `POST /detect` | **0,002 $** |
| `verifier_langue` | `POST /verify` | **0,004 $** |
| `bundle_check` | `POST /v1/bundle/check` | **0,006 $** |
| `credit_topup` | `POST /v1/credit/topup` | libre (min 0,006 $) |

## Modes de paiement

Le serveur lit sa configuration dans l'environnement. **Deux modes** (dans l'ordre de priorité) :

1. **Crédit prépayé** — `X402_CREDIT_TOKEN` : un jeton opaque obtenu via un top-up
   (`credit_topup` ou `bundle_check`). Chaque appel débite le crédit **sans** transaction
   Solana. Idéal pour un volume élevé.
2. **Wallet payeur** — `X402_PAYER_KEY_B64` : clé privée Solana (64 octets, base64) d'un
   wallet **financé en USDC** (pas de SOL requis : le gas est sponsorisé par le facilitateur).
   Chaque appel règle sa transaction x402 automatiquement.

Sans l'un ni l'autre, les outils renvoient le **challenge 402 décodé** (montant, adresse
`payTo`, réseau) afin que l'agent comprenne ce qui est demandé.

### Variables d'environnement

| Variable | Rôle | Défaut |
|---|---|---|
| `X402_BASE_URL` | Base de l'API payante | `https://linguadetective.com` |
| `X402_NETWORK` | `mainnet` \| `devnet` | `mainnet` |
| `X402_PAYER_KEY_B64` | Wallet payeur (secret key 64 octets, base64) | — |
| `X402_CREDIT_TOKEN` | Jeton de crédit prépayé | — |
| `X402_TRUSTED_PAYTO` | Verrouille le destinataire (anti-détournement) | — |
| `X402_FACILITATOR_URL` | Facilitateur x402 (Dexter) | `https://x402.dexter.cash` |
| `X402_RPC_URL` | RPC Solana (fallback blockhash) | mainnet-beta public |

## Installation

### Claude Desktop

```json
{
  "mcpServers": {
    "linguadetective": {
      "command": "npx",
      "args": ["-y", "lingua-x402-mcp"],
      "env": {
        "X402_PAYER_KEY_B64": "<votre clé privée base64>",
        "X402_TRUSTED_PAYTO": "H3NuGHu9mpGgscj2DWtrs699PWdovPUicy2N9dDaYLTk"
      }
    }
  }
}
```

### Cursor / autres clients stdio

Ajoutez la même entrée `command: npx`, `args: ["-y", "lingua-x402-mcp"]` avec vos `env`.

### Local

```bash
git clone https://github.com/maximethemens-code/lingua-x402-mcp && cd lingua-x402-mcp && npm install
X402_PAYER_KEY_B64=... npm start   # npm start = node src/index.js
```

## Exemple d'appel

```
detect_langue { text: "Bonjour tout le monde, ceci est une phrase en français." }
→ { "langues": [ { "code": "fra", "nom": "français", ... } ], ... }   (0,002 $ USDC débité)
```

## Sécurité

- `X402_PAYER_KEY_B64` n'est **jamais** transmis au serveur : il ne sert qu'à signer la
  transaction localement.
- `X402_TRUSTED_PAYTO` est fortement recommandé : il empêche le wallet de payer un
  destinataire inattendu (ex. si `X402_BASE_URL` pointe vers un serveur malveillant).
- Le wallet de paiement doit être distinct du wallet de réception (`payTo`).

## Limites connues

- La détection est **hors-ligne** (bibliothèque `franc`, 186 langues, codes ISO 639-3) :
  pas d'appel réseau, mais un texte trop court (< 10 caractères) renvoie une erreur.
- Le règlement réel on-chain (verify/settle via Dexter) n'est exercé qu'avec un wallet
  effectivement financé en USDC.
