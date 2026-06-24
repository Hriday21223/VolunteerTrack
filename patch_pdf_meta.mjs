import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { jsPDF } = require('jspdf')

// We can't reopen & re-save the existing PDF (jspdf can't load an existing
// PDF for editing). Instead, add the title/author/subject to the original
// build script and re-run. Update via sed in the existing build_voluntrack_pdf.mjs
