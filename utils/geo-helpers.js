import { buildReportResponse } from "./report-helpers.js";

export const buildGeoPoint = (latitude, longitude) => ({
    type: "Point",
    coordinates: [longitude, latitude],
});

export const parseGeoPoint = (locationObj) => {
    const [longitude, latitude] = locationObj.coordinates;
    return { latitude, longitude };
};

export const buildReportGeoResponse = (report) => {
    const base = buildReportResponse(report);

    const latitude = report.Latitude != null ? parseFloat(report.Latitude) : null;
    const longitude =
        report.Longitude != null ? parseFloat(report.Longitude) : null;
    const address = report.Address ?? null;

    const hasLocation = latitude !== null && longitude !== null;

    return {
        ...base,
        latitude,
        longitude,
        address,
        hasLocation,
    };
};