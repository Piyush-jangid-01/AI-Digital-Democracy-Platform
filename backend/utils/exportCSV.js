const exportToCSV = (data, fields) => {
  const header = fields.join(",");
  const rows = data.map(row =>
    fields.map(field => `"${row[field] || ""}"`).join(",")
  );
  return [header, ...rows].join("\n");
};

module.exports = { exportToCSV };