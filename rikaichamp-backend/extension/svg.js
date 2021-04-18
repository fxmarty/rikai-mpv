export const SVG_NS = 'http://www.w3.org/2000/svg';
export const isSvgDoc = (doc) => {
    return doc.documentElement.namespaceURI === SVG_NS;
};
export const isForeignObjectElement = (elem) => !!elem &&
    elem.namespaceURI === SVG_NS &&
    elem.nodeName.toUpperCase() === 'FOREIGNOBJECT';
// This is only needed because Edge's WebIDL definitions are wrong
// (they have documentElement as having type HTMLElement)
export const isSvgSvgElement = (elem) => !!elem &&
    elem.namespaceURI === SVG_NS &&
    elem.nodeName.toUpperCase() === 'SVG';
//# sourceMappingURL=svg.js.map