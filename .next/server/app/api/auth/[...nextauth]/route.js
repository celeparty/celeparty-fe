"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fsaptoprasojo%2FDocuments%2Fprojects%2FSRIBU%2Fceleparty%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fsaptoprasojo%2FDocuments%2Fprojects%2FSRIBU%2Fceleparty&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fsaptoprasojo%2FDocuments%2Fprojects%2FSRIBU%2Fceleparty%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fsaptoprasojo%2FDocuments%2Fprojects%2FSRIBU%2Fceleparty&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_saptoprasojo_Documents_projects_SRIBU_celeparty_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"/Users/saptoprasojo/Documents/projects/SRIBU/celeparty/app/api/auth/[...nextauth]/route.ts\",\n    nextConfigOutput,\n    userland: _Users_saptoprasojo_Documents_projects_SRIBU_celeparty_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRnNhcHRvcHJhc29qbyUyRkRvY3VtZW50cyUyRnByb2plY3RzJTJGU1JJQlUlMkZjZWxlcGFydHklMkZhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPSUyRlVzZXJzJTJGc2FwdG9wcmFzb2pvJTJGRG9jdW1lbnRzJTJGcHJvamVjdHMlMkZTUklCVSUyRmNlbGVwYXJ0eSZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDMEM7QUFDdkg7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxpRUFBaUU7QUFDekU7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUN1SDs7QUFFdkgiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdGFydGVyLW5leHRqcy8/MjAwZiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMvc2FwdG9wcmFzb2pvL0RvY3VtZW50cy9wcm9qZWN0cy9TUklCVS9jZWxlcGFydHkvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2F1dGgvWy4uLm5leHRhdXRoXVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL3NhcHRvcHJhc29qby9Eb2N1bWVudHMvcHJvamVjdHMvU1JJQlUvY2VsZXBhcnR5L2FwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fsaptoprasojo%2FDocuments%2Fprojects%2FSRIBU%2Fceleparty%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fsaptoprasojo%2FDocuments%2Fprojects%2FSRIBU%2Fceleparty&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n/* harmony import */ var next_auth_next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/next */ \"(rsc)/./node_modules/next-auth/next/index.js\");\n\n\nconst handler = (0,next_auth_next__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(_lib_auth__WEBPACK_IMPORTED_MODULE_0__.authOptions);\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQXlDO0FBQ0g7QUFFdEMsTUFBTUUsVUFBVUQsMERBQVFBLENBQUNELGtEQUFXQTtBQUVPIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3RhcnRlci1uZXh0anMvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cz9jOGE0Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGF1dGhPcHRpb25zIH0gZnJvbSBcIkAvbGliL2F1dGhcIjtcbmltcG9ydCBOZXh0QXV0aCBmcm9tIFwibmV4dC1hdXRoL25leHRcIjtcblxuY29uc3QgaGFuZGxlciA9IE5leHRBdXRoKGF1dGhPcHRpb25zKTtcblxuZXhwb3J0IHsgaGFuZGxlciBhcyBHRVQsIGhhbmRsZXIgYXMgUE9TVCB9O1xuIl0sIm5hbWVzIjpbImF1dGhPcHRpb25zIiwiTmV4dEF1dGgiLCJoYW5kbGVyIiwiR0VUIiwiUE9TVCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var next_auth_providers_github__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/github */ \"(rsc)/./node_modules/next-auth/providers/github.js\");\n\n\nconst authOptions = {\n    session: {\n        strategy: \"jwt\",\n        maxAge: 24 * 60 * 60\n    },\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            credentials: {\n                identifier: {\n                    label: \"Email\",\n                    type: \"email\",\n                    placeholder: \"example@example.com\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                console.log(\"Credentials:\", credentials);\n                const res = await fetch(`${\"https://sub.typestaging.my.id\"}/api/auth/local?populate=*`, {\n                    method: \"POST\",\n                    headers: {\n                        \"Content-Type\": \"application/json\"\n                    },\n                    body: JSON.stringify(credentials)\n                });\n                const user = await res.json();\n                console.log(\"API Response:\", user);\n                if (res.ok && user.jwt) {\n                    console.log(\"Login sukses, user:\", user);\n                    return user; // Kembalikan respons API langsung\n                }\n                return null; // Jika gagal\n            }\n        }),\n        (0,next_auth_providers_github__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            clientId: process.env.GITHUB_ID,\n            clientSecret: process.env.GITHUB_SECRET\n        })\n    ],\n    callbacks: {\n        async jwt ({ token, user }) {\n            // Jika ada `user`, tambahkan ke `token`\n            if (user) {\n                token.accessToken = user.jwt; // Simpan JWT ke token\n                token.user = user.user; // Simpan informasi user\n            }\n            return token; // Kembalikan token yang diperbarui\n        },\n        async session ({ session, token }) {\n            // Transfer token ke session\n            session.jwt = token.accessToken; // Simpan JWT ke session\n            session.user = token.user; // Simpan informasi user ke session\n            return session; // Kembalikan session yang diperbarui\n        }\n    },\n    pages: {\n        signIn: \"/auth/login\",\n        error: \"*\"\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFDMEQ7QUFDRjtBQWdDakQsTUFBTUUsY0FBK0I7SUFDM0NDLFNBQVM7UUFDUkMsVUFBVTtRQUNWQyxRQUFRLEtBQUcsS0FBSztJQUNqQjtJQUVBQyxXQUFXO1FBQ1ZOLDJFQUFXQSxDQUFDO1lBQ1hPLGFBQWE7Z0JBQ0FDLFlBQVk7b0JBQ1JDLE9BQU87b0JBQ1BDLE1BQU07b0JBQ05DLGFBQWE7Z0JBQ2pCO2dCQUNBQyxVQUFVO29CQUNOSCxPQUFPO29CQUNQQyxNQUFNO2dCQUNWO1lBQ2I7WUFDQSxNQUFNRyxXQUFVTixXQUFXO2dCQUMxQk8sUUFBUUMsR0FBRyxDQUFDLGdCQUFnQlI7Z0JBQzVCLE1BQU1TLE1BQU0sTUFBTUMsTUFBTSxDQUFDLEVBQUVDLCtCQUFvQixDQUFDLDBCQUEwQixDQUFDLEVBQUU7b0JBQzVFRyxRQUFRO29CQUNSQyxTQUFTO3dCQUNQLGdCQUFnQjtvQkFDbEI7b0JBQ0FDLE1BQU1DLEtBQUtDLFNBQVMsQ0FBQ2xCO2dCQUNwQjtnQkFFQSxNQUFNbUIsT0FBTyxNQUFNVixJQUFJVyxJQUFJO2dCQUMzQmIsUUFBUUMsR0FBRyxDQUFDLGlCQUFpQlc7Z0JBRy9CLElBQUlWLElBQUlZLEVBQUUsSUFBSUYsS0FBS0csR0FBRyxFQUFFO29CQUN2QmYsUUFBUUMsR0FBRyxDQUFDLHVCQUF1Qlc7b0JBQ2xDLE9BQU9BLE1BQU0sa0NBQWtDO2dCQUNqRDtnQkFFQSxPQUFPLE1BQU0sYUFBYTtZQUN6QjtRQUNIO1FBQ0F6QixzRUFBY0EsQ0FBQztZQUNkNkIsVUFBVVosUUFBUUMsR0FBRyxDQUFDWSxTQUFTO1lBQy9CQyxjQUFjZCxRQUFRQyxHQUFHLENBQUNjLGFBQWE7UUFDeEM7S0FDQTtJQUdFQyxXQUFXO1FBQ2IsTUFBTUwsS0FBSSxFQUFFTSxLQUFLLEVBQUVULElBQUksRUFBNkI7WUFDbkQsd0NBQXdDO1lBQ3hDLElBQUlBLE1BQU07Z0JBQ1JTLE1BQU1DLFdBQVcsR0FBR1YsS0FBS0csR0FBRyxFQUFFLHNCQUFzQjtnQkFDcERNLE1BQU1ULElBQUksR0FBR0EsS0FBS0EsSUFBSSxFQUFFLHdCQUF3QjtZQUNsRDtZQUNBLE9BQU9TLE9BQU8sbUNBQW1DO1FBQ2xEO1FBRUEsTUFBTWhDLFNBQVEsRUFBRUEsT0FBTyxFQUFFZ0MsS0FBSyxFQUFnQztZQUM3RCw0QkFBNEI7WUFDNUJoQyxRQUFRMEIsR0FBRyxHQUFHTSxNQUFNQyxXQUFXLEVBQUUsd0JBQXdCO1lBQ3pEakMsUUFBUXVCLElBQUksR0FBR1MsTUFBTVQsSUFBSSxFQUFFLG1DQUFtQztZQUM5RCxPQUFPdkIsU0FBUyxxQ0FBcUM7UUFDdEQ7SUFDRTtJQUNIa0MsT0FBTztRQUNOQyxRQUFRO1FBQ1JDLE9BQU87SUFDUjtBQUNELEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdGFydGVyLW5leHRqcy8uL2xpYi9hdXRoLnRzP2JmN2UiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBOZXh0QXV0aE9wdGlvbnMgfSBmcm9tIFwibmV4dC1hdXRoXCI7XG5pbXBvcnQgQ3JlZGVudGlhbHMgZnJvbSBcIm5leHQtYXV0aC9wcm92aWRlcnMvY3JlZGVudGlhbHNcIjtcbmltcG9ydCBHaXRodWJQcm92aWRlciBmcm9tIFwibmV4dC1hdXRoL3Byb3ZpZGVycy9naXRodWJcIjtcblxuaW50ZXJmYWNlIGlVc2VyIHtcblx0aWQ6IHN0cmluZztcblx0dG9rZW46IHN0cmluZztcblx0ZGF0YTogYW55O1xuXHRtZXNzYWdlOiBzdHJpbmc7XG5cdHVzZXI/OiBhbnk7XG5cdHN1Y2Nlc3M/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgaVVzZXJSZXNwb25zZSB7XG5cdHRva2VuOiBzdHJpbmc7XG59XG5cbmRlY2xhcmUgbW9kdWxlIFwibmV4dC1hdXRoXCIge1xuXHRpbnRlcmZhY2UgU2Vzc2lvbiB7XG5cdCAgand0Pzogc3RyaW5nOyAvLyBKV1QgdG9rZW5cblx0ICB1c2VyPzogYW55OyAvLyBJbmZvcm1hc2kgdXNlciB5YW5nIGJlcmFzYWwgZGFyaSBBUElcblx0fVxuICBcblx0aW50ZXJmYWNlIFVzZXIge1xuXHQgIGp3dD86IHN0cmluZzsgLy8gVG9rZW4gZGFyaSBBUEkgQW5kYVxuXHQgIHVzZXI/OiBhbnk7IC8vIEluZm9ybWFzaSB0YW1iYWhhbiB1c2VyXG5cdH1cbiAgXG5cdGludGVyZmFjZSBKV1Qge1xuXHQgIGFjY2Vzc1Rva2VuPzogc3RyaW5nOyAvLyBOYW1hIHRva2VuIHlhbmcgQW5kYSBndW5ha2FuXG5cdCAgdXNlcj86IGFueTsgLy8gSW5mb3JtYXNpIHVzZXIgeWFuZyBiZXJhc2FsIGRhcmkgdG9rZW5cblx0fVxuICB9XG5cbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9uczogTmV4dEF1dGhPcHRpb25zID0ge1xuXHRzZXNzaW9uOiB7XG5cdFx0c3RyYXRlZ3k6IFwiand0XCIsXG5cdFx0bWF4QWdlOiAyNCo2MCAqIDYwLCAvLyAyNCBob3Vyc1xuXHR9LFxuXG5cdHByb3ZpZGVyczogW1xuXHRcdENyZWRlbnRpYWxzKHtcblx0XHRcdGNyZWRlbnRpYWxzOiB7XG4gICAgICAgICAgICAgICAgaWRlbnRpZmllcjoge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJFbWFpbFwiLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImVtYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBcImV4YW1wbGVAZXhhbXBsZS5jb21cIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIlBhc3N3b3JkXCIsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwicGFzc3dvcmRcIixcbiAgICAgICAgICAgICAgICB9LFxuXHRcdFx0fSxcblx0XHRcdGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFscykge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIkNyZWRlbnRpYWxzOlwiLCBjcmVkZW50aWFscyk7XG5cdFx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke3Byb2Nlc3MuZW52LkJBU0VfQVBJfS9hcGkvYXV0aC9sb2NhbD9wb3B1bGF0ZT0qYCwge1xuXHRcdFx0XHRcdG1ldGhvZDogXCJQT1NUXCIsXG5cdFx0XHRcdFx0aGVhZGVyczoge1xuXHRcdFx0XHRcdCAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeShjcmVkZW50aWFscyksXG5cdFx0XHRcdCAgfSk7XG5cdFx0XHQgIFxuXHRcdFx0XHQgIGNvbnN0IHVzZXIgPSBhd2FpdCByZXMuanNvbigpO1xuXHRcdFx0XHQgIGNvbnNvbGUubG9nKFwiQVBJIFJlc3BvbnNlOlwiLCB1c2VyKTtcblxuXHRcdFx0ICBcblx0XHRcdFx0aWYgKHJlcy5vayAmJiB1c2VyLmp3dCkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiTG9naW4gc3Vrc2VzLCB1c2VyOlwiLCB1c2VyKTtcblx0XHRcdFx0ICByZXR1cm4gdXNlcjsgLy8gS2VtYmFsaWthbiByZXNwb25zIEFQSSBsYW5nc3VuZ1xuXHRcdFx0XHR9XG5cdFx0XHQgIFxuXHRcdFx0XHRyZXR1cm4gbnVsbDsgLy8gSmlrYSBnYWdhbFxuXHRcdFx0ICB9XG5cdFx0fSksXG5cdFx0R2l0aHViUHJvdmlkZXIoe1xuXHRcdFx0Y2xpZW50SWQ6IHByb2Nlc3MuZW52LkdJVEhVQl9JRCBhcyBzdHJpbmcsXG5cdFx0XHRjbGllbnRTZWNyZXQ6IHByb2Nlc3MuZW52LkdJVEhVQl9TRUNSRVQgYXMgc3RyaW5nLFxuXHRcdH0pLFxuXHRdLFxuXG5cbiAgICBjYWxsYmFja3M6IHtcblx0XHRhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9OiB7IHRva2VuOiBhbnk7IHVzZXI6IGFueSB9KSB7XG5cdFx0XHQvLyBKaWthIGFkYSBgdXNlcmAsIHRhbWJhaGthbiBrZSBgdG9rZW5gXG5cdFx0XHRpZiAodXNlcikge1xuXHRcdFx0ICB0b2tlbi5hY2Nlc3NUb2tlbiA9IHVzZXIuand0OyAvLyBTaW1wYW4gSldUIGtlIHRva2VuXG5cdFx0XHQgIHRva2VuLnVzZXIgPSB1c2VyLnVzZXI7IC8vIFNpbXBhbiBpbmZvcm1hc2kgdXNlclxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRva2VuOyAvLyBLZW1iYWxpa2FuIHRva2VuIHlhbmcgZGlwZXJiYXJ1aVxuXHRcdH0sXG5cdFx0XG5cdFx0YXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH06IHsgc2Vzc2lvbjogYW55OyB0b2tlbjogYW55IH0pIHtcblx0XHRcdC8vIFRyYW5zZmVyIHRva2VuIGtlIHNlc3Npb25cblx0XHRcdHNlc3Npb24uand0ID0gdG9rZW4uYWNjZXNzVG9rZW47IC8vIFNpbXBhbiBKV1Qga2Ugc2Vzc2lvblxuXHRcdFx0c2Vzc2lvbi51c2VyID0gdG9rZW4udXNlcjsgLy8gU2ltcGFuIGluZm9ybWFzaSB1c2VyIGtlIHNlc3Npb25cblx0XHRcdHJldHVybiBzZXNzaW9uOyAvLyBLZW1iYWxpa2FuIHNlc3Npb24geWFuZyBkaXBlcmJhcnVpXG5cdFx0fSxcbiAgICB9LFxuXHRwYWdlczoge1xuXHRcdHNpZ25JbjogXCIvYXV0aC9sb2dpblwiLFxuXHRcdGVycm9yOiBcIipcIixcblx0fSxcdFxufTtcbiJdLCJuYW1lcyI6WyJDcmVkZW50aWFscyIsIkdpdGh1YlByb3ZpZGVyIiwiYXV0aE9wdGlvbnMiLCJzZXNzaW9uIiwic3RyYXRlZ3kiLCJtYXhBZ2UiLCJwcm92aWRlcnMiLCJjcmVkZW50aWFscyIsImlkZW50aWZpZXIiLCJsYWJlbCIsInR5cGUiLCJwbGFjZWhvbGRlciIsInBhc3N3b3JkIiwiYXV0aG9yaXplIiwiY29uc29sZSIsImxvZyIsInJlcyIsImZldGNoIiwicHJvY2VzcyIsImVudiIsIkJBU0VfQVBJIiwibWV0aG9kIiwiaGVhZGVycyIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5IiwidXNlciIsImpzb24iLCJvayIsImp3dCIsImNsaWVudElkIiwiR0lUSFVCX0lEIiwiY2xpZW50U2VjcmV0IiwiR0lUSFVCX1NFQ1JFVCIsImNhbGxiYWNrcyIsInRva2VuIiwiYWNjZXNzVG9rZW4iLCJwYWdlcyIsInNpZ25JbiIsImVycm9yIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/uuid","vendor-chunks/oauth","vendor-chunks/@panva","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/oidc-token-hash","vendor-chunks/preact","vendor-chunks/lru-cache","vendor-chunks/cookie"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=%2FUsers%2Fsaptoprasojo%2FDocuments%2Fprojects%2FSRIBU%2Fceleparty%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fsaptoprasojo%2FDocuments%2Fprojects%2FSRIBU%2Fceleparty&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();