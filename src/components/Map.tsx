"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix icon marker mặc định của Leaflet bị lỗi trong Next.js/Webpack
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});

interface MapProps {
    pos: [number, number]; // [lat, lng]
    zoom?: number;
    popupText?: string;
}

export default function Map({ pos, zoom = 13, popupText }: MapProps) {
    return (
        <MapContainer
            center={pos}
            zoom={zoom}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={pos} icon={icon}>
                {popupText && <Popup>{popupText}</Popup>}
            </Marker>
        </MapContainer>
    );
}
