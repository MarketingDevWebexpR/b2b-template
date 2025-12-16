"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/index.ts
var utils_exports = {};
__export(utils_exports, {
  DEFAULT_APPROVAL_RULES: () => DEFAULT_APPROVAL_RULES,
  EMPLOYEE_COLUMN_MAPPINGS: () => EMPLOYEE_COLUMN_MAPPINGS,
  calculateByCategory: () => calculateByCategory,
  calculateByDay: () => calculateByDay,
  calculateEffectiveLimit: () => calculateEffectiveLimit,
  calculateRollover: () => calculateRollover,
  calculateSavingsOpportunity: () => calculateSavingsOpportunity,
  calculateSpending: () => calculateSpending,
  calculateTotal: () => calculateTotal,
  calculateTrend: () => calculateTrend,
  canAutoApprove: () => canAutoApprove,
  canMakePurchase: () => canMakePurchase,
  createAmountRule: () => createAmountRule,
  createDepartmentRule: () => createDepartmentRule,
  createRoleRule: () => createRoleRule,
  daysBetween: () => daysBetween,
  evaluateCondition: () => evaluateCondition,
  evaluateRule: () => evaluateRule,
  evaluateRules: () => evaluateRules,
  filterByPeriod: () => filterByPeriod,
  formatAddress: () => formatAddress,
  formatCompanyName: () => formatCompanyName,
  formatCurrency: () => formatCurrency,
  formatCurrencyCompact: () => formatCurrencyCompact,
  formatDate: () => formatDate,
  formatDuration: () => formatDuration,
  formatFileSize: () => formatFileSize,
  formatInvoiceNumber: () => formatInvoiceNumber,
  formatNumber: () => formatNumber,
  formatOrderNumber: () => formatOrderNumber,
  formatPaymentTerms: () => formatPaymentTerms,
  formatPercentage: () => formatPercentage,
  formatPhoneNumber: () => formatPhoneNumber,
  formatQuantity: () => formatQuantity,
  formatQuoteNumber: () => formatQuoteNumber,
  formatRelativeDate: () => formatRelativeDate,
  formatVatId: () => formatVatId,
  generateCsv: () => generateCsv,
  generateForecast: () => generateForecast,
  generateTemplate: () => generateTemplate,
  getPeriodDates: () => getPeriodDates,
  getRequiredApprovers: () => getRequiredApprovers,
  mapColumns: () => mapColumns,
  parseCsv: () => parseCsv,
  readAndParseCsv: () => readAndParseCsv,
  readFileAsText: () => readFileAsText,
  requiresApproval: () => requiresApproval,
  shouldReject: () => shouldReject,
  truncateText: () => truncateText,
  validateFileSize: () => validateFileSize
});
module.exports = __toCommonJS(utils_exports);

