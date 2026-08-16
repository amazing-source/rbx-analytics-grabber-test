# docs-src — how the `.docx` deliverables are built

There is **no python and no `docx` npm package** on this machine, so the OOXML
package is built by hand. This directory is that toolchain, vendored into the
repo so a session on another device does not have to rediscover it.

## Build

```
node case/build.js                 # writes case/blocks.json
node ../docs-src/mkdocx.js <dir>   # stages <dir>/docx/ from <dir>/blocks.json
powershell -File zip.ps1 -Stage <dir>/docx -Out "<name>.docx"
```

`mkdocx-letter.js` is the same generator with tighter spacing (smaller H1,
`w:after=130`, `w:line=252`, narrower margins). It exists because a ~530-word
letter overflows onto a second page under the report defaults. Use it for
anything that must fit one page; use `mkdocx.js` for reports.

## Block types

`h1` `h2` `h3` · `para` · `bullet` · `table` · `code` · `callout` · `spacer`.
Runs take `{t, b, i, color, mono, sz}`. Tables take `widths` (relative), a
`header` row, and `rows` of cells (`{t}` or `{runs:[...]}`, optional `fill`).

## The gotchas that broke earlier attempts

1. **`w:pPr` children must be in schema order:** `pStyle`, `numPr`, `pBdr`,
   `shd`, `spacing`, `ind`, `jc`, `rPr`. Out of order, Word still opens the file
   but spacing renders inconsistently across the whole document. Same for
   `w:rPr` (`rFonts`, `b`, `i`, `color`, `sz`), `w:tblPr` and `w:tcPr`. Never
   emit two `w:spacing` elements; it takes both attributes.
2. **PowerShell 5.1 needs both** `System.IO.Compression` *and*
   `System.IO.Compression.FileSystem`. `ZipFile::CreateFromDirectory` writes
   **backslash** entry names, which Word tolerates but Google Docs and
   LibreOffice may not, so `zip.ps1` creates each entry explicitly with forward
   slashes and puts `[Content_Types].xml` first.
3. **`[Content_Types].xml` needs `-LiteralPath`** in PowerShell, or the square
   brackets are treated as a wildcard.
4. **Verify by opening it** through Word COM — `ComputeStatistics(2)` is pages,
   `(0)` is words — then `Quit()` and release the COM objects. A leftover
   `WINWORD` process holds a lock and blocks the next overwrite. Killing
   `WINWORD` also closes any document the user has open, so check first.

## Voice

These go out under Dilan's name. No em dashes, no balanced antithesis, no
tables or bullets for things that are just sentences, plain words, uneven
paragraphs. Say the number and what it means.
