/**
 * A helper to strip certain fields from an object.
 */
export function stripFields(o, fields) {
    const result = Object.assign({}, o);
    for (const field of fields) {
        delete result[field];
    }
    return result;
}
//# sourceMappingURL=strip-fields.js.map