/**
 * CSV Parser Utilities
 *
 * Functions for parsing and validating CSV data for bulk imports.
 */

/**
 * CSV parsing options
 */
export interface CsvParseOptions {
  /** Field delimiter (default: ',') */
  delimiter?: string;
  /** Whether first row is header (default: true) */
  hasHeader?: boolean;
  /** Quote character (default: '"') */
  quote?: string;
  /** Whether to trim whitespace from values (default: true) */
  trim?: boolean;
  /** Whether to skip empty lines (default: true) */
  skipEmptyLines?: boolean;
  /** Maximum number of rows to parse (0 = unlimited) */
  maxRows?: number;
  /** Expected column names (for validation) */
  expectedColumns?: string[];
  /** Required column names (must be present) */
  requiredColumns?: string[];
}

/**
 * CSV parse result
 */
export interface CsvParseResult<T = Record<string, string>> {
  /** Parsed data rows */
  data: T[];
  /** Column headers */
  headers: string[];
  /** Total rows parsed (including header) */
  totalRows: number;
  /** Errors encountered during parsing */
  errors: CsvParseError[];
  /** Whether parsing was successful */
  success: boolean;
  /** Raw parsed rows (before type conversion) */
  rawRows: string[][];
}

/**
 * CSV parse error
 */
export interface CsvParseError {
  /** Row number (1-indexed) */
  row: number;
  /** Column number (1-indexed) */
  column?: number;
  /** Column name */
  columnName?: string;
  /** Error message */
  message: string;
  /** Error type */
  type: "parse" | "validation" | "missing_required" | "invalid_value";
  /** Raw value that caused the error */
  value?: string;
}

/**
 * Column mapping configuration
 */
export interface ColumnMapping {
  /** Source column name (from CSV) */
  source: string;
  /** Target field name */
  target: string;
  /** Whether column is required */
  required?: boolean;
  /** Default value if empty */
  defaultValue?: unknown;
  /** Transform function */
  transform?: (value: string) => unknown;
  /** Validation function */
  validate?: (value: string) => boolean | string;
}

/**
 * Parse a CSV line respecting quotes
 */
function parseLine(
  line: string,
  delimiter: string,
  quote: string
): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === quote) {
      if (inQuotes && line[i + 1] === quote) {
        // Escaped quote
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

/**
 * Parse CSV string into rows and columns
 */
export function parseCsv<T = Record<string, string>>(
  csvString: string,
  options: CsvParseOptions = {}
): CsvParseResult<T> {
  const {
    delimiter = ",",
    hasHeader = true,
    quote = '"',
    trim = true,
    skipEmptyLines = true,
    maxRows = 0,
    expectedColumns,
    requiredColumns,
  } = options;

  const errors: CsvParseError[] = [];
  const rawRows: string[][] = [];

  // Split into lines
  const lines = csvString.split(/\r?\n/);

  // Parse each line
  let rowIndex = 0;
  for (const line of lines) {
    // Skip empty lines
    if (skipEmptyLines && line.trim() === "") {
      continue;
    }

    // Check max rows
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
        type: "parse",
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
      rawRows: [],
    };
  }

  // Extract headers
  const firstRow = rawRows[0];
  if (!firstRow) {
    return {
      data: [],
      headers: [],
      totalRows: 0,
      errors: [{ row: 0, message: "No data rows found", type: "parse" }],
      success: false,
      rawRows: [],
    };
  }
  const headers: string[] = hasHeader ? firstRow : firstRow.map((_, i) => `column_${i + 1}`);
  const dataRows = hasHeader ? rawRows.slice(1) : rawRows;

  // Validate expected columns
  if (expectedColumns) {
    const missingColumns = expectedColumns.filter(
      (col) => !headers.includes(col)
    );
    if (missingColumns.length > 0) {
      errors.push({
        row: 1,
        message: `Missing expected columns: ${missingColumns.join(", ")}`,
        type: "validation",
      });
    }
  }

  // Validate required columns
  if (requiredColumns) {
    const missingRequired = requiredColumns.filter(
      (col) => !headers.includes(col)
    );
    if (missingRequired.length > 0) {
      errors.push({
        row: 1,
        message: `Missing required columns: ${missingRequired.join(", ")}`,
        type: "missing_required",
      });
    }
  }

  // Convert to objects
  const data: T[] = dataRows.map((row, index) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, colIndex) => {
      obj[header] = row[colIndex] ?? "";
    });
    return obj as T;
  });

  return {
    data,
    headers,
    totalRows: rawRows.length,
    errors,
    success: errors.filter((e) => e.type !== "validation").length === 0,
    rawRows,
  };
}

/**
 * Map CSV columns to target fields
 */
export function mapColumns<T>(
  data: Record<string, string>[],
  mappings: ColumnMapping[]
): { data: T[]; errors: CsvParseError[] } {
  const errors: CsvParseError[] = [];
  const result: T[] = [];

  data.forEach((row, rowIndex) => {
    const mapped: Record<string, unknown> = {};

    for (const mapping of mappings) {
      const rawValue = row[mapping.source];

      // Check required
      if (mapping.required && (rawValue === undefined || rawValue === "")) {
        const error: CsvParseError = {
          row: rowIndex + 2, // +2 for header and 0-indexing
          columnName: mapping.source,
          message: `Required field "${mapping.source}" is empty`,
          type: "missing_required",
        };
        if (rawValue !== undefined) {
          error.value = rawValue;
        }
        errors.push(error);
        continue;
      }

      // Use default value if empty
      if ((rawValue === undefined || rawValue === "") && mapping.defaultValue !== undefined) {
        mapped[mapping.target] = mapping.defaultValue;
        continue;
      }

      // Validate
      if (mapping.validate && rawValue !== undefined && rawValue !== "") {
        const validationResult = mapping.validate(rawValue);
        if (validationResult !== true) {
          errors.push({
            row: rowIndex + 2,
            columnName: mapping.source,
            message:
              typeof validationResult === "string"
                ? validationResult
                : `Invalid value for "${mapping.source}"`,
            type: "invalid_value",
            value: rawValue,
          });
          continue;
        }
      }

      // Transform
      if (mapping.transform && rawValue !== undefined) {
        try {
          mapped[mapping.target] = mapping.transform(rawValue);
        } catch {
          errors.push({
            row: rowIndex + 2,
            columnName: mapping.source,
            message: `Failed to transform value for "${mapping.source}"`,
            type: "invalid_value",
            value: rawValue,
          });
        }
      } else {
        mapped[mapping.target] = rawValue;
      }
    }

    result.push(mapped as T);
  });

  return { data: result, errors };
}