// src/utils/approval-rules.ts
function evaluateCondition(condition, context) {
  switch (condition.type) {
    case "amount_greater_than":
      return context.amount !== void 0 && context.amount > condition.value;
    case "amount_less_than":
      return context.amount !== void 0 && context.amount < condition.value;
    case "amount_between":
      return context.amount !== void 0 && context.amount >= condition.value && context.amount <= condition.valueTo;
    case "quantity_greater_than":
      return context.quantity !== void 0 && context.quantity > condition.value;
    case "quantity_less_than":
      return context.quantity !== void 0 && context.quantity < condition.value;
    case "category_in":
      return context.categories !== void 0 && condition.value.some(
        (cat) => context.categories.includes(cat)
      );
    case "category_not_in":
      return context.categories !== void 0 && !condition.value.some(
        (cat) => context.categories.includes(cat)
      );
    case "user_role_in":
      return context.userRole !== void 0 && condition.value.includes(context.userRole);
    case "user_role_not_in":
      return context.userRole !== void 0 && !condition.value.includes(context.userRole);
    case "department_in":
      return context.department !== void 0 && condition.value.includes(context.department);
    case "department_not_in":
      return context.department !== void 0 && !condition.value.includes(context.department);
    case "cost_center_in":
      return context.costCenter !== void 0 && condition.value.includes(context.costCenter);
    case "cost_center_not_in":
      return context.costCenter !== void 0 && !condition.value.includes(context.costCenter);
    case "vendor_in":
      return context.vendorId !== void 0 && condition.value.includes(context.vendorId);
    case "vendor_not_in":
      return context.vendorId !== void 0 && !condition.value.includes(context.vendorId);
    case "custom":
      if (typeof condition.value === "function") {
        return condition.value(
          context
        );
      }
      return false;
    default:
      return false;
  }
}
function evaluateRule(rule, context) {
  if (!rule.isActive) {
    return { matched: false, failedConditions: rule.conditions };
  }
  const failedConditions = [];
  for (const condition of rule.conditions) {
    if (!evaluateCondition(condition, context)) {
      failedConditions.push(condition);
    }
  }
  return {
    matched: failedConditions.length === 0,
    failedConditions
  };
}
function evaluateRules(rules, context) {
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);
  const evaluations = [];
  let matchedRule;
  for (const rule of sortedRules) {
    const { matched, failedConditions } = evaluateRule(rule, context);
    evaluations.push({
      rule,
      matched,
      failedConditions
    });
    if (matched && !matchedRule) {
      matchedRule = rule;
    }
  }
  const result = {
    matched: matchedRule !== void 0,
    evaluations
  };
  if (matchedRule) {
    result.matchedRule = matchedRule;
    result.action = matchedRule.action;
  }
  return result;
}
function getRequiredApprovers(result) {
  if (!result.matched || !result.action) {
    return [];
  }
  switch (result.action.type) {
    case "require_approval":
    case "require_multi_approval":
      return result.action.approverIds ?? [];
    case "escalate":
      return result.action.escalateTo ? [result.action.escalateTo] : [];
    default:
      return [];
  }
}
function requiresApproval(result) {
  if (!result.matched || !result.action) {
    return true;
  }
  return result.action.type === "require_approval" || result.action.type === "require_multi_approval" || result.action.type === "escalate";
}
function canAutoApprove(result) {
  return result.matched && result.action?.type === "auto_approve";
}
function shouldReject(result) {
  return result.matched && result.action?.type === "reject";
}
function createAmountRule(id, name, threshold, action, priority = 100) {
  return {
    id,
    name,
    conditions: [
      {
        type: "amount_greater_than",
        value: threshold
      }
    ],
    action,
    priority,
    isActive: true
  };
}
function createRoleRule(id, name, roles, action, priority = 100) {
  return {
    id,
    name,
    conditions: [
      {
        type: "user_role_in",
        value: roles
      }
    ],
    action,
    priority,
    isActive: true
  };
}
function createDepartmentRule(id, name, departments, action, priority = 100) {
  return {
    id,
    name,
    conditions: [
      {
        type: "department_in",
        value: departments
      }
    ],
    action,
    priority,
    isActive: true
  };
}
var DEFAULT_APPROVAL_RULES = [
  {
    id: "auto-approve-small",
    name: "Auto-approve small orders",
    description: "Automatically approve orders under 500",
    conditions: [{ type: "amount_less_than", value: 500 }],
    action: { type: "auto_approve" },
    priority: 10,
    isActive: true
  },
  {
    id: "manager-approval-medium",
    name: "Manager approval for medium orders",
    description: "Require manager approval for orders 500-5000",
    conditions: [{ type: "amount_between", value: 500, valueTo: 5e3 }],
    action: {
      type: "require_approval",
      approverIds: []
      // To be filled with manager IDs
    },
    priority: 20,
    isActive: true
  },
  {
    id: "executive-approval-large",
    name: "Executive approval for large orders",
    description: "Require executive approval for orders over 5000",
    conditions: [{ type: "amount_greater_than", value: 5e3 }],
    action: {
      type: "require_multi_approval",
      approverIds: [],
      // To be filled with executive IDs
      requiredApprovals: 2
    },
    priority: 30,
    isActive: true
  }
];

