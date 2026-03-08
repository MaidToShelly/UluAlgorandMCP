# UluAlgorandMCP

Algorand ecosystem MCP server. Returns meaning, not raw chain data.

## What It Is

UluAlgorandMCP is an Algorand-specific knowledge and interpretation layer exposed as an MCP (Model Context Protocol) server. It provides protocol discovery, application identification, asset identification, naming resolution, and protocol summaries for the Algorand ecosystem.

## What It Does

- Identifies known Algorand applications by app ID (protocol, role, purpose)
- Identifies known Algorand assets by asset ID (symbol, type, protocol association)
- Lists and describes Algorand protocols (DEXes, lending, naming, bridges, wallets)
- Resolves .algo names from a curated static registry
- Provides agent-friendly protocol summaries

## What It Does Not Do

- Generic block/round lookup
- Account balance or state queries
- Transaction building, signing, or broadcasting
- Custody or key management
- Real-time on-chain data fetching

Those responsibilities belong to other layers:

```
UluCoreMCP      → chain primitives (blocks, accounts, transactions)
UluAlgorandMCP  → Algorand ecosystem meaning (this server)
UluWalletMCP    → signing and custody
UluBroadcastMCP → transaction submission
```

> **Core returns facts. Algorand returns meaning.**

## How It Differs From UluCoreMCP

UluCoreMCP provides low-level chain primitives: look up a block, query an account, fetch a transaction. It is network-aware and returns raw chain data.

UluAlgorandMCP sits above that layer. It answers questions like "what is application 1002541853?" (Tinyman V2 Router) or "what protocols exist in the Algorand ecosystem?" without requiring any chain calls.

## How It Mirrors UluVoiMCP

UluAlgorandMCP is the Algorand-specific sibling of UluVoiMCP. Both share:

- The same EmptyMCP scaffold
- The same project structure (`data/`, `lib/`, `tools/`, `index.js`)
- The same tool surface (10 tools across 3 modules)
- The same registry-backed architecture
- The same error conventions

UluVoiMCP covers the Voi ecosystem. UluAlgorandMCP covers Algorand.

## Relationship to algorand-mcp

[GoPlausible/algorand-mcp](https://github.com/GoPlausible/algorand-mcp) was used as a reference for understanding which Algorand ecosystem capabilities exist and which protocols are worth covering. However, UluAlgorandMCP does not replicate its architecture. algorand-mcp combines wallet, signing, submission, indexer access, and ecosystem integrations in one server. UluAlgorandMCP is deliberately smaller, focused only on the ecosystem knowledge layer.

## Setup

```bash
npm install
```

## Usage

```bash
node index.js
```

## Adding to a Client

```json
{
  "mcpServers": {
    "ulu-algorand-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/UluAlgorandMCP/index.js"]
    }
  }
}
```

## Tools

### Protocol Discovery

| Tool | Description |
|------|-------------|
| `get_protocols` | List all known Algorand protocols. Optional `type` filter. |
| `get_protocol` | Get full metadata for a protocol by ID. |
| `get_protocol_contracts` | List known contracts and assets for a protocol. |
| `get_protocol_summary` | Get a concise agent-friendly protocol summary. |

### Application & Asset Identification

| Tool | Description |
|------|-------------|
| `identify_application` | Identify an Algorand app by ID — returns protocol, role, type. |
| `identify_asset` | Identify an Algorand asset by ID — returns symbol, type, tags. |
| `get_contract_role` | Get the known role of an Algorand application. |

### Naming Resolution

| Tool | Description |
|------|-------------|
| `resolve_name` | Resolve a .algo name from the static registry. |
| `reverse_resolve_address` | Look up names associated with an address. |
| `search_names` | Search the name registry by substring pattern. |

## Example Requests and Responses

### List all DEX protocols

Request:
```json
{ "type": "dex" }
```

Response:
```json
{
  "protocols": [
    {
      "id": "tinyman",
      "name": "Tinyman",
      "type": "dex",
      "description": "Leading Algorand DEX using constant-product AMM pools...",
      "tags": ["defi", "amm", "swap", "liquidity"]
    }
  ]
}
```

### Identify an application

Request:
```json
{ "appId": 1002541853 }
```

Response:
```json
{
  "appId": 1002541853,
  "recognized": true,
  "name": "Tinyman V2 Router",
  "protocol": "tinyman",
  "protocolName": "Tinyman",
  "role": "amm-router",
  "type": "dex",
  "description": "Tinyman V2 AMM router and validator..."
}
```

### Identify an asset

Request:
```json
{ "assetId": 31566704 }
```

Response:
```json
{
  "assetId": 31566704,
  "recognized": true,
  "name": "USDC",
  "symbol": "USDC",
  "decimals": 6,
  "type": "stablecoin",
  "protocol": null,
  "protocolName": null,
  "tags": ["stablecoin", "circle", "usd"],
  "description": "USD Coin issued by Circle. The primary USD stablecoin on Algorand."
}
```

### Resolve a name

Request:
```json
{ "name": "tinyman.algo" }
```

Response:
```json
{
  "name": "tinyman.algo",
  "description": "Tinyman — leading Algorand DEX",
  "source": "static-registry"
}
```

### Identify an unknown application

Request:
```json
{ "appId": 999999999 }
```

Response:
```json
{
  "appId": 999999999,
  "recognized": false,
  "message": "Application 999999999 is not in the known Algorand registry."
}
```

## Project Structure

```
index.js              Server entry point
package.json          Dependencies and metadata
data/
  protocols.json      Curated protocol registry
  applications.json   Known application IDs and roles
  assets.json         Known asset IDs and metadata
  names.json          Well-known .algo names
lib/
  errors.js           Tool result/error helpers
  registry.js         Data loading and lookup functions
tools/
  protocols.js        get_protocols, get_protocol, get_protocol_contracts, get_protocol_summary
  identify.js         identify_application, identify_asset, get_contract_role
  names.js            resolve_name, reverse_resolve_address, search_names
```

## Initial Registry Coverage

The v1 registry includes curated entries for:

- **DEX/AMM**: Tinyman, Pact, HumbleSwap, CompX
- **Lending**: Folks Finance
- **Naming**: NFDomains
- **Analytics**: Vestige
- **Bridge**: Algomint, Aramid Bridge
- **Liquid Staking**: Cometa
- **Real World Assets**: Lofty
- **Oracle**: Goracle
- **Wallets**: Pera, Defly

The registry is static and curated. Dynamic enrichment can be added in future versions.

## Constraints

- JavaScript only, no TypeScript
- No bundlers or build systems
- Lightweight, stdio MCP server
- Extended from the EmptyMCP scaffold
- Structurally consistent with all Ulu MCP servers
