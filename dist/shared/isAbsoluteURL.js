/** True if `url` is absolute (http(s):, data:, blob:, or //host). */
export function isAbsoluteURL(url) {
    return /^([a-z][a-z\d+-.]*:)|^\/\//i.test(url);
}
