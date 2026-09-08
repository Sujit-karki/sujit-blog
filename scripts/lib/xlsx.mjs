// A minimal, dependency-free reader for the one thing this repo needs from
// .xlsx files: the cell values of a named worksheet.
//
// An .xlsx is a ZIP archive of XML parts. Node ships zlib, so the whole job is
// walking the ZIP central directory, inflating two or three entries, and
// pulling values out of the sheet XML. That is a few dozen lines and no
// dependency, against a parser library that would be the largest thing in
// package.json purely to read a Federal Reserve spreadsheet.
//
// What it deliberately does NOT do: styles, number formats, dates as dates,
// formulas (it reads the cached <v>, which is what a published workbook
// carries), or streaming for very large sheets. Anything beyond reading
// published statistical tables should use a real library instead.

import zlib from "node:zlib";

/** Entries of a ZIP archive, by path, as raw (still compressed) buffers. */
function readZipEntries(buf) {
  // Locate the End Of Central Directory record by scanning backwards for its
  // signature. The comment field is variable length, so there is no fixed
  // offset; 22 bytes is the minimum record size.
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 65558; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("not a ZIP archive: no end-of-central-directory record");

  const count = buf.readUInt16LE(eocd + 10);
  let offset = buf.readUInt32LE(eocd + 16);

  const entries = new Map();
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error(`corrupt central directory at entry ${i}`);
    }
    const method = buf.readUInt16LE(offset + 10);
    const compressedSize = buf.readUInt32LE(offset + 20);
    const nameLength = buf.readUInt16LE(offset + 28);
    const extraLength = buf.readUInt16LE(offset + 30);
    const commentLength = buf.readUInt16LE(offset + 32);
    const localOffset = buf.readUInt32LE(offset + 42);
    const name = buf.toString("utf8", offset + 46, offset + 46 + nameLength);

    // The local header repeats the name and extra fields, with its own
    // lengths — which may differ from the central directory's.
    const localNameLength = buf.readUInt16LE(localOffset + 26);
    const localExtraLength = buf.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const raw = buf.subarray(dataStart, dataStart + compressedSize);

    entries.set(name, { method, raw });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function inflate(entry, name) {
  if (entry.method === 0) return entry.raw;
  if (entry.method === 8) return zlib.inflateRawSync(entry.raw);
  throw new Error(`unsupported compression method ${entry.method} for ${name}`);
}

function readPart(entries, name) {
  const entry = entries.get(name);
  if (!entry) return null;
  return inflate(entry, name).toString("utf8");
}

function decodeXmlText(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&");
}

/** Shared strings table; sheet cells of type "s" index into it. */
function parseSharedStrings(xml) {
  if (!xml) return [];
  const out = [];
  for (const [, si] of xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)) {
    // A string may be split across several <t> runs with formatting between.
    let text = "";
    for (const [, t] of si.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)) text += t;
    out.push(decodeXmlText(text));
  }
  return out;
}

/** "BC12" -> {col: 54, row: 12}, one-based column. */
function parseRef(ref) {
  const m = /^([A-Z]+)(\d+)$/.exec(ref);
  if (!m) return null;
  let col = 0;
  for (const ch of m[1]) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { col, row: Number(m[2]) };
}

/**
 * Read one worksheet as an array of rows, each an array of cell values
 * (string, number, or null). Sparse cells are filled with null so column
 * positions line up.
 */
export function readSheet(buffer, sheetName) {
  const entries = readZipEntries(buffer);

  const workbook = readPart(entries, "xl/workbook.xml");
  if (!workbook) throw new Error("not an xlsx: xl/workbook.xml is missing");

  const sheets = [...workbook.matchAll(/<sheet\b([^>]*)\/>/g)].map(([, attrs]) => ({
    name: decodeXmlText(/name="([^"]*)"/.exec(attrs)?.[1] ?? ""),
    id: /r:id="([^"]*)"/.exec(attrs)?.[1] ?? "",
  }));
  if (!sheets.length) throw new Error("workbook declares no sheets");

  const wanted = sheetName ? sheets.find((s) => s.name === sheetName) : sheets[0];
  if (!wanted) {
    throw new Error(`no sheet named "${sheetName}"; available: ${sheets.map((s) => s.name).join(", ")}`);
  }

  // Resolve r:id through the workbook relationships to a part path.
  const rels = readPart(entries, "xl/_rels/workbook.xml.rels") ?? "";
  let target = null;
  for (const [, attrs] of rels.matchAll(/<Relationship\b([^>]*)\/>/g)) {
    if (/Id="([^"]*)"/.exec(attrs)?.[1] === wanted.id) {
      target = /Target="([^"]*)"/.exec(attrs)?.[1] ?? null;
    }
  }
  if (target && target.startsWith("/")) target = target.slice(1);
  const path = target
    ? (target.startsWith("xl/") ? target : `xl/${target}`)
    : `xl/worksheets/sheet${sheets.indexOf(wanted) + 1}.xml`;

  const sheetXml = readPart(entries, path);
  if (!sheetXml) throw new Error(`sheet part ${path} not found in archive`);

  const shared = parseSharedStrings(readPart(entries, "xl/sharedStrings.xml"));

  const rows = [];
  for (const [, rowAttrs, rowBody] of sheetXml.matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>/g)) {
    const rowIndex = Number(/r="(\d+)"/.exec(rowAttrs)?.[1] ?? rows.length + 1);
    const cells = [];
    for (const [, cellAttrs, cellBody] of rowBody.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const ref = /r="([A-Z]+\d+)"/.exec(cellAttrs)?.[1];
      const type = /t="([^"]*)"/.exec(cellAttrs)?.[1] ?? "n";
      const pos = ref ? parseRef(ref) : null;
      const index = pos ? pos.col - 1 : cells.length;

      let value = null;
      if (type === "inlineStr") {
        let text = "";
        for (const [, t] of cellBody.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)) text += t;
        value = decodeXmlText(text);
      } else {
        const raw = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(cellBody)?.[1];
        if (raw !== undefined) {
          if (type === "s") value = shared[Number(raw)] ?? null;
          else if (type === "str" || type === "e") value = decodeXmlText(raw);
          else if (type === "b") value = raw === "1";
          else value = Number(raw);
        }
      }
      while (cells.length < index) cells.push(null);
      cells[index] = value;
    }
    while (rows.length < rowIndex - 1) rows.push([]);
    rows[rowIndex - 1] = cells;
  }
  return rows;
}

/** Sheet names, in workbook order. */
export function sheetNames(buffer) {
  const entries = readZipEntries(buffer);
  const workbook = readPart(entries, "xl/workbook.xml");
  if (!workbook) throw new Error("not an xlsx: xl/workbook.xml is missing");
  return [...workbook.matchAll(/<sheet\b([^>]*)\/>/g)].map(([, attrs]) =>
    decodeXmlText(/name="([^"]*)"/.exec(attrs)?.[1] ?? "")
  );
}
