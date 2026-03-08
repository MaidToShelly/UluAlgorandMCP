import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");

function loadJSON(filename) {
  const raw = readFileSync(join(dataDir, filename), "utf-8");
  return JSON.parse(raw);
}

let protocols = null;
let applications = null;
let assets = null;
let names = null;

export function getProtocols() {
  if (!protocols) protocols = loadJSON("protocols.json");
  return protocols;
}

export function getApplications() {
  if (!applications) applications = loadJSON("applications.json");
  return applications;
}

export function getAssets() {
  if (!assets) assets = loadJSON("assets.json");
  return assets;
}

export function getNames() {
  if (!names) names = loadJSON("names.json");
  return names;
}

export function findProtocol(id) {
  return getProtocols().find((p) => p.id === id) || null;
}

export function findApplication(appId) {
  const apps = getApplications();
  return apps[String(appId)] || null;
}

export function findAsset(assetId) {
  const a = getAssets();
  return a[String(assetId)] || null;
}

export function protocolContracts(protocolId) {
  const apps = getApplications();
  const results = [];
  for (const [appId, info] of Object.entries(apps)) {
    if (info.protocol === protocolId) {
      results.push({ appId: Number(appId), ...info });
    }
  }
  return results;
}

export function protocolAssets(protocolId) {
  const a = getAssets();
  const results = [];
  for (const [assetId, info] of Object.entries(a)) {
    if (info.protocol === protocolId) {
      results.push({ assetId: Number(assetId), ...info });
    }
  }
  return results;
}
