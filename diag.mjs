// Jalankan: node diag.mjs
// Opsional: BASE=https://v20.kuramanime.ing EP=/anime/185/naruto/episode/35 node diag.mjs
import { writeFileSync } from "node:fs";

const BASE = process.env.BASE || "https://v20.kuramanime.ing";
const EP = process.env.EP || "/anime/185/naruto/episode/35";
const HARDCODED_SECRET_PATH = "/assets/Ks6sqSgloPT1HM1.txt";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0";

const baseHeaders = {
  "User-Agent": UA,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
};

const mask = (s) => (s && s.length > 6 ? s.slice(0, 3) + "***" + s.slice(-2) : s);

async function get(path, { ref, cookie } = {}) {
  const headers = { ...baseHeaders };
  if (ref) headers.Referer = ref;
  if (cookie) headers.Cookie = cookie;

  const res = await fetch(new URL(path, BASE), { headers, redirect: "manual" });
  const text = await res.text();

  return { res, text };
}

function cookiesFrom(res) {
  const list = res.headers.getSetCookie ? res.headers.getSetCookie() : [];

  return list.map((c) => c.split(";")[0]).join("; ");
}

function count(text, re) {
  return (text.match(re) || []).length;
}

async function main() {
  const ref = new URL(EP, BASE).toString();

  console.log("== 1. Halaman episode polos ==");
  const first = await get(EP);
  console.log("status:", first.res.status, "| length:", first.text.length);
  console.log("title:", first.text.match(/<title>([^<]*)/i)?.[1]?.trim());
  console.log("cloudflare/challenge?:", /just a moment|cf-chl|challenge-platform/i.test(first.text));

  const cookie = cookiesFrom(first.res);
  console.log("cookie diterima:", cookie ? cookie.split("; ").map((c) => c.split("=")[0]).join(", ") : "(tidak ada)");

  console.log("\n== 2. Cari file config JS (MIX_AUTH_ROUTE_PARAM) ==");
  const srcs = [...first.text.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
  console.log("jumlah <script src>:", srcs.length);

  let discoveredPath = null;
  let configUrl = null;

  for (const src of srcs.slice(0, 30)) {
    try {
      const u = new URL(src, BASE);
      if (u.origin !== new URL(BASE).origin) continue;

      const { text } = await get(u.pathname + u.search, { ref });
      const route = text.match(/MIX_AUTH_ROUTE_PARAM\s*:\s*['"]([^'"]+)['"]/)?.[1];

      if (route) {
        const prefix = text.match(/MIX_PREFIX_AUTH_ROUTE_PARAM\s*:\s*['"]([^'"]*)['"]/)?.[1] ?? "assets/";
        discoveredPath = "/" + (prefix + route).replace(/^\/+/, "");
        configUrl = u.pathname + u.search;
        break;
      }
    } catch {
      // lanjut
    }
  }

  console.log("config JS:", configUrl || "(tidak ketemu)");
  console.log("path secret hasil temuan:", discoveredPath || "(tidak ketemu)");
  console.log("path secret hardcode    :", HARDCODED_SECRET_PATH);
  console.log("sama?:", discoveredPath === HARDCODED_SECRET_PATH);

  const secretPath = discoveredPath || HARDCODED_SECRET_PATH;

  for (const useCookie of [false, true]) {
    console.log(`\n== 3. Ambil secret & halaman (${useCookie ? "DENGAN" : "TANPA"} cookie) ==`);
    const ck = useCookie ? cookie : undefined;

    const sec = await get(secretPath, { ref, cookie: ck });
    const secret = sec.text.trim();
    console.log("secret status:", sec.res.status, "| len:", secret.length, "| isi:", mask(secret.slice(0, 60)));
    console.log("secret terlihat HTML?:", /[<>]/.test(secret));

    const qs = `?Ub3BzhijicHXZdv=${secret}&C2XAPerzX1BM7V9=kuramadrive&page=1`;
    const page = await get(EP + qs, { ref: BASE, cookie: ck });
    const t = page.text;
    const file = `diag-episode-${useCookie ? "cookie" : "nocookie"}.html`;
    writeFileSync(file, t);

    console.log("page status:", page.res.status, "| length:", t.length, "| disimpan:", file);
    console.log("title:", t.match(/<title>([^<]*)/i)?.[1]?.trim());
    console.log("id=player:", count(t, /id=["']player["']/g));
    console.log("<source:", count(t, /<source\b/g));
    console.log("animeDownloadLink:", count(t, /animeDownloadLink/g));
    console.log("episode__navigations:", count(t, /episode__navigations/g));

    const nav = t.indexOf("episode__navigations");
    if (nav >= 0) console.log("nav snippet:\n", t.slice(nav - 40, nav + 500).replace(/\s+/g, " "));

    const pl = t.indexOf('id="player"');
    if (pl >= 0) console.log("player snippet:\n", t.slice(pl - 60, pl + 400).replace(/\s+/g, " "));
  }
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
