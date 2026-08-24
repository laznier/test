/**
 * C1AA HQ Assessment — archive drop endpoint (proof-of-concept stub).
 *
 * The assessment tool POSTs { name, doc } here whenever the managing office
 * archives an LOE / IMO / task / indicator: `doc` is a self-contained HTML
 * narrative preserving the node's entire nested record, including all history.
 *
 * >>> TODO(BUILDER AI / PLNTR MAVEN) <<<
 * The destination of record will be a folder in the MAVEN environment.
 * When this tool is transferred, replace the local write below with the
 * MAVEN folder API and keep the request/response contract identical:
 *   request  POST { name: string, doc: string }
 *   response { ok: true, persisted: boolean, path?: string }
 * The front end treats persisted:false as success (it also hands the
 * operator a local download), so the swap cannot break the UI.
 *
 * On Vercel the deployed filesystem is read-only, so the write below is
 * expected to fail in production — the endpoint then answers
 * { ok:true, persisted:false } and the document survives via the browser
 * download. Locally (vercel dev / node) the write succeeds and the file
 * lands in hq-assessment/archive/ beside the tool itself.
 */
import fs from "node:fs/promises";
import path from "node:path";

const MAX_DOC_BYTES = 4 * 1024 * 1024; // one narrative document, generous

function safeName(name) {
  const base = String(name || "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^[.-]+/, "")
    .slice(0, 120);
  return base.endsWith(".html") ? base : base + ".html";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "POST only" });
  }
  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);
    const name = safeName(body && body.name);
    const doc = body && body.doc;
    if (!name || name === ".html" || typeof doc !== "string" || !doc.trim()) {
      return res.status(400).json({ ok: false, error: "need { name, doc }" });
    }
    if (Buffer.byteLength(doc, "utf8") > MAX_DOC_BYTES) {
      return res.status(413).json({ ok: false, error: "document too large" });
    }

    // TODO(PLNTR MAVEN): replace from here down with the MAVEN folder write.
    const dir = path.join(process.cwd(), "hq-assessment", "archive");
    const file = path.join(dir, name);
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(file, doc, "utf8");
      return res.status(200).json({
        ok: true,
        persisted: true,
        path: "hq-assessment/archive/" + name,
      });
    } catch (fsErr) {
      // Read-only deployment filesystem: acknowledge without persisting.
      return res.status(200).json({ ok: true, persisted: false });
    }
  } catch (err) {
    return res.status(400).json({ ok: false, error: "bad request" });
  }
}
