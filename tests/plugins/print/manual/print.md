@bender-ui: collapsed
@bender-tags: 3661, 4.14.0, feature
@bender-ckeditor-plugins: wysiwygarea, print, font, colorbutton, format, clipboard, pagebreak, toolbar, floatingspace, link, image2

Things to check:

* There are both "Preview" and "Print" buttons in the toolbar.
* "Print" button prints the same document as in preview. **Note**: preview shows pagebreak element as it is not possible to render new page in HTML. However this element should not be visible on printed document.