const htmlEditor = document.getElementById('html-code');
const cssEditor = document.getElementById('css-code');
const jsEditor = document.getElementById('js-code');
const previewFrame = document.getElementById('preview-frame');

function updatePreview() {
    const html = htmlEditor.value;
    const css = cssEditor.value;
    const js = jsEditor.value;

    const previewContent = `
        <html>
            <head>
                <style>${css}</style>
            </head>
            <body>
                ${html}
                <script>${js}<\/script>
            </body>
        </html>
    `;

    previewFrame.srcdoc = previewContent;
}

htmlEditor.addEventListener('input', updatePreview);
cssEditor.addEventListener('input', updatePreview);
jsEditor.addEventListener('input', updatePreview);

// Initial preview update
updatePreview();

// Autocomplete functionality
document.addEventListener('DOMContentLoaded', () => {
    const htmlTextarea = document.getElementById('html-code');
    const htmlTags = [
        '<div>', '<p>', '<span>', '<a>', '<img src="" alt="">', 
        '<ul>', '<li>', '<h1>', '<h2>', '<h3>'
    ];
    const selfClosingTags = ['<img src="" alt="">', '<br>', '<hr>', '<input>', '<link>', '<meta>'];

    const suggestionBox = document.createElement('ul');
    suggestionBox.style.position = 'absolute';
    suggestionBox.style.display = 'none';
    suggestionBox.style.listStyle = 'none';
    suggestionBox.style.padding = '5px';
    suggestionBox.style.margin = '0';
    suggestionBox.style.border = '1px solid #ccc';
    suggestionBox.style.backgroundColor = 'white';
    suggestionBox.style.zIndex = '1000';
    document.body.appendChild(suggestionBox);

    htmlTextarea.addEventListener('input', () => {
        const cursorPos = htmlTextarea.selectionStart;
        const textBeforeCursor = htmlTextarea.value.substring(0, cursorPos);
        const lastWord = textBeforeCursor.split(/[\s<>]/).pop();

        if (lastWord.length > 0) {
            const suggestions = htmlTags.filter(tag => tag.startsWith(`<${lastWord}`));
            showSuggestions(suggestions, htmlTextarea, cursorPos, lastWord);
        } else {
            suggestionBox.style.display = 'none';
        }
    });

    htmlTextarea.addEventListener('keydown', (e) => {
        if (suggestionBox.style.display === 'block') {
            const activeItem = suggestionBox.querySelector('.active');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (activeItem && activeItem.nextSibling) {
                    activeItem.classList.remove('active');
                    activeItem.nextSibling.classList.add('active');
                } else if (!activeItem && suggestionBox.firstChild) {
                    suggestionBox.firstChild.classList.add('active');
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (activeItem && activeItem.previousSibling) {
                    activeItem.classList.remove('active');
                    activeItem.previousSibling.classList.add('active');
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeItem) {
                    const selectedTag = activeItem.textContent;
                    insertTag(htmlTextarea, selectedTag);
                    suggestionBox.style.display = 'none';
                }
            } else if (e.key === 'Escape') {
                suggestionBox.style.display = 'none';
            }
        }
    });

    function showSuggestions(suggestions, textarea, cursorPos, lastWord) {
        suggestionBox.innerHTML = '';
        if (suggestions.length === 0) {
            suggestionBox.style.display = 'none';
            return;
        }

        suggestions.forEach(tag => {
            const listItem = document.createElement('li');
            listItem.textContent = tag;
            listItem.style.padding = '5px';
            listItem.style.cursor = 'pointer';
            listItem.addEventListener('click', () => {
                insertTag(textarea, tag, lastWord);
                suggestionBox.style.display = 'none';
            });
            suggestionBox.appendChild(listItem);
        });

        positionSuggestionBox(textarea, cursorPos);
        suggestionBox.style.display = 'block';
    }

    function positionSuggestionBox(textarea, cursorPos) {
        const rect = textarea.getBoundingClientRect();
        suggestionBox.style.left = `${rect.left + window.scrollX}px`;
        suggestionBox.style.top = `${rect.bottom + window.scrollY}px`;
        suggestionBox.style.width = `${rect.width}px`;
    }

    function insertTag(textarea, tag, lastWord = '') {
        const cursorPos = textarea.selectionStart;
        const textBefore = textarea.value.substring(0, cursorPos - lastWord.length); // Replace lastWord
        const textAfter = textarea.value.substring(cursorPos);

        if (selfClosingTags.includes(tag)) {
            // Insert self-closing tag
            textarea.value = textBefore + tag + textAfter;
            textarea.selectionStart = textarea.selectionEnd = textBefore.length + tag.indexOf('""') + 1; // Place cursor in the `src` attribute
        } else {
            // Insert opening and closing tag
            const closingTag = tag.replace('<', '</');
            textarea.value = textBefore + tag + closingTag + textAfter;
            textarea.selectionStart = textarea.selectionEnd = textBefore.length + tag.length; // Place cursor between the tags
        }
        textarea.focus();
    }
});
