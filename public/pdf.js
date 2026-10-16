import pdfMake from 'pdfmake/build/pdfmake.js';
import fonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.addVirtualFileSystem(fonts);

export function resumeDocument(text) {
  if (!text.trim()) throw new Error('Your draft is empty. Tailor your resume or add text before downloading.');
  let first = true;
  const content = text.replace(/\r\n/g, '\n').split('\n').map(line => {
    if (!line.trim()) return {text: ' ', fontSize: 5, margin: [0, 0, 0, 3]};
    const isName = first;
    first = false;
    const isHeading = !isName && line.length < 70 && /\p{L}/u.test(line) && line === line.toUpperCase();
    return {text: line, fontSize: isName ? 18 : 10.5, bold: isName || isHeading, margin: [0, isHeading ? 8 : 0, 0, isName ? 10 : 5]};
  });
  return {
    pageSize: 'LETTER', pageMargins: [48, 45, 48, 45],
    defaultStyle: {font: 'Roboto', fontSize: 10.5, lineHeight: 1.2, color: '#17251f'},
    info: {title: 'Tailored resume', creator: 'In Your Words'},
    content
  };
}
export async function downloadResumePdf(text) {
  await pdfMake.createPdf(resumeDocument(text)).download('tailored-resume.pdf');
}
