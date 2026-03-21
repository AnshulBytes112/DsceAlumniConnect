import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import type { TextItem as PdfjsTextItem } from "pdfjs-dist/types/src/display/api";
import type { TextItem, TextItems } from "./types";

const PDFJS_CONFIG = {
  useWorkerFetch: false,
  isEvalSupported: false,
  useSystemFonts: true,
  disableFontFace: true,
};

const isNode = typeof window === 'undefined';

if (isNode) {
  (pdfjs as unknown as { GlobalWorkerOptions: { workerPort: null } }).GlobalWorkerOptions.workerPort = null;
}

const isEmptySpace = (textItem: TextItem): boolean =>
  !textItem.hasEOL && textItem.text.trim() === "";

const convertPdfjsItem = (
  item: PdfjsTextItem,
  commonObjs: { get: (name: string) => { name: string } | undefined }
): TextItem => {
  const { str: text, transform, fontName: pdfFontName, ...otherProps } = item;
  
  const x = transform[4];
  const y = transform[5];
  
  const fontObj = commonObjs.get(pdfFontName);
  const fontName = fontObj?.name || pdfFontName;
  
  const newText = text.replace(/-­‐/g, "-").replace(/\s+/g, " ").trim();
  
  return {
    ...otherProps,
    fontName,
    text: newText,
    x,
    y,
  } as TextItem;
};

export const readPdf = async (fileUrl: string): Promise<TextItems> => {
  const loadingTask = isNode
    ? pdfjs.getDocument({ url: fileUrl, ...PDFJS_CONFIG })
    : pdfjs.getDocument(fileUrl);
    
  const pdfFile = await loadingTask.promise;
  const numPages = pdfFile.numPages;
  
  const pagePromises: Array<Promise<TextItem[]>> = [];
  
  for (let i = 1; i <= numPages; i++) {
    pagePromises.push(processPage(pdfFile, i));
  }
  
  const pageResults = await Promise.all(pagePromises);
  let textItems: TextItems = pageResults.flat();
  
  textItems = textItems.filter((textItem) => !isEmptySpace(textItem));
  
  return textItems;
};

const processPage = async (
  pdfFile: pdfjs.PDFDocumentProxy,
  pageNumber: number
): Promise<TextItem[]> => {
  const page = await pdfFile.getPage(pageNumber);
  const textContent = await page.getTextContent();
  await page.getOperatorList();
  const commonObjs = page.commonObjs;
  
  return textContent.items.map((item) =>
    convertPdfjsItem(item as PdfjsTextItem, commonObjs)
  );
};

export const readPdfWithCache = async (
  fileUrl: string,
  cache: Map<string, TextItems> = new Map()
): Promise<TextItems> => {
  if (cache.has(fileUrl)) {
    return cache.get(fileUrl)!;
  }
  
  const textItems = await readPdf(fileUrl);
  cache.set(fileUrl, textItems);
  
  return textItems;
};

export const validatePdf = async (fileUrl: string): Promise<{ valid: boolean; error?: string; pageCount?: number }> => {
  try {
    const loadingTask = isNode
      ? pdfjs.getDocument({ url: fileUrl, ...PDFJS_CONFIG })
      : pdfjs.getDocument(fileUrl);
      
    const pdfFile = await loadingTask.promise;
    
    if (pdfFile.numPages === 0) {
      return { valid: false, error: 'PDF has no pages' };
    }
    
    if (pdfFile.numPages > 50) {
      return { valid: false, error: 'PDF has too many pages (>50). Resume parser works best with 1-3 page resumes.' };
    }
    
    return { valid: true, pageCount: pdfFile.numPages };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Failed to read PDF' 
    };
  }
};

export const readPdfMetadata = async (fileUrl: string): Promise<{
  pageCount: number;
  title?: string;
  author?: string;
}> => {
  const loadingTask = isNode
    ? pdfjs.getDocument({ url: fileUrl, ...PDFJS_CONFIG })
    : pdfjs.getDocument(fileUrl);
    
  const pdfFile = await loadingTask.promise;
  const metadata = await pdfFile.getMetadata().catch(() => null);
  const info = metadata?.info as Record<string, unknown> | null;
  
  return {
    pageCount: pdfFile.numPages,
    title: info?.Title as string | undefined,
    author: info?.Author as string | undefined,
  };
};
