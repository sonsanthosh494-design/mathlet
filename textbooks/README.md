# Textbook import

Place the Class 6 English and Tamil PDFs in this folder, then run:

```powershell
node scripts/import-class6-content.mjs
npm run prisma:seed
```

The importer requires the Poppler `pdftotext` command to be installed and available in PATH.
