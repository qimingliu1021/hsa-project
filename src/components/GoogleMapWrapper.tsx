"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  provider: string;
  rating: number;
  image: string;
  hsaEligible: boolean;
  conditions: string[];
  location: string;
  address: string;
}

interface GoogleMapWrapperProps {
  services: Service[];
  onServiceClick?: (service: Service) => void;
  selectedServiceId?: string;
  centerOnService?: Service; // Add this new prop
  onLocationChange?: (bounds: google.maps.LatLngBounds) => void;
  enableUserLocation?: boolean;
  enableDirections?: boolean;
  mapHeight?: string;
  className?: string;
}

interface MapComponentProps extends GoogleMapWrapperProps {
  // All props from GoogleMapWrapperProps
}

const MapComponent: React.FC<MapComponentProps> = ({
  services,
  onServiceClick,
  selectedServiceId,
  onLocationChange,
  enableUserLocation = true,
  enableDirections = false,
  mapHeight = "100%",
  centerOnService,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [userLocationMarker, setUserLocationMarker] =
    useState<google.maps.Marker>();
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();
  const [userLocation, setUserLocation] = useState<google.maps.LatLng>();
  const [infoWindows, setInfoWindows] = useState<google.maps.InfoWindow[]>([]);

  // Initialize map
  useEffect(() => {
    if (ref.current && !map && window.google && window.google.maps) {
      const newMap = new window.google.maps.Map(ref.current, {
        center: { lat: 40.7589, lng: -73.9851 }, // NYC center
        zoom: 12,
        mapId: "DEMO_MAP_ID", // Add this line
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP,
        },
      });

      setMap(newMap);

      // Initialize directions service and renderer if enabled
      if (enableDirections) {
        const dirService = new window.google.maps.DirectionsService();
        const dirRenderer = new window.google.maps.DirectionsRenderer({
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: "#4F46E5",
            strokeWeight: 4,
            strokeOpacity: 0.8,
          },
        });
        dirRenderer.setMap(newMap);
        setDirectionsService(dirService);
        setDirectionsRenderer(dirRenderer);
      }

      // Add bounds change listener
      if (onLocationChange) {
        newMap.addListener("bounds_changed", () => {
          const bounds = newMap.getBounds();
          if (bounds) {
            onLocationChange(bounds);
          }
        });
      }
    }
  }, [enableDirections]); // Removed onLocationChange from dependencies

  // Get user location
  useEffect(() => {
    if (map && enableUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          setUserLocation(userPos);

          // Create user location marker
          const userMarker = new google.maps.Marker({
            position: userPos,
            map: map,
            title: "Your Location",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
            zIndex: 100,
          });

          setUserLocationMarker(userMarker);

          // Center map on user location if no services are selected
          if (services.length === 0) {
            map.setCenter(userPos);
            map.setZoom(15);
          }
        },
        (error) => {
          console.warn("Error getting user location:", error);
        }
      );
    }
  }, [map, enableUserLocation, services.length]);

  // Update service markers
  useEffect(() => {
    const createMarkers = async () => {
      if (!map || !services || !window.google || !window.google.maps) {
        return;
      }
      markers.forEach((marker) => marker.setMap(null)); // Keep this line as is
      infoWindows.forEach((infoWindow) => infoWindow.close());

      const newMarkers: google.maps.Marker[] = [];
      const newInfoWindows: google.maps.InfoWindow[] = [];

      for (const service of services) {
        const position = await geocodeAddress(service.address);

        if (position) {
          // Only create marker if geocoding succeeded
          const marker = new google.maps.Marker({
            position: position,
            map: null, // Hide initially
            title: service.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: service.id === selectedServiceId ? 14 : 10,
              fillColor: getMarkerColor(service.category),
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: service.id === selectedServiceId ? 3 : 2,
            },
            zIndex: service.id === selectedServiceId ? 100 : 1,
          });

          // Add this: Show marker and center map if this service is selected
          if (service.id === selectedServiceId) {
            marker.setMap(map);
            map.setCenter(position);
            map.setZoom(16);
          }

          const infoWindow = new google.maps.InfoWindow({
            content: createInfoWindowContent(service),
            maxWidth: 300,
          });

          // Add this: Auto-open info window if this service is selected
          if (service.id === selectedServiceId) {
            infoWindow.open(map, marker);
          }

          marker.addListener("click", () => {
            // Close all other info windows
            newInfoWindows.forEach((iw) => iw.close());
            infoWindow.open(map, marker);

            if (onServiceClick) {
              onServiceClick(service);
            }

            // Show directions if enabled and user location is available
            if (
              enableDirections &&
              directionsService &&
              directionsRenderer &&
              userLocation
            ) {
              showDirections(userLocation, position); // Use position instead of service.coordinates
            }
          });

          newMarkers.push(marker);
          newInfoWindows.push(infoWindow);
        }
      }

      setMarkers(newMarkers);
      setInfoWindows(newInfoWindows);

      // Fit bounds to show all markers
      if (newMarkers.length > 0) {
        const bounds = new google.maps.LatLngBounds();

        // Include service locations
        newMarkers.forEach((marker) => {
          const position = marker.getPosition();
          if (position) {
            bounds.extend(position);
          }
        });

        // Include user location if available
        if (userLocation) {
          bounds.extend(userLocation);
        }

        map.fitBounds(bounds);

        // Don't zoom in too much if there's only one marker
        if (newMarkers.length === 1 && !userLocation) {
          map.setZoom(15);
        }
      }
    };

    createMarkers(); // Call the async function
  }, [
    map,
    services,
    selectedServiceId,
    enableDirections,
    directionsService,
    directionsRenderer,
    userLocation,
  ]);

  useEffect(() => {
    if (map && centerOnService && centerOnService.address) {
      map.setZoom(16);

      const selectedMarker = markers.find(
        (marker) => marker.title === centerOnService.name
      );
      if (selectedMarker) {
        const markerIndex = markers.indexOf(selectedMarker);
        if (infoWindows[markerIndex]) {
          infoWindows.forEach((iw) => iw.close());
          infoWindows[markerIndex].open(map, selectedMarker);
        }
      }
    }
  }, [map, centerOnService, markers, infoWindows]);

  const showDirections = useCallback(
    (origin: google.maps.LatLng, destination: google.maps.LatLng) => {
      if (directionsService && directionsRenderer) {
        directionsService.route(
          {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === "OK" && result) {
              directionsRenderer.setDirections(result);
            } else {
              console.error("Directions request failed:", status);
            }
          }
        );
      }
    },
    [directionsService, directionsRenderer]
  );

  const getMarkerColor = (category: string): string => {
    const colors = {
      Wellness: "#10b981",
      "Alternative Medicine": "#3b82f6",
      Fitness: "#8b5cf6",
      "Mental Health": "#f59e0b",
      Nutrition: "#ef4444",
      "Physical Therapy": "#06b6d4",
      default: "#6b7280",
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  const createInfoWindowContent = (service: Service): string => {
    const hsaBadge = service.hsaEligible
      ? '<span style="display: inline-block; padding: 2px 6px; background-color: #dcfce7; color: #166534; border-radius: 8px; font-size: 11px; font-weight: 600; margin-left: 8px;">HSA Eligible</span>'
      : "";

    return `
      <div style="padding: 12px; max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <img src="${service.image}" alt="${
      service.name
    }" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; flex-shrink: 0;" />
          <div style="flex: 1; min-width: 0;">
            <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #1f2937; line-height: 1.3;">
              ${service.name}
            </h3>
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">
              ${service.provider}
            </p>
          </div>
        </div>
        
        <div style="margin: 8px 0; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="color: #fbbf24; font-size: 14px;">★</span>
            <span style="font-size: 13px; color: #374151;">${
              service.rating
            }</span>
            <span style="margin-left: 8px; font-size: 14px; font-weight: 600; color: #059669;">
              $${service.price}
            </span>
            ${hsaBadge}
          </div>
        </div>
        
        <div style="margin: 8px 0;">
          <span style="display: inline-block; padding: 3px 8px; background-color: ${getCategoryBadgeColor(
            service.category
          )}; color: white; border-radius: 12px; font-size: 11px; font-weight: 500;">
            ${service.category}
          </span>
        </div>
        
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #9ca3af; line-height: 1.4;">
          <svg style="display: inline; width: 12px; height: 12px; margin-right: 4px;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
          ${service.address}
        </p>
        
        <p style="margin: 0 0 12px 0; font-size: 12px; color: #6b7280; line-height: 1.4;">
          ${service.description.substring(0, 120)}${
      service.description.length > 120 ? "..." : ""
    }
        </p>
        
        ${
          service.conditions.length > 0
            ? `
          <div style="margin: 8px 0;">
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${service.conditions
                .slice(0, 3)
                .map(
                  (condition) =>
                    `<span style="display: inline-block; padding: 2px 6px; background-color: #f3f4f6; color: #374151; border-radius: 8px; font-size: 10px;">${condition}</span>`
                )
                .join("")}
              ${
                service.conditions.length > 3
                  ? `<span style="font-size: 10px; color: #9ca3af;">+${
                      service.conditions.length - 3
                    } more</span>`
                  : ""
              }
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;
  };

  const getCategoryBadgeColor = (category: string): string => {
    const colors = {
      Wellness: "#10b981",
      "Alternative Medicine": "#3b82f6",
      Fitness: "#8b5cf6",
      "Mental Health": "#f59e0b",
      Nutrition: "#ef4444",
      "Physical Therapy": "#06b6d4",
      default: "#6b7280",
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  const createMarkerContent = (
    service: Service,
    selectedServiceId?: string
  ) => {
    const div = document.createElement("div");
    div.style.cssText = `
      width: ${service.id === selectedServiceId ? "28px" : "20px"};
      height: ${service.id === selectedServiceId ? "28px" : "20px"};
      border-radius: 50%;
      background-color: ${getMarkerColor(service.category)};
      border: ${service.id === selectedServiceId ? "3px" : "2px"} solid white;
      cursor: pointer;
    `;
    return div;
  };

  return <div ref={ref} style={{ height: mapHeight, width: "100%" }} />;
};

const LoadingComponent = () => (
  <div className="h-full w-full flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading map...</p>
    </div>
  </div>
);

const ErrorComponent = () => (
  <div className="h-full w-full flex items-center justify-center bg-gray-50">
    <div className="text-center p-6">
      <svg
        className="mx-auto h-12 w-12 text-red-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <p className="text-red-600 mb-2">Failed to load map</p>
      <p className="text-sm text-gray-500">
        Please check your Google Maps API key and internet connection
      </p>
    </div>
  </div>
);

const FallbackComponent: React.FC<{ services: Service[] }> = ({ services }) => (
  <div className="h-full w-full flex items-center justify-center bg-gray-50">
    <div className="text-center p-6">
      <svg
        className="mx-auto h-12 w-12 text-blue-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Interactive Service Map
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Service locations will be displayed here when the map loads.
      </p>
      <div className="bg-blue-50 p-4 rounded-lg text-left text-sm max-w-sm">
        <p className="font-medium mb-2 text-blue-800">
          Available Services ({services.length}):
        </p>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {services.slice(0, 5).map((service) => (
            <div key={service.id} className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0`}
                style={{
                  backgroundColor: getMarkerColor(service.category),
                }}
              ></div>
              <div className="min-w-0 flex-1">
                <span className="text-blue-700 text-xs font-medium block truncate">
                  {service.name}
                </span>
                <span className="text-blue-600 text-xs block truncate">
                  {service.location}
                </span>
              </div>
            </div>
          ))}
          {services.length > 5 && (
            <p className="text-blue-600 text-xs font-medium">
              +{services.length - 5} more services
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

const getMarkerColor = (category: string): string => {
  const colors = {
    Wellness: "#10b981",
    "Alternative Medicine": "#3b82f6",
    Fitness: "#8b5cf6",
    "Mental Health": "#f59e0b",
    Nutrition: "#ef4444",
    "Physical Therapy": "#06b6d4",
    default: "#6b7280",
  };
  return colors[category as keyof typeof colors] || colors.default;
};

const geocodeAddress = async (
  address: string
): Promise<google.maps.LatLng | null> => {
  return new Promise((resolve) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        resolve(results[0].geometry.location);
      } else {
        console.warn("Geocoding failed for address:", address, status);
        resolve(null);
      }
    });
  });
};

const render = (status: Status, services: Service[]) => {
  switch (status) {
    case Status.LOADING:
      return <LoadingComponent />;
    case Status.FAILURE:
      return <ErrorComponent />;
    default:
      return <FallbackComponent services={services} />;
  }
};

const GoogleMapWrapper: React.FC<GoogleMapWrapperProps> = ({
  services,
  onServiceClick,
  selectedServiceId,
  onLocationChange,
  enableUserLocation = true,
  enableDirections = false,
  mapHeight = "100%",
  className = "",
  centerOnService,
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  console.log("apiKey", apiKey);

  // Safety check for services
  if (!services || !Array.isArray(services)) {
    return (
      <div
        className={`h-full w-full flex items-center justify-center bg-gray-50 ${className}`}
      >
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  // Handle missing or invalid API key
  if (
    !apiKey ||
    apiKey === "your_google_maps_api_key_here" ||
    apiKey === "AIzaSyBvOkBwvOkBwvOkBwvOkBwvOkBwvOkBwvOk"
  ) {
    return <FallbackComponent services={services} />;
  }

  // Listen for booking messages from info windows
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "BOOK_SERVICE") {
        const service = services.find((s) => s.id === event.data.serviceId);
        if (service && onServiceClick) {
          onServiceClick(service);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [services, onServiceClick]);

  return (
    <div className={className} style={{ height: mapHeight }}>
      <Wrapper
        apiKey={apiKey}
        render={(status) => render(status, services)}
        libraries={["places", "geometry", "marker"]} // Add "marker" back
      >
        <MapComponent
          services={services}
          onServiceClick={onServiceClick}
          selectedServiceId={selectedServiceId}
          centerOnService={centerOnService}
          onLocationChange={onLocationChange}
          enableUserLocation={enableUserLocation}
          enableDirections={enableDirections}
          mapHeight={mapHeight}
          className={className}
        />
      </Wrapper>
    </div>
  );
};

export default GoogleMapWrapper;
