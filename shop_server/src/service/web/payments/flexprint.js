export const flexPrint = (items, rate) => {
  const defaultRates = {
    normal: 10,
    star: 20,
    blackback: 15,
    vinyle: 30,
  };

  // Merge and sanitize rates
  const rates = {
    normal: rate.normal || rate.nromal || defaultRates.normal,
    star: rate.star || defaultRates.star,
    blackback: rate.blackBack || rate.blackback || defaultRates.blackback,
    vinyle: rate.vinyle || rate.Vinyle || defaultRates.vinyle,
  };

  // Process each item
  const results = items.map((item) => {
    try {
      if (!item?.originalname) {
        throw new Error("Missing file name");
      }

      // Normalize filename (remove spaces)
      const filename = item.originalname.replace(/\s+/g, "");
      // e.g., "2x3=1normal" or "4x6normal"

      // Split into size and sheet info
      const [sizeStr, sheetStrRaw] = filename.includes("=")
        ? filename.split("=")
        : filename.match(/^(\d+x\d+)(.*)$/)?.slice(1, 3) || [];

      if (!sizeStr || !sheetStrRaw) {
        throw new Error("Invalid filename format. Missing size or sheet info.");
      }

      // Parse width and height
      const [widthStr, heightStr] = sizeStr.split("x");
      const width = parseFloat(widthStr);
      const height = parseFloat(heightStr);

      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        throw new Error("Invalid image dimensions.");
      }

      // Parse quantity and sheet type (like 1normal or star)
      const match = sheetStrRaw.match(/^(\d*)\s*([a-zA-Z]+).*$/);
      if (!match) {
        throw new Error("Invalid sheet format.");
      }

      const [, qtyStr, sheetTypeRaw] = match;

      // Default quantity to 1
      const quantity = qtyStr ? parseInt(qtyStr, 10) : 1;
      let sheetType = sheetTypeRaw.toLowerCase();

      // Normalize sheet type synonyms
      if (sheetType === "bb") sheetType = "blackback";
      if (sheetType === "vinyl") sheetType = "vinyle"; // normalize spelling

      // Calculate pricing
      const squareFeet = width * height;
      const pricePerUnit = rates[sheetType] ?? 0;
      const price = squareFeet * pricePerUnit * quantity;

      return {
        // userId: `${userId}.json`,
        size: `${width}x${height}`,
        sheet: sheetType,
        quantity,
        squareFeet,
        price,
        imageFormat: item.mimetype?.split("/")[1] || "jpg",
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        error: err.message,
        filename: item?.originalname || null,
      };
    }
  });

  return results;
};
