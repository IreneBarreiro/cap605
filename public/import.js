import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth/mammoth.browser.js';
pdfjs.GlobalWorkerOptions.workerSrc = new URL('./pdf.worker.mjs', import.meta.url).href;

export async function importResume(file) {
  if (file.size > 10_000_000) throw new Error('Please choose a file smaller than 10 MB.');
  const extension = file.name.split('.').pop().toLowerCase();
  let text;
  if (extension === 'txt') text = await file.text();
  else if (extension === 'doc') throw new Error('For older .doc files, open the file in Word and save it as .docx, then upload it here.');
  else if (extension === 'docx') {
    const result = await mammoth.convertToHtml({arrayBuffer: await file.arrayBuffer()}, {
      convertImage: mammoth.images.imgElement(() => Promise.resolve({src: ''}))
    });
    // Parse into a detached document; never insert uploaded HTML into the page.
    const document = new DOMParser().parseFromString(result.value, 'text/html');
    const lines = [];
    for (const block of document.body.querySelectorAll('p,h1,h2,h3,h4,h5,h6,li')) {
      if (block.closest('li') && block.tagName !== 'LI') continue;
      const content = block.textContent.trim();
      if (content) lines.push((block.tagName === 'LI' ? '• ' : '') + content);
    }
    text = lines.join('\n');
  } else if (extension === 'pdf') {
    const task = pdfjs.getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
      cMapUrl: new URL('./cmaps/', import.meta.url).href,
      cMapPacked: true,
      standardFontDataUrl: new URL('./standard_fonts/', import.meta.url).href,
      wasmUrl: new URL('./wasm/', import.meta.url).href,
      isEvalSupported: false
    });
    let pdf;
    try {
      pdf = await task.promise;
      if (pdf.numPages > 50) throw new Error('Please upload a resume with 50 pages or fewer.');
      const pages = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        let line = '', previousY;
        const lines = [];
        for (const item of content.items) {
          if (!('str' in item)) continue;
          const y = item.transform[5];
          if (previousY !== undefined && Math.abs(y - previousY) > 3 && line.trim()) { lines.push(line.trim()); line = ''; }
          if (line && !/\s$/.test(line) && !/^\s/.test(item.str)) line += ' ';
          line += item.str;
          previousY = y;
          if (item.hasEOL) { if (line.trim()) lines.push(line.trim()); line = ''; previousY = undefined; }
        }
        if (line.trim()) lines.push(line.trim());
        pages.push(lines.join('\n'));
      }
      text = pages.join('\n\n');
    } catch (error) {
      if (error.name === 'PasswordException') throw new Error('This PDF is password protected. Upload an unlocked copy.');
      throw error;
    } finally { await task.destroy(); }
  } else throw new Error('Choose a PDF, Word (.docx), or plain-text (.txt) file.');
  if (!text?.trim()) throw new Error('No readable text found. If this is a scanned PDF, use a text-based PDF or Word file, or paste your resume.');
  return text.trim();
}
