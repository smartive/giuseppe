/**
 * Options for the registerControllersFromFolder function. It is an object with configuration parameters.
 *
 * @typedef {LoadingOptions}
 *
 * @property {string} folderPath The root path to start the search for *.js files.
 * @property {root} [root] The project root folder (could be different if you start your app with node .)
 * @property {boolean} [recursive] Should the function search for *.js in a recursive mode.
 * @property {RegExp} [matchRegExp] An optional regular expression for the found files.
 */
export type LoadingOptions = { folderPath: string, root?: string, recursive?: boolean, matchRegExp?: RegExp };
