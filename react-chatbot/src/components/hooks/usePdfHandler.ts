import { useState } from 'react';

interface PDFData {
    fileName: string;
    content: string;
    uploadedAt: string;
}

export const usePDFHandler = () => {
    const [pdfData, setPdfData] = useState<PDFData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            const pdfjsLib = await import('pdfjs-dist');
            
            // Use the worker from the node_modules package
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
                'pdfjs-dist/build/pdf.worker.min.mjs',
                import.meta.url
            ).href;

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ');
                fullText += pageText + '\n';
            }

            return fullText;
        } catch (err) {
            throw new Error(`Failed to extract text from PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const uploadPDF = async (file: File): Promise<void> => {
        if (!file.type.includes('pdf')) {
            throw new Error('Please upload a valid PDF file');
        }

        setIsLoading(true);
        setError(null);

        try {
            const textContent = await extractTextFromPDF(file);

            // Limit content to avoid token limits (approximately 12000 characters)
            const limitedContent = textContent.substring(0, 12000);

            setPdfData({
                fileName: file.name,
                content: limitedContent,
                uploadedAt: new Date().toLocaleTimeString(),
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to upload PDF';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const clearPDF = (): void => {
        setPdfData(null);
        setError(null);
    };

    return {
        pdfData,
        isLoading,
        error,
        uploadPDF,
        clearPDF,
    };
};
