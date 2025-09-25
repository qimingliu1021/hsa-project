"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleMapWrapper from "@/components/GoogleMapWrapper";

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
  coordinates: {
    lat: number;
    lng: number;
  };
}

const MOCK_SERVICES: Service[] = [
  {
    id: "1",
    name: "Tension-Intervention",
    category: "Wellness",
    description:
      "Functional Mobility and Injury Prevention for Life Long Health",
    price: 225,
    duration: "Starts from 60 minutes",
    provider: "Tension Intervention",
    rating: 4.9,
    image:
      "https://images.squarespace-cdn.com/content/v1/6665beb550937144dac7cf76/1717946838332-PROZTO5JOSX4W1FRFV1I/Massage+Therapy",
    hsaEligible: true,
    conditions: [
      "Low Back Pain",
      "Shoulder Pain",
      "Knee Pain",
      "Elbow Pain",
      "Hip Pain",
      "Ankle Pain",
      "Foot Pain",
      "Hand Pain",
      "Wrist Pain",
      "Neck Pain",
      "Headache",
    ],
    location: "Greenpoint/Williamsburg",
    address: "252 Java Street, Brooklyn, NY 11222",
    coordinates: { lat: 40.7197, lng: -74.0085 },
  },
  {
    id: "2",
    name: "Your Dream Spa",
    category: "Wellness",
    description:
      "Your Dream Spa is a luxurious spa that offers a variety of services to help you relax and de-stress.",
    price: 0.01,
    duration: "Starts from 60 minutes",
    provider: "Your Dream Spa",
    rating: 5.0,
    image:
      "https://lh3.googleusercontent.com/p/AF1QipOubx9ehbcqt465azaPoC8NGqnwTHClYUVZSIlB=w408-h305-k-no",
    hsaEligible: true,
    conditions: ["tesing"],
    location: "Fidi",
    address: "6 Stone St 2 Floor, New York, NY 10004",
    coordinates: { lat: 40.7197, lng: -74.0085 },
  },
];

export default function MarketplacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [filteredServices, setFilteredServices] =
    useState<Service[]>(MOCK_SERVICES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<
    string | undefined
  >();
  const [selectedService, setSelectedService] = useState<Service | undefined>();

  useEffect(() => {
    let filtered = services;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (service) => service.category === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          service.provider.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [services, selectedCategory, searchTerm]);

  const categories = [
    "All",
    ...Array.from(new Set(services.map((s) => s.category))),
  ];

  const handleServiceClick = (service: Service) => {
    setSelectedServiceId(service.id);
    setSelectedService(service);
    // Scroll to the service card
    const element = document.getElementById(`service-${service.id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleServiceCardClick = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedService(services.find((s) => s.id === serviceId));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link
                href="/marketplace"
                className="flex-shrink-0 flex items-center"
              >
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">
                  SAGAS HEALTH
                </span>
              </Link>

              {/* Search Bar */}
              <div className="hidden md:block">
                <input
                  type="text"
                  placeholder="Search services, providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/investment-dashboard"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Investment Dashboard
                  </Link>
                  <span className="text-sm text-gray-700">
                    Welcome, {session.user?.email || "User"}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => signIn()}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Log in
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-screen">
        {/* Left Side - Service Listings */}
        <div className="w-3/5 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Health Services near New York
              </h1>
              <p className="text-gray-600">
                {filteredServices.length}+ services available
              </p>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Date/Time Filters */}
            <div className="flex items-center space-x-4 mb-6 text-sm">
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">
                Today
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">
                All Day
              </button>
              <select className="px-3 py-1 border border-gray-300 rounded-lg bg-white">
                <option>Location</option>
                <option>Manhattan</option>
                <option>Brooklyn</option>
                <option>Queens</option>
              </select>
              <select className="px-3 py-1 border border-gray-300 rounded-lg bg-white">
                <option>Categories</option>
                <option>Wellness</option>
                <option>Alternative Medicine</option>
                <option>Fitness</option>
              </select>
            </div>

            {/* Service Listings */}
            <div className="space-y-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  id={`service-${service.id}`}
                  className={`border rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer ${
                    selectedServiceId === service.id
                      ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => handleServiceCardClick(service.id)}
                >
                  <div className="flex space-x-4">
                    {/* Service Image */}
                    <div className="w-32 h-32 rounded-lg flex-shrink-0 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Service Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {service.name}
                          </h3>

                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(service.rating)
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="ml-1 text-sm text-gray-600">
                                {service.rating}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">
                              {service.category}
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">
                              ${service.price}
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">
                              {service.location}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-1">
                            {service.provider}
                          </p>
                          <p className="text-xs text-gray-500 mb-2 flex items-center">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {service.address}
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            {service.description}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {service.conditions.slice(0, 3).map((condition) => (
                              <span
                                key={condition}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {condition}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Booking Buttons */}
                        <div className="flex flex-col space-y-2 ml-4">
                          <Link
                            href={`/marketplace/service/${service.id}`}
                            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Navigate to service details page
                            }}
                          >
                            Book Now
                          </Link>
                          <button
                            className="text-sm text-gray-600 hover:text-gray-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Could add a modal or expand card functionality here
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No services found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Google Maps */}
        <div className="w-2/5 border-l border-gray-200">
          <div className="h-full relative">
            {/* Google Maps Component */}
            <GoogleMapWrapper
              services={filteredServices}
              onServiceClick={handleServiceClick}
              selectedServiceId={selectedServiceId}
              enableUserLocation={true}
              enableDirections={false}
              mapHeight="100%"
              className="h-full"
              centerOnService={selectedService}
            />

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3 z-10">
              <div className="text-xs font-medium text-gray-900 mb-2">
                Service Types
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Wellness</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">
                    Alternative Medicine
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Fitness</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
