#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SIGLAS = {
  'constituicao-udcl': { sigla: 'CUDCL', nome: 'Constituição da UDCL' },
  'codigo-civil-da-resenha': { sigla: 'CCR', nome: 'Código Civil da Resenha' },
  'codigo-penal-da-amizade': { sigla: 'CPA', nome: 'Código Penal da Amizade' },
  'codigo-administrativo-da-resenha': { sigla: 'CAR', nome: 'Código Administrativo da Resenha' },
  'codigo-de-tributacao-e-rateio': { sigla: 'CTR', nome: 'Código de Tributação e Rateio' },
  'codigo-do-lazer-e-tempo-livre': { sigla: 'CLT', nome: 'Código do Lazer e Tempo Livre' },
  'codigo-de-lazer-trabalho-e-economia': { sigla: 'CLTE', nome: 'Código de Lazer, Trabalho e Economia' },
  'codigo-de-processo-civil-da-resenha': { sigla: 'CPC', nome: 'Código de Processo Civil da Resenha' },
  'codigo-de-processo-penal-fraterno': { sigla: 'CPP', nome: 'Código de Processo Penal Fraterno' },
  'manual-de-heraldica-e-simbolos': { sigla: 'MHS', nome: 'Manual de Heráldica e Símbolos' },
};

const DIRS = [
  'constituicao',
  'codigos/materiais',
  'codigos/processuais',
  'manuais',
];

const BASE_DIR = path.resolve(__dirname, '..');

function findDiplomaFiles() {
  const files = [];
  for (const dir of DIRS) {
    const fullPath = path.join(BASE_DIR, dir);
    if (!fs.existsSync(fullPath)) continue;
    for (const entry of fs.readdirSync(fullPath)) {
      if (entry.endsWith('.md')) {
        files.push(path.join(fullPath, entry));
      }
    }
  }
  return files;
}

function extractReferences(texto) {
  const refs = new Set();
  // Match patterns like: art. 2º, § 2º da Constituição | art. 50 | arts. 10 a 15 | Art. 5
  const regex = /[Aa]rts?\.\s*\d+[º.]?(?:\s*,?\s*§§?\s*\d+[º.]?)?(?:\s*(?:,\s*[IVXLCDMivxlcdm]+))?(?:\s+(?:do|da|dos|das|ao|à)\s+[A-ZÀ-Ú][^\n,;.]{0,60})?/g;
  let match;
  while ((match = regex.exec(texto)) !== null) {
    const ref = match[0].trim();
    // Skip self-references that are just the article header
    if (!ref.startsWith('Art.') || ref.length > 6) {
      refs.add(ref);
    }
  }
  return Array.from(refs);
}

function parseArticles(content, diplomaNome, siglaDiploma) {
  const articles = [];
  // Unified regex: matches both "Art. X —" and "### Art. X —"
  const articleRegex = /^(?:### )?Art\.\s+(\d+)[º.]?\s*—/gm;

  const matches = [];
  let m;
  while ((m = articleRegex.exec(content)) !== null) {
    matches.push({ index: m.index, numero: parseInt(m[1], 10) });
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i < matches.length - 1 ? matches[i + 1].index : content.length;
    const texto = content.substring(start, end).trim();
    const referencias = extractReferences(texto);

    articles.push({
      diploma: diplomaNome,
      sigla: siglaDiploma,
      numero: matches[i].numero,
      texto,
      referencias,
    });
  }

  return articles;
}

function build() {
  const outputDir = path.join(__dirname, 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = findDiplomaFiles();
  const allArticles = [];
  let totalRefs = 0;

  console.log('=== UDCL Build — Parser de Diplomas ===\n');

  for (const filePath of files) {
    const filename = path.basename(filePath, '.md');
    const info = SIGLAS[filename];
    if (!info) {
      console.log(`[AVISO] Arquivo ignorado (sem mapeamento de sigla): ${filename}.md`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const articles = parseArticles(content, info.nome, info.sigla);
    const refs = articles.reduce((sum, a) => sum + a.referencias.length, 0);
    totalRefs += refs;

    allArticles.push(...articles);
    console.log(`[OK] ${info.sigla.padEnd(5)} -- ${String(articles.length).padStart(3)} artigos, ${String(refs).padStart(3)} referencias  (${info.nome})`);
  }

  const outputFile = path.join(outputDir, 'artigos.json');
  fs.writeFileSync(outputFile, JSON.stringify(allArticles, null, 2), 'utf-8');

  console.log('\n────────────────────────────────────');
  console.log(`Total de diplomas:     ${new Set(allArticles.map(a => a.sigla)).size}`);
  console.log(`Total de artigos:      ${allArticles.length}`);
  console.log(`Total de referências:  ${totalRefs}`);
  console.log(`Arquivo gerado:        ${outputFile}`);
  console.log('────────────────────────────────────\n');
}

build();
