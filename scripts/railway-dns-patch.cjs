"use strict";

/**
 * Preload for Railway CLI when system DNS cannot resolve backboard.railway.com.
 * Forces lookups through 8.8.8.8 / 1.1.1.1.
 */
const dns = require("dns");
const { promisify } = require("util");

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);
const originalLookup = dns.lookup.bind(dns);

function patchedLookup(hostname, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  options = options || {};

  const family = typeof options === "number" ? options : options.family;
  const all = typeof options === "object" && options.all;

  const finish = (err, result) => {
    if (!callback) return;
    if (err) return callback(err);
    if (all) return callback(null, result);
    const first = Array.isArray(result) ? result[0] : result;
    callback(null, first.address, first.family);
  };

  const run = async () => {
    try {
      if (family === 6) {
        const addrs = await resolve6(hostname);
        const mapped = addrs.map((address) => ({ address, family: 6 }));
        return finish(null, all ? mapped : mapped);
      }
      // Prefer IPv4
      try {
        const addrs = await resolve4(hostname);
        const mapped = addrs.map((address) => ({ address, family: 4 }));
        return finish(null, mapped);
      } catch (e4) {
        if (family === 4) throw e4;
        const addrs = await resolve6(hostname);
        const mapped = addrs.map((address) => ({ address, family: 6 }));
        return finish(null, mapped);
      }
    } catch (err) {
      // Fallback to system lookup
      return originalLookup(hostname, options, callback);
    }
  };

  run().catch((err) => callback && callback(err));
}

dns.lookup = patchedLookup;

// Also patch promises API used by undici/fetch in newer Node
if (dns.promises && dns.promises.lookup) {
  dns.promises.lookup = (hostname, options = {}) =>
    new Promise((resolve, reject) => {
      patchedLookup(hostname, options, (err, address, family) => {
        if (err) reject(err);
        else if (options && options.all) resolve(address);
        else resolve({ address, family });
      });
    });
}

console.error("[railway-dns-patch] using DNS 8.8.8.8 / 1.1.1.1");
