function matchRoute(pathname, pattern) {
  const patternParts = pattern.split("/");
  const pathnameParts = pathname.split("/");

  if (patternParts.length !== pathnameParts.length) {
    return null;
  }

  const params = {};

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      const paramName = patternParts[i].slice(1);
      params[paramName] = pathnameParts[i];
    } else if (patternParts[i] !== pathnameParts[i]) {
      return null;
    }
  }

  return params;
}

function findRoute(routes, pathname, method) {
  for (const [pattern, handlers] of Object.entries(routes)) {
    const params = matchRoute(pathname, pattern);
    if (params !== null && handlers[method]) {
      return { handler: handlers[method], params };
    }
  }
  return null;
}

module.exports = {
  matchRoute,
  findRoute,
};
