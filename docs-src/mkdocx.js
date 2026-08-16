// Build a minimal, well-formed .docx (OOXML). Extended with tables + callouts.
// w:pPr  children MUST be in schema order: pStyle, numPr, pBdr, shd, spacing, ind, jc, rPr.
// w:rPr  children MUST be in schema order: rFonts, b, i, color, sz.
// w:tblPr children MUST be in schema order: tblStyle, tblW, jc, tblInd, tblBorders, shd, tblLayout, tblCellMar, tblLook.
// w:tcPr children MUST be in schema order: tcW, gridSpan, tcBorders, shd, tcMar, vAlign.
const fs = require('fs');
const path = require('path');

const OUT_DIR = process.argv[2];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function runXml(runs, defSz) {
  return runs.map(r => {
    let props = '';
    if (r.mono) props += '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>';
    if (r.b) props += '<w:b/>';
    if (r.i) props += '<w:i/>';
    if (r.color) props += `<w:color w:val="${r.color}"/>`;
    const sz = r.sz || (r.mono ? 20 : defSz);
    if (sz) props += `<w:sz w:val="${sz}"/>`;
    const rPr = props ? `<w:rPr>${props}</w:rPr>` : '';
    return `<w:r>${rPr}<w:t xml:space="preserve">${esc(r.t)}</w:t></w:r>`;
  }).join('');
}

function para(runs, o = {}) {
  let pr = '';
  if (o.style) pr += `<w:pStyle w:val="${o.style}"/>`;
  if (o.bullet) pr += '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>';

  if (o.codeFirst || o.codeMid || o.codeLast) {
    let b = '';
    if (o.codeFirst) b += '<w:top w:val="single" w:sz="4" w:space="2" w:color="D8DAE4"/>';
    b += '<w:left w:val="single" w:sz="18" w:space="6" w:color="3F3BA0"/>';
    if (o.codeLast) b += '<w:bottom w:val="single" w:sz="4" w:space="2" w:color="D8DAE4"/>';
    pr += `<w:pBdr>${b}</w:pBdr>`;
    pr += '<w:shd w:val="clear" w:color="auto" w:fill="F4F4F8"/>';
    pr += `<w:spacing w:before="${o.codeFirst ? 140 : 0}" w:after="${o.codeLast ? 180 : 0}" w:line="240" w:lineRule="auto"/>`;
    pr += '<w:ind w:left="170"/>';
  } else if (o.calloutFirst || o.calloutMid || o.calloutLast) {
    let b = '';
    if (o.calloutFirst) b += `<w:top w:val="single" w:sz="4" w:space="4" w:color="${o.accent || 'E3B341'}"/>`;
    b += `<w:left w:val="single" w:sz="24" w:space="8" w:color="${o.accent || 'E3B341'}"/>`;
    if (o.calloutLast) b += `<w:bottom w:val="single" w:sz="4" w:space="4" w:color="${o.accent || 'E3B341'}"/>`;
    pr += `<w:pBdr>${b}</w:pBdr>`;
    pr += `<w:shd w:val="clear" w:color="auto" w:fill="${o.fill || 'FDF7E7'}"/>`;
    pr += `<w:spacing w:before="${o.calloutFirst ? 160 : 0}" w:after="${o.calloutLast ? 200 : 100}" w:line="264" w:lineRule="auto"/>`;
    pr += '<w:ind w:left="200" w:right="140"/>';
  } else if (o.after != null || o.before != null) {
    pr += `<w:spacing${o.before != null ? ` w:before="${o.before}"` : ''}${o.after != null ? ` w:after="${o.after}"` : ''}/>`;
  }
  return `<w:p>${pr ? `<w:pPr>${pr}</w:pPr>` : ''}${runXml(runs, o.defSz)}</w:p>`;
}

function cellPara(runs, opts = {}) {
  let pr = '<w:spacing w:before="40" w:after="40" w:line="252" w:lineRule="auto"/>';
  return `<w:p><w:pPr>${pr}</w:pPr>${runXml(runs, opts.sz || 21)}</w:p>`;
}

