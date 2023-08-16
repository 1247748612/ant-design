import jsdom from 'jsdom';
import format, { plugins } from 'pretty-format';

function cleanup(node: HTMLElement) {
  const childList = Array.from(node.childNodes);
  node.innerHTML = '';
  childList.forEach((child) => {
    if (!(child instanceof Text)) {
      node.appendChild(cleanup(child as any));
    } else if (child.textContent) {
      node.appendChild(child);
    }
  });
  return node;
}

function formatHTML(nodes: any) {
  let cloneNodes: any;
  if (Array.isArray(nodes) || nodes instanceof HTMLCollection || nodes instanceof NodeList) {
    cloneNodes = Array.from(nodes).map((node) => cleanup(node.cloneNode(true) as any));
  } else {
    cloneNodes = cleanup(nodes.cloneNode(true));
  }

  const htmlContent = format(cloneNodes, {
    plugins: [plugins.DOMCollection, plugins.DOMElement],
  });

  const filtered = htmlContent
    .split(/[\n\r]+/)
    .filter((line) => line.trim())
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n');

  return filtered;
}

/**
 * React 17 & 18 will have different behavior in some special cases:
 *
 * React 17:
 *
 * ```html
 * <span> Hello World </span>
 * ```
 *
 * React 18:
 *
 * ```html
 * <span> Hello World </span>
 * ```
 *
 * These diff is nothing important in front end but will break in snapshot diff.
 */
expect.addSnapshotSerializer({
  test: (element) =>
    typeof HTMLElement !== 'undefined' &&
    (element instanceof HTMLElement ||
      element instanceof DocumentFragment ||
      element instanceof HTMLCollection ||
      (Array.isArray(element) && element[0] instanceof HTMLElement)),
  print: (element) => formatHTML(element),
});

/** Demo Test only accept render as SSR to make sure align with both `server` & `client` side */
expect.addSnapshotSerializer({
  test: (node) => node && typeof node === 'object' && node.type === 'demo' && node.html,
  print: ({ html }) => {
    const { JSDOM } = jsdom;
    const { document } = new JSDOM().window;
    document.body.innerHTML = html;

    const children = Array.from(document.body.childNodes);

    // Clean up `data-reactroot` since React 18 do not have this
    children.forEach((ele: HTMLElement) => {
      if (typeof ele.removeAttribute === 'function') {
        ele.removeAttribute('data-reactroot');
      }
    });

    return formatHTML(children.length > 1 ? children : children[0]);
  },
});
