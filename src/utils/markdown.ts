// Utility function to format text with single asterisk as bold
// Converts *text* to <strong>text</strong>
export const formatMarkdown = (text: string): string => {
    // Replace *text* with <strong>text</strong>
    // Use a regex that matches *non-whitespace* patterns
    return text.replace(/\*([^\s*][^*]*?)\*/g, '<strong class="text-teal-300 font-semibold">$1</strong>');
};

// Parse and sanitize markdown-like formatting
export const parseMessageContent = (content: string): string => {
    let formatted = content;

    // Apply bold formatting
    formatted = formatMarkdown(formatted);

    // Preserve line breaks
    formatted = formatted.replace(/\n/g, '<br />');

    return formatted;
};
