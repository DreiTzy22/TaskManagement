const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgRed: '\x1b[41m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

const METHOD_COLORS = {
  GET: `${COLORS.bgGreen}${COLORS.white}`,
  POST: `${COLORS.bgBlue}${COLORS.white}`,
  PUT: `${COLORS.bgYellow}${COLORS.white}`,
  PATCH: `${COLORS.bgCyan}${COLORS.white}`,
  DELETE: `${COLORS.bgRed}${COLORS.white}`,
};

const padRight = (str, length) => {
  if (str.length >= length) return str;
  return str + ' '.repeat(length - str.length);
};

const padLeft = (str, length) => {
  if (str.length >= length) return str;
  return ' '.repeat(length - str.length) + str;
};

const getStatusColor = (status) => {
  if (status >= 500) return COLORS.bgRed;
  if (status >= 400) return COLORS.bgYellow;
  if (status >= 300) return COLORS.bgCyan;
  if (status >= 200) return COLORS.bgGreen;
  return COLORS.bgBlue;
};

const getMethodColor = (method) => {
  return METHOD_COLORS[method] || `${COLORS.bgMagenta}${COLORS.white}`;
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (ms) => {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const formatTimestamp = (date) => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();
  const { method, originalUrl, ip, hostname } = req;
  const timestamp = new Date();

  const startTimeNano = process.hrtime.bigint();

  let requestBody = '';
  try {
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyStr = JSON.stringify(req.body);
      requestBody = bodyStr.length > 120 ? bodyStr.substring(0, 117) + '...' : bodyStr;
    }
  } catch (e) {
    requestBody = '';
  }

  let responseSize = 0;
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;
  const originalWrite = res.write;

  res.send = function (body) {
    if (typeof body === 'string') {
      responseSize += Buffer.byteLength(body, 'utf8');
    }
    return originalSend.apply(this, arguments);
  };

  res.json = function (body) {
    try {
      responseSize += Buffer.byteLength(JSON.stringify(body), 'utf8');
    } catch (e) {}
    return originalJson.apply(this, arguments);
  };

  res.write = function (chunk) {
    if (chunk) {
      responseSize += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, 'utf8');
    }
    return originalWrite.apply(this, arguments);
  };

  res.end = function (chunk) {
    if (chunk) {
      responseSize += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, 'utf8');
    }
    return originalEnd.apply(this, arguments);
  };

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    const { statusCode } = res;

    const methodStr = padRight(method, 7);
    const methodColored = `${getMethodColor(method)} ${methodStr} ${COLORS.reset}`;

    const statusStr = padLeft(String(statusCode), 3);
    const statusColored = `${getStatusColor(statusCode)}${COLORS.white} ${statusStr} ${COLORS.reset}`;

    const durationStr = padLeft(formatDuration(durationMs), 8);
    const durationColor =
      durationMs < 100
        ? COLORS.green
        : durationMs < 500
        ? COLORS.yellow
        : durationMs < 2000
        ? COLORS.magenta
        : COLORS.red;

    const time = formatTimestamp(timestamp);
    const url = originalUrl.length > 60 ? originalUrl.substring(0, 57) + '...' : originalUrl;
    const sizeStr = formatBytes(responseSize);
    const ipStr = (ip || '').replace('::ffff:', '').replace('::1', '127.0.0.1');

    let line = '';
    line += `${COLORS.gray}[${time}]${COLORS.reset} `;
    line += `${methodColored} `;
    line += `${statusColored} `;
    line += `${COLORS.cyan}${padLeft(sizeStr, 8)}${COLORS.reset} `;
    line += `${durationColor}${durationStr}${COLORS.reset} `;
    line += `${COLORS.white}${url}${COLORS.reset} `;
    line += `${COLORS.gray}from ${ipStr}${COLORS.reset}`;

    console.log(line);

    if (requestBody) {
      console.log(
        `${COLORS.gray}         └─ body: ${COLORS.reset}${COLORS.dim}${requestBody}${COLORS.reset}`
      );
    }
  });

  next();
};

module.exports = requestLogger;
