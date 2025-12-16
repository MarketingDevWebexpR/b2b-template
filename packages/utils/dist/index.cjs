'use strict';

var clsx = require('clsx');
var tailwindMerge = require('tailwind-merge');

// src/index.ts
function cn(...inputs) {
  return tailwindMerge.twMerge(clsx.clsx(inputs));
}
function formatPrice(price) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}
function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
function truncate(text, length) {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}
function calculateDiscount(price, compareAtPrice) {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round((compareAtPrice - price) / compareAtPrice * 100);
}
function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
var isClient = typeof window !== "undefined";
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}
function formatDate(date, locale = "fr-FR") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

exports.calculateDiscount = calculateDiscount;
exports.cn = cn;
exports.debounce = debounce;
exports.delay = delay;
exports.formatDate = formatDate;
exports.formatPrice = formatPrice;
exports.generateId = generateId;
exports.isClient = isClient;
exports.slugify = slugify;
exports.truncate = truncate;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map