// src/utils/spending-calculator.ts
function getPeriodDates(period, referenceDate = /* @__PURE__ */ new Date()) {
  const date = new Date(referenceDate);
  switch (period) {
    case "daily": {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      end.setMilliseconds(-1);
      return { start, end };
    }
    case "weekly": {
      const start = new Date(date);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      end.setMilliseconds(-1);
      return { start, end };
    }
    case "monthly": {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start, end };
    }
    case "quarterly": {
      const quarter = Math.floor(date.getMonth() / 3);
      const start = new Date(date.getFullYear(), quarter * 3, 1);
      const end = new Date(date.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
      return { start, end };
    }
    case "yearly": {
      const start = new Date(date.getFullYear(), 0, 1);
      const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start, end };
    }
    default:
      throw new Error(`Unknown period type: ${period}`);
  }
}
function daysBetween(start, end) {
  const msPerDay = 24 * 60 * 60 * 1e3;
  return Math.ceil((end.getTime() - start.getTime()) / msPerDay);
}
function filterByPeriod(records, start, end) {
  return records.filter(
    (record) => record.date >= start && record.date <= end
  );
}
function calculateTotal(records) {
  return records.reduce((sum, record) => sum + record.amount, 0);
}
function calculateByCategory(records) {
  const byCategory = {};
  for (const record of records) {
    const category = record.category ?? "uncategorized";
    byCategory[category] = (byCategory[category] ?? 0) + record.amount;
  }
  return byCategory;
}
function calculateByDay(records) {
  const byDay = {};
  for (const record of records) {
    const isoString = record.date.toISOString();
    const day = isoString.split("T")[0] ?? isoString.substring(0, 10);
    byDay[day] = (byDay[day] ?? 0) + record.amount;
  }
  return byDay;
}
function calculateSpending(records, config, referenceDate = /* @__PURE__ */ new Date()) {
  const { start: periodStart, end: periodEnd } = getPeriodDates(
    config.period,
    referenceDate
  );
  const periodRecords = filterByPeriod(records, periodStart, periodEnd);
  const totalSpent = calculateTotal(periodRecords);
  const remaining = Math.max(0, config.maxAmount - totalSpent);
  const percentage = config.maxAmount > 0 ? totalSpent / config.maxAmount * 100 : 0;
  const softLimitPercentage = config.softLimitPercentage ?? 75;
  const hardLimitPercentage = config.hardLimitPercentage ?? 100;
  const softLimitExceeded = percentage >= softLimitPercentage;
  const hardLimitExceeded = percentage >= hardLimitPercentage;
  const now = new Date(referenceDate);
  const daysInPeriod = daysBetween(periodStart, periodEnd);
  const daysElapsed = Math.max(1, daysBetween(periodStart, now));
  const daysRemaining = Math.max(0, daysBetween(now, periodEnd));
  const averageDaily = totalSpent / daysElapsed;
  const projected = averageDaily * daysInPeriod;
  const onTrack = projected <= config.maxAmount;
  const recommendedDaily = daysRemaining > 0 ? remaining / daysRemaining : 0;
  return {
    totalSpent,
    remaining,
    percentage,
    softLimitExceeded,
    hardLimitExceeded,
    periodStart,
    periodEnd,
    daysRemaining,
    averageDaily,
    projected,
    onTrack,
    recommendedDaily
  };
}
function calculateRollover(previousPeriodSpent, config) {
  if (!config.rollover) return 0;
  const unused = Math.max(0, config.maxAmount - previousPeriodSpent);
  const rolloverPercentage = config.rolloverPercentage ?? 100;
  return unused * (rolloverPercentage / 100);
}
function calculateEffectiveLimit(config, rolloverAmount = 0) {
  return config.maxAmount + rolloverAmount;
}
function canMakePurchase(purchaseAmount, currentSpent, limit, allowExceed = false) {
  if (allowExceed) {
    return { allowed: true };
  }
  const newTotal = currentSpent + purchaseAmount;
  if (newTotal > limit) {
    return {
      allowed: false,
      reason: `Purchase would exceed spending limit. Current: ${currentSpent}, Purchase: ${purchaseAmount}, Limit: ${limit}`
    };
  }
  return { allowed: true };
}
function calculateTrend(currentPeriodSpent, previousPeriodSpent) {
  if (previousPeriodSpent === 0) {
    return {
      direction: currentPeriodSpent > 0 ? "up" : "stable",
      percentage: currentPeriodSpent > 0 ? 100 : 0
    };
  }
  const change = (currentPeriodSpent - previousPeriodSpent) / previousPeriodSpent * 100;
  let direction;
  if (Math.abs(change) < 1) {
    direction = "stable";
  } else if (change > 0) {
    direction = "up";
  } else {
    direction = "down";
  }
  return {
    direction,
    percentage: Math.abs(change)
  };
}
function generateForecast(records, config, forecastDays = 30) {
  const { start: periodStart } = getPeriodDates(config.period);
  const periodRecords = filterByPeriod(
    records,
    periodStart,
    /* @__PURE__ */ new Date()
  );
  const byDay = calculateByDay(periodRecords);
  const days = Object.keys(byDay);
  const total = calculateTotal(periodRecords);
  const avgDaily = days.length > 0 ? total / days.length : 0;
  const forecast = [];
  let cumulative = total;
  for (let i = 1; i <= forecastDays; i++) {
    const date = /* @__PURE__ */ new Date();
    date.setDate(date.getDate() + i);
    cumulative += avgDaily;
    forecast.push({
      date,
      projected: cumulative,
      limit: config.maxAmount
    });
  }
  return forecast;
}
function calculateSavingsOpportunity(records, targetPercentage = 10) {
  const byCategory = calculateByCategory(records);
  const total = calculateTotal(records);
  const targetSavings = total * (targetPercentage / 100);
  const suggestions = [];
  let potentialSavings = 0;
  const sortedCategories = Object.entries(byCategory).sort(
    ([, a], [, b]) => b - a
  );
  for (const [category, amount] of sortedCategories) {
    const categoryPercentage = amount / total * 100;
    if (categoryPercentage > 20) {
      const savingAmount = amount * 0.1;
      potentialSavings += savingAmount;
      suggestions.push(
        `Reduce "${category}" spending by 10% to save ${savingAmount.toFixed(2)}`
      );
    }
    if (potentialSavings >= targetSavings) break;
  }
  return {
    potentialSavings,
    suggestions
  };
}