function table(b) {
  const cols = b.widths;
  const total = cols.reduce((a, c) => a + c, 0);
  const grid = cols.map(c => `<w:gridCol w:w="${Math.round(c / total * 9638)}"/>`).join('');

  const border = c => `<w:top w:val="single" w:sz="4" w:space="0" w:color="${c}"/><w:left w:val="single" w:sz="4" w:space="0" w:color="${c}"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="${c}"/><w:right w:val="single" w:sz="4" w:space="0" w:color="${c}"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="${c}"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="${c}"/>`;

  const tblPr = '<w:tblPr>'
    + '<w:tblW w:w="5000" w:type="pct"/>'
    + `<w:tblBorders>${border('C9CCDD')}</w:tblBorders>`
    + '<w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar>'
    + '</w:tblPr>';

  const mkRow = (cells, isHeader) => {
    const tcs = cells.map((cell, i) => {
      const w = Math.round(cols[i] / total * 9638);
      let tcPr = `<w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>`;
      const fill = isHeader ? '3F3BA0' : (cell.fill || null);
      if (fill) tcPr += `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>`;
      tcPr += '<w:vAlign w:val="center"/></w:tcPr>';
      const runs = (cell.runs || [{ t: cell.t || '' }]).map(r => ({
        ...r,
        b: isHeader ? true : r.b,
        color: isHeader ? 'FFFFFF' : r.color,
      }));
      return `<w:tc>${tcPr}${cellPara(runs, { sz: isHeader ? 21 : 21 })}</w:tc>`;
    }).join('');
    const trPr = isHeader ? '<w:trPr><w:tblHeader/></w:trPr>' : '';
    return `<w:tr>${trPr}${tcs}</w:tr>`;
  };

  const rows = [mkRow(b.header, true), ...b.rows.map(r => mkRow(r, false))].join('');
  return `<w:tbl>${tblPr}<w:tblGrid>${grid}</w:tblGrid>${rows}</w:tbl><w:p><w:pPr><w:spacing w:after="60" w:line="120" w:lineRule="auto"/></w:pPr></w:p>`;
}

const blocks = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'blocks.json'), 'utf8'));

const body = blocks.map((b, i) => {
  const prev = blocks[i - 1], next = blocks[i + 1];
  if (b.type === 'h1') return para([{ t: b.text }], { style: 'Heading1' });
  if (b.type === 'h2') return para([{ t: b.text }], { style: 'Heading2' });
  if (b.type === 'h3') return para([{ t: b.text }], { style: 'Heading3' });
  if (b.type === 'bullet') return para(b.runs, { bullet: true });
  if (b.type === 'spacer') return '<w:p/>';
  if (b.type === 'table') return table(b);
  if (b.type === 'code') {
    return para([{ t: b.text, mono: true }], {
      codeFirst: !prev || prev.type !== 'code',
      codeMid: true,
      codeLast: !next || next.type !== 'code',
    });
  }
  if (b.type === 'callout') {
    return para(b.runs, {
      calloutFirst: !prev || prev.type !== 'callout' || prev.accent !== b.accent,
      calloutMid: true,
      calloutLast: !next || next.type !== 'callout' || next.accent !== b.accent,
      accent: b.accent, fill: b.fill,
    });
  }
  return para(b.runs, {});
}).join('');

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`;

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/></Types>`;

const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;

const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>`;

const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="24"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="288" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="200" w:after="180"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:color w:val="1F2340"/><w:sz w:val="44"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="400" w:after="140"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:color w:val="3F3BA0"/><w:sz w:val="32"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="280" w:after="100"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:color w:val="1F2340"/><w:sz w:val="27"/></w:rPr></w:style>
</w:styles>`;

const numbering = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="&#8226;"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="360" w:hanging="360"/></w:pPr><w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol" w:hint="default"/></w:rPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>`;

const stage = path.join(OUT_DIR, 'docx');
fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(path.join(stage, '_rels'), { recursive: true });
fs.mkdirSync(path.join(stage, 'word', '_rels'), { recursive: true });
fs.writeFileSync(path.join(stage, '[Content_Types].xml'), contentTypes);
fs.writeFileSync(path.join(stage, '_rels', '.rels'), rels);
fs.writeFileSync(path.join(stage, 'word', 'document.xml'), documentXml);
fs.writeFileSync(path.join(stage, 'word', 'styles.xml'), styles);
fs.writeFileSync(path.join(stage, 'word', 'numbering.xml'), numbering);
fs.writeFileSync(path.join(stage, 'word', '_rels', 'document.xml.rels'), docRels);
console.log('staged ' + blocks.length + ' blocks at ' + stage);
