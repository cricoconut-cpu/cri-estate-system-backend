export const calculateSurveyStatistics = (geoJson) => {
  const statistics = {
    totalTrees: 0,

    healthy: 0,

    moderate: 0,

    mildStress: 0,

    severeStress: 0,

    critical: 0,
  };

  if (
    !geoJson ||
    geoJson.type !== "FeatureCollection" ||
    !Array.isArray(geoJson.features)
  ) {
    throw new Error("Invalid GeoJSON format.");
  }

  geoJson.features.forEach((feature) => {
    statistics.totalTrees++;

    const ndviClass = feature.properties?.NDVI_Class;

    switch (ndviClass) {
      case "Healthy":
        statistics.healthy++;
        break;

      case "Moderate":
        statistics.moderate++;
        break;

      case "Mild Stress":
        statistics.mildStress++;
        break;

      case "Severe Stress":
        statistics.severeStress++;
        break;

      case "Critical":
        statistics.critical++;
        break;

      default:
        break;
    }
  });

  return statistics;
};
