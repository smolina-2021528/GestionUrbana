import { buildReportResponse } from "./report-helpers.js";
import { PRIORITY_COLORS } from "../helpers/report-constants.js";

export const HEATMAP_WEIGHTS = {
    ALTA: 1.0,
    MEDIA: 0.6,
    BAJA: 0.3,
};

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

export const buildHeatmapPoint = (report) => ({
    id: report.Id,
    latitude: report.Latitude != null ? parseFloat(report.Latitude) : null,
    longitude: report.Longitude != null ? parseFloat(report.Longitude) : null,
    weight: HEATMAP_WEIGHTS[report.Priority] ?? HEATMAP_WEIGHTS.MEDIA,
    category: report.Category,
    priority: report.Priority,
    priorityColor: PRIORITY_COLORS[report.Priority],
    status: report.Status,
});