// src/utils/csv-parser.ts
function parseLine(line, delimiter, quote) {
  const result = [];
  let current = "";
  let inQuotes = false;
  let i = 0;
  while (i < line.length) {
    const char = line[i];
    if (char === quote) {
      if (inQuotes && line[i + 1] === quote) {
        current += quote;
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i++;
      continue;
    }
    if (char === delimiter && !inQuotes) {
      result.push(current);
      current = "";
      i++;
      continue;
    }
    current += char;
    i++;
  }
  result.push(current);
  return result;
}
function parseCsv(csvString, options = {}) {
  const {
    delimiter = ",",
    hasHeader = true,
    quote = '"',
    trim = true,
    skipEmptyLines = true,
    maxRows = 0,
    expectedColumns,
    requiredColumns
  } = options;
  const errors = [];
  const rawRows = [];
  const lines = csvString.split(/\r?\n/);
  let rowIndex = 0;
  for (const line of lines) {
    if (skipEmptyLines && line.trim() === "") {
      continue;
    }
    if (maxRows > 0 && rowIndex >= maxRows) {
      break;
    }
    try {
      let values = parseLine(line, delimiter, quote);
      if (trim) {
        values = values.map((v) => v.trim());
      }
      rawRows.push(values);
      rowIndex++;
    } catch {
      errors.push({
        row: rowIndex + 1,
        message: `Failed to parse line: ${line.substring(0, 50)}...`,
        type: "parse"
      });
      rowIndex++;
    }
  }
  if (rawRows.length === 0) {
    return {
      data: [],
      headers: [],
      totalRows: 0,
      errors: [{ row: 0, message: "Empty CSV file", type: "parse" }],
      success: false,
      rawRows: []
    };
  }
  const firstRow = rawRows[0];
  if (!firstRow) {
    return {
      data: [],
      headers: [],
      totalRows: 0,
      errors: [{ row: 0, message: "No data rows found", type: "parse" }],
      success: false,
      rawRows: []
    };
  }
  const headers = hasHeader ? firstRow : firstRow.map((_, i) => `column_${i + 1}`);
  const dataRows = hasHeader ? rawRows.slice(1) : rawRows;
  if (expectedColumns) {
    const missingColumns = expectedColumns.filter(
      (col) => !headers.includes(col)
    );
    if (missingColumns.length > 0) {
      errors.push({
        row: 1,
        message: `Missing expected columns: ${missingColumns.join(", ")}`,
        type: "validation"
      });
    }
  }
  if (requiredColumns) {
    const missingRequired = requiredColumns.filter(
      (col) => !headers.includes(col)
    );
    if (missingRequired.length > 0) {
      errors.push({
        row: 1,
        message: `Missing required columns: ${missingRequired.join(", ")}`,
        type: "missing_required"
      });
    }
  }
  const data = dataRows.map((row, index) => {
    const obj = {};
    headers.forEach((header, colIndex) => {
      obj[header] = row[colIndex] ?? "";
    });
    return obj;
  });
  return {
    data,
    headers,
    totalRows: rawRows.length,
    errors,
    success: errors.filter((e) => e.type !== "validation").length === 0,
    rawRows
  };
}
function mapColumns(data, mappings) {
  const errors = [];
  const result = [];
  data.forEach((row, rowIndex) => {
    const mapped = {};
    for (const mapping of mappings) {
      const rawValue = row[mapping.source];
      if (mapping.required && (rawValue === void 0 || rawValue === "")) {
        const error = {
          row: rowIndex + 2,
          // +2 for header and 0-indexing
          columnName: mapping.source,
          message: `Required field "${mapping.source}" is empty`,
          type: "missing_required"
        };
        if (rawValue !== void 0) {
          error.value = rawValue;
        }
        errors.push(error);
        continue;
      }
      if ((rawValue === void 0 || rawValue === "") && mapping.defaultValue !== void 0) {
        mapped[mapping.target] = mapping.defaultValue;
        continue;
      }
      if (mapping.validate && rawValue !== void 0 && rawValue !== "") {
        const validationResult = mapping.validate(rawValue);
        if (validationResult !== true) {
          errors.push({
            row: rowIndex + 2,
            columnName: mapping.source,
            message: typeof validationResult === "string" ? validationResult : `Invalid value for "${mapping.source}"`,
            type: "invalid_value",
            value: rawValue
          });
          continue;
        }
      }
      if (mapping.transform && rawValue !== void 0) {
        try {
          mapped[mapping.target] = mapping.transform(rawValue);
        } catch {
          errors.push({
            row: rowIndex + 2,
            columnName: mapping.source,
            message: `Failed to transform value for "${mapping.source}"`,
            type: "invalid_value",
            value: rawValue
          });
        }
      } else {
        mapped[mapping.target] = rawValue;
      }
    }
    result.push(mapped);
  });
  return { data: result, errors };
}
function generateCsv(data, options = {}) {
  const {
    columns,
    delimiter = ",",
    includeHeader = true,
    quote = '"'
  } = options;
  if (data.length === 0) {
    return columns && includeHeader ? columns.join(delimiter) : "";
  }
  const firstDataRow = data[0];
  const headers = columns ?? (firstDataRow ? Object.keys(firstDataRow) : []);
  const escapeValue = (value) => {
    const str = String(value ?? "");
    if (str.includes(delimiter) || str.includes(quote) || str.includes("\n") || str.includes("\r")) {
      return `${quote}${str.replace(new RegExp(quote, "g"), quote + quote)}${quote}`;
    }
    return str;
  };
  const lines = [];
  if (includeHeader) {
    lines.push(headers.map(escapeValue).join(delimiter));
  }
  for (const row of data) {
    const values = headers.map((header) => escapeValue(row[header]));
    lines.push(values.join(delimiter));
  }
  return lines.join("\n");
}
var EMPLOYEE_COLUMN_MAPPINGS = [
  {
    source: "first_name",
    target: "firstName",
    required: true,
    validate: (v) => v.length > 0 || "First name is required"
  },
  {
    source: "last_name",
    target: "lastName",
    required: true,
    validate: (v) => v.length > 0 || "Last name is required"
  },
  {
    source: "email",
    target: "email",
    required: true,
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Invalid email format"
  },
  {
    source: "phone",
    target: "phone",
    required: false
  },
  {
    source: "role",
    target: "role",
    required: false,
    defaultValue: "viewer",
    validate: (v) => ["admin", "manager", "purchaser", "viewer", "approver"].includes(v) || "Invalid role"
  },
  {
    source: "department",
    target: "department",
    required: false
  },
  {
    source: "job_title",
    target: "jobTitle",
    required: false
  },
  {
    source: "employee_number",
    target: "employeeNumber",
    required: false
  },
  {
    source: "monthly_limit",
    target: "monthlyLimit",
    required: false,
    transform: (v) => v ? parseFloat(v) : void 0,
    validate: (v) => !v || !isNaN(parseFloat(v)) || "Invalid number"
  },
  {
    source: "order_limit",
    target: "orderLimit",
    required: false,
    transform: (v) => v ? parseFloat(v) : void 0,
    validate: (v) => !v || !isNaN(parseFloat(v)) || "Invalid number"
  },
  {
    source: "manager_id",
    target: "managerId",
    required: false
  }
];
function generateTemplate(mappings, sampleData) {
  const headers = mappings.map((m) => m.source);
  if (!sampleData || sampleData.length === 0) {
    return headers.join(",");
  }
  return generateCsv(sampleData, { columns: headers });
}
function validateFileSize(file, maxSizeBytes = 10 * 1024 * 1024) {
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`
    };
  }
  return { valid: true };
}
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    if (typeof FileReader === "undefined") {
      reject(new Error("FileReader is not available in this environment"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to read file as text"));
      }
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsText(file);
  });
}
async function readAndParseCsv(file, options = {}) {
  const text = await readFileAsText(file);
  return parseCsv(text, options);
}

// src/utils/format.ts
var DEFAULT_LOCALE = "fr-FR";
function formatCurrency(amount, options = {}) {
  const {
    code = "EUR",
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
    showCode = false
  } = options;
  if (showSymbol) {
    const formatter2 = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits,
      maximumFractionDigits
    });
    return formatter2.format(amount);
  }
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits
  });
  const formatted = formatter.format(amount);
  return showCode ? `${formatted} ${code}` : formatted;
}
function formatCurrencyCompact(amount, options = {}) {
  const { code = "EUR", locale = DEFAULT_LOCALE } = options;
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1
  });
  return formatter.format(amount);
}
function formatDate(date, options = {}) {
  const {
    style = "medium",
    includeTime = false,
    timeStyle = "short",
    locale = DEFAULT_LOCALE
  } = options;
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }
  const dateStyleMap = {
    short: "short",
    medium: "medium",
    long: "long",
    full: "full"
  };
  const timeStyleMap = {
    short: "short",
    medium: "medium",
    long: "long"
  };
  const formatOptions = {
    dateStyle: dateStyleMap[style]
  };
  if (includeTime) {
    formatOptions.timeStyle = timeStyleMap[timeStyle];
  }
  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
}
function formatRelativeDate(date, locale = DEFAULT_LOCALE) {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = /* @__PURE__ */ new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1e3);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30);
  const diffYears = Math.round(diffDays / 365);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(diffSeconds) < 60) {
    return rtf.format(diffSeconds, "second");
  }
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }
  if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, "day");
  }
  if (Math.abs(diffWeeks) < 4) {
    return rtf.format(diffWeeks, "week");
  }
  if (Math.abs(diffMonths) < 12) {
    return rtf.format(diffMonths, "month");
  }
  return rtf.format(diffYears, "year");
}
function formatNumber(value, options = {}) {
  const {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping = true,
    notation = "standard",
    compactDisplay = "short"
  } = options;
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
    notation,
    compactDisplay: notation === "compact" ? compactDisplay : void 0
  });
  return formatter.format(value);
}
function formatPercentage(value, options = {}) {
  const {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 0,
    maximumFractionDigits = 1,
    showSign = false
  } = options;
  const formatter = new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay: showSign ? "always" : "auto"
  });
  const normalizedValue = Math.abs(value) > 1 ? value / 100 : value;
  return formatter.format(normalizedValue);
}
function formatOrderNumber(number, prefix = "ORD") {
  const numStr = String(number).padStart(6, "0");
  return `${prefix}-${numStr}`;
}
function formatQuoteNumber(number, prefix = "QUO") {
  const numStr = String(number).padStart(6, "0");
  return `${prefix}-${numStr}`;
}
function formatInvoiceNumber(number, prefix = "INV") {
  const numStr = String(number).padStart(6, "0");
  return `${prefix}-${numStr}`;
}
function formatPhoneNumber(phone, countryCode = "FR") {
  const cleaned = phone.replace(/\D/g, "");
  switch (countryCode) {
    case "FR":
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
      }
      if (cleaned.length === 11 && cleaned.startsWith("33")) {
        return `+33 ${cleaned.slice(2).replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5")}`;
      }
      break;
    case "US":
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      }
      break;
  }
  return phone;
}
function formatAddress(address, options = {}) {
  const { multiline = false, separator = ", " } = options;
  const parts = [];
  if (address.line1) parts.push(address.line1);
  if (address.line2) parts.push(address.line2);
  const cityParts = [];
  if (address.city) cityParts.push(address.city);
  if (address.state) cityParts.push(address.state);
  if (address.postalCode) cityParts.push(address.postalCode);
  if (cityParts.length > 0) parts.push(cityParts.join(" "));
  if (address.country) parts.push(address.country);
  return multiline ? parts.join("\n") : parts.join(separator);
}
function formatVatId(vatId, countryCode = "FR") {
  const cleaned = vatId.replace(/\s/g, "");
  switch (countryCode) {
    case "FR":
      if (cleaned.length === 13 && cleaned.startsWith("FR")) {
        return `FR ${cleaned.slice(2, 4)} ${cleaned.slice(4)}`;
      }
      break;
    case "DE":
      if (cleaned.length === 11 && cleaned.startsWith("DE")) {
        return `DE ${cleaned.slice(2)}`;
      }
      break;
  }
  return vatId;
}
function formatFileSize(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
function formatQuantity(quantity, unit, options = {}) {
  const formatted = formatNumber(quantity, {
    ...options,
    maximumFractionDigits: options.maximumFractionDigits ?? 0
  });
  return unit ? `${formatted} ${unit}` : formatted;
}
function formatDuration(minutes, options = {}) {
  const { short = false } = options;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (short) {
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    }
    if (hours > 0) {
      return `${hours}h`;
    }
    return `${mins}m`;
  }
  const parts = [];
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }
  if (mins > 0 || parts.length === 0) {
    parts.push(`${mins} ${mins === 1 ? "minute" : "minutes"}`);
  }
  return parts.join(" ");
}
function truncateText(text, maxLength, options = {}) {
  const { ellipsis = "...", wordBoundary = true } = options;
  if (text.length <= maxLength) {
    return text;
  }
  let truncated = text.slice(0, maxLength - ellipsis.length);
  if (wordBoundary) {
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > maxLength * 0.5) {
      truncated = truncated.slice(0, lastSpace);
    }
  }
  return truncated.trim() + ellipsis;
}
function formatCompanyName(name) {
  const lowercaseWords = /* @__PURE__ */ new Set([
    "and",
    "or",
    "the",
    "a",
    "an",
    "of",
    "in",
    "for",
    "to",
    "et",
    "de",
    "la",
    "le",
    "du",
    "des"
  ]);
  const uppercaseWords = /* @__PURE__ */ new Set([
    "sarl",
    "sas",
    "sa",
    "eurl",
    "sci",
    "llc",
    "inc",
    "ltd",
    "plc",
    "gmbh",
    "ag"
  ]);
  return name.toLowerCase().split(/\s+/).map((word, index) => {
    const lowerWord = word.toLowerCase();
    if (uppercaseWords.has(lowerWord)) {
      return word.toUpperCase();
    }
    if (index > 0 && lowercaseWords.has(lowerWord)) {
      return lowerWord;
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(" ");
}
function formatPaymentTerms(terms) {
  const termsMap = {
    NET30: "Net 30 days",
    NET60: "Net 60 days",
    NET90: "Net 90 days",
    DUE_ON_RECEIPT: "Due on receipt",
    COD: "Cash on delivery",
    PREPAID: "Prepaid",
    "2/10_NET30": "2% 10, Net 30"
  };
  return termsMap[terms] ?? terms;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_APPROVAL_RULES,
  EMPLOYEE_COLUMN_MAPPINGS,
  calculateByCategory,
  calculateByDay,
  calculateEffectiveLimit,
  calculateRollover,
  calculateSavingsOpportunity,
  calculateSpending,
  calculateTotal,
  calculateTrend,
  canAutoApprove,
  canMakePurchase,
  createAmountRule,
  createDepartmentRule,
  createRoleRule,
  daysBetween,
  evaluateCondition,
  evaluateRule,
  evaluateRules,
  filterByPeriod,
  formatAddress,
  formatCompanyName,
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
  formatDuration,
  formatFileSize,
  formatInvoiceNumber,
  formatNumber,
  formatOrderNumber,
  formatPaymentTerms,
  formatPercentage,
  formatPhoneNumber,
  formatQuantity,
  formatQuoteNumber,
  formatRelativeDate,
  formatVatId,
  generateCsv,
  generateForecast,
  generateTemplate,
  getPeriodDates,
  getRequiredApprovers,
  mapColumns,
  parseCsv,
  readAndParseCsv,
  readFileAsText,
  requiresApproval,
  shouldReject,
  truncateText,
  validateFileSize
});
//# sourceMappingURL=index.cjs.map