/**
 * Generate CSV string from data
 */
export function generateCsv<T extends Record<string, unknown>>(
  data: T[],
  options: {
    columns?: string[];
    delimiter?: string;
    includeHeader?: boolean;
    quote?: string;
  } = {}
): string {
  const {
    columns,
    delimiter = ",",
    includeHeader = true,
    quote = '"',
  } = options;

  if (data.length === 0) {
    return columns && includeHeader ? columns.join(delimiter) : "";
  }

  const firstDataRow = data[0];
  const headers: string[] = columns ?? (firstDataRow ? Object.keys(firstDataRow) : []);

  const escapeValue = (value: unknown): string => {
    const str = String(value ?? "");
    if (
      str.includes(delimiter) ||
      str.includes(quote) ||
      str.includes("\n") ||
      str.includes("\r")
    ) {
      return `${quote}${str.replace(new RegExp(quote, "g"), quote + quote)}${quote}`;
    }
    return str;
  };

  const lines: string[] = [];

  if (includeHeader) {
    lines.push(headers.map(escapeValue).join(delimiter));
  }

  for (const row of data) {
    const values = headers.map((header) => escapeValue(row[header]));
    lines.push(values.join(delimiter));
  }

  return lines.join("\n");
}

/**
 * Common column mappings for employee import
 */
export const EMPLOYEE_COLUMN_MAPPINGS: ColumnMapping[] = [
  {
    source: "first_name",
    target: "firstName",
    required: true,
    validate: (v) => v.length > 0 || "First name is required",
  },
  {
    source: "last_name",
    target: "lastName",
    required: true,
    validate: (v) => v.length > 0 || "Last name is required",
  },
  {
    source: "email",
    target: "email",
    required: true,
    validate: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Invalid email format",
  },
  {
    source: "phone",
    target: "phone",
    required: false,
  },
  {
    source: "role",
    target: "role",
    required: false,
    defaultValue: "viewer",
    validate: (v) =>
      ["admin", "manager", "purchaser", "viewer", "approver"].includes(v) ||
      "Invalid role",
  },
  {
    source: "department",
    target: "department",
    required: false,
  },
  {
    source: "job_title",
    target: "jobTitle",
    required: false,
  },
  {
    source: "employee_number",
    target: "employeeNumber",
    required: false,
  },
  {
    source: "monthly_limit",
    target: "monthlyLimit",
    required: false,
    transform: (v) => (v ? parseFloat(v) : undefined),
    validate: (v) => !v || !isNaN(parseFloat(v)) || "Invalid number",
  },
  {
    source: "order_limit",
    target: "orderLimit",
    required: false,
    transform: (v) => (v ? parseFloat(v) : undefined),
    validate: (v) => !v || !isNaN(parseFloat(v)) || "Invalid number",
  },
  {
    source: "manager_id",
    target: "managerId",
    required: false,
  },
];

/**
 * Generate a sample CSV template
 */
export function generateTemplate(
  mappings: ColumnMapping[],
  sampleData?: Record<string, string>[]
): string {
  const headers = mappings.map((m) => m.source);

  if (!sampleData || sampleData.length === 0) {
    return headers.join(",");
  }

  return generateCsv(sampleData, { columns: headers });
}

/**
 * Validate CSV file size
 */
export function validateFileSize(
  file: File | Blob,
  maxSizeBytes: number = 10 * 1024 * 1024 // 10MB default
): { valid: boolean; error?: string } {
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }
  return { valid: true };
}

/**
 * Read CSV file content as string (browser-compatible)
 *
 * Note: This function requires browser environment with FileReader API.
 * For Node.js, use fs.readFileSync and then parseCsv.
 *
 * @example
 * ```tsx
 * // Browser usage
 * const handleFileUpload = async (file: File) => {
 *   const text = await readFileAsText(file);
 *   const result = parseCsv(text, { requiredColumns: ['email', 'name'] });
 *   return result;
 * };
 * ```
 */
export function readFileAsText(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof FileReader === "undefined") {
      reject(new Error("FileReader is not available in this environment"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
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

/**
 * Read and parse CSV file (browser-compatible)
 *
 * Combines file reading and parsing in one operation.
 *
 * @example
 * ```tsx
 * const handleFileUpload = async (file: File) => {
 *   const result = await readAndParseCsv(file, {
 *     requiredColumns: ['email', 'name'],
 *   });
 *   if (result.success) {
 *     console.log('Parsed rows:', result.data);
 *   }
 * };
 * ```
 */
export async function readAndParseCsv<T = Record<string, string>>(
  file: Blob,
  options: CsvParseOptions = {}
): Promise<CsvParseResult<T>> {
  const text = await readFileAsText(file);
  return parseCsv<T>(text, options);
}
