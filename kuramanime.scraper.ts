import kuramanimeConfig from "../configs/kuramanime.config.js";
import getHTML from "../helpers/getHTML.js";
import { parse } from "node-html-parser";

const { baseUrl } = kuramanimeConfig;

// Aktifkan log dengan menjalankan server pakai: KURAMA_DEBUG=1 npm start
const DEBUG = process.env.KURAMA_DEBUG === "1";
const log = (...args: unknown[]) => {
  if (DEBUG) console.log("[kuramanime]", ...args);
};

// Nama file secret saat ini (dari config situs: prefix "assets/" + AUTH_ROUTE_PARAM)
const DEFAULT_SECRET_PATH = "/assets/Ks6sqSgloPT1HM1.txt";
const CACHE_TTL = 10 * 60 * 1000;

let cachedSecretPath: { path: string; at: number } | null = null;

// Secret yang valid: string pendek, tanpa spasi/tag HTML
function isValidSecret(text: unknown): text is string {
  return typeof text === "string" && text.length > 0 && text.length <= 200 && !/[<>\s]/.test(text);
}

async function trySecret(origin: string, path: string, ref: string): Promise<string | null> {
  try {
    const raw = await getHTML(origin, path, ref);
    const text = String(raw ?? "").trim();

    log("secret try:", path, "->", JSON.stringify(text.slice(0, 40)), "len:", text.length);

    return isValidSecret(text) ? text : null;
  } catch (error) {
    log("secret error:", path, (error as Error)?.message);

    return null;
  }
}

// Fallback: cari nama file secret dari file JS config situs (window.process = { env: { MIX_... } })
async function discoverSecretPath(origin: string, ref: string): Promise<string | null> {
  try {
    const refUrl = new URL(ref);
    const pageHtml = await getHTML(origin, refUrl.pathname + refUrl.search, baseUrl);
    const doc = parse(String(pageHtml));
    const siteOrigin = new URL(origin).origin;

    const srcs = doc
      .querySelectorAll("script[src]")
      .map((el) => el.getAttribute("src") || "")
      .filter(Boolean)
      .slice(0, 25);

    for (const src of srcs) {
      let scriptUrl: URL;

      try {
        scriptUrl = new URL(src, origin);
      } catch {
        continue;
      }

      if (scriptUrl.origin !== siteOrigin) continue;

      try {
        const js = String(await getHTML(origin, scriptUrl.pathname + scriptUrl.search, ref));
        const route = js.match(/MIX_AUTH_ROUTE_PARAM\s*:\s*['"]([^'"]+)['"]/)?.[1];

        if (route) {
          const prefix = js.match(/MIX_PREFIX_AUTH_ROUTE_PARAM\s*:\s*['"]([^'"]*)['"]/)?.[1] ?? "assets/";
          const path = "/" + (prefix + route).replace(/^\/+/, "");

          log("secret path discovered:", path, "from", scriptUrl.pathname);

          return path;
        }
      } catch {
        // lanjut ke script berikutnya
      }
    }
  } catch (error) {
    log("discover error:", (error as Error)?.message);
  }

  return null;
}

const kuramanimeScraper = {
  async scrapeDOM(pathname: string, ref: string, sanitize = false) {
    const { url } = await fetch(baseUrl);
    const html = await getHTML(url, pathname, ref, sanitize);

    const document = parse(html, {
      parseNoneClosedTags: true,
    });

    if (DEBUG) {
      log("DOM:", pathname);
      log("  title:", document.querySelector("title")?.text?.trim());
      log("  #player:", document.querySelector("#player") ? "ada" : "TIDAK ADA");
      log("  #player source:", document.querySelectorAll("#player source").length);
      log("  #animeDownloadLink h6:", document.querySelectorAll("#animeDownloadLink h6").length);
    }

    return document;
  },

  async scrapeSecret(ref: string): Promise<string> {
    const { url } = await fetch(baseUrl);
    const tried = new Set<string>();

    // 1. Pakai path hasil cache (kalau ada), lalu path default
    const candidates: string[] = [];

    if (cachedSecretPath && Date.now() - cachedSecretPath.at < CACHE_TTL) {
      candidates.push(cachedSecretPath.path);
    }

    candidates.push(DEFAULT_SECRET_PATH);

    for (const path of candidates) {
      if (tried.has(path)) continue;

      tried.add(path);

      const secret = await trySecret(url, path, ref);

      if (secret) {
        cachedSecretPath = { path, at: Date.now() };

        return secret;
      }
    }

    // 2. Fallback: cari ulang nama file dari JS config situs
    const discovered = await discoverSecretPath(url, ref);

    if (discovered && !tried.has(discovered)) {
      const secret = await trySecret(url, discovered, ref);

      if (secret) {
        cachedSecretPath = { path: discovered, at: Date.now() };

        return secret;
      }
    }

    cachedSecretPath = null;

    throw new Error(
      "Gagal mengambil secret Kuramanime. Cek KURAMA_DEBUG=1 untuk detail (file secret berubah, kena Cloudflare, atau butuh header tambahan).",
    );
  },
};

export default kuramanimeScraper;
