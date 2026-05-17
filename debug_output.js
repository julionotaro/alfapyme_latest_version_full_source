// Debug output for document analysis
export const debugOutput = {
    text: '', // Original text extracted from document
    ingestion_source: '', // Source of the document
    document_type: '', // Type of document
    extracted_fields: {}, // Key-value pairs extracted from the document
    decision: '', // Decision made based on the analysis
};

// Function to log the output
export function logDebugOutput(debugData) {
    console.log('Debug Data:', debugData);
    // Additional logging mechanisms can be implemented